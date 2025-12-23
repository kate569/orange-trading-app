/**
 * Market Data Stream Service
 * Fetches live weather data from Open-Meteo API for Winter Haven, Florida
 */

// Winter Haven, Florida coordinates - heart of the citrus industry
const WINTER_HAVEN_LAT = 28.02;
const WINTER_HAVEN_LON = -81.73;

export interface LiveMarketData {
  currentTemp: number;
  inventory: number;
  isHurricaneAlert: boolean;
  timestamp: Date;
}

export interface WeatherData {
  temperature: number; // Fahrenheit
  humidity: number; // Percentage
  windSpeed: number; // mph
  condition: string; // e.g., "Clear", "Cloudy", "Rain"
  weatherCode: number;
  isFreezingConditions: boolean;
  isFreezeWarning: boolean;
  timestamp: Date;
}

export interface LiveWeatherResponse {
  weather: WeatherData;
  marketData: LiveMarketData;
}

// Weather code to condition mapping (WMO Weather interpretation codes)
const WEATHER_CODE_MAP: Record<number, string> = {
  0: "Clear",
  1: "Mainly Clear",
  2: "Partly Cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing Rime Fog",
  51: "Light Drizzle",
  53: "Moderate Drizzle",
  55: "Dense Drizzle",
  56: "Light Freezing Drizzle",
  57: "Dense Freezing Drizzle",
  61: "Slight Rain",
  63: "Moderate Rain",
  65: "Heavy Rain",
  66: "Light Freezing Rain",
  67: "Heavy Freezing Rain",
  71: "Slight Snow",
  73: "Moderate Snow",
  75: "Heavy Snow",
  77: "Snow Grains",
  80: "Slight Rain Showers",
  81: "Moderate Rain Showers",
  82: "Violent Rain Showers",
  85: "Slight Snow Showers",
  86: "Heavy Snow Showers",
  95: "Thunderstorm",
  96: "Thunderstorm with Slight Hail",
  99: "Thunderstorm with Heavy Hail",
};

/**
 * Converts Celsius to Fahrenheit
 */
function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32);
}

/**
 * Converts km/h to mph
 */
function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.621371);
}

/**
 * Gets the condition string from weather code
 */
function getConditionFromCode(code: number, temp: number): string {
  // Add freeze warning context if temperature is low
  if (temp <= 32) {
    if (code === 0 || code === 1) return "Clear - FREEZE WARNING";
    return `${WEATHER_CODE_MAP[code] || "Unknown"} - FREEZE WARNING`;
  }
  if (temp <= 36) {
    if (code === 0 || code === 1) return "Clear - Frost Advisory";
    return `${WEATHER_CODE_MAP[code] || "Unknown"} - Frost Advisory`;
  }
  return WEATHER_CODE_MAP[code] || "Unknown";
}

/**
 * Fetches real weather data from Open-Meteo API for Winter Haven, FL
 */
export async function fetchWeatherData(): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${WINTER_HAVEN_LAT}&longitude=${WINTER_HAVEN_LON}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh&timezone=America%2FNew_York`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;

    const tempFahrenheit = celsiusToFahrenheit(current.temperature_2m);
    const windSpeedMph = kmhToMph(current.wind_speed_10m);
    const weatherCode = current.weather_code;

    return {
      temperature: tempFahrenheit,
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: windSpeedMph,
      condition: getConditionFromCode(weatherCode, tempFahrenheit),
      weatherCode,
      isFreezingConditions: tempFahrenheit <= 32,
      isFreezeWarning: tempFahrenheit <= 36,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    // Return fallback data on error
    return {
      temperature: 45,
      humidity: 70,
      windSpeed: 5,
      condition: "Data Unavailable",
      weatherCode: -1,
      isFreezingConditions: false,
      isFreezeWarning: false,
      timestamp: new Date(),
    };
  }
}

/**
 * Fetches live market data including real weather
 * Combines real weather API data with simulated inventory data
 */
export async function fetchLiveMarketData(): Promise<LiveWeatherResponse> {
  // Fetch real weather data
  const weather = await fetchWeatherData();

  // Simulate inventory levels (this would come from USDA/ICE data in production)
  const inventoryBase = 35 + Math.random() * 20;
  const inventoryVariance = (Math.random() - 0.5) * 30;
  const inventory = Math.round(
    Math.max(20, Math.min(70, inventoryBase + inventoryVariance))
  );

  // Hurricane alert based on weather conditions (simplified)
  // In production, this would check NHC/NOAA hurricane data
  const isHurricaneAlert =
    weather.weatherCode >= 95 || // Thunderstorm conditions
    (weather.windSpeed > 40 && weather.weatherCode >= 80); // High winds + rain

  return {
    weather,
    marketData: {
      currentTemp: weather.temperature,
      inventory,
      isHurricaneAlert,
      timestamp: weather.timestamp,
    },
  };
}

/**
 * Formats the timestamp for display
 */
export function formatSyncTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Gets frost risk level based on temperature and conditions
 */
export function getFrostRiskLevel(
  temp: number,
  humidity: number,
  windSpeed: number
): { level: "none" | "low" | "moderate" | "high" | "critical"; description: string } {
  // High humidity + low wind + low temp = higher frost risk
  // Wind actually reduces frost risk by preventing radiative cooling

  if (temp > 40) {
    return { level: "none", description: "No frost risk" };
  }

  if (temp > 36) {
    if (windSpeed < 5 && humidity > 70) {
      return { level: "low", description: "Slight frost possible overnight" };
    }
    return { level: "none", description: "No significant frost risk" };
  }

  if (temp > 32) {
    if (windSpeed < 5 && humidity > 60) {
      return { level: "moderate", description: "Frost likely overnight" };
    }
    return { level: "low", description: "Light frost possible" };
  }

  if (temp > 28) {
    if (windSpeed < 10) {
      return { level: "high", description: "Hard freeze expected" };
    }
    return { level: "moderate", description: "Freeze conditions" };
  }

  // Below 28°F - critical for citrus
  return { level: "critical", description: "CRITICAL: Citrus damage likely" };
}
