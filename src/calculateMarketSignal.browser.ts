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
  hurricane_false_alarm: number;
  brazil_drought: number;
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
  laNinaEffect?: string;
  hurricaneEffect?: string;
  brazilDroughtEffect?: string;
  rsiEffect?: string;
}

export interface MarketContextParams {
  isLaNina: boolean;
  isHurricaneActive: boolean;
  hurricaneCenterFarFromPolk: boolean;
  brazilRainfallIndex: number;
  currentMonth: number; // 1-12
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
    hurricane_false_alarm: 0.71,
    brazil_drought: 0.69,
  },
};

// Additional market context multipliers
const LA_NINA_MULTIPLIER = 1.4;
const HURRICANE_FALSE_ALARM_WIN_RATE = 0.71;
const BRAZIL_DROUGHT_WIN_RATE = 0.69;
const BRAZIL_DROUGHT_THRESHOLD = -1.5;
const BRAZIL_DROUGHT_MONTHS = [8, 9, 10]; // Aug, Sep, Oct
const MAX_WIN_PROBABILITY = 0.95;

// RSI thresholds
const RSI_OVERBOUGHT_THRESHOLD = 70;
const TEMP_RECOVERY_THRESHOLD = 35;
const RSI_TAKE_PROFIT_WIN_RATE = 0.72;

