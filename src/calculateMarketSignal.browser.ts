// Browser-compatible version of calculateMarketSignal
// Uses embedded rules instead of filesystem access

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

export interface SignalInsight {
  frostCondition: string;
  inventoryCondition: string;
  multiplierApplied: number;
  baseWinRate: number;
}

// Embedded market rules (from constants/market_rules.json)
const MARKET_RULES: MarketRules = {
  theme: "Orange Juice Trading",
  frost_rule: {
    critical_temp_f: 28,
    min_duration_hours: 4,
    target_counties: ["Polk", "Highlands", "Lake"],
  },
  inventory_multipliers: {
    under_35m: 2.0,
    "35_45m": 1.5,
    over_55m: 0.7,
  },
  win_rates: {
    la_nina_double_hit: 0.79,
    volatility_pre_frost: 0.79,
    real_frost: 0.76,
  },
};

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
export function calculateMarketSignalBrowser(
  currentTemp: number,
  hoursBelow28: number,
  currentInventory: number
): MarketSignalResultWithInsight {
  const { frost_rule, inventory_multipliers, win_rates } = MARKET_RULES;

  // Determine base win probability based on frost conditions
  let baseWinProbability: number;
  let frostCondition: string;

  const isBelowCriticalTemp = currentTemp < frost_rule.critical_temp_f;
  const hasSufficientDuration = hoursBelow28 >= frost_rule.min_duration_hours;

  if (isBelowCriticalTemp && hasSufficientDuration) {
    // Real frost conditions met
    baseWinProbability = win_rates.real_frost;
    frostCondition = `Real frost detected: ${currentTemp}°F for ${hoursBelow28}+ hours`;
  } else if (isBelowCriticalTemp) {
    // Pre-frost volatility (below critical temp but not enough duration yet)
    baseWinProbability = win_rates.volatility_pre_frost;
    frostCondition = `Pre-frost volatility: ${currentTemp}°F (need ${frost_rule.min_duration_hours}h duration)`;
  } else {
    // No frost signal - use a baseline probability
    baseWinProbability = 0.5;
    frostCondition = `No frost signal: ${currentTemp}°F above ${frost_rule.critical_temp_f}°F threshold`;
  }

  // Determine inventory multiplier
  let inventoryMultiplier: number;
  let inventoryCondition: string;

  if (currentInventory < 35) {
    inventoryMultiplier = inventory_multipliers.under_35m;
    inventoryCondition = `Inventory < 35M triggers ${inventoryMultiplier}x risk multiplier`;
  } else if (currentInventory <= 45) {
    inventoryMultiplier = inventory_multipliers["35_45m"];
    inventoryCondition = `Inventory 35-45M triggers ${inventoryMultiplier}x multiplier`;
  } else if (currentInventory > 55) {
    inventoryMultiplier = inventory_multipliers.over_55m;
    inventoryCondition = `Inventory > 55M triggers ${inventoryMultiplier}x (reduced) multiplier`;
  } else {
    // Between 45 and 55, use neutral multiplier
    inventoryMultiplier = 1.0;
    inventoryCondition = `Inventory 45-55M: neutral position (1.0x multiplier)`;
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
    insight: {
      frostCondition,
      inventoryCondition,
      multiplierApplied: inventoryMultiplier,
      baseWinRate: baseWinProbability,
    },
  };
}
