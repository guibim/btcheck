/**
 * Fear & Greed Index API Service
 * Fetches data from alternative.me with caching and TTL
 */

import { FngResponse, FngData } from "@/lib/fearGreedUtils";

const API_BASE = "https://api.alternative.me/fng/";
const CACHE_KEY = "fng-cache";
const FALLBACK_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

interface CachedData {
  current: FngData | null;
  history: FngData[];
  timestamp: number;
  ttl: number;
}

/**
 * Get cached data from localStorage
 */
function getCache(): CachedData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data: CachedData = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - data.timestamp < data.ttl) {
      return data;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Set cache in localStorage
 */
function setCache(current: FngData | null, history: FngData[], ttl: number) {
  try {
    const data: CachedData = {
      current,
      history,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to cache FNG data:", error);
  }
}

/**
 * Fetch current Fear & Greed Index
 * Uses cache if valid, otherwise fetches from API
 */
export async function fetchCurrentFng(): Promise<FngData | null> {
  // Check cache first
  const cached = getCache();
  if (cached?.current) {
    return cached.current;
  }

  try {
    const response = await fetch(`${API_BASE}?limit=1`);
    if (!response.ok) throw new Error("API request failed");
    
    const json: FngResponse = await response.json();
    if (!json.data || json.data.length === 0) {
      throw new Error("No data in response");
    }

    const current = json.data[0];
    
    // Calculate TTL from time_until_update or use fallback
    const ttl = current.time_until_update 
      ? parseInt(current.time_until_update) * 1000 
      : FALLBACK_TTL;

    // Update cache
    const existingHistory = cached?.history || [];
    setCache(current, existingHistory, ttl);

    return current;
  } catch (error) {
    console.error("Failed to fetch current FNG:", error);
    return null;
  }
}

/**
 * Fetch Fear & Greed Index history (last 90 days)
 * Uses cache if valid, otherwise fetches from API
 */
export async function fetchFngHistory(): Promise<FngData[]> {
  // Check cache first
  const cached = getCache();
  if (cached?.history && cached.history.length > 0) {
    return cached.history;
  }

  try {
    const response = await fetch(`${API_BASE}?limit=90`);
    if (!response.ok) throw new Error("API request failed");
    
    const json: FngResponse = await response.json();
    if (!json.data || json.data.length === 0) {
      throw new Error("No data in response");
    }

    const history = json.data;
    
    // Use fallback TTL for history
    const ttl = FALLBACK_TTL;

    // Update cache
    const existingCurrent = cached?.current || null;
    setCache(existingCurrent, history, ttl);

    return history;
  } catch (error) {
    console.error("Failed to fetch FNG history:", error);
    return [];
  }
}

/**
 * Clear cache (useful for testing or forced refresh)
 */
export function clearFngCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error("Failed to clear FNG cache:", error);
  }
}
