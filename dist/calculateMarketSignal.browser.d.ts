export interface MarketSignalResult {
    winProbability: number;
    recommendedAction: string;
}
export interface SignalInsight {
    frostCondition: string;
    inventoryCondition: string;
    multiplierApplied: number;
    baseWinRate: number;
}
export interface MarketSignalResultWithInsight extends MarketSignalResult {
    insight: SignalInsight;
}
/**
 * Calculates market signal based on temperature, frost duration, and inventory levels.
 * Browser-compatible version with embedded rules.
 *
 * @param currentTemp - Current temperature in Fahrenheit
 * @param hoursBelow28 - Number of hours temperature has been below 28°F
 * @param currentInventory - Current inventory in millions (e.g., 30 for 30M)
 * @returns MarketSignalResultWithInsight with win probability, recommended action, and insight
 */
export declare function calculateMarketSignalBrowser(currentTemp: number, hoursBelow28: number, currentInventory: number): MarketSignalResultWithInsight;
