import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  calculateMarketSignalBrowser,
  MarketSignalResultWithInsight,
  MarketContextParams,
  STRATEGY_WIN_RATES,
} from "../calculateMarketSignal.browser";
import {
  fetchLiveMarketData,
  fetchLiveMarketRSI,
  formatSyncTime,
  WeatherData,
  LiveWeatherResponse,
  getFrostRiskLevel,
  RSIResult,
} from "../services/marketDataStream";

// localStorage keys for persistence
const FROST_STORAGE_KEY = "oj_frost_tracker";
const MARKET_DATA_STORAGE_KEY = "oj_market_data";
const RSI_STORAGE_KEY = "oj_rsi_value";
const CRITICAL_FROST_HOURS = 4;
const CRITICAL_TEMP_THRESHOLD = 28;
const RESET_TEMP_THRESHOLD = 32;
const STALE_DATA_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

interface FrostTrackerData {
  accumulatedSeconds: number;
  lastUpdateTime: number;
  isTracking: boolean;
}

// Persisted market data interface
interface PersistedMarketData {
  currentTemp: number;
  currentInventory: number;
  hoursBelow28: number;
  marketContext: MarketContextParams;
  weatherData: WeatherData | null;
  lastSyncTimestamp: number;
  lastSyncTimeFormatted: string;
}

// Trade Blueprint data interface
interface TradeBlueprintData {
  primarySignal: string;
  currentTemp: number;
  frostDuration: string;
  inventoryLevel: number;
  isLaNinaActive: boolean;
  winRate: number;
  avgProfit: number;
  positionMultiplier: number;
  timestamp: Date;
}

// Helper to load frost data from localStorage
function loadFrostData(): FrostTrackerData {
  try {
    const stored = localStorage.getItem(FROST_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as FrostTrackerData;
      // If we were tracking, add the time since last update
      if (data.isTracking && data.lastUpdateTime) {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - data.lastUpdateTime) / 1000);
        return {
          ...data,
          accumulatedSeconds: data.accumulatedSeconds + elapsedSeconds,
          lastUpdateTime: now,
        };
      }
      return data;
    }
  } catch (e) {
    console.error("Failed to load frost data:", e);
  }
  return { accumulatedSeconds: 0, lastUpdateTime: Date.now(), isTracking: false };
}

