/**
 * Market Context Data Service
 * Fetches automated signals for La Niña and Hurricane warnings
 */

export interface HurricaneStatus {
  isActive: boolean;
  latestTitle?: string;
  error?: string;
}

export interface LaNinaStatus {
  isActive: boolean;
  sst?: number;
  error?: string;
}

export interface MarketContextData {
  hurricane: HurricaneStatus;
  laNina: LaNinaStatus;
  timestamp: Date;
}

/**
 * Fetches hurricane warnings from NOAA National Hurricane Center RSS feed
 * Returns true if any active hurricane is detected
 */
export async function fetchHurricaneStatus(): Promise<HurricaneStatus> {
  const rssUrl = "https://www.nhc.noaa.gov/index-at.xml";
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`RSS2JSON API error: ${response.status}`);
    }

    const data = await response.json();

    // Check if any item title contains "Hurricane"
    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        if (item.title && item.title.toLowerCase().includes("hurricane")) {
          return {
            isActive: true,
            latestTitle: item.title,
          };
        }
      }
    }

    return {
      isActive: false,
    };
  } catch (error) {
    console.error("Failed to fetch hurricane status:", error);
    return {
      isActive: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Fetches Sea Surface Temperature (SST) for Niño 3.4 region
 * Returns true if SST < 26.5°C (La Niña conditions)
 */
export async function fetchLaNinaStatus(): Promise<LaNinaStatus> {
  // Niño 3.4 region: 0° latitude, -145° longitude
  const lat = 0.0;
  const lon = -145.0;
  const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&daily=wave_height_max,ocean_surface_temperature&timezone=auto`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Open-Meteo Marine API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Get the latest SST from daily data (most recent value)
    const sstArray = data?.daily?.ocean_surface_temperature;

    if (!Array.isArray(sstArray) || sstArray.length === 0) {
      throw new Error("SST data not available in response");
    }

    // Get the most recent SST value (last element in array)
    const sst = sstArray[sstArray.length - 1];

    if (typeof sst !== "number") {
      throw new Error("Invalid SST data format");
    }

    // La Niña is active if SST < 26.5°C
    const isActive = sst < 26.5;

    return {
      isActive,
      sst,
    };
  } catch (error) {
    console.error("Failed to fetch La Niña status:", error);
    return {
      isActive: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Fetches all market context data (Hurricane + La Niña)
 */
export async function fetchMarketContextData(): Promise<MarketContextData> {
  // Fetch both in parallel for better performance
  const [hurricane, laNina] = await Promise.all([
    fetchHurricaneStatus(),
    fetchLaNinaStatus(),
  ]);

  return {
    hurricane,
    laNina,
    timestamp: new Date(),
  };
}
