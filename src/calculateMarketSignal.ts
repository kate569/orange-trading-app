import * as fs from "fs";
import * as path from "path";

interface FrostRule {
  critical_temp_f: number;
  min_duration_hours: number;
  target_counties: string[];
}

interface InventoryMultipliers {
  under_35m: number;
  "35_45m": number;
  over_55m: number;
}

interface WinRates {
  la_nina_double_hit: number;
  volatility_pre_frost: number;
  real_frost: number;
}

interface MarketRules {
  theme: string;
  frost_rule: FrostRule;
  inventory_multipliers: InventoryMultipliers;
  win_rates: WinRates;
}

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
export function calculateMarketSignal(
  currentTemp: number,
  hoursBelow28: number,
  currentInventory: number
): MarketSignalResult {
  // Read market rules from JSON file
  const rulesPath = path.resolve(__dirname, "../constants/market_rules.json");
  const rulesData = fs.readFileSync(rulesPath, "utf-8");
  const rules: MarketRules = JSON.parse(rulesData);

  const { frost_rule, inventory_multipliers, win_rates } = rules;

  // Determine base win probability based on frost conditions
  let baseWinProbability: number;

  const isBelowCriticalTemp = currentTemp < frost_rule.critical_temp_f;
  const hasSufficientDuration = hoursBelow28 >= frost_rule.min_duration_hours;

  if (isBelowCriticalTemp && hasSufficientDuration) {
    // Real frost conditions met
    baseWinProbability = win_rates.real_frost;
  } else if (isBelowCriticalTemp) {
    // Pre-frost volatility (below critical temp but not enough duration yet)
    baseWinProbability = win_rates.volatility_pre_frost;
  } else {
    // No frost signal - use a baseline probability
    baseWinProbability = 0.5;
  }

  // Determine inventory multiplier
  let inventoryMultiplier: number;

  if (currentInventory < 35) {
    inventoryMultiplier = inventory_multipliers.under_35m;
  } else if (currentInventory <= 45) {
    inventoryMultiplier = inventory_multipliers["35_45m"];
  } else if (currentInventory > 55) {
    inventoryMultiplier = inventory_multipliers.over_55m;
  } else {
    // Between 45 and 55, use neutral multiplier
    inventoryMultiplier = 1.0;
  }

  // Calculate final win probability (capped at 0.95)
  const winProbability = Math.min(
    baseWinProbability * inventoryMultiplier,
    0.95
  );

  // Determine recommended action based on inventory and conditions
  let recommendedAction: string;

  if (currentInventory < 35) {
    recommendedAction = "Double Position";
  } else if (currentInventory <= 45 && isBelowCriticalTemp) {
    recommendedAction = "Increase Position";
  } else if (currentInventory > 55) {
    recommendedAction = "Reduce Position";
  } else if (isBelowCriticalTemp && hasSufficientDuration) {
    recommendedAction = "Hold Position";
  } else {
    recommendedAction = "Monitor";
  }

  return {
    winProbability: Math.round(winProbability * 100) / 100,
    recommendedAction,
  };
}
