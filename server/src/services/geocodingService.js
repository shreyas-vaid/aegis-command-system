/**
 * AEGIS 2.0 Geocoding Service
 * Provider: OpenStreetMap Nominatim with in-memory caching and resilient offline fallback.
 */

// Simple in-memory cache: query -> { timestamp, results }
const geocodeCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_ENTRIES = 200;

// Curated emergency operations fallbacks for network resilience or offline development
const CURATED_LOCATIONS = [
  {
    displayName: "Chandigarh, India",
    locationName: "Chandigarh",
    latitude: 30.7333,
    longitude: 76.7794,
    country: "India",
    region: "Chandigarh",
    type: "administrative"
  },
  {
    displayName: "Mohali, Punjab, India",
    locationName: "Mohali",
    latitude: 30.7046,
    longitude: 76.7179,
    country: "India",
    region: "Punjab",
    type: "city"
  },
  {
    displayName: "Panchkula, Haryana, India",
    locationName: "Panchkula",
    latitude: 30.6942,
    longitude: 76.8606,
    country: "India",
    region: "Haryana",
    type: "city"
  },
  {
    displayName: "New Delhi, Delhi, India",
    locationName: "New Delhi",
    latitude: 28.6139,
    longitude: 77.2090,
    country: "India",
    region: "Delhi",
    type: "city"
  },
  {
    displayName: "Mumbai, Maharashtra, India",
    locationName: "Mumbai",
    latitude: 19.0760,
    longitude: 72.8777,
    country: "India",
    region: "Maharashtra",
    type: "city"
  },
  {
    displayName: "Bengaluru, Karnataka, India",
    locationName: "Bengaluru",
    latitude: 12.9716,
    longitude: 77.5946,
    country: "India",
    region: "Karnataka",
    type: "city"
  },
  {
    displayName: "London, Greater London, England, United Kingdom",
    locationName: "London",
    latitude: 51.5074,
    longitude: -0.1278,
    country: "United Kingdom",
    region: "England",
    type: "city"
  },
  {
    displayName: "Tokyo, Japan",
    locationName: "Tokyo",
    latitude: 35.6762,
    longitude: 139.6503,
    country: "Japan",
    region: "Tokyo",
    type: "city"
  },
  {
    displayName: "New York, NY, United States",
    locationName: "New York",
    latitude: 40.7128,
    longitude: -74.0060,
    country: "United States",
    region: "New York",
    type: "city"
  },
  {
    displayName: "Los Angeles, CA, United States",
    locationName: "Los Angeles",
    latitude: 34.0522,
    longitude: -118.2437,
    country: "United States",
    region: "California",
    type: "city"
  },
  {
    displayName: "Sydney, New South Wales, Australia",
    locationName: "Sydney",
    latitude: -33.8688,
    longitude: 151.2093,
    country: "Australia",
    region: "New South Wales",
    type: "city"
  }
];

/**
 * Search locations using OpenStreetMap Nominatim
 * @param {string} query - Location query (min 3 chars)
 * @returns {Promise<Array>} Normalized array of location candidates
 */
export async function searchLocations(query) {
  if (!query || typeof query !== 'string') {
    throw new Error('Query must be a valid non-empty string');
  }

  const cleanQuery = query.trim();
  if (cleanQuery.length < 3) {
    throw new Error('Query must be at least 3 characters');
  }

  const cacheKey = cleanQuery.toLowerCase();

  // 1. Check in-memory cache
  const cached = geocodeCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.results;
  }

  // 2. Query Nominatim geocoding API
  const endpoint = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQuery)}&format=json&addressdetails=1&limit=8`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'User-Agent': 'AEGIS-Command-System/2.0 (emergency-mgmt-ops@aegis.mil; dev-testing)',
        'Accept': 'application/json',
        'Accept-Language': 'en'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const rawData = await response.json();
      if (Array.isArray(rawData) && rawData.length > 0) {
        const normalized = rawData.map(item => {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          const name = item.name || item.address?.city || item.address?.town || item.address?.village || item.address?.state || item.display_name.split(',')[0].trim();
          
          return {
            displayName: item.display_name,
            locationName: name,
            latitude: Number(lat.toFixed(4)),
            longitude: Number(lon.toFixed(4)),
            country: item.address?.country || '',
            region: item.address?.state || item.address?.region || item.address?.county || '',
            type: item.type || item.class || 'locality'
          };
        }).filter(item => !isNaN(item.latitude) && !isNaN(item.longitude));

        // Store in cache
        if (geocodeCache.size >= MAX_CACHE_ENTRIES) {
          const firstKey = geocodeCache.keys().next().value;
          geocodeCache.delete(firstKey);
        }
        geocodeCache.set(cacheKey, {
          timestamp: Date.now(),
          results: normalized
        });

        return normalized;
      }
    }
  } catch (err) {
    console.warn(`[AEGIS-GEO] Nominatim lookup failed or timed out for "${cleanQuery}":`, err.message);
  }

  // 3. Fallback: filter curated locations if network failed or Nominatim is unreachable
  const qLower = cleanQuery.toLowerCase();
  const matchedCurated = CURATED_LOCATIONS.filter(loc => 
    loc.displayName.toLowerCase().includes(qLower) ||
    loc.locationName.toLowerCase().includes(qLower) ||
    loc.country.toLowerCase().includes(qLower) ||
    loc.region.toLowerCase().includes(qLower)
  );

  if (matchedCurated.length > 0) {
    return matchedCurated;
  }

  return [];
}
