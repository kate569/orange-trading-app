import React, { useMemo } from "react";

interface RiskRewardCardProps {
  currentPrice: number;
  recommendation: string;
  winProbability: number;
  isHurricaneActive?: boolean;
  isLaNinaActive?: boolean;
}

interface TradeParameters {
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  riskAmount: number;
  rewardAmount: number;
  riskPercent: number;
  rewardPercent: number;
  riskRewardRatio: number;
  expectedValue: number;
  positionDirection: "LONG" | "SHORT" | "NEUTRAL";
}

/**
 * Calculates dynamic stop loss and take profit levels based on signal type
 */
function calculateTradeParameters(
  currentPrice: number,
  recommendation: string,
  winProbability: number,
  isHurricaneActive: boolean,
  isLaNinaActive: boolean
): TradeParameters {
  const action = recommendation.toUpperCase();
  
  // Determine position direction
  let positionDirection: "LONG" | "SHORT" | "NEUTRAL" = "NEUTRAL";
  if (action.includes("BUY") || action.includes("LONG") || action.includes("DOUBLE") || action.includes("INCREASE")) {
    positionDirection = "LONG";
  } else if (action.includes("SELL") || action.includes("SHORT") || action.includes("REDUCE")) {
    positionDirection = "SHORT";
  }

  // Base stop loss and take profit percentages
  let stopLossPercent = 2.0; // 2% base risk
  let takeProfitPercent = 6.0; // 6% base reward (1:3 ratio)

  // Adjust for hurricane volatility - widen stops to avoid premature stop-outs
  if (isHurricaneActive) {
    stopLossPercent = 2.5; // +0.5% to account for volatility
    takeProfitPercent = 7.5; // +1.5% to maintain 1:3 ratio
  }

  // Additional adjustment for La Niña (longer-term pattern)
  if (isLaNinaActive && !isHurricaneActive) {
    stopLossPercent = 2.2; // Slightly wider
    takeProfitPercent = 6.6; // Maintain 1:3 ratio
  }

  let stopLoss: number;
  let takeProfit: number;
  let riskAmount: number;
  let rewardAmount: number;

  if (positionDirection === "LONG") {
    // Long position: SL below entry, TP above entry
    stopLoss = currentPrice * (1 - stopLossPercent / 100);
    takeProfit = currentPrice * (1 + takeProfitPercent / 100);
    riskAmount = currentPrice - stopLoss;
    rewardAmount = takeProfit - currentPrice;
  } else if (positionDirection === "SHORT") {
    // Short position: SL above entry, TP below entry
    stopLoss = currentPrice * (1 + stopLossPercent / 100);
    takeProfit = currentPrice * (1 - takeProfitPercent / 100);
    riskAmount = stopLoss - currentPrice;
    rewardAmount = currentPrice - takeProfit;
  } else {
    // Neutral: No position, use placeholder values
    stopLoss = currentPrice * 0.98;
    takeProfit = currentPrice * 1.02;
    riskAmount = currentPrice * 0.02;
    rewardAmount = currentPrice * 0.02;
  }

  // Calculate risk/reward ratio
  const riskRewardRatio = rewardAmount / riskAmount;

  // Calculate Expected Value (EV)
  // EV = (WinProb × Reward) - ((1 - WinProb) × Risk)
  const expectedValue = (winProbability * rewardAmount) - ((1 - winProbability) * riskAmount);

  return {
    entryPrice: currentPrice,
    stopLoss: Math.round(stopLoss * 100) / 100,
    takeProfit: Math.round(takeProfit * 100) / 100,
    riskAmount: Math.round(riskAmount * 100) / 100,
    rewardAmount: Math.round(rewardAmount * 100) / 100,
    riskPercent: Math.round(stopLossPercent * 10) / 10,
    rewardPercent: Math.round(takeProfitPercent * 10) / 10,
    riskRewardRatio: Math.round(riskRewardRatio * 10) / 10,
    expectedValue: Math.round(expectedValue * 100) / 100,
    positionDirection,
  };
}

