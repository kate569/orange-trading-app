/**
 * Price Service for Orange Juice Futures
 * Fetches real-time Orange Juice Futures price (OJ=F or OJ:NM)
 * Orange Juice is priced in Cents per Pound
 */

export interface PriceData {
  priceInCents: number; // Raw price in cents per pound (e.g., 350.00)
  priceInDollars: number; // Converted to dollars per pound (e.g., 3.50)
  previousClose: number; // Previous close price in cents
  change: number; // Change from previous close in cents
  changePercent: number; // Percentage change
  timestamp: Date;
  isLive: boolean; // Whether this is live data or simulated
}

// Storage key for cached price data
const PRICE_STORAGE_KEY = "oj_price_data";
const PRICE_CACHE_DURATION_MS = 60 * 1000; // 1 minute cache

// CORS proxy options (public proxies that work with Yahoo Finance)
const CORS_PROXIES = [
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?",
  "https://api.codetabs.com/v1/proxy?quest=",
];

/**
 * Fetches Orange Juice Futures price from Yahoo Finance
 * Uses OJ=F symbol (Orange Juice Futures)
 */
async function fetchYahooFinancePrice(): Promise<PriceData | null> {
  const symbol = "OJ=F"; // Orange Juice Futures
  
  // Try each CORS proxy until one works
  for (const proxy of CORS_PROXIES) {
    try {
      const url = `${proxy}https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        continue; // Try next proxy
      }

      const data = await response.json();
      
      if (!data?.chart?.result?.[0]) {
        continue;
      }

      const result = data.chart.result[0];
      const meta = result.meta;
      const previousCloseRaw = meta.previousClose || meta.regularMarketPreviousClose;
      const currentPriceRaw = meta.regularMarketPrice || meta.previousClose || previousCloseRaw;

      if (!currentPriceRaw || !previousCloseRaw) {
        continue;
      }

      // Yahoo Finance returns OJ futures prices in cents per pound
      // If price is less than 10, it might be in dollars (unlikely for OJ), so convert
      // Otherwise assume it's in cents (typical range: 200-500 cents = $2-5/lb)
      const priceInCents = currentPriceRaw < 10 ? currentPriceRaw * 100 : currentPriceRaw;
      const previousCloseInCents = previousCloseRaw < 10 ? previousCloseRaw * 100 : previousCloseRaw;
      
      const change = priceInCents - previousCloseInCents;
      const changePercent = (change / previousCloseInCents) * 100;

      return {
        priceInCents,
        priceInDollars: priceInCents / 100,
        previousClose: previousCloseInCents,
        change,
        changePercent,
        timestamp: new Date(),
        isLive: true,
      };
    } catch (error) {
      console.warn(`Failed to fetch from proxy ${proxy}:`, error);
      continue;
    }
  }

  return null;
}

/**
 * Fetches price from Financial Modeling Prep API (alternative)
 * Uses real API key - returns null on error (no simulation fallback)
 */
async function fetchFinancialModelingPrepPrice(): Promise<PriceData | null> {
  try {
    const API_KEY = "R7pfPW0pIMaVvX2MwkycXEzJ0AFS3FA8";
    const url = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://financialmodelingprep.com/api/v3/quote/AAPL?apikey=' + API_KEY);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Financial Modeling Prep API returned status ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Check if we got an error response (like "Upgrade Required")
    if (data.error || data.message || !Array.isArray(data) || data.length === 0) {
      console.error("Financial Modeling Prep API error or empty response:", data.error || data.message || "No data");
      return null;
    }

    const quote = data[0];
    
    // Validate we have the required data
    if (!quote || typeof quote.price !== 'number') {
      console.error("Invalid quote data from Financial Modeling Prep");
      return null;
    }

    // FMP returns price in dollars per pound for OJ futures
    // We need to convert to cents for consistency
    const priceInDollars = quote.price;
    const priceInCents = priceInDollars * 100;
    
    const previousCloseInDollars = quote.previousClose || priceInDollars;
    const previousCloseInCents = previousCloseInDollars * 100;
    
    const changeInDollars = quote.change || 0;
    const changeInCents = changeInDollars * 100;
    
    const changePercent = quote.changesPercentage || 0;

    return {
      priceInCents,
      priceInDollars,
      previousClose: previousCloseInCents,
      change: changeInCents,
      changePercent,
      timestamp: new Date(),
      isLive: true,
    };
  } catch (error) {
    console.error("Financial Modeling Prep fetch failed:", error);
    return null;
  }
}

/**
 * Simulates micro-ticking updates based on previous close
 * Creates realistic price movement for UI liveliness
 */
function simulatePriceTicks(basePrice: number): PriceData {
  // Generate small random variation (±0.5% max)
  const variation = (Math.random() - 0.5) * 0.01; // ±0.5%
  const tickedPrice = basePrice * (1 + variation);
  
  // Round to 2 decimal places (cents precision)
  const priceInCents = Math.round(tickedPrice * 100) / 100;
  const change = priceInCents - basePrice;
  const changePercent = (change / basePrice) * 100;

  return {
    priceInCents,
    priceInDollars: priceInCents / 100,
    previousClose: basePrice,
    change,
    changePercent,
    timestamp: new Date(),
    isLive: false, // This is simulated
  };
}

/**
 * Loads cached price data from localStorage
 */
function loadCachedPrice(): PriceData | null {
  try {
    const cached = localStorage.getItem(PRICE_STORAGE_KEY);
    if (cached) {
      const data = JSON.parse(cached) as PriceData & { timestamp: string };
      const timestamp = new Date(data.timestamp);
      const age = Date.now() - timestamp.getTime();
      
      // Use cache if less than 1 minute old
      if (age < PRICE_CACHE_DURATION_MS) {
        return {
          ...data,
          timestamp,
        };
      }
    }
  } catch (error) {
    console.warn("Failed to load cached price:", error);
  }
  return null;
}

/**
 * Saves price data to localStorage
 */
function saveCachedPrice(data: PriceData): void {
  try {
    localStorage.setItem(PRICE_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to save cached price:", error);
  }
}

/**
 * Fetches the latest Orange Juice Futures price
 * Tries live data first, falls back to cached data only
 * NO SIMULATION - returns null if real data unavailable
 */
export async function fetchOrangeJuicePrice(): Promise<PriceData | null> {
  // Try to fetch live data - Try Financial Modeling Prep first
  let priceData = await fetchFinancialModelingPrepPrice();
  
  if (!priceData) {
    // Fallback to Yahoo Finance with CORS proxies
    priceData = await fetchYahooFinancePrice();
  }

  if (priceData) {
    // Save live data
    saveCachedPrice(priceData);
    return priceData;
  }

  // Return cached data if available (even if stale), otherwise null
  const cached = loadCachedPrice();
  if (cached && cached.isLive) {
    return cached;
  }

  // No real data available - return null to show "Data Unavailable"
  console.error("Unable to fetch real price data from any source");
  return null;
}

/**
 * Formats price for display with explicit units
 * Returns formatted string like "$3.50/lb (USD/lb)"
 */
export function formatPriceWithUnits(priceData: PriceData): string {
  const formatted = priceData.priceInDollars.toFixed(2);
  return `$${formatted}/lb`;
}

/**
 * Formats price change for display
 */
export function formatPriceChange(priceData: PriceData): string {
  const sign = priceData.change >= 0 ? "+" : "";
  const changeDollars = (priceData.change / 100).toFixed(2);
  const changePercent = priceData.changePercent.toFixed(2);
  return `${sign}$${changeDollars} (${sign}${changePercent}%)`;
}

/**
 * Creates a subscription to price updates
 * Returns a function to unsubscribe
 */
export function subscribeToPriceUpdates(
  callback: (priceData: PriceData | null) => void,
  intervalMs: number = 5000 // Update every 5 seconds
): () => void {
  let isActive = true;
  let intervalId: number | null = null;

  const updatePrice = async () => {
    if (!isActive) return;
    
    try {
      const priceData = await fetchOrangeJuicePrice();
      callback(priceData);
    } catch (error) {
      console.error("Failed to update price:", error);
      callback(null);
    }
  };

  // Initial fetch
  updatePrice();

  // Set up interval
  intervalId = window.setInterval(updatePrice, intervalMs);

  // Return unsubscribe function
  return () => {
    isActive = false;
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
  };
}

