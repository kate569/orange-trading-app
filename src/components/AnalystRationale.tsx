import React from "react";

interface AnalystRationaleProps {
  rsi: number;
  inventory: number;
  temperature: number;
  recommendation: string;
  isHurricaneActive?: boolean;
  isLaNinaActive?: boolean;
  hurricaneLatestTitle?: string;
  laNinaSst?: number;
}

// Generate RSI analysis text
function getTechnicalSetup(rsi: number): { text: string; sentiment: "bullish" | "bearish" | "neutral" } {
  if (rsi <= 30) {
    return {
      text: `RSI is ${rsi} (Oversold), suggesting the asset is undervalued and due for a potential reversal. Historically, OJ futures tend to rebound strongly from oversold levels, especially when combined with supply concerns. This presents a favorable risk/reward entry point for long positions.`,
      sentiment: "bullish",
    };
  } else if (rsi >= 70) {
    return {
      text: `RSI is ${rsi} (Overbought), indicating the asset may be overextended. Price momentum is stretched and profit-taking is likely. Consider reducing exposure or waiting for a pullback before adding to positions. Overbought conditions often precede consolidation or correction phases.`,
      sentiment: "bearish",
    };
  } else if (rsi >= 50 && rsi < 70) {
    return {
      text: `RSI is ${rsi} (Neutral-Bullish), showing steady upward momentum without overextension. The technical picture supports continued strength, though aggressive entries carry moderate risk. Trend-following strategies remain viable at current levels.`,
      sentiment: "neutral",
    };
  } else if (rsi > 30 && rsi < 50) {
    return {
      text: `RSI is ${rsi} (Neutral-Bearish), reflecting subdued momentum. Price action lacks conviction, suggesting a wait-and-see approach. Monitor for either a breakdown toward oversold levels (buying opportunity) or a breakout above 50 (trend confirmation).`,
      sentiment: "neutral",
    };
  }
  return {
    text: `RSI is ${rsi}, indicating neutral market conditions.`,
    sentiment: "neutral",
  };
}

