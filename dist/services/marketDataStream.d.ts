/**
 * Market Data Stream Service
 * Fetches live weather data from Open-Meteo API for Winter Haven, Florida
 */
export interface LiveMarketData {
    currentTemp: number;
    inventory: number;
    isHurricaneAlert: boolean;
    timestamp: Date;
}
export interface WeatherData {
    temperature: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    weatherCode: number;
    isFreezingConditions: boolean;
    isFreezeWarning: boolean;
    timestamp: Date;
}
export interface LiveWeatherResponse {
    weather: WeatherData;
    marketData: LiveMarketData;
}
/**
 * Fetches real weather data from Open-Meteo API for Winter Haven, FL
 */
export declare function fetchWeatherData(): Promise<WeatherData>;
/**
 * Fetches live market data including real weather
 * Combines real weather API data with simulated inventory data
 */
export declare function fetchLiveMarketData(): Promise<LiveWeatherResponse>;
/**
 * Formats the timestamp for display
 */
export declare function formatSyncTime(date: Date): string;
/**
 * Gets frost risk level based on temperature and conditions
 */
export declare function getFrostRiskLevel(temp: number, humidity: number, windSpeed: number): {
    level: "none" | "low" | "moderate" | "high" | "critical";
    description: string;
};
