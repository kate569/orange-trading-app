import React, { useState, useMemo } from "react";
import {
  calculateMarketSignalBrowser,
  MarketSignalResultWithInsight,
} from "../calculateMarketSignal.browser";

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (value: number) => void;
}

const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <label className="text-slate-300 text-sm font-medium uppercase tracking-wider">
          {label}
        </label>
        <span className="text-xl font-bold" style={{ color: "#ff8c00" }}>
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-5
                   [&::-webkit-slider-thumb]:h-5
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-[#ff8c00]
                   [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:shadow-lg
                   [&::-webkit-slider-thumb]:shadow-orange-500/30
                   [&::-moz-range-thumb]:w-5
                   [&::-moz-range-thumb]:h-5
                   [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:bg-[#ff8c00]
                   [&::-moz-range-thumb]:border-0
                   [&::-moz-range-thumb]:cursor-pointer"
      />
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
};

interface SignalGaugeProps {
  action: string;
}

const SignalGauge: React.FC<SignalGaugeProps> = ({ action }) => {
  return (
    <div
      className="relative p-6 rounded-xl text-center"
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 140, 0, 0.15) 0%, rgba(255, 140, 0, 0.05) 100%)",
        border: "2px solid #ff8c00",
        boxShadow:
          "0 0 30px rgba(255, 140, 0, 0.3), 0 0 60px rgba(255, 140, 0, 0.1), inset 0 0 30px rgba(255, 140, 0, 0.05)",
      }}
    >
      <div className="text-slate-400 text-sm uppercase tracking-wider mb-2">
        Recommended Action
      </div>
      <div
        className="text-3xl font-black uppercase tracking-wide"
        style={{
          color: "#ff8c00",
          textShadow: "0 0 20px rgba(255, 140, 0, 0.5)",
        }}
      >
        {action}
      </div>
    </div>
  );
};

interface WinProbabilityMeterProps {
  probability: number;
}

const WinProbabilityMeter: React.FC<WinProbabilityMeterProps> = ({
  probability,
}) => {
  const percentage = Math.round(probability * 100);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine color based on probability
  const getColor = (prob: number) => {
    if (prob >= 0.7) return "#22c55e"; // green
    if (prob >= 0.5) return "#ff8c00"; // orange
    return "#ef4444"; // red
  };

  const color = getColor(probability);

  return (
    <div className="flex flex-col items-center">
      <div className="text-slate-400 text-sm uppercase tracking-wider mb-4">
        Win Probability
      </div>
      <div className="relative w-32 h-32">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="#334155"
            strokeWidth="10"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke={color}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              filter: `drop-shadow(0 0 10px ${color})`,
              transition: "stroke-dashoffset 0.3s ease, stroke 0.3s ease",
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-3xl font-bold"
            style={{ color, textShadow: `0 0 15px ${color}` }}
          >
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
};

interface LogicInsightProps {
  insight: MarketSignalResultWithInsight["insight"];
}

const LogicInsight: React.FC<LogicInsightProps> = ({ insight }) => {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <div className="text-slate-400 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Logic Insight
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <span className="text-blue-400">❄️</span>
          <span className="text-slate-300">{insight.frostCondition}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-amber-400">📦</span>
          <span className="text-slate-300">{insight.inventoryCondition}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-700 text-slate-400">
          <span className="text-xs">
            Base win rate: {Math.round(insight.baseWinRate * 100)}% ×{" "}
            {insight.multiplierApplied}x multiplier
          </span>
        </div>
      </div>
    </div>
  );
};

export const PredictorDashboard: React.FC = () => {
  const [currentTemp, setCurrentTemp] = useState<number>(32);
  const [hoursBelow28, setHoursBelow28] = useState<number>(0);
  const [currentInventory, setCurrentInventory] = useState<number>(45);

  // Calculate signal instantly as sliders move
  const signal = useMemo(() => {
    return calculateMarketSignalBrowser(
      currentTemp,
      hoursBelow28,
      currentInventory
    );
  }, [currentTemp, hoursBelow28, currentInventory]);

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Market Signal Predictor
          </h1>
          <p className="text-slate-400">
            Orange Juice Futures Trading Analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Control Panel */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-2xl">
            <h2 className="text-lg font-semibold text-slate-200 mb-6 pb-4 border-b border-slate-700">
              Input Parameters
            </h2>

            <SliderControl
              label="Current Temperature"
              value={currentTemp}
              min={15}
              max={50}
              unit="°F"
              onChange={setCurrentTemp}
            />

            <SliderControl
              label="Hours Below 28°F"
              value={hoursBelow28}
              min={0}
              max={12}
              unit=" hrs"
              onChange={setHoursBelow28}
            />

            <SliderControl
              label="Current Inventory"
              value={currentInventory}
              min={20}
              max={70}
              unit="M"
              onChange={setCurrentInventory}
            />
          </div>

          {/* Prediction Results */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-2xl">
            <h2 className="text-lg font-semibold text-slate-200 mb-6 pb-4 border-b border-slate-700">
              Prediction Results
            </h2>

            <div className="space-y-6">
              {/* Signal Gauge */}
              <SignalGauge action={signal.recommendedAction} />

              {/* Win Probability Meter */}
              <WinProbabilityMeter probability={signal.winProbability} />

              {/* Logic Insight */}
              <LogicInsight insight={signal.insight} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictorDashboard;
