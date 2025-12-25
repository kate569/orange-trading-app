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

// Fixed inventory value - represents current USDA/ICE reported inventory
// In production, this would be fetched from USDA NASS or ICE exchange data
const FIXED_INVENTORY_LEVEL = 27; // 27M gallons (realistic current level)

/**
 * Fetches live market data including real weather
 * Uses real weather API data and fixed inventory (no random fluctuation)
 * 
 * Note: Inventory is fixed at 27M. In production, this would come from USDA/ICE.
 * Hurricane alerts are disabled by default - use the manual toggle in the UI.
 */
export async function fetchLiveMarketData(): Promise<LiveWeatherResponse> {
  // Fetch real weather data from Open-Meteo API
  const weather = await fetchWeatherData();

  // Use fixed inventory level (no random fluctuation)
  // This value only changes when manually adjusted via slider
  const inventory = FIXED_INVENTORY_LEVEL;

  // Hurricane alert is false by default
  // User should manually toggle this based on NHC/NOAA hurricane advisories
  // This prevents random alerts and keeps the system stable
  const isHurricaneAlert = false;

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
 * RSI calculation result interface
 */
export interface RSIResult {
  value: number;
  timestamp: Date;
  symbol: string;
  period: number;
  currentPrice?: number;
  error?: string;
}

/**
 * Calculates RSI (Relative Strength Index) from price data
 * RSI = 100 - (100 / (1 + RS))
 * where RS = Average Gain / Average Loss over the period
 */
function calculateRSI(closingPrices: number[], period: number = 14): number {
  if (closingPrices.length < period + 1) {
    throw new Error(`Need at least ${period + 1} data points for RSI calculation`);
  }

  // Calculate daily price changes
  const changes: number[] = [];
  for (let i = 1; i < closingPrices.length; i++) {
    changes.push(closingPrices[i] - closingPrices[i - 1]);
  }

  // Separate gains and losses
  const gains = changes.map(change => change > 0 ? change : 0);
  const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);

  // Calculate initial average gain and loss (simple average for first period)
  let avgGain = gains.slice(0, period).reduce((sum, g) => sum + g, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((sum, l) => sum + l, 0) / period;

  // Use Wilder's smoothing method for subsequent periods
  for (let i = period; i < gains.length; i++) {
    avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
    avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
  }

  // Handle edge case where there are no losses
  if (avgLoss === 0) {
    return 100;
  }

  // Calculate RS and RSI
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return Math.round(rsi);
}

/**
 * Fetches live market RSI for Orange Juice Futures (OJ=F)
 * Uses Yahoo Finance API to get historical price data and calculates 14-day RSI
 */
export async function fetchLiveMarketRSI(): Promise<RSIResult> {
  const symbol = "OJ=F";
  const period = 14;
  
  // We need at least 30 days of data to calculate a reliable 14-day RSI
  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
  
  // Yahoo Finance API endpoint for historical data
  // Using a CORS proxy for browser compatibility
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${thirtyDaysAgo}&period2=${now}&interval=1d`;
  
  try {
    // Try direct Yahoo Finance API first
    let response: Response;
    let data: any;
    
    try {
      response = await fetch(yahooUrl);
      if (!response.ok) {
        throw new Error(`Yahoo API error: ${response.status}`);
      }
      data = await response.json();
    } catch (directError) {
      // If direct fails (likely due to CORS), try with a CORS proxy
      const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(yahooUrl)}`;
      response = await fetch(corsProxyUrl);
      
      if (!response.ok) {
        throw new Error(`CORS proxy error: ${response.status}`);
      }
      data = await response.json();
    }
    
    // Extract closing prices from Yahoo Finance response
    const result = data?.chart?.result?.[0];
    if (!result) {
      throw new Error("No data returned from Yahoo Finance");
    }
    
    const closingPrices = result?.indicators?.quote?.[0]?.close;
    if (!closingPrices || closingPrices.length === 0) {
      throw new Error("No closing prices in response");
    }
    
    // Filter out null values (market closed days)
    const validPrices = closingPrices.filter((price: number | null) => price !== null);
    
    if (validPrices.length < period + 1) {
      throw new Error(`Insufficient price data: got ${validPrices.length}, need ${period + 1}`);
    }
    
    // Calculate the 14-day RSI
    const rsiValue = calculateRSI(validPrices, period);
    
    // Get the current price (last closing price)
    const currentPrice = validPrices[validPrices.length - 1];
    
    return {
      value: rsiValue,
      timestamp: new Date(),
      symbol,
      period,
      currentPrice,
    };
  } catch (error) {
    console.error("Failed to fetch RSI data:", error);
    
    // Return a fallback value with error indication
    return {
      value: 50, // Neutral fallback
      timestamp: new Date(),
      symbol,
      period,
      error: error instanceof Error ? error.message : "Unknown error fetching RSI",
    };
  }
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
