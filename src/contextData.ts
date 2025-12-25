// Context data service for fetching NOAA RSS headlines
// Exports recent headlines from NOAA weather/hurricane feeds

export interface NewsHeadline {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  isHurricane?: boolean; // Flag to indicate if headline is hurricane-related
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

// NOAA RSS feed URLs
// Using NOAA's National Weather Service RSS feeds for weather alerts and hurricane updates
const NOAA_WEATHER_RSS_URL = "https://alerts.weather.gov/cap/us.php?x=0";
// Alternative: Use Google News RSS for hurricane/weather news if NOAA RSS has CORS issues
const HURRICANE_NEWS_RSS_URL = "https://news.google.com/rss/search?q=hurricane+florida+OR+orange+juice+weather+when:7d&hl=en-US&gl=US&ceid=US:en";
const WEATHER_NEWS_RSS_URL = "https://news.google.com/rss/search?q=florida+freeze+OR+citrus+frost+OR+orange+juice+weather+when:7d&hl=en-US&gl=US&ceid=US:en";

const RSS_API_URL = "https://api.rss2json.com/v1/api.json?rss_url=";

// Keywords that indicate hurricane-related news
const HURRICANE_KEYWORDS = [
  'hurricane', 'tropical storm', 'cyclone', 'tropical depression',
  'storm surge', 'tropical system', 'nhc', 'national hurricane center'
];

/**
 * Checks if a headline is hurricane-related
 */
function isHurricaneHeadline(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return HURRICANE_KEYWORDS.some(keyword => lowerTitle.includes(keyword));
}

/**
 * Fetches headlines from RSS feed
 */
async function fetchRSSHeadlines(url: string): Promise<NewsHeadline[]> {
  try {
    const response = await fetch(RSS_API_URL + encodeURIComponent(url));
    
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS: ${response.status}`);
    }

    const data: RSSResponse = await response.json();

    if (data.status !== "ok") {
      throw new Error("Invalid response from RSS API");
    }

    return data.items.map((item) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      source: "NOAA/Weather",
      isHurricane: isHurricaneHeadline(item.title),
    }));
  } catch (error) {
    console.error("Failed to fetch RSS headlines:", error);
    return [];
  }
}

/**
 * Fetches recent headlines from NOAA and weather news sources
 * Returns a combined list of headlines, prioritizing hurricane-related news
 */
export async function fetchRecentHeadlines(): Promise<NewsHeadline[]> {
  try {
    // Fetch from multiple sources in parallel
    const [hurricaneNews, weatherNews] = await Promise.all([
      fetchRSSHeadlines(HURRICANE_NEWS_RSS_URL),
      fetchRSSHeadlines(WEATHER_NEWS_RSS_URL),
    ]);

    // Combine and deduplicate by title
    const allHeadlines: NewsHeadline[] = [...hurricaneNews, ...weatherNews];
    const uniqueHeadlines = new Map<string, NewsHeadline>();

    // Prioritize hurricane headlines and remove duplicates
    allHeadlines.forEach((headline) => {
      const key = headline.title.toLowerCase().trim();
      if (!uniqueHeadlines.has(key)) {
        uniqueHeadlines.set(key, headline);
      } else {
        // If duplicate exists, prefer the one marked as hurricane
        const existing = uniqueHeadlines.get(key)!;
        if (headline.isHurricane && !existing.isHurricane) {
          uniqueHeadlines.set(key, headline);
        }
      }
    });

    // Sort: hurricane headlines first, then by date (newest first)
    const sortedHeadlines = Array.from(uniqueHeadlines.values()).sort((a, b) => {
      // Hurricane headlines first
      if (a.isHurricane && !b.isHurricane) return -1;
      if (!a.isHurricane && b.isHurricane) return 1;
      // Then by date (newest first)
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });

    // Return most recent 20 headlines
    return sortedHeadlines.slice(0, 20);
  } catch (error) {
    console.error("Failed to fetch recent headlines:", error);
    // Return fallback headlines
    return [
      {
        title: "Weather data temporarily unavailable",
        link: "#",
        pubDate: new Date().toISOString(),
        source: "System",
        isHurricane: false,
      },
    ];
  }
}

/**
 * Checks if there are any active hurricane headlines
 */
export async function hasHurricaneHeadlines(): Promise<boolean> {
  const headlines = await fetchRecentHeadlines();
  return headlines.some(h => h.isHurricane);
}

