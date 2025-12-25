import React, { useState, useEffect, useCallback } from "react";
import { fetchRecentHeadlines, NewsHeadline } from "../contextData";

interface NewsTickerProps {
  isHurricaneDetected?: boolean; // Pass from parent if hurricane is detected
}

export const NewsTicker: React.FC<NewsTickerProps> = ({ isHurricaneDetected = false }) => {
  const [headlines, setHeadlines] = useState<NewsHeadline[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchHeadlines = useCallback(async () => {
    setIsLoading(true);
    try {
      const recentHeadlines = await fetchRecentHeadlines();
      setHeadlines(recentHeadlines);
    } catch (error) {
      console.error("Failed to fetch headlines:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch headlines on mount and refresh every 5 minutes
  useEffect(() => {
    fetchHeadlines();
    const interval = setInterval(fetchHeadlines, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [fetchHeadlines]);

  // Check if any headline is hurricane-related
  const hasHurricaneHeadline = headlines.some(h => h.isHurricane) || isHurricaneDetected;

  return (
    <div
      className="fixed bottom-0 left-0 z-40 border-t"
      style={{
        right: "400px", // Account for Strategy Sidebar width
        backgroundColor: hasHurricaneHeadline ? "rgba(30, 41, 59, 0.95)" : "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderColor: hasHurricaneHeadline ? "#ef4444" : "#334155",
        boxShadow: hasHurricaneHeadline
          ? "0 -4px 20px rgba(239, 68, 68, 0.3)"
          : "0 -2px 10px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div className="flex items-center h-12 overflow-hidden">
        {/* Breaking News Badge (if hurricane detected) */}
        {hasHurricaneHeadline && (
          <div
            className="flex items-center gap-2 px-4 py-2 font-bold text-white uppercase tracking-wider whitespace-nowrap"
            style={{
              backgroundColor: "#ef4444",
              boxShadow: "0 0 15px rgba(239, 68, 68, 0.5)",
            }}
          >
            <span className="animate-pulse">🚨</span>
            <span>BREAKING NEWS</span>
          </div>
        )}

        {/* Ticker Content */}
        <div
          className="flex-1 overflow-hidden"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)",
          }}
        >
          {isLoading ? (
            <div className="flex items-center h-full px-4">
              <span className="text-slate-400 text-sm">Loading headlines...</span>
            </div>
          ) : headlines.length === 0 ? (
            <div className="flex items-center h-full px-4">
              <span className="text-slate-500 text-sm">No headlines available</span>
            </div>
          ) : (
            <div className="flex items-center h-full animate-scroll">
              {/* Duplicate headlines for seamless loop */}
              {[...headlines, ...headlines].map((headline, index) => (
                <a
                  key={`${headline.title}-${index}`}
                  href={headline.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 text-sm text-slate-300 hover:text-white transition-colors whitespace-nowrap"
                  style={{
                    color: headline.isHurricane ? "#fca5a5" : "#cbd5e1",
                  }}
                >
                  <span className="text-slate-500">•</span>
                  <span className={headline.isHurricane ? "font-semibold" : ""}>
                    {headline.title}
                  </span>
                  {headline.isHurricane && (
                    <span className="text-red-400 text-xs">🌀</span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CSS Animation for scrolling */}
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default NewsTicker;

