import React, { useState, useEffect, useCallback } from "react";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source?: string;
}

interface RSSResponse {
  status: string;
  items: Array<{
    title: string;
    link: string;
    pubDate: string;
    author?: string;
  }>;
}

// RSS feed URL for OJ futures news
const RSS_FEED_URL = "https://news.google.com/rss/search?q=orange+juice+futures";
const NEWS_API_URL = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(RSS_FEED_URL);

// Format relative time (e.g., "2 hours ago")
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

// Extract source from title (Google News format: "Title - Source")
function extractSource(title: string): { cleanTitle: string; source: string } {
  const lastDash = title.lastIndexOf(" - ");
  if (lastDash > 0) {
    return {
      cleanTitle: title.substring(0, lastDash),
      source: title.substring(lastDash + 3),
    };
  }
  return { cleanTitle: title, source: "News" };
}

export const NewsFeed: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(NEWS_API_URL);

      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.status}`);
      }

      const data: RSSResponse = await response.json();

      if (data.status !== "ok") {
        throw new Error("Invalid response from news API");
      }

      // Get top 3 headlines
      const topNews = data.items.slice(0, 3).map((item) => {
        const { cleanTitle, source } = extractSource(item.title);
        return {
          title: cleanTitle,
          link: item.link,
          pubDate: item.pubDate,
          source,
        };
      });

      setNews(topNews);
      setLastFetched(new Date());
    } catch (err) {
      console.error("Failed to fetch news:", err);
      setError(err instanceof Error ? err.message : "Failed to load news");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch news on mount
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-2xl mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <span className="text-xl">📰</span>
          <h2 className="text-lg font-semibold text-slate-200">
            OJ Market News
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {lastFetched && (
            <span className="text-xs text-slate-500">
              Updated {formatRelativeTime(lastFetched.toISOString())}
            </span>
          )}
          <button
            onClick={fetchNews}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
            title="Refresh news"
          >
            <svg
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
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
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading && news.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <svg
            className="w-6 h-6 animate-spin text-slate-400"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="ml-3 text-slate-400">Loading news...</span>
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <span className="text-yellow-500 text-sm">⚠️ {error}</span>
          <button
            onClick={fetchNews}
            className="block mx-auto mt-2 text-sm text-blue-400 hover:text-blue-300"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div
                className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 
                           hover:border-orange-500/50 hover:bg-slate-800 
                           transition-all duration-200"
                style={{
                  boxShadow: "0 0 0 0 rgba(255, 140, 0, 0)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 0 15px rgba(255, 140, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 0 0 0 rgba(255, 140, 0, 0)";
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-slate-200 font-medium group-hover:text-orange-400 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-slate-500">
                        {item.source}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-500">
                        {formatRelativeTime(item.pubDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-slate-500 group-hover:text-orange-400 transition-colors">
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
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-700 text-center">
        <a
          href="https://news.google.com/search?q=orange+juice+commodity"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-slate-500 hover:text-orange-400 transition-colors"
        >
          View more on Google News →
        </a>
      </div>
    </div>
  );
};

export default NewsFeed;