// Helper to save frost data to localStorage
function saveFrostData(data: FrostTrackerData): void {
  try {
    localStorage.setItem(FROST_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save frost data:", e);
  }
}

// Helper to load market data from localStorage
function loadMarketData(): PersistedMarketData | null {
  try {
    const stored = localStorage.getItem(MARKET_DATA_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as PersistedMarketData;
    }
  } catch (e) {
    console.error("Failed to load market data:", e);
  }
  return null;
}

// Helper to save market data to localStorage
function saveMarketData(data: PersistedMarketData): void {
  try {
    localStorage.setItem(MARKET_DATA_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save market data:", e);
  }
}

// Helper to load RSI value from localStorage
function loadRsiValue(): number {
  try {
    const stored = localStorage.getItem(RSI_STORAGE_KEY);
    if (stored) {
      const value = parseInt(stored, 10);
      if (!isNaN(value) && value >= 0 && value <= 100) {
        return value;
      }
    }
  } catch (e) {
    console.error("Failed to load RSI value:", e);
  }
  return 50; // Default value
}

// Helper to save RSI value to localStorage
function saveRsiValue(value: number): void {
  try {
    localStorage.setItem(RSI_STORAGE_KEY, value.toString());
  } catch (e) {
    console.error("Failed to save RSI value:", e);
  }
}

// Helper to check if data is stale (older than 30 minutes)
function isDataStale(lastSyncTimestamp: number): boolean {
  return Date.now() - lastSyncTimestamp > STALE_DATA_THRESHOLD_MS;
}

// Helper to format seconds as "Xh Ym Zs"
function formatFrostDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

// Helper to format frost duration for blueprint (shorter format)
function formatFrostDurationShort(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

// Generate trade blueprint text
function generateTradeBlueprintText(data: TradeBlueprintData): string {
  const timestamp = data.timestamp.toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return `
═══════════════════════════════════════════════════════
                    TRADE BLUEPRINT
              Orange Juice Futures (OJ)
═══════════════════════════════════════════════════════

📅 Generated: ${timestamp}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 PRIMARY SIGNAL
   ${data.primarySignal}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 DATA PROOF

   🌡️  Current Temperature:  ${data.currentTemp}°F
   ⏱️  Total Duration:       ${data.frostDuration}
   📦  Inventory Level:      ${data.inventoryLevel}M gallons
   🌊  La Niña Status:       ${data.isLaNinaActive ? "ACTIVE (ONI < -0.5)" : "Inactive"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 STRATEGY CONFIDENCE

   Historical Win Rate:  ${Math.round(data.winRate * 100)}%
   Avg Expected Profit:  +${data.avgProfit.toFixed(1)}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  RISK MANAGEMENT

   Position Multiplier:  ${data.positionMultiplier.toFixed(2)}x
   Recommended Size:     ${data.positionMultiplier.toFixed(2)}x base position

   ${data.positionMultiplier >= 2.0 ? "🔥 HIGH CONVICTION SETUP - Maximum position size recommended" : 
     data.positionMultiplier >= 1.5 ? "📈 STRONG SETUP - Above-average position size recommended" :
     data.positionMultiplier >= 1.0 ? "📊 STANDARD SETUP - Normal position size recommended" :
     "⚠️ REDUCED CONVICTION - Below-average position size recommended"}

═══════════════════════════════════════════════════════
         Generated by OJ Market Signal Predictor
═══════════════════════════════════════════════════════
`.trim();
}

// Data Card component for read-only value display
interface DataCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  color?: string;
  sublabel?: string;
  status?: {
    text: string;
    color: string;
  };
  isAutoSynced?: boolean;
}

const DataCard: React.FC<DataCardProps> = ({
  label,
  value,
  unit = "",
  icon,
  color = "#ff8c00",
  sublabel,
  status,
  isAutoSynced = false,
}) => {
  return (
    <div
      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 transition-all duration-300 hover:border-slate-600"
      style={{
        boxShadow: `0 0 10px ${color}10`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            {label}
          </span>
          {isAutoSynced && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-semibold bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          )}
        </div>
        {status && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded"
            style={{
              backgroundColor: `${status.color}20`,
              color: status.color,
            }}
          >
            {status.text}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className="text-2xl font-bold"
          style={{ color }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-slate-400 text-sm font-medium">{unit}</span>
        )}
      </div>
      {sublabel && (
        <p className="text-slate-500 text-xs mt-1">{sublabel}</p>
      )}
    </div>
  );
};

// RSI Data Card with special status indicators
interface RSIDataCardProps {
  value: number;
  isAutoSynced?: boolean;
  syncError?: string;
}

const RSIDataCard: React.FC<RSIDataCardProps> = ({ value, isAutoSynced = false, syncError }) => {
  const isOverbought = value > 70;
  const isOversold = value < 30;

  const getValueColor = () => {
    if (isOverbought) return "#ef4444";
    if (isOversold) return "#22c55e";
    return "#ff8c00";
  };

  const getStatus = () => {
    if (isOverbought) return { text: "OVERBOUGHT", color: "#ef4444" };
    if (isOversold) return { text: "OVERSOLD", color: "#22c55e" };
    return { text: "NEUTRAL", color: "#ff8c00" };
  };

  return (
    <div
      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 transition-all duration-300"
      style={{
        borderColor: isOverbought ? "#ef444440" : isOversold ? "#22c55e40" : "#334155",
        boxShadow: `0 0 15px ${getValueColor()}15`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Market RSI (14-day)
          </span>
          {isAutoSynced && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-semibold bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          )}
          {syncError && !isAutoSynced && (
            <span className="text-xs text-yellow-500" title={syncError}>
              ⚠️
            </span>
          )}
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded"
          style={{
            backgroundColor: `${getStatus().color}20`,
            color: getStatus().color,
          }}
        >
          {getStatus().text}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="text-3xl font-bold"
          style={{ color: getValueColor() }}
        >
          {value}
        </span>
        <span className="text-slate-500 text-sm">/ 100</span>
      </div>
      {/* RSI Scale indicator */}
      <div className="mt-3 relative">
        <div className="h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-30" />
        <div
          className="absolute top-0 w-3 h-3 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-0.5"
          style={{
            left: `${value}%`,
            backgroundColor: getValueColor(),
            boxShadow: `0 0 8px ${getValueColor()}`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span className="text-green-400">Oversold</span>
        <span className="text-red-400">Overbought</span>
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
  variant?: "success" | "info";
}

const Toast: React.FC<ToastProps> = ({
  message,
  timestamp,
  isVisible,
  onClose,
  variant = "success",
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

  const bgColor = variant === "success" 
    ? "rgba(34, 197, 94, 0.95)" 
    : "rgba(59, 130, 246, 0.95)";
  const shadowColor = variant === "success"
    ? "rgba(34, 197, 94, 0.3)"
    : "rgba(59, 130, 246, 0.3)";

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl"
        style={{
          backgroundColor: bgColor,
          boxShadow: `0 0 20px ${shadowColor}`,
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

interface FrostClockProps {
  accumulatedSeconds: number;
  isTracking: boolean;
  onReset: () => void;
}

const FrostClock: React.FC<FrostClockProps> = ({
  accumulatedSeconds,
  isTracking,
  onReset,
}) => {
  const hours = accumulatedSeconds / 3600;
  const progress = Math.min((hours / CRITICAL_FROST_HOURS) * 100, 100);
  const isCritical = hours >= CRITICAL_FROST_HOURS;

  return (
    <div
      className={`rounded-lg p-4 border transition-all duration-300 ${
        isCritical
          ? "bg-red-900/30 border-red-500"
          : isTracking
          ? "bg-blue-900/30 border-blue-500"
          : "bg-slate-800/50 border-slate-700"
      }`}
      style={{
        boxShadow: isCritical
          ? "0 0 20px rgba(239, 68, 68, 0.3)"
          : isTracking
          ? "0 0 15px rgba(59, 130, 246, 0.2)"
          : "none",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">⏱️</span>
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${
              isCritical
                ? "text-red-400"
                : isTracking
                ? "text-blue-400"
                : "text-slate-400"
            }`}
          >
            Frost Clock
          </span>
          {isTracking && (
            <span className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  isCritical ? "bg-red-500" : "bg-blue-500"
                }`}
              />
              <span className="text-xs text-slate-500">TRACKING</span>
            </span>
          )}
        </div>
        {accumulatedSeconds > 0 && (
          <button
            onClick={onReset}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-slate-400 text-sm">Time at Critical Level:</span>
        <span
          className={`text-xl font-bold font-mono ${
            isCritical
              ? "text-red-400"
              : isTracking
              ? "text-blue-400"
              : "text-slate-300"
          }`}
        >
          {formatFrostDuration(accumulatedSeconds)}
        </span>
      </div>

      {/* Progress bar to 4 hours */}
      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${
            isCritical ? "bg-red-500" : "bg-blue-500"
          }`}
          style={{
            width: `${progress}%`,
            boxShadow: isCritical
              ? "0 0 10px rgba(239, 68, 68, 0.5)"
              : "0 0 10px rgba(59, 130, 246, 0.5)",
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>0h</span>
        <span className={isCritical ? "text-red-400 font-semibold" : ""}>
          {CRITICAL_FROST_HOURS}h (Damage Threshold)
        </span>
      </div>
    </div>
  );
};

interface TradeBlueprintModalProps {
  isVisible: boolean;
  blueprintData: TradeBlueprintData | null;
  onClose: () => void;
  onCopy: () => void;
}

const TradeBlueprintModal: React.FC<TradeBlueprintModalProps> = ({
  isVisible,
  blueprintData,
  onClose,
  onCopy,
}) => {
  if (!isVisible || !blueprintData) return null;

  const blueprintText = generateTradeBlueprintText(blueprintData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div
        className="max-w-2xl w-full max-h-[90vh] rounded-xl overflow-hidden animate-bounce-in"
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          border: "2px solid #3b82f6",
          boxShadow: "0 0 40px rgba(59, 130, 246, 0.3)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <h2 className="text-xl font-bold text-white">Trade Blueprint</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Blueprint Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <pre
            className="text-sm font-mono text-slate-300 whitespace-pre-wrap bg-slate-900/50 p-4 rounded-lg border border-slate-700"
            style={{ lineHeight: 1.5 }}
          >
            {blueprintText}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700 bg-slate-800/50">
          <p className="text-slate-400 text-sm">
            Copy this memo to your trading journal
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={onCopy}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy to Clipboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PhysicalDamageAlertProps {
  isVisible: boolean;
  onDismiss: () => void;
  onGenerateBlueprint: () => void;
  blueprintData: TradeBlueprintData | null;
}

const PhysicalDamageAlert: React.FC<PhysicalDamageAlertProps> = ({
  isVisible,
  onDismiss,
  onGenerateBlueprint,
  blueprintData,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div
        className="max-w-md w-full rounded-xl p-6 animate-bounce-in"
        style={{
          background: "linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)",
          border: "2px solid #ef4444",
          boxShadow:
            "0 0 60px rgba(239, 68, 68, 0.5), 0 0 100px rgba(239, 68, 68, 0.3)",
        }}
      >
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🚨</div>
          <h2 className="text-2xl font-black text-red-400 uppercase tracking-wider mb-2">
            Physical Damage Confirmed
          </h2>
          <p className="text-red-200 text-lg font-bold mb-4">
            4+ Hours Below 28°F
          </p>
          <div
            className="bg-red-500/20 rounded-lg p-4 mb-6 border border-red-500/50"
          >
            <p className="text-xl font-black text-white uppercase tracking-wide">
              EXECUTE TRADE NOW
            </p>
            <p className="text-red-200 text-sm mt-2">
              Citrus crop damage is virtually certain. Historical win rate: 76%
            </p>
          </div>

          {/* Blueprint Summary Preview */}
          {blueprintData && (
            <div className="bg-black/30 rounded-lg p-3 mb-4 text-left border border-red-500/30">
              <div className="text-xs text-red-300 uppercase tracking-wider mb-2">
                Quick Summary
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-slate-400">Temperature:</div>
                <div className="text-white font-semibold">{blueprintData.currentTemp}°F</div>
                <div className="text-slate-400">Duration:</div>
                <div className="text-white font-semibold">{blueprintData.frostDuration}</div>
                <div className="text-slate-400">Position Size:</div>
                <div className="text-white font-semibold">{blueprintData.positionMultiplier.toFixed(2)}x</div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={onGenerateBlueprint}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 
                         text-white font-bold rounded-lg transition-colors uppercase tracking-wider"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate Trade Blueprint
            </button>
            <button
              onClick={onDismiss}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg 
                         transition-colors uppercase tracking-wider"
            >
              Acknowledge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface LiveWeatherBadgeProps {
  weather: WeatherData | null;
  isLoading: boolean;
}

const LiveWeatherBadge: React.FC<LiveWeatherBadgeProps> = ({
  weather,
  isLoading,
}) => {
  if (!weather && !isLoading) return null;

  const frostRisk = weather
    ? getFrostRiskLevel(weather.temperature, weather.humidity, weather.windSpeed)
    : null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "#ef4444";
      case "high":
        return "#f97316";
      case "moderate":
        return "#eab308";
      case "low":
        return "#22c55e";
      default:
        return "#64748b";
    }
  };

  return (
    <div
      className="bg-slate-800/80 rounded-lg p-4 border mb-6 transition-all duration-300"
      style={{
        borderColor: weather?.isFreezingConditions ? "#ef4444" : "#334155",
        boxShadow: weather?.isFreezingConditions
          ? "0 0 20px rgba(239, 68, 68, 0.2)"
          : "none",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isLoading ? "bg-yellow-400 animate-pulse" : "bg-green-400"
            }`}
          />
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Live Weather Status
          </span>
        </div>
        <span className="text-slate-500 text-xs">
          📍 Winter Haven, FL
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <svg className="w-6 h-6 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : weather ? (
        <div className="space-y-3">
          {/* Condition */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Conditions</span>
            <span
              className={`font-semibold text-sm ${
                weather.isFreezingConditions
                  ? "text-red-400"
                  : weather.isFreezeWarning
                  ? "text-orange-400"
                  : "text-slate-200"
              }`}
            >
              {weather.condition}
            </span>
          </div>

          {/* Temperature */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Air Temperature</span>
            <span
              className={`font-bold text-lg ${
                weather.temperature <= 28
                  ? "text-red-400"
                  : weather.temperature <= 32
                  ? "text-orange-400"
                  : weather.temperature <= 36
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              {weather.temperature}°F
            </span>
          </div>

          {/* Humidity & Wind */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Humidity</span>
              <span className="text-slate-200 font-medium">{weather.humidity}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Wind</span>
              <span className="text-slate-200 font-medium">{weather.windSpeed} mph</span>
            </div>
          </div>

          {/* Frost Risk Indicator */}
          {frostRisk && (
            <div
              className="mt-2 pt-2 border-t border-slate-700 flex items-center justify-between"
            >
              <span className="text-slate-400 text-sm">Frost Risk</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getRiskColor(frostRisk.level) }}
                />
                <span
                  className="text-sm font-medium capitalize"
                  style={{ color: getRiskColor(frostRisk.level) }}
                >
                  {frostRisk.level === "none" ? "None" : frostRisk.description}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

interface SyncButtonProps {
  onClick: () => void;
  isLoading: boolean;
  lastSync?: string;
  isStale?: boolean;
}

const SyncButton: React.FC<SyncButtonProps> = ({
  onClick,
  isLoading,
  lastSync,
  isStale = false,
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
            : isStale
            ? "linear-gradient(135deg, #ca8a04 0%, #a16207 100%)"
            : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
          boxShadow: isLoading
            ? "none"
            : isStale
            ? "0 0 20px rgba(202, 138, 4, 0.3)"
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
        <div className="text-center mt-2">
          <p
            className={`text-xs ${
              isStale ? "text-yellow-400 font-semibold" : "text-slate-500"
            }`}
          >
            Last synced: {lastSync}
            {isStale && " ⚠️"}
          </p>
          {isStale && (
            <p className="text-yellow-500 text-xs mt-1">
              ⚠️ Stale Data - Last sync was over 30 minutes ago
            </p>
          )}
        </div>
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
  isRsiOverbought: boolean;
}

const SignalGauge: React.FC<SignalGaugeProps> = ({
  action,
  isHurricaneFalseAlarm,
  isBrazilDrought,
  isRsiOverbought,
}) => {
  // Determine accent color based on signal type
  const getAccentColor = () => {
    if (isHurricaneFalseAlarm) return "#ef4444"; // Red for short
    if (isRsiOverbought) return "#eab308"; // Yellow for take profit
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
      {isRsiOverbought && (
        <div className="mt-2 text-yellow-400 text-xs uppercase tracking-wider">
          📊 RSI Overbought - Take Profit Signal
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
        {insight.rsiEffect && (
          <div className="flex items-start gap-2">
            <span className="text-yellow-400">📊</span>
            <span className="text-yellow-300">{insight.rsiEffect}</span>
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
  // Load persisted market data on initial render
  const persistedData = useMemo(() => loadMarketData(), []);

  const [currentTemp, setCurrentTemp] = useState<number>(
    persistedData?.currentTemp ?? 32
  );
  const [hoursBelow28, setHoursBelow28] = useState<number>(
    persistedData?.hoursBelow28 ?? 0
  );
  const [currentInventory, setCurrentInventory] = useState<number>(
    persistedData?.currentInventory ?? 45
  );
  const [marketContext, setMarketContext] = useState<MarketContextParams>(
    persistedData?.marketContext ?? {
      isLaNina: false,
      isHurricaneActive: false,
      hurricaneCenterFarFromPolk: false,
      brazilRainfallIndex: 0,
      currentMonth: new Date().getMonth() + 1,
    }
  );

  // Sync state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | undefined>(
    persistedData?.lastSyncTimeFormatted
  );
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<number>(
    persistedData?.lastSyncTimestamp ?? 0
  );
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("Data Synced");
  const [toastVariant, setToastVariant] = useState<"success" | "info">("success");

  // Weather data state
  const [weatherData, setWeatherData] = useState<WeatherData | null>(
    persistedData?.weatherData ?? null
  );

  // Frost duration tracker state
  const [frostData, setFrostData] = useState<FrostTrackerData>(() => loadFrostData());
  const [showDamageAlert, setShowDamageAlert] = useState<boolean>(false);
  const damageAlertShownRef = useRef<boolean>(false);

  // Trade Blueprint state
  const [showBlueprintModal, setShowBlueprintModal] = useState<boolean>(false);
  const [blueprintData, setBlueprintData] = useState<TradeBlueprintData | null>(null);

  // RSI state - load from localStorage
  const [rsiValue, setRsiValue] = useState<number>(() => loadRsiValue());
  const [isRsiAutoSynced, setIsRsiAutoSynced] = useState<boolean>(false);
  const [rsiSyncError, setRsiSyncError] = useState<string | undefined>(undefined);

  // Check if data is stale
  const dataIsStale = useMemo(
    () => lastSyncTimestamp > 0 && isDataStale(lastSyncTimestamp),
    [lastSyncTimestamp]
  );

  // Save RSI value to localStorage when it changes
  useEffect(() => {
    saveRsiValue(rsiValue);
  }, [rsiValue]);

  // Background timer for frost tracking
  useEffect(() => {
    const isBelowCritical = currentTemp <= CRITICAL_TEMP_THRESHOLD;
    const isAboveReset = currentTemp > RESET_TEMP_THRESHOLD;

    // Start tracking if temp drops to critical level
    if (isBelowCritical && !frostData.isTracking) {
      const newData: FrostTrackerData = {
        ...frostData,
        isTracking: true,
        lastUpdateTime: Date.now(),
      };
      setFrostData(newData);
      saveFrostData(newData);
    }

    // Reset if temperature rises above reset threshold
    if (isAboveReset && frostData.isTracking) {
      const newData: FrostTrackerData = {
        accumulatedSeconds: 0,
        isTracking: false,
        lastUpdateTime: Date.now(),
      };
      setFrostData(newData);
      saveFrostData(newData);
      damageAlertShownRef.current = false;
    }

    // Timer interval for updating accumulated time
    let intervalId: NodeJS.Timeout | undefined;

    if (frostData.isTracking && isBelowCritical) {
      intervalId = setInterval(() => {
        setFrostData((prev) => {
          const newData: FrostTrackerData = {
            ...prev,
            accumulatedSeconds: prev.accumulatedSeconds + 1,
            lastUpdateTime: Date.now(),
          };
          saveFrostData(newData);

          // Check if we've hit the critical threshold
          const hours = newData.accumulatedSeconds / 3600;
          if (hours >= CRITICAL_FROST_HOURS && !damageAlertShownRef.current) {
            damageAlertShownRef.current = true;
            setShowDamageAlert(true);
          }

          return newData;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentTemp, frostData.isTracking]);

  // Update hoursBelow28 slider based on frost tracker
  useEffect(() => {
    if (frostData.isTracking) {
      const hours = Math.floor(frostData.accumulatedSeconds / 3600);
      if (hours !== hoursBelow28 && hours <= 12) {
        setHoursBelow28(hours);
      }
    }
  }, [frostData.accumulatedSeconds, frostData.isTracking, hoursBelow28]);

  // Calculate signal instantly as sliders move
  const signal = useMemo(() => {
    return calculateMarketSignalBrowser(
      currentTemp,
      hoursBelow28,
      currentInventory,
      marketContext,
      rsiValue
    );
  }, [currentTemp, hoursBelow28, currentInventory, marketContext, rsiValue]);

  // Generate blueprint data
  const currentBlueprintData = useMemo((): TradeBlueprintData => {
    // Determine position multiplier based on inventory
    let positionMultiplier = 1.0;
    if (currentInventory < 35) {
      positionMultiplier = 2.0;
    } else if (currentInventory <= 45) {
      positionMultiplier = 1.5;
    } else if (currentInventory > 55) {
      positionMultiplier = 0.7;
    }

    // Apply La Niña multiplier
    if (marketContext.isLaNina) {
      positionMultiplier *= 1.4;
    }

    return {
      primarySignal: "LONG OJ - Real Frost Event",
      currentTemp,
      frostDuration: formatFrostDurationShort(frostData.accumulatedSeconds),
      inventoryLevel: currentInventory,
      isLaNinaActive: marketContext.isLaNina,
      winRate: STRATEGY_WIN_RATES.realFrost,
      avgProfit: 14.9, // Historical average
      positionMultiplier: Math.min(positionMultiplier, 2.8), // Cap at 2.8x
      timestamp: new Date(),
    };
  }, [currentTemp, currentInventory, marketContext.isLaNina, frostData.accumulatedSeconds]);

  // Reset frost tracker
  const handleResetFrostTracker = useCallback(() => {
    const newData: FrostTrackerData = {
      accumulatedSeconds: 0,
      isTracking: false,
      lastUpdateTime: Date.now(),
    };
    setFrostData(newData);
    saveFrostData(newData);
    damageAlertShownRef.current = false;
    setHoursBelow28(0);
  }, []);

  // Handle live data sync
  const handleSyncLiveData = useCallback(async () => {
    setIsSyncing(true);
    try {
      // Fetch both weather data and RSI in parallel
      const [response, rsiResult]: [LiveWeatherResponse, RSIResult] = await Promise.all([
        fetchLiveMarketData(),
        fetchLiveMarketRSI(),
      ]);
      
      const syncTimestamp = Date.now();
      const syncTimeFormatted = formatSyncTime(response.marketData.timestamp);

      // Update weather data
      setWeatherData(response.weather);

      // Only update temperature from live weather data
      // Inventory and Hurricane settings are manual controls - don't override them
      setCurrentTemp(response.marketData.currentTemp);
      
      // Update RSI from live market data
      if (!rsiResult.error) {
        setRsiValue(rsiResult.value);
        setIsRsiAutoSynced(true);
        setRsiSyncError(undefined);
        // Also save to localStorage
        saveRsiValue(rsiResult.value);
      } else {
        // Keep the current value but note the error
        setRsiSyncError(rsiResult.error);
        setIsRsiAutoSynced(false);
      }
      
      // Keep current market context unchanged (inventory slider, hurricane toggle are manual)
      // Only the temperature is updated from the API

      // Update last sync time
      setLastSyncTime(syncTimeFormatted);
      setLastSyncTimestamp(syncTimestamp);

      // Save to localStorage for persistence
      // Note: We save current inventory and market context (not from API response)
      // since those are manual controls that shouldn't be overwritten
      const dataToSave: PersistedMarketData = {
        currentTemp: response.marketData.currentTemp,
        currentInventory, // Use current slider value, not API response
        hoursBelow28,
        marketContext, // Use current context, not overwritten
        weatherData: response.weather,
        lastSyncTimestamp: syncTimestamp,
        lastSyncTimeFormatted: syncTimeFormatted,
      };
      saveMarketData(dataToSave);

      // Show success toast
      setToastMessage(rsiResult.error ? "Data Synced (RSI unavailable)" : "Data Synced");
      setToastVariant("success");
      setShowToast(true);
    } catch (error) {
      console.error("Failed to sync live data:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [marketContext, hoursBelow28, currentInventory]);

  // Handle generate blueprint
  const handleGenerateBlueprint = useCallback(() => {
    setBlueprintData(currentBlueprintData);
    setShowDamageAlert(false);
    setShowBlueprintModal(true);
  }, [currentBlueprintData]);

  // Handle copy to clipboard
  const handleCopyBlueprint = useCallback(async () => {
    if (!blueprintData) return;

    const text = generateTradeBlueprintText(blueprintData);
    try {
      await navigator.clipboard.writeText(text);
      setShowBlueprintModal(false);
      setToastMessage("Blueprint copied to clipboard!");
      setToastVariant("info");
      setShowToast(true);
    } catch (err) {
      console.error("Failed to copy:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setShowBlueprintModal(false);
      setToastMessage("Blueprint copied to clipboard!");
      setToastVariant("info");
      setShowToast(true);
    }
  }, [blueprintData]);

  // Check if we're in freezing conditions (for pulsing header)
  const isFreezingAlert = weatherData?.isFreezingConditions || currentTemp <= 32;

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

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        timestamp={toastVariant === "success" ? lastSyncTime : undefined}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        variant={toastVariant}
      />

      {/* Physical Damage Alert Modal */}
      <PhysicalDamageAlert
        isVisible={showDamageAlert}
        onDismiss={() => setShowDamageAlert(false)}
        onGenerateBlueprint={handleGenerateBlueprint}
        blueprintData={currentBlueprintData}
      />

      {/* Trade Blueprint Modal */}
      <TradeBlueprintModal
        isVisible={showBlueprintModal}
        blueprintData={blueprintData}
        onClose={() => setShowBlueprintModal(false)}
        onCopy={handleCopyBlueprint}
      />

      {/* CSS for animations */}
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
        @keyframes pulse-red {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
          50% {
            box-shadow: 0 0 30px 10px rgba(239, 68, 68, 0.4);
          }
        }
        .animate-pulse-red {
          animation: pulse-red 2s ease-in-out infinite;
        }
        @keyframes text-pulse-red {
          0%, 100% {
            text-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
          }
          50% {
            text-shadow: 0 0 20px rgba(239, 68, 68, 0.8), 0 0 30px rgba(239, 68, 68, 0.5);
          }
        }
        .animate-text-pulse-red {
          animation: text-pulse-red 2s ease-in-out infinite;
        }
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>

      <div
        className={`max-w-4xl mx-auto rounded-2xl p-6 transition-all duration-500 ${
          isFreezingAlert ? "animate-pulse-red" : ""
        }`}
        style={getDashboardBorderStyle()}
      >
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 flex-wrap">
            <h1
              className={`text-3xl font-bold transition-colors duration-300 ${
                isFreezingAlert
                  ? "text-red-400 animate-text-pulse-red"
                  : "text-white"
              }`}
            >
              🍊 OJ TERMINAL 2.0
            </h1>
            {isFreezingAlert && (
              <span className="px-2 py-1 text-xs font-semibold bg-red-500/20 text-red-400 rounded-full border border-red-500/30 animate-pulse">
                🥶 FREEZE ALERT
              </span>
            )}
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
            {signal.isRsiOverbought && (
              <span className="px-2 py-1 text-xs font-semibold bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                📊 RSI Overbought
              </span>
            )}
          </div>
          <p className="text-slate-400 mt-2">
            Orange Juice Futures Trading Analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Market Data Panel */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-2xl">
            <h2 className="text-lg font-semibold text-slate-200 mb-6 pb-4 border-b border-slate-700">
              Live Market Data
            </h2>

            {/* Sync Live Data Button */}
            <SyncButton
              onClick={handleSyncLiveData}
              isLoading={isSyncing}
              lastSync={lastSyncTime}
              isStale={dataIsStale}
            />

            {/* Live Weather Status Badge */}
            <LiveWeatherBadge
              weather={weatherData}
              isLoading={isSyncing}
            />

            {/* Frost Duration Tracker */}
            <div className="mb-6">
              <FrostClock
                accumulatedSeconds={frostData.accumulatedSeconds}
                isTracking={frostData.isTracking}
                onReset={handleResetFrostTracker}
              />
            </div>

            {/* Market Context Section */}
            <MarketContextSection
              context={marketContext}
              onContextChange={setMarketContext}
            />

            {/* Data Cards Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <DataCard
                label="Temperature"
                value={currentTemp}
                unit="°F"
                icon="🌡️"
                color={currentTemp <= 28 ? "#ef4444" : currentTemp <= 32 ? "#f97316" : currentTemp <= 36 ? "#eab308" : "#22c55e"}
                isAutoSynced={!!weatherData}
                sublabel="Winter Haven, FL"
              />
              
              <DataCard
                label="Hours Below 28°F"
                value={hoursBelow28}
                unit="hrs"
                icon="⏱️"
                color={hoursBelow28 >= 4 ? "#ef4444" : hoursBelow28 >= 2 ? "#f97316" : "#3b82f6"}
                sublabel={hoursBelow28 >= 4 ? "Damage threshold reached" : "Frost duration"}
              />
              
              <DataCard
                label="Inventory"
                value={currentInventory}
                unit="M gallons"
                icon="📦"
                color={currentInventory < 35 ? "#ef4444" : currentInventory <= 45 ? "#f97316" : "#22c55e"}
                sublabel={currentInventory < 35 ? "Critical low" : currentInventory <= 45 ? "Below average" : "Normal levels"}
              />
              
              <DataCard
                label="Brazil Rainfall"
                value={marketContext.brazilRainfallIndex > 0 ? `+${marketContext.brazilRainfallIndex.toFixed(1)}` : marketContext.brazilRainfallIndex.toFixed(1)}
                unit="SPI-3"
                icon="🌧️"
                color={marketContext.brazilRainfallIndex <= -1.5 ? "#a855f7" : marketContext.brazilRainfallIndex <= -0.5 ? "#f97316" : "#22c55e"}
                sublabel={isBrazilDroughtSeason ? "Peak Season (Aug-Oct)" : "Off Season"}
              />
            </div>

            {/* RSI Data Card - Full Width */}
            <RSIDataCard
              value={rsiValue}
              isAutoSynced={isRsiAutoSynced}
              syncError={rsiSyncError}
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
                isBrazilDrought={signal.isBrazilDrought}
                isRsiOverbought={signal.isRsiOverbought}
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