export interface MarketSignalResultWithInsight extends MarketSignalResult {
  insight: SignalInsight;
  isHurricaneFalseAlarm: boolean;
  isLaNinaActive: boolean;
  isBrazilDrought: boolean;
  isRsiOverbought: boolean;
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
 * @param rsiValue - Optional RSI (14-day) value for overbought/oversold detection
 * @returns MarketSignalResultWithInsight with win probability, recommended action, and insight
 */
export function calculateMarketSignalBrowser(
  currentTemp: number,
  hoursBelow28: number,
  currentInventory: number,
  marketContext?: MarketContextParams,
  rsiValue: number = 50
): MarketSignalResultWithInsight {
  const { frost_rule, inventory_multipliers, win_rates } = MARKET_RULES;

  // Default market context
  const context: MarketContextParams = marketContext ?? {
    isLaNina: false,
    isHurricaneActive: false,
    hurricaneCenterFarFromPolk: false,
    brazilRainfallIndex: 0,
    currentMonth: new Date().getMonth() + 1,
  };

  // Check for Brazil Drought first (Aug-Oct, SPI-3 < -1.5)
  const isBrazilDroughtSeason = BRAZIL_DROUGHT_MONTHS.includes(
    context.currentMonth
  );
  const isBrazilDrought =
    isBrazilDroughtSeason &&
    context.brazilRainfallIndex < BRAZIL_DROUGHT_THRESHOLD;

  if (isBrazilDrought) {
    return {
      winProbability: BRAZIL_DROUGHT_WIN_RATE,
      recommendedAction: "STRONG LONG (Brazil Drought)",
      isHurricaneFalseAlarm: false,
      isLaNinaActive: context.isLaNina,
      isBrazilDrought: true,
      isRsiOverbought: false,
      insight: {
        frostCondition: "Brazil drought override active - frost conditions bypassed",
        inventoryCondition: "Brazil drought override active - inventory conditions bypassed",
        multiplierApplied: 1.0,
        baseWinRate: BRAZIL_DROUGHT_WIN_RATE,
        brazilDroughtEffect: `Brazil SPI-3 at ${context.brazilRainfallIndex.toFixed(1)} (< ${BRAZIL_DROUGHT_THRESHOLD}) during peak season. Historical win rate: ${BRAZIL_DROUGHT_WIN_RATE * 100}%`,
      },
    };
  }

  // Check for RSI Overbought + Temperature Recovery (Take Profit Signal)
  const isRsiOverbought = rsiValue > RSI_OVERBOUGHT_THRESHOLD;
  const isTempRecovered = currentTemp > TEMP_RECOVERY_THRESHOLD;

  if (isRsiOverbought && isTempRecovered) {
    return {
      winProbability: RSI_TAKE_PROFIT_WIN_RATE,
      recommendedAction: "TAKE PROFIT / SELL",
      isHurricaneFalseAlarm: false,
      isLaNinaActive: context.isLaNina,
      isBrazilDrought: false,
      isRsiOverbought: true,
      insight: {
        frostCondition: `Temperature recovered to ${currentTemp}°F (above ${TEMP_RECOVERY_THRESHOLD}°F threshold)`,
        inventoryCondition: "RSI signal override active - inventory conditions secondary",
        multiplierApplied: 1.0,
        baseWinRate: RSI_TAKE_PROFIT_WIN_RATE,
        rsiEffect: `Market is overbought (RSI ${rsiValue} > ${RSI_OVERBOUGHT_THRESHOLD}) and temperature has recovered. Risk of price correction is high.`,
      },
    };
  }

  // Check for Hurricane False Alarm - this overrides frost/inventory logic
  if (context.isHurricaneActive && context.hurricaneCenterFarFromPolk) {
    return {
      winProbability: HURRICANE_FALSE_ALARM_WIN_RATE,
      recommendedAction: "SELL/SHORT (False Alarm)",
      isHurricaneFalseAlarm: true,
      isLaNinaActive: context.isLaNina,
      isBrazilDrought: false,
      isRsiOverbought: false,
      insight: {
        frostCondition: "Hurricane override active - frost conditions bypassed",
        inventoryCondition: "Hurricane override active - inventory conditions bypassed",
        multiplierApplied: 1.0,
        baseWinRate: HURRICANE_FALSE_ALARM_WIN_RATE,
        hurricaneEffect: `Hurricane center >100mi from Polk County = False Alarm. Historical win rate: ${HURRICANE_FALSE_ALARM_WIN_RATE * 100}%`,
      },
    };
  }

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

  // Calculate win probability with inventory multiplier
  let winProbability = baseWinProbability * inventoryMultiplier;

  // Apply La Niña effect
  let laNinaEffect: string | undefined;
  if (context.isLaNina) {
    winProbability *= LA_NINA_MULTIPLIER;
    laNinaEffect = `La Niña active (ONI < -0.5): ${LA_NINA_MULTIPLIER}x multiplier applied. Historical "Double Hit" win rate: ${win_rates.la_nina_double_hit * 100}%`;
  }

  // Cap at maximum probability
  winProbability = Math.min(winProbability, MAX_WIN_PROBABILITY);

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

  // Hurricane warning without false alarm condition
  let hurricaneEffect: string | undefined;
  if (context.isHurricaneActive && !context.hurricaneCenterFarFromPolk) {
    hurricaneEffect = "Hurricane warning active - monitoring for potential impact on Polk County";
  }

  // Brazil drought info (outside of season or above threshold)
  let brazilDroughtEffect: string | undefined;
  if (isBrazilDroughtSeason && context.brazilRainfallIndex >= BRAZIL_DROUGHT_THRESHOLD) {
    brazilDroughtEffect = `Brazil SPI-3 at ${context.brazilRainfallIndex.toFixed(1)} (above ${BRAZIL_DROUGHT_THRESHOLD} threshold) - no drought signal`;
  } else if (!isBrazilDroughtSeason && context.brazilRainfallIndex < BRAZIL_DROUGHT_THRESHOLD) {
    brazilDroughtEffect = `Brazil SPI-3 at ${context.brazilRainfallIndex.toFixed(1)} - drought conditions noted but outside Aug-Oct window`;
  }

  // RSI info (when not triggering take profit)
  let rsiEffect: string | undefined;
  if (rsiValue > RSI_OVERBOUGHT_THRESHOLD) {
    rsiEffect = `RSI at ${rsiValue} (overbought) - watch for temperature recovery above ${TEMP_RECOVERY_THRESHOLD}°F to trigger take profit`;
  } else if (rsiValue < 30) {
    rsiEffect = `RSI at ${rsiValue} (oversold) - potential buying opportunity if fundamentals align`;
  }

  return {
    winProbability: Math.round(winProbability * 100) / 100,
    recommendedAction,
    isHurricaneFalseAlarm: false,
    isLaNinaActive: context.isLaNina,
    isBrazilDrought: false,
    isRsiOverbought: isRsiOverbought,
    insight: {
      frostCondition,
      inventoryCondition,
      multiplierApplied: inventoryMultiplier,
      baseWinRate: baseWinProbability,
      laNinaEffect,
      hurricaneEffect,
      brazilDroughtEffect,
      rsiEffect,
    },
  };
}

// Export win rates for the Strategy Summary Table
export const STRATEGY_WIN_RATES = {
  laNina: MARKET_RULES.win_rates.la_nina_double_hit,
  volatility: MARKET_RULES.win_rates.volatility_pre_frost,
  realFrost: MARKET_RULES.win_rates.real_frost,
  hurricaneFalseAlarm: MARKET_RULES.win_rates.hurricane_false_alarm,
  brazilDrought: MARKET_RULES.win_rates.brazil_drought,
};
