import { BACKEND_API } from '../config/api';

// Memory Cache store for 0ms in-session retrieval
const memoryCache = new Map();

/**
 * Stale-While-Revalidate (SWR) Caching Utility
 * @param {string} key - Unique cache key (e.g. 'properties_list', 'vehicles_list')
 * @param {Function} fetcher - Async function that fetches fresh data from API
 * @param {Object} options - { ttlMs: number, onUpdate: Function }
 */
export async function getWithSWR(key, fetcher, { ttlMs = 120000, onUpdate } = {}) {
  const now = Date.now();
  const cachedMem = memoryCache.get(key);
  
  // 1. Try local storage cache
  let localData = null;
  let localTime = 0;
  try {
    const raw = localStorage.getItem(`etn_swr_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      localData = parsed.data;
      localTime = parsed.timestamp || 0;
    }
  } catch (e) {}

  const currentData = cachedMem?.data || localData;
  const lastSavedTime = cachedMem?.timestamp || localTime;

  // Background revalidation function
  const revalidate = async () => {
    try {
      const freshData = await fetcher();
      if (freshData !== undefined && freshData !== null) {
        // Save to memory cache
        memoryCache.set(key, { data: freshData, timestamp: Date.now() });
        // Save to localStorage
        try {
          localStorage.setItem(`etn_swr_${key}`, JSON.stringify({ data: freshData, timestamp: Date.now() }));
        } catch (e) {}

        // Notify caller if data has changed and onUpdate handler exists
        if (onUpdate && JSON.stringify(freshData) !== JSON.stringify(currentData)) {
          onUpdate(freshData);
        }
        return freshData;
      }
    } catch (err) {
      console.warn(`[SWR Revalidation Notice] (${key}):`, err.message);
    }
    return currentData;
  };

  const hasValidData = currentData !== null && currentData !== undefined && (!Array.isArray(currentData) || currentData.length > 0);

  // If we have populated cached data:
  if (hasValidData) {
    // If cache is older than TTL, revalidate in background
    if (now - lastSavedTime > ttlMs) {
      setTimeout(() => revalidate(), 50);
    }
    return currentData;
  }

  // If no cache or empty array, perform immediate fetch
  return await revalidate();
}

/**
 * Manually set or update cache
 */
export function setCachedData(key, data) {
  memoryCache.set(key, { data, timestamp: Date.now() });
  try {
    localStorage.setItem(`etn_swr_${key}`, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {}
}

/**
 * Invalidate a specific cache entry or all SWR caches
 */
export function invalidateCache(key) {
  if (key) {
    memoryCache.delete(key);
    try {
      localStorage.removeItem(`etn_swr_${key}`);
    } catch (e) {}
  } else {
    memoryCache.clear();
    try {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('etn_swr_')) localStorage.removeItem(k);
      });
    } catch (e) {}
  }
}
