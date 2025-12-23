import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  calculateMarketSignalBrowser,
  MarketSignalResultWithInsight,
  MarketContextParams,
  STRATEGY_WIN_RATES,
} from "../calculateMarketSignal.browser";
import {
  fetchLiveMarketData,
  formatSyncTime,
  LiveMarketData,
} from "../services/marketDataStream";

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (value: number) => void;
  showSign?: boolean;
}

const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  showSign = false,
}) => {
  const displayValue = showSign && value > 0 ? `+${value}` : `${value}`;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <label className="text-slate-300 text-sm font-medium uppercase tracking-wider">
          {label}
        </label>
        <span className="text-xl font-bold" style={{ color: "#ff8c00" }}>
          {displayValue}
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
          {showSign && min > 0 ? "+" : ""}
          {min}
          {unit}
        </span>
        <span>
          {showSign && max > 0 ? "+" : ""}
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

interface ToastProps {
  message: string;
  timestamp?: string;
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  timestamp,
  isVisible,
  onClose,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl"
        style={{
          backgroundColor: "rgba(34, 197, 94, 0.95)",
          boxShadow: "0 0 20px rgba(34, 197, 94, 0.3)",
        }}
      >
        <div className="flex items-center justify-center w-6 h-6 bg-white/20 rounded-full">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <p className="text-white font-semibold">{message}</p>
          {timestamp && (
            <p className="text-white/70 text-xs">Last sync: {timestamp}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="ml-2 text-white/70 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

interface SyncButtonProps {
  onClick: () => void;
  isLoading: boolean;
  lastSync?: string;
}

const SyncButton: React.FC<SyncButtonProps> = ({
  onClick,
  isLoading,
  lastSync,
}) => {
  return (
    <div className="mb-6">
      <button
        onClick={onClick}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold
                   text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: isLoading
            ? "linear-gradient(135deg, #475569 0%, #334155 100%)"
            : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
          boxShadow: isLoading
            ? "none"
            : "0 0 20px rgba(34, 197, 94, 0.3)",
        }}
      >
        {isLoading ? (
          <>
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Syncing...</span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Sync Live Data</span>
          </>
        )}
      </button>
      {lastSync && (
        <p className="text-center text-slate-500 text-xs mt-2">
          Last synced: {lastSync}
        </p>
      )}
    </div>
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
  isBrazilDrought: boolean;
}

const SignalGauge: React.FC<SignalGaugeProps> = ({
  action,
  isHurricaneFalseAlarm,
  isBrazilDrought,
}) => {
  // Determine accent color based on signal type
  const getAccentColor = () => {
    if (isHurricaneFalseAlarm) return "#ef4444"; // Red for short
    if (isBrazilDrought) return "#a855f7"; // Purple for Brazil drought
    return "#ff8c00"; // Orange default
  };

  const accentColor = getAccentColor();

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
      {isBrazilDrought && (
        <div className="mt-2 text-purple-400 text-xs uppercase tracking-wider">
          🌾 Brazil Supply Crisis
        </div>
      )}
    </div>
  );
};

const BrazilDroughtWarning: React.FC = () => {
  return (
    <div
      className="p-4 rounded-lg border-2 mt-4"
      style={{
        backgroundColor: "rgba(168, 85, 247, 0.1)",
        borderColor: "#a855f7",
        boxShadow: "0 0 20px rgba(168, 85, 247, 0.2)",
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div>
          <div
            className="font-black text-lg uppercase tracking-wide mb-1"
            style={{ color: "#a855f7" }}
          >
            CRITICAL
          </div>
          <p className="text-purple-200 font-semibold">
            Do not exit for 12-18 months. 40-60% of move happens after 90 days.
          </p>
        </div>
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
        {insight.brazilDroughtEffect && (
          <div className="flex items-start gap-2">
            <span className="text-purple-400">🌾</span>
            <span className="text-purple-300">{insight.brazilDroughtEffect}</span>
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

const StrategySummaryTable: React.FC = () => {
  const strategies = [
    {
      name: "La Niña Double Hit",
      winRate: STRATEGY_WIN_RATES.laNina,
      icon: "🌊",
      color: "#3b82f6",
    },
    {
      name: "Pre-Frost Volatility",
      winRate: STRATEGY_WIN_RATES.volatility,
      icon: "📈",
      color: "#ff8c00",
    },
    {
      name: "Real Frost Event",
      winRate: STRATEGY_WIN_RATES.realFrost,
      icon: "❄️",
      color: "#60a5fa",
    },
    {
      name: "Hurricane False Alarm",
      winRate: STRATEGY_WIN_RATES.hurricaneFalseAlarm,
      icon: "🌀",
      color: "#ef4444",
    },
    {
      name: "Brazil Drought",
      winRate: STRATEGY_WIN_RATES.brazilDrought,
      icon: "🌾",
      color: "#a855f7",
    },
  ];

  // Sort by win rate descending
  const sortedStrategies = [...strategies].sort(
    (a, b) => b.winRate - a.winRate
  );

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-2xl mt-6">
      <h2 className="text-lg font-semibold text-slate-200 mb-6 pb-4 border-b border-slate-700">
        Strategy Summary Table
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-3 px-4">
                Strategy
              </th>
              <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider py-3 px-4">
                Historical Win Rate
              </th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-3 px-4 w-1/3">
                Performance
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStrategies.map((strategy, index) => (
              <tr
                key={strategy.name}
                className={`border-b border-slate-800 ${
                  index % 2 === 0 ? "bg-slate-800/30" : ""
                }`}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{strategy.icon}</span>
                    <span className="text-slate-200 font-medium">
                      {strategy.name}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <span
                    className="text-xl font-bold"
                    style={{ color: strategy.color }}
                  >
                    {Math.round(strategy.winRate * 100)}%
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${strategy.winRate * 100}%`,
                        backgroundColor: strategy.color,
                        boxShadow: `0 0 10px ${strategy.color}80`,
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    brazilRainfallIndex: 0,
    currentMonth: new Date().getMonth() + 1,
  });

  // Sync state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | undefined>();
  const [showToast, setShowToast] = useState<boolean>(false);

  // Handle live data sync
  const handleSyncLiveData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const liveData: LiveMarketData = await fetchLiveMarketData();

      // Update all sliders with live data
      setCurrentTemp(liveData.currentTemp);
      setCurrentInventory(liveData.inventory);
      setMarketContext((prev) => ({
        ...prev,
        isHurricaneActive: liveData.isHurricaneAlert,
        // Reset the far-from-polk checkbox when hurricane status changes
        hurricaneCenterFarFromPolk: liveData.isHurricaneAlert
          ? prev.hurricaneCenterFarFromPolk
          : false,
      }));

      // Update last sync time and show toast
      setLastSyncTime(formatSyncTime(liveData.timestamp));
      setShowToast(true);
    } catch (error) {
      console.error("Failed to sync live data:", error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

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

  // Check if we're in Brazil drought season (Aug-Oct)
  const isBrazilDroughtSeason = [8, 9, 10].includes(marketContext.currentMonth);
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      {/* Toast Notification */}
      <Toast
        message="Data Synced"
        timestamp={lastSyncTime}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* CSS for toast animation */}
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>

      <div
        className="max-w-4xl mx-auto rounded-2xl p-6 transition-all duration-500"
        style={getDashboardBorderStyle()}
      >
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-white">
              Market Signal Predictor
            </h1>
            {signal.isLaNinaActive && (
              <span className="px-2 py-1 text-xs font-semibold bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                🌊 La Niña Active
              </span>
            )}
            {signal.isBrazilDrought && (
              <span className="px-2 py-1 text-xs font-semibold bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                🌾 Brazil Drought
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

            {/* Sync Live Data Button */}
            <SyncButton
              onClick={handleSyncLiveData}
              isLoading={isSyncing}
              lastSync={lastSyncTime}
            />

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

            {/* Brazil Rainfall Index */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  Brazil Supply Monitor
                </h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    isBrazilDroughtSeason
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {monthNames[marketContext.currentMonth - 1]} (
                  {isBrazilDroughtSeason ? "Peak Season" : "Off Season"})
                </span>
              </div>
              <SliderControl
                label="Brazil Rainfall Index (SPI-3)"
                value={marketContext.brazilRainfallIndex}
                min={-3}
                max={3}
                step={0.1}
                unit=""
                onChange={(value) =>
                  setMarketContext({
                    ...marketContext,
                    brazilRainfallIndex: Math.round(value * 10) / 10,
                  })
                }
                showSign
              />
              <div className="flex justify-between text-xs text-slate-500 -mt-6">
                <span className="text-red-400">Extreme Drought</span>
                <span className="text-green-400">Excess Rain</span>
              </div>
            </div>
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
                isBrazilDrought={signal.isBrazilDrought}
              />

              {/* Brazil Drought Warning */}
              {signal.isBrazilDrought && <BrazilDroughtWarning />}

              {/* Win Probability Meter */}
              <WinProbabilityMeter probability={signal.winProbability} />

              {/* Logic Insight */}
              <LogicInsight insight={signal.insight} />
            </div>
          </div>
        </div>

        {/* Strategy Summary Table */}
        <StrategySummaryTable />
      </div>
    </div>
  );
};

export default PredictorDashboard;
