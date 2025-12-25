import React from "react";
import { PriceData, formatPriceWithUnits, formatPriceChange } from "../services/priceService";

interface RiskRewardCardProps {
  currentPrice: PriceData;
  recommendedAction: string;
  winProbability: number;
}

/**
 * Calculates Entry, Stop Loss, and Target prices based on current market price
 * Uses standard risk/reward ratios for OJ futures trading
 */
function calculateRiskRewardLevels(
  currentPrice: PriceData,
  recommendedAction: string,
  winProbability: number
): {
  entry: number; // in dollars per pound
  stopLoss: number; // in dollars per pound
  target: number; // in dollars per pound
  riskRewardRatio: number;
  riskAmount: number; // in dollars per pound
  rewardAmount: number; // in dollars per pound
} {
  const currentPriceDollars = currentPrice.priceInDollars;
  
  // Determine if this is a long or short position
  const isLong = recommendedAction.includes("LONG") || 
                 recommendedAction.includes("BUY") || 
                 recommendedAction.includes("Double") ||
                 recommendedAction.includes("Increase") ||
                 recommendedAction.includes("Hold");

  // Base risk/reward ratios (adjust based on win probability)
  // Higher win probability = tighter stops, wider targets
  let stopLossPercent: number;
  let targetPercent: number;

  if (winProbability >= 0.75) {
    // High confidence: 2% stop, 6% target (3:1 R/R)
    stopLossPercent = 0.02;
    targetPercent = 0.06;
  } else if (winProbability >= 0.65) {
    // Medium-high confidence: 2.5% stop, 5% target (2:1 R/R)
    stopLossPercent = 0.025;
    targetPercent = 0.05;
  } else {
    // Lower confidence: 3% stop, 4.5% target (1.5:1 R/R)
    stopLossPercent = 0.03;
    targetPercent = 0.045;
  }

  let entry: number;
  let stopLoss: number;
  let target: number;

  if (isLong) {
    // Long position: entry at current price, stop below, target above
    entry = currentPriceDollars;
    stopLoss = currentPriceDollars * (1 - stopLossPercent);
    target = currentPriceDollars * (1 + targetPercent);
  } else {
    // Short position: entry at current price, stop above, target below
    entry = currentPriceDollars;
    stopLoss = currentPriceDollars * (1 + stopLossPercent);
    target = currentPriceDollars * (1 - targetPercent);
  }

  const riskAmount = Math.abs(entry - stopLoss);
  const rewardAmount = Math.abs(target - entry);
  const riskRewardRatio = rewardAmount / riskAmount;

  return {
    entry,
    stopLoss,
    target,
    riskRewardRatio,
    riskAmount,
    rewardAmount,
  };
}

export const RiskRewardCard: React.FC<RiskRewardCardProps> = ({
  currentPrice,
  recommendedAction,
  winProbability,
}) => {
  const levels = calculateRiskRewardLevels(currentPrice, recommendedAction, winProbability);
  const isLong = recommendedAction.includes("LONG") || 
                 recommendedAction.includes("BUY") || 
                 recommendedAction.includes("Double") ||
                 recommendedAction.includes("Increase") ||
                 recommendedAction.includes("Hold");

  const priceChangeColor = currentPrice.change >= 0 ? "#22c55e" : "#ef4444";
  const isHighConfidence = winProbability > 0.8;

  return (
    <div 
      className={`glass-card rounded-lg p-4 transition-all duration-300 ${isHighConfidence ? "animate-glow-pulse" : ""}`}
      style={isHighConfidence ? {
        border: "1px solid rgba(34, 197, 94, 0.3)",
      } : {}}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">💰</span>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Current Market Price
          </span>
          {currentPrice.isLive && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-semibold bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          )}
        </div>
      </div>

      {/* Current Price Display */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-bold text-white">
            {formatPriceWithUnits(currentPrice)}
          </span>
          <span className="text-xs text-slate-500">(USD/lb)</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-semibold"
            style={{ color: priceChangeColor }}
          >
            {formatPriceChange(currentPrice)}
          </span>
          <span className="text-xs text-slate-500">
            vs Previous Close
          </span>
        </div>
      </div>

      {/* Risk/Reward Levels */}
      <div className="space-y-4 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-400">📍</span>
            <span className="text-slate-300 text-sm font-medium">Entry Price</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-400">
              ${levels.entry.toFixed(2)}/lb
            </div>
            <div className="text-xs text-slate-500">(USD/lb)</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-red-400">🛑</span>
            <span className="text-slate-300 text-sm font-medium">Stop Loss</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-red-400">
              ${levels.stopLoss.toFixed(2)}/lb
            </div>
            <div className="text-xs text-slate-500">(USD/lb)</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green-400">🎯</span>
            <span className="text-slate-300 text-sm font-medium">Target Price</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-400">
              ${levels.target.toFixed(2)}/lb
            </div>
            <div className="text-xs text-slate-500">(USD/lb)</div>
          </div>
        </div>

        {/* Risk/Reward Summary */}
        <div className="pt-4 border-t border-slate-700">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <div className="text-xs text-slate-500 mb-1">Risk</div>
              <div className="text-sm font-semibold text-red-400">
                ${levels.riskAmount.toFixed(2)}/lb
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Reward</div>
              <div className="text-sm font-semibold text-green-400">
                ${levels.rewardAmount.toFixed(2)}/lb
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-700">
            <span className="text-xs text-slate-400">Risk/Reward Ratio</span>
            <span className="text-sm font-bold text-white">
              {levels.riskRewardRatio.toFixed(2)}:1
            </span>
          </div>
        </div>

        {/* Position Direction Indicator */}
        <div className="pt-2">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            isLong 
              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}>
            <span>{isLong ? "📈" : "📉"}</span>
            <span>{isLong ? "LONG Position" : "SHORT Position"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskRewardCard;

