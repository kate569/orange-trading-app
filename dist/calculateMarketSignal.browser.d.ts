export interface MarketSignalResult {
    winProbability: number;
    recommendedAction: string;
}
export interface SignalInsight {
    frostCondition: string;
    inventoryCondition: string;
    multiplierApplied: number;
    baseWinRate: number;
    laNinaEffect?: string;
    hurricaneEffect?: string;
    brazilDroughtEffect?: string;
}
export interface MarketContextParams {
    isLaNina: boolean;
    isHurricaneActive: boolean;
    hurricaneCenterFarFromPolk: boolean;
    brazilRainfallIndex: number;
    currentMonth: number;
}
export interface MarketSignalResultWithInsight extends MarketSignalResult {
    insight: SignalInsight;
    isHurricaneFalseAlarm: boolean;
    isLaNinaActive: boolean;
    isBrazilDrought: boolean;
}
/**
 * Calculates market signal based on temperature, frost duration, inventory levels,
 * and market context (La Niña, Hurricane, Brazil Drought conditions).
 * Browser-compatible version with embedded rules.
 *
 * @param currentTemp - Current temperature in Fahrenheit
 * @param hoursBelow28 - Number of hours temperature has been below 28°F
 * @param currentInventory - Current inventory in millions (e.g., 30 for 30M)
 * @param marketContext - Optional market context parameters (La Niña, Hurricane, Brazil)
 * @returns MarketSignalResultWithInsight with win probability, recommended action, and insight
 */
export declare function calculateMarketSignalBrowser(currentTemp: number, hoursBelow28: number, currentInventory: number, marketContext?: MarketContextParams): MarketSignalResultWithInsight;
export declare const STRATEGY_WIN_RATES: {
    laNina: number;
    volatility: number;
    realFrost: number;
    hurricaneFalseAlarm: number;
    brazilDrought: number;
};