// Generate fundamental analysis text
function getFundamentalDrivers(
  inventory: number,
  temperature: number,
  isHurricaneActive: boolean,
  isLaNinaActive: boolean,
  hurricaneLatestTitle?: string,
  laNinaSst?: number
): { text: string; sentiment: "bullish" | "bearish" | "neutral" } {
  const parts: string[] = [];
  let overallSentiment: "bullish" | "bearish" | "neutral" = "neutral";
  let bullishFactors = 0;
  let bearishFactors = 0;

  // Hurricane analysis (LIVE DATA - highest priority)
  if (isHurricaneActive) {
    parts.push(
      `🌀 LIVE ALERT: Active hurricane warning detected${hurricaneLatestTitle ? ` (${hurricaneLatestTitle})` : ""}. Hurricane threats to Florida citrus belt create significant supply shock risk. Even if the storm doesn't make direct landfall, wind damage, flooding, and tree stress can reduce crop yields by 15-30%. Markets typically price in a 10-15% premium during hurricane season threats. This is a critical bullish catalyst.`
    );
    bullishFactors += 3;
  }

  // La Niña analysis (LIVE DATA - weather pattern multiplier)
  if (isLaNinaActive) {
    parts.push(
      `🌊 LIVE ALERT: La Niña conditions confirmed (SST: ${laNinaSst?.toFixed(2)}°C < 26.5°C threshold). La Niña weather patterns historically correlate with colder, wetter winters in Florida, increasing frost risk by 40-60%. This climate signal acts as a "double hit" multiplier on any supply disruption events. Historical win rate during La Niña periods: 79%.`
    );
    bullishFactors += 2;
  }

  // Inventory analysis
  if (inventory < 35) {
    parts.push(
      `Critical supply shortage (${inventory}M gallons) creates significant bullish pressure. Inventory below 35M historically triggers panic buying and sharp price spikes. Producers struggle to meet demand, giving buyers pricing power.`
    );
    bullishFactors += 2;
  } else if (inventory < 45) {
    parts.push(
      `Below-average inventory (${inventory}M gallons) supports prices. Supply tightness limits downside risk and creates favorable conditions for bulls. Any supply disruption could quickly escalate into a shortage.`
    );
    bullishFactors += 1;
  } else if (inventory > 55) {
    parts.push(
      `Elevated inventory (${inventory}M gallons) weighs on prices. Abundant supply gives buyers leverage and reduces urgency. Expect range-bound or bearish price action until inventories normalize.`
    );
    bearishFactors += 1;
  } else {
    parts.push(
      `Inventory at ${inventory}M gallons is within normal range, providing a balanced supply/demand picture. Neither bulls nor bears have a clear fundamental edge from storage levels alone.`
    );
  }

  // Temperature/Weather analysis
  if (temperature <= 28) {
    parts.push(
      `CRITICAL: Temperature at ${temperature}°F poses severe frost damage risk to Florida citrus. Prolonged exposure below 28°F causes irreversible crop damage, potentially reducing yields by 20-40%. This is the most bullish fundamental catalyst for OJ prices.`
    );
    bullishFactors += 3;
  } else if (temperature <= 32) {
    parts.push(
      `Freeze warning active with temperature at ${temperature}°F. Light frost possible, putting crops at risk. Markets are pricing in weather premium. Monitor closely for sustained cold that could escalate to damage conditions.`
    );
    bullishFactors += 1;
  } else if (temperature <= 36) {
    parts.push(
      `Frost advisory in effect at ${temperature}°F. While not immediately damaging, continued cold increases vulnerability. Weather remains a key watch factor for near-term price direction.`
    );
    bullishFactors += 0.5;
  } else if (temperature >= 50) {
    parts.push(
      `Favorable growing conditions at ${temperature}°F. No weather-related supply threats currently. This removes a key bullish catalyst and allows market focus to shift to demand and inventory fundamentals.`
    );
  } else {
    parts.push(
      `Temperature at ${temperature}°F is within safe range for citrus. No immediate frost concerns, though seasonal weather patterns warrant continued monitoring during winter months.`
    );
  }

  // Determine overall sentiment
  if (bullishFactors >= 2) {
    overallSentiment = "bullish";
  } else if (bearishFactors >= 1 && bullishFactors === 0) {
    overallSentiment = "bearish";
  }

  return {
    text: parts.join(" "),
    sentiment: overallSentiment,
  };
}

