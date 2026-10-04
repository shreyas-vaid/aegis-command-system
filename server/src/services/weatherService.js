/**
 * AEGIS 2.0 Weather Intelligence Service
 * Provider: Open-Meteo API
 * Server-side cached, validated, and normalized operational meteorology service.
 */

import { mapWeatherCode } from '../utils/weatherCodeMapper.js';

// In-memory weather cache: key -> { timestamp, data }
const weatherCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL
const MAX_CACHE_ENTRIES = 200;

/**
 * Fetch and normalize weather data for geographical coordinates
 * @param {number|string} latitude
 * @param {number|string} longitude
 * @param {string|null} missionId - Optional operation ID for scoped cache key
 * @param {boolean} forceRefresh - If true, bypass cache
 * @returns {Promise<Object>} Normalized AEGIS weather intelligence payload
 */
export async function getLiveWeather(latitude, longitude, missionId = null, forceRefresh = false) {
  const numLat = Number(latitude);
  const numLon = Number(longitude);

  if (isNaN(numLat) || numLat < -90 || numLat > 90) {
    throw new Error(`Invalid latitude: ${latitude}. Must be between -90 and 90`);
  }
  if (isNaN(numLon) || numLon < -180 || numLon > 180) {
    throw new Error(`Invalid longitude: ${longitude}. Must be between -180 and 180`);
  }

  const cacheKey = missionId ? `weather:op:${missionId}` : `weather:coords:${numLat.toFixed(3)},${numLon.toFixed(3)}`;

  // 1. Check in-memory cache if refresh not forced
  if (!forceRefresh) {
    const cached = weatherCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return {
        ...cached.data,
        isCached: true
      };
    }
  }

  // 2. Build Open-Meteo API URL
  const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${numLat.toFixed(4)}&longitude=${numLon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,rain,weather_code,wind_speed_10m&forecast_hours=24&timezone=auto`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'User-Agent': 'AEGIS-Command-System/2.0 (weather-ops@aegis.mil; emergency-response-platform)',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => response.statusText);
      throw new Error(`Open-Meteo HTTP ${response.status}: ${errText}`);
    }

    const raw = await response.json();
    const current = raw.current || {};
    const hourly = raw.hourly || {};

    const mappedCurrent = mapWeatherCode(current.weather_code);

    // Build short 12-hour compact forecast window
    const forecast = [];
    const hourlyTimes = hourly.time || [];
    const maxHours = Math.min(12, hourlyTimes.length);

    // Find current or upcoming hour index
    const nowIso = new Date().toISOString();
    let startIndex = 0;
    for (let i = 0; i < hourlyTimes.length; i++) {
      if (hourlyTimes[i] >= nowIso.slice(0, 13)) {
        startIndex = i;
        break;
      }
    }

    const endIndex = Math.min(startIndex + 8, hourlyTimes.length);

    for (let i = startIndex; i < endIndex; i++) {
      const timeStr = hourlyTimes[i];
      const hourDisplay = timeStr ? timeStr.split('T')[1] || timeStr : `${i}:00`;
      const code = hourly.weather_code?.[i];
      const mapped = mapWeatherCode(code);

      forecast.push({
        time: hourDisplay,
        isoTime: timeStr,
        temperature: hourly.temperature_2m?.[i] ?? null,
        humidity: hourly.relative_humidity_2m?.[i] ?? null,
        precipitationProbability: hourly.precipitation_probability?.[i] ?? 0,
        precipitation: hourly.precipitation?.[i] ?? 0,
        rainfall: hourly.rain?.[i] ?? hourly.precipitation?.[i] ?? 0,
        windSpeed: hourly.wind_speed_10m?.[i] ?? null,
        weatherCode: code ?? null,
        condition: mapped.condition,
        conditionLabel: mapped.label
      });
    }

    const normalizedData = {
      location: {
        latitude: numLat,
        longitude: numLon
      },
      current: {
        temperature: current.temperature_2m ?? null,
        apparentTemperature: current.apparent_temperature ?? null,
        rainfall: current.rain ?? current.precipitation ?? 0,
        precipitation: current.precipitation ?? 0,
        windSpeed: current.wind_speed_10m ?? null,
        humidity: current.relative_humidity_2m ?? null,
        weatherCode: current.weather_code ?? null,
        condition: mappedCurrent.condition,
        conditionLabel: mappedCurrent.label,
        category: mappedCurrent.category
      },
      forecast,
      source: "Open-Meteo",
      isCached: false,
      fetchedAt: new Date().toISOString()
    };

    // Store in cache
    if (weatherCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = weatherCache.keys().next().value;
      weatherCache.delete(oldestKey);
    }
    weatherCache.set(cacheKey, {
      timestamp: Date.now(),
      data: normalizedData
    });

    return normalizedData;
  } catch (err) {
    console.warn(`[AEGIS-WEATHER] Open-Meteo error for [${numLat}, ${numLon}]:`, err.message);

    // Return stale cache if available
    const stale = weatherCache.get(cacheKey);
    if (stale) {
      return {
        ...stale.data,
        isCached: true,
        isStale: true
      };
    }

    throw new Error(`Weather service unavailable: ${err.message}`);
  } finally {
    clearTimeout(timeoutId);
  }
}
