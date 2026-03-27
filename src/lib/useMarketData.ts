// src/lib/useMarketData.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { Pool } from "./types";
import { fetchMarketData, MOCK_POOLS } from "./poolData";

interface MarketDataState {
  pools: Pool[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;   // call this to manually re-fetch
}

export function useMarketData(refreshIntervalMs = 0): MarketDataState & { isRefreshing: boolean } {
  const [pools, setPools] = useState<Pool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async (isBackground = false) => {
    if (isBackground) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const data = await fetchMarketData();
      setPools(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Could not fetch market data");
      if (pools.length === 0) setPools(MOCK_POOLS);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [pools.length]);

  // Load on mount
  useEffect(() => {
    load();
  }, [load]);

  // Auto-refresh only if refreshIntervalMs > 0
  useEffect(() => {
    if (refreshIntervalMs <= 0) return;
    const interval = setInterval(() => load(true), refreshIntervalMs);
    return () => clearInterval(interval);
  }, [load, refreshIntervalMs]);

  return { pools, isLoading, isRefreshing, error, lastUpdated, refresh: () => load() };
}
