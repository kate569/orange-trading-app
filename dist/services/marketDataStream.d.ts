/**
 * Market Data Stream Service
 * Simulates fetching live market data from an external API
 */
export interface LiveMarketData {
    currentTemp: number;
    inventory: number;
    isHurricaneAlert: boolean;
    timestamp: Date;
}
/**
 * Simulates an API call to fetch live market data.
 * In production, this would connect to a real weather/market data API.
 *
 * @param delayMs - Simulated network delay in milliseconds (default: 800ms)
 * @returns Promise resolving to LiveMarketData
 */
export declare function fetchLiveMarketData(delayMs?: number): Promise<LiveMarketData>;
/**
 * Formats the timestamp for display
 */
export declare function formatSyncTime(date: Date): string;
