import React, { useState, useMemo } from "react";
import {
  calculateMarketSignalBrowser,
  MarketSignalResultWithInsight,
  MarketContextParams,
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

interface ToggleSwitchProps {
  label: string;
  sublabel?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: "orange" | "blue" | "red";
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  sublabel,
  checked,
  onChange,
  color = "orange",
}) => {
  const colorClasses = {
    orange: "bg-[#ff8c00]",
    blue: "bg-blue-500",
    red: "bg-red-500",
  };

  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <div>
        <span className="text-slate-300 text-sm font-medium">{label}</span>
        {sublabel && (
          <span className="text-slate-500 text-xs ml-2">({sublabel})</span>
        )}
      </div>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`w-11 h-6 rounded-full transition-colors ${
            checked ? colorClasses[color] : "bg-slate-600"
          }`}
        />
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </label>
  );
};

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer ml-4 mt-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-slate-500 bg-slate-700 text-red-500 
                   focus:ring-red-500 focus:ring-offset-slate-900"
      />
      <span className="text-slate-400 text-sm">{label}</span>
    </label>
  );
};

interface MarketContextSectionProps {
  context: MarketContextParams;
  onContextChange: (context: MarketContextParams) => void;
}

const MarketContextSection: React.FC<MarketContextSectionProps> = ({
  context,
  onContextChange,
}) => {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 mb-6">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Market Context
      </h3>
      <div className="space-y-4">
        <ToggleSwitch
          label="La Niña Active"
          sublabel="ONI < -0.5"
          checked={context.isLaNina}
          onChange={(checked) =>
            onContextChange({ ...context, isLaNina: checked })
          }
          color="blue"
        />
        <div>
          <ToggleSwitch
            label="Hurricane Warning"
            checked={context.isHurricaneActive}
            onChange={(checked) =>
              onContextChange({
                ...context,
                isHurricaneActive: checked,
                hurricaneCenterFarFromPolk: checked
                  ? context.hurricaneCenterFarFromPolk
                  : false,
              })
            }
            color="red"
          />
          {context.isHurricaneActive && (
            <Checkbox
              label="Is center > 100 miles from Polk County?"
              checked={context.hurricaneCenterFarFromPolk}
              onChange={(checked) =>
                onContextChange({
                  ...context,
                  hurricaneCenterFarFromPolk: checked,
                })
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

interface SignalGaugeProps {
  action: string;
  isHurricaneFalseAlarm: boolean;
}

const SignalGauge: React.FC<SignalGaugeProps> = ({
  action,
  isHurricaneFalseAlarm,
}) => {
  const accentColor = isHurricaneFalseAlarm ? "#ef4444" : "#ff8c00";

  return (
    <div
      className="relative p-6 rounded-xl text-center transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${accentColor}26 0%, ${accentColor}0d 100%)`,
        border: `2px solid ${accentColor}`,
        boxShadow: `0 0 30px ${accentColor}4d, 0 0 60px ${accentColor}1a, inset 0 0 30px ${accentColor}0d`,
      }}
    >
      <div className="text-slate-400 text-sm uppercase tracking-wider mb-2">
        Recommended Action
      </div>
      <div
        className="text-3xl font-black uppercase tracking-wide transition-colors duration-300"
        style={{
          color: accentColor,
          textShadow: `0 0 20px ${accentColor}80`,
        }}
      >
        {action}
      </div>
      {isHurricaneFalseAlarm && (
        <div className="mt-2 text-red-400 text-xs uppercase tracking-wider">
          ⚠️ Short Opportunity Detected
        </div>
      )}
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
        {insight.laNinaEffect && (
          <div className="flex items-start gap-2">
            <span className="text-blue-300">🌊</span>
            <span className="text-blue-300">{insight.laNinaEffect}</span>
          </div>
        )}
        {insight.hurricaneEffect && (
          <div className="flex items-start gap-2">
            <span className="text-red-400">🌀</span>
            <span className="text-red-300">{insight.hurricaneEffect}</span>
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-slate-700 text-slate-400">
          <span className="text-xs">
            Base win rate: {Math.round(insight.baseWinRate * 100)}% ×{" "}
            {insight.multiplierApplied}x multiplier
            {insight.laNinaEffect && " × 1.4x La Niña"}
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
  const [marketContext, setMarketContext] = useState<MarketContextParams>({
    isLaNina: false,
    isHurricaneActive: false,
    hurricaneCenterFarFromPolk: false,
  });

  // Calculate signal instantly as sliders move
  const signal = useMemo(() => {
    return calculateMarketSignalBrowser(
      currentTemp,
      hoursBelow28,
      currentInventory,
      marketContext
    );
  }, [currentTemp, hoursBelow28, currentInventory, marketContext]);

  // Dynamic border styling for La Niña effect
  const getDashboardBorderStyle = () => {
    if (signal.isLaNinaActive) {
      return {
        border: "1px solid rgba(59, 130, 246, 0.5)",
        boxShadow:
          "0 0 20px rgba(59, 130, 246, 0.2), 0 0 40px rgba(59, 130, 246, 0.1), inset 0 0 60px rgba(59, 130, 246, 0.03)",
      };
    }
    return {
      border: "1px solid rgb(30, 41, 59)",
    };
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div
        className="max-w-4xl mx-auto rounded-2xl p-6 transition-all duration-500"
        style={getDashboardBorderStyle()}
      >
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">
              Market Signal Predictor
            </h1>
            {signal.isLaNinaActive && (
              <span className="px-2 py-1 text-xs font-semibold bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                🌊 La Niña Active
              </span>
            )}
          </div>
          <p className="text-slate-400 mt-2">
            Orange Juice Futures Trading Analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Control Panel */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-2xl">
            <h2 className="text-lg font-semibold text-slate-200 mb-6 pb-4 border-b border-slate-700">
              Input Parameters
            </h2>

            {/* Market Context Section */}
            <MarketContextSection
              context={marketContext}
              onContextChange={setMarketContext}
            />

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
              <SignalGauge
                action={signal.recommendedAction}
                isHurricaneFalseAlarm={signal.isHurricaneFalseAlarm}
              />

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