// Generate verdict text
function getVerdict(
  recommendation: string,
  rsi: number,
  inventory: number,
  temperature: number,
  isHurricaneActive: boolean,
  isLaNinaActive: boolean
): string {
  const action = recommendation.toUpperCase();

  if (action.includes("BUY") || action.includes("LONG") || action.includes("DOUBLE")) {
    const reasons: string[] = [];
    
    if (isHurricaneActive) reasons.push("active hurricane warning (LIVE)");
    if (isLaNinaActive) reasons.push("La Niña conditions confirmed (LIVE)");
    if (rsi <= 30) reasons.push("oversold technical conditions");
    if (inventory < 40) reasons.push("critical supply shortage");
    if (temperature <= 32) reasons.push("freeze-related crop risk");
    if (rsi > 30 && rsi < 50) reasons.push("room for upside momentum");
    
    const reasonText = reasons.length > 0 
      ? `Key catalysts: ${reasons.join(", ")}.` 
      : "";

    const liveDataPrefix = (isHurricaneActive || isLaNinaActive) 
      ? "🔴 LIVE DATA CONFIRMED: " 
      : "";

    return `${liveDataPrefix}STRONG BUY SIGNAL. The confluence of technical and fundamental factors strongly favors long positions in OJ futures. ${reasonText} Risk/reward is asymmetric to the upside. Consider scaling into positions on any short-term weakness. Set stops below recent support levels and target the upper end of the trading range.`;
  }

  if (action.includes("SELL") || action.includes("SHORT") || action.includes("REDUCE")) {
    const reasons: string[] = [];
    
    if (rsi >= 70) reasons.push("overbought technical conditions");
    if (inventory > 55) reasons.push("abundant supply");
    if (temperature > 45) reasons.push("no weather threats");
    
    const reasonText = reasons.length > 0 
      ? `Key factors: ${reasons.join(", ")}.` 
      : "";

    return `REDUCE EXPOSURE / TAKE PROFITS. Current conditions favor defensive positioning. ${reasonText} Consider trimming long positions or implementing hedges. Wait for a pullback or improved fundamentals before re-entering. Shorting may be appropriate for experienced traders with proper risk management.`;
  }

  if (action.includes("HOLD") || action.includes("MAINTAIN")) {
    return `HOLD CURRENT POSITIONS. The market is in equilibrium with no clear directional edge. Maintain existing exposure but avoid adding aggressively. Use this consolidation period to set alerts for key levels and prepare for the next directional move. Patience is warranted.`;
  }

  // Default: Monitor
  return `MONITOR & WAIT. Conditions do not favor immediate action. The technical and fundamental picture is mixed, suggesting a wait-and-see approach. Key levels to watch: RSI breaking above 50 (bullish) or below 30 (buying opportunity). On fundamentals, monitor inventory reports and weather forecasts for Florida. Be ready to act quickly when a clear setup emerges.`;
}

export const AnalystRationale: React.FC<AnalystRationaleProps> = ({
  rsi,
  inventory,
  temperature,
  recommendation,
  isHurricaneActive = false,
  isLaNinaActive = false,
  hurricaneLatestTitle,
  laNinaSst,
}) => {
  const technical = getTechnicalSetup(rsi);
  const fundamental = getFundamentalDrivers(
    inventory, 
    temperature, 
    isHurricaneActive, 
    isLaNinaActive,
    hurricaneLatestTitle,
    laNinaSst
  );
  const verdict = getVerdict(
    recommendation, 
    rsi, 
    inventory, 
    temperature,
    isHurricaneActive,
    isLaNinaActive
  );

  const getSentimentColor = (sentiment: "bullish" | "bearish" | "neutral") => {
    switch (sentiment) {
      case "bullish":
        return "#22c55e";
      case "bearish":
        return "#ef4444";
      default:
        return "#ff8c00";
    }
  };

  const getSentimentIcon = (sentiment: "bullish" | "bearish" | "neutral") => {
    switch (sentiment) {
      case "bullish":
        return "📈";
      case "bearish":
        return "📉";
      default:
        return "📊";
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700">
        <span className="text-xl">📝</span>
        <h3 className="text-slate-200 font-semibold text-lg">Strategic Analysis</h3>
      </div>

      <div className="space-y-5">
        {/* Technical Setup */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span>{getSentimentIcon(technical.sentiment)}</span>
            <h4
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: getSentimentColor(technical.sentiment) }}
            >
              Technical Setup
            </h4>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            {technical.text}
          </p>
        </div>

        {/* Fundamental Drivers */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span>{getSentimentIcon(fundamental.sentiment)}</span>
            <h4
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: getSentimentColor(fundamental.sentiment) }}
            >
              Fundamental Drivers
            </h4>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            {fundamental.text}
          </p>
        </div>

        {/* The Verdict */}
        <div
          className="mt-4 pt-4 border-t border-slate-700 rounded-lg p-4"
          style={{
            background: "linear-gradient(135deg, rgba(255, 140, 0, 0.1) 0%, rgba(255, 140, 0, 0.05) 100%)",
            border: "1px solid rgba(255, 140, 0, 0.3)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span>⚡</span>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-orange-400">
              The Verdict
            </h4>
          </div>
          <p className="text-slate-200 text-sm leading-relaxed font-medium">
            {verdict}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalystRationale;