export const RiskRewardCard: React.FC<RiskRewardCardProps> = ({
  currentPrice,
  recommendation,
  winProbability,
  isHurricaneActive = false,
  isLaNinaActive = false,
}) => {
  const tradeParams = useMemo(
    () => calculateTradeParameters(
      currentPrice, 
      recommendation, 
      winProbability, 
      isHurricaneActive,
      isLaNinaActive
    ),
    [currentPrice, recommendation, winProbability, isHurricaneActive, isLaNinaActive]
  );

  // Calculate position of entry marker on the risk/reward bar (0-100%)
  const totalRange = tradeParams.riskAmount + tradeParams.rewardAmount;
  const entryPosition = (tradeParams.riskAmount / totalRange) * 100;

  // Determine colors based on position direction
  const getDirectionColor = () => {
    if (tradeParams.positionDirection === "LONG") return "#22c55e";
    if (tradeParams.positionDirection === "SHORT") return "#ef4444";
    return "#94a3b8";
  };

  const directionColor = getDirectionColor();

  // Determine EV color
  const getEvColor = (ev: number) => {
    if (ev > 0.5) return "#22c55e";
    if (ev > 0) return "#ff8c00";
    return "#ef4444";
  };

  const evColor = getEvColor(tradeParams.expectedValue);

  // Show volatility adjustment indicator
  const hasVolatilityAdjustment = isHurricaneActive || isLaNinaActive;

  return (
    <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <h3 className="text-slate-200 font-semibold text-lg">Trade Execution</h3>
        </div>
        {tradeParams.positionDirection !== "NEUTRAL" && (
          <span
            className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider"
            style={{
              backgroundColor: `${directionColor}20`,
              color: directionColor,
            }}
          >
            {tradeParams.positionDirection}
          </span>
        )}
      </div>

      {tradeParams.positionDirection === "NEUTRAL" ? (
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm">
            No active trade signal. Monitor market conditions.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Entry, Stop Loss, Take Profit */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Entry
              </div>
              <div className="text-lg font-bold text-slate-200">
                ${tradeParams.entryPrice.toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Stop Loss
              </div>
              <div className="text-lg font-bold text-red-400">
                ${tradeParams.stopLoss.toFixed(2)}
              </div>
              <div className="text-xs text-red-400 mt-0.5">
                -{tradeParams.riskPercent}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Take Profit
              </div>
              <div className="text-lg font-bold text-green-400">
                ${tradeParams.takeProfit.toFixed(2)}
              </div>
              <div className="text-xs text-green-400 mt-0.5">
                +{tradeParams.rewardPercent}%
              </div>
            </div>
          </div>

          {/* Risk/Reward Visual Gauge */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Risk/Reward Visualization</span>
              <span
                className="font-bold"
                style={{ color: directionColor }}
              >
                1:{tradeParams.riskRewardRatio.toFixed(1)} R/R
              </span>
            </div>

            {/* Visual Bar */}
            <div className="relative h-8 rounded-lg overflow-hidden bg-slate-900 border border-slate-700">
              {/* Risk Zone (Red) */}
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-red-500"
                style={{
                  width: `${entryPosition}%`,
                  boxShadow: "inset 0 0 10px rgba(0,0,0,0.3)",
                }}
              />
              
              {/* Reward Zone (Green) */}
              <div
                className="absolute top-0 h-full bg-gradient-to-r from-green-500 to-green-600"
                style={{
                  left: `${entryPosition}%`,
                  width: `${100 - entryPosition}%`,
                  boxShadow: "inset 0 0 10px rgba(0,0,0,0.3)",
                }}
              />

              {/* Entry Marker */}
              <div
                className="absolute top-0 h-full w-1 bg-white shadow-lg"
                style={{
                  left: `${entryPosition}%`,
                  boxShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
                }}
              />

              {/* Labels */}
              <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-bold">
                <span className="text-white drop-shadow-lg">RISK</span>
                <span 
                  className="absolute bg-white text-slate-900 px-2 py-0.5 rounded text-xs font-black"
                  style={{ 
                    left: `${entryPosition}%`,
                    transform: "translateX(-50%)",
                    boxShadow: "0 0 5px rgba(0,0,0,0.5)",
                  }}
                >
                  ENTRY
                </span>
                <span className="text-white drop-shadow-lg">REWARD</span>
              </div>
            </div>

            {/* Numeric breakdown */}
            <div className="flex justify-between text-xs text-slate-400">
              <span>
                Risk: <span className="text-red-400 font-semibold">${tradeParams.riskAmount.toFixed(2)}</span>
              </span>
              <span>
                Reward: <span className="text-green-400 font-semibold">${tradeParams.rewardAmount.toFixed(2)}</span>
              </span>
            </div>
          </div>

          {/* Expected Value (EV) Calculation */}
          <div
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: `${evColor}10`,
              borderColor: `${evColor}40`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider">
                Expected Value (EV)
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${evColor}20`,
                  color: evColor,
                }}
              >
                {tradeParams.expectedValue > 0 ? "POSITIVE" : "NEGATIVE"}
              </span>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span
                className="text-2xl font-bold"
                style={{ color: evColor }}
              >
                ${Math.abs(tradeParams.expectedValue).toFixed(2)}
              </span>
              <span className="text-slate-500 text-sm">per $1 risked</span>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-700/50">
              <p className="text-xs text-slate-400 leading-relaxed">
                EV = ({(winProbability * 100).toFixed(0)}% × ${tradeParams.rewardAmount.toFixed(2)}) - 
                ({(100 - winProbability * 100).toFixed(0)}% × ${tradeParams.riskAmount.toFixed(2)})
              </p>
            </div>
          </div>

          {/* Volatility Adjustment Notice */}
          {hasVolatilityAdjustment && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <span className="text-yellow-400 text-lg">⚠️</span>
              <div className="flex-1">
                <div className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-1">
                  Volatility Adjustment Applied
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isHurricaneActive && "Hurricane conditions detected. Stops widened to 2.5%/7.5% to account for increased volatility and avoid premature stop-outs."}
                  {!isHurricaneActive && isLaNinaActive && "La Niña conditions active. Stops adjusted to 2.2%/6.6% to account for elevated weather risk patterns."}
                </p>
              </div>
            </div>
          )}

          {/* Trade Execution Tips */}
          <div className="pt-3 border-t border-slate-700">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
              Execution Guidelines
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Use limit orders near entry price to avoid slippage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Set stop loss immediately after entry - do not adjust</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Consider scaling out at 1:2 R/R (50% position) and letting rest run</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Review position sizing: Risk only 1-2% of capital per trade</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskRewardCard;
