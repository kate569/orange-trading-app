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
export function fetchLiveMarketData(delayMs: number = 800): Promise<LiveMarketData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate realistic Florida winter temperature (15-50°F range)
      // More likely to be in the 25-40°F range during frost season
      const currentTemp = Math.round(
        Math.random() < 0.3
          ? 15 + Math.random() * 15 // 30% chance of cold snap (15-30°F)
          : 30 + Math.random() * 20 // 70% chance of mild weather (30-50°F)
      );

      // Simulate inventory levels (20-70M range)
      // Tends toward middle values with occasional extremes
      const inventoryBase = 35 + Math.random() * 20; // Base: 35-55M
      const inventoryVariance = (Math.random() - 0.5) * 30; // +/- 15M variance
      const inventory = Math.round(
        Math.max(20, Math.min(70, inventoryBase + inventoryVariance))
      );

      // Hurricane alerts are rare (10% chance)
      const isHurricaneAlert = Math.random() < 0.1;

      resolve({
        currentTemp,
        inventory,
        isHurricaneAlert,
        timestamp: new Date(),
      });
    }, delayMs);
  });
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
