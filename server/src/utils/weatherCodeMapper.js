/**
 * AEGIS 2.0 Weather Code Mapper
 * Converts Open-Meteo WMO weather codes into standardized AEGIS operational classifications.
 */

const WMO_CODE_MAP = {
  0: { condition: "CLEAR", label: "Clear Sky", category: "FAIR" },
  1: { condition: "MAINLY_CLEAR", label: "Mainly Clear", category: "FAIR" },
  2: { condition: "PARTLY_CLOUDY", label: "Partly Cloudy", category: "CLOUDY" },
  3: { condition: "CLOUDY", label: "Overcast", category: "CLOUDY" },
  45: { condition: "FOG", label: "Atmospheric Fog", category: "OBSCURED" },
  48: { condition: "FOG", label: "Depositing Rime Fog", category: "OBSCURED" },
  51: { condition: "DRIZZLE", label: "Light Drizzle", category: "PRECIPITATION" },
  53: { condition: "DRIZZLE", label: "Moderate Drizzle", category: "PRECIPITATION" },
  55: { condition: "DRIZZLE", label: "Dense Drizzle", category: "PRECIPITATION" },
  56: { condition: "FREEZING_DRIZZLE", label: "Freezing Drizzle", category: "PRECIPITATION" },
  57: { condition: "FREEZING_DRIZZLE", label: "Dense Freezing Drizzle", category: "PRECIPITATION" },
  61: { condition: "RAIN", label: "Slight Rain", category: "RAIN" },
  63: { condition: "RAIN", label: "Moderate Rain", category: "RAIN" },
  65: { condition: "HEAVY_RAIN", label: "Heavy Torrential Rain", category: "HEAVY_RAIN" },
  66: { condition: "FREEZING_RAIN", label: "Freezing Rain", category: "PRECIPITATION" },
  67: { condition: "FREEZING_RAIN", label: "Heavy Freezing Rain", category: "PRECIPITATION" },
  71: { condition: "SNOW", label: "Slight Snowfall", category: "SNOW" },
  73: { condition: "SNOW", label: "Moderate Snowfall", category: "SNOW" },
  75: { condition: "HEAVY_SNOW", label: "Heavy Snowfall", category: "SNOW" },
  77: { condition: "SNOW", label: "Snow Grains", category: "SNOW" },
  80: { condition: "RAIN", label: "Slight Rain Showers", category: "RAIN" },
  81: { condition: "RAIN", label: "Moderate Rain Showers", category: "RAIN" },
  82: { condition: "HEAVY_RAIN", label: "Violent Rain Showers", category: "HEAVY_RAIN" },
  85: { condition: "SNOW", label: "Slight Snow Showers", category: "SNOW" },
  86: { condition: "HEAVY_SNOW", label: "Heavy Snow Showers", category: "SNOW" },
  95: { condition: "THUNDERSTORM", label: "Thunderstorm", category: "STORM" },
  96: { condition: "THUNDERSTORM", label: "Thunderstorm with Slight Hail", category: "STORM" },
  99: { condition: "THUNDERSTORM", label: "Severe Thunderstorm with Heavy Hail", category: "STORM" }
};

/**
 * Map a WMO code to human-readable condition and category
 * @param {number|string} code - WMO weather interpretation code
 * @returns {{ condition: string, label: string, category: string }}
 */
export function mapWeatherCode(code) {
  const numericCode = Number(code);
  if (WMO_CODE_MAP[numericCode]) {
    return WMO_CODE_MAP[numericCode];
  }
  return {
    condition: "UNKNOWN",
    label: "Unknown Atmospheric Condition",
    category: "UNKNOWN"
  };
}

export default mapWeatherCode;
