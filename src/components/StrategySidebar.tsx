import React, { useState } from "react";
import { STRATEGY_WIN_RATES } from "../calculateMarketSignal.browser";

interface Strategy {
  name: string;
  winRate: number;
  icon: string;
  color: string;
}

export const StrategySidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const strategies: Strategy[] = [
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
    <>
      {/* Toggle Button - Fixed on right side */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-slate-800 hover:bg-slate-700 
                   text-slate-300 hover:text-white transition-all duration-300 rounded-l-lg 
                   px-3 py-4 border border-slate-700 border-r-0 shadow-lg"
        style={{
          transform: isOpen ? "translateX(0) translateY(-50%)" : "translateX(0) translateY(-50%)",
        }}
        title={isOpen ? "Hide Strategy Performance" : "Show Strategy Performance"}
      >
        <div className="flex flex-col items-center gap-1">
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-xs font-semibold">Strategy</span>
          <span className="text-xs font-semibold">Performance</span>
        </div>
      </button>

      {/* Sidebar Drawer */}
      <div
        className={`fixed right-0 top-0 z-40 border-l border-slate-800 
                   shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto
                   ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{
          width: "380px",
          bottom: "48px", // Account for ticker height
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          maxHeight: "calc(100vh - 48px)", // Account for ticker height
        }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <h2 className="text-lg font-semibold text-slate-200">
                Strategy Performance
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
              title="Close"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-400 mb-6">
            Historical win rates validate why the algorithm is giving a signal.
          </p>

          {/* Strategy Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-3 px-2">
                    Strategy
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider py-3 px-2">
                    Win Rate
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
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{strategy.icon}</span>
                        <span className="text-slate-200 text-sm font-medium">
                          {strategy.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span
                          className="text-lg font-bold"
                          style={{ color: strategy.color }}
                        >
                          {Math.round(strategy.winRate * 100)}%
                        </span>
                        <div className="w-16 bg-slate-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${strategy.winRate * 100}%`,
                              backgroundColor: strategy.color,
                              boxShadow: `0 0 8px ${strategy.color}80`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Note */}
          <div className="mt-6 pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center">
              Based on historical backtesting data
            </p>
          </div>
        </div>
      </div>

      {/* Backdrop overlay when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default StrategySidebar;

