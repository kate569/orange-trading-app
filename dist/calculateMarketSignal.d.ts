export interface MarketSignalResult {
    winProbability: number;
    recommendedAction: string;
}
/**
 * Calculates market signal based on temperature, frost duration, and inventory levels.
 *
 * @param currentTemp - Current temperature in Fahrenheit
 * @param hoursBelow28 - Number of hours temperature has been below 28°F
 * @param currentInventory - Current inventory in millions (e.g., 30 for 30M)
 * @returns MarketSignalResult with win probability and recommended action
 */
export declare function calculateMarketSignal(currentTemp: number, hoursBelow28: number, currentInventory: number): MarketSignalResult;
