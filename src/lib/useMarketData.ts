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

export function useMarketData(refreshIntervalMs = 30000): MarketDataState {
  const [pools, setPools] = useState<Pool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMarketData();
      setPools(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Could not fetch market data");
      setPools(MOCK_POOLS); // always show something
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    load();
  }, [load]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(load, refreshIntervalMs);
    return () => clearInterval(interval); // cleanup on unmount
  }, [load, refreshIntervalMs]);

  return { pools, isLoading, error, lastUpdated, refresh: load };
}
