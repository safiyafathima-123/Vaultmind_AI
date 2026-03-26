// src/lib/poolData.ts
import axios from "axios";
import { Pool } from "./types";

// Base URLs from your .env.local
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// ── Mock data (always works, great for demo) ──────────────────────────────────
// These are realistic-looking pools. Used when the real API is unavailable.
export const MOCK_POOLS: Pool[] = [
  {
    id: "pool-eth-usdc",
    name: "ETH / USDC",
    apy: 14.2,
    volatility: 0.62,
    confidence: 0.78,
    tvl: 4200000,
    token: "ETH",
  },
  {
    id: "pool-one-usdo",
    name: "ONE / USDO",
    apy: 22.7,
    volatility: 0.81,
    confidence: 0.65,
    tvl: 1800000,
    token: "ONE",
  },
  {
    id: "pool-usdc-usdo",
    name: "USDC / USDO",
    apy: 6.1,
    volatility: 0.08,
    confidence: 0.95,
    tvl: 9500000,
    token: "USDC",
  },
  {
    id: "pool-btc-usdc",
    name: "BTC / USDC",
    apy: 9.8,
    volatility: 0.55,
    confidence: 0.72,
    tvl: 6100000,
    token: "BTC",
  },
  {
    id: "pool-one-eth",
    name: "ONE / ETH",
    apy: 18.4,
    volatility: 0.74,
    confidence: 0.61,
    tvl: 2300000,
    token: "ONE",
  },
];

// ── Fetch pools from OneDEX via your backend ──────────────────────────────────
export async function fetchPools(): Promise<Pool[]> {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/pools`, { timeout: 5000 });
    return res.data as Pool[];
  } catch (err) {
    // If API fails, silently fall back to mock data
    console.warn("OneDEX API unavailable — using mock pools");
    return MOCK_POOLS;
  }
}

// ── Fetch volatility forecast for a single token from OnePredict ──────────────
export async function fetchVolatility(token: string): Promise<number> {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/volatility/${token}`, {
      timeout: 5000,
    });
    return res.data.volatility as number;
  } catch (err) {
    console.warn(`OnePredict unavailable for ${token} — using mock volatility`);
    // Return a realistic mock based on token type
    const mockVolatility: Record<string, number> = {
      ETH: 0.62,
      BTC: 0.55,
      ONE: 0.78,
      USDC: 0.06,
      USDO: 0.05,
    };
    return mockVolatility[token] ?? 0.5;
  }
}

// ── Fetch everything at once (pools + updated volatility) ─────────────────────
export async function fetchMarketData(): Promise<Pool[]> {
  const pools = await fetchPools();

  // Update each pool's volatility with the latest OnePredict forecast
  const updated = await Promise.all(
    pools.map(async (pool) => {
      const freshVolatility = await fetchVolatility(pool.token);
      return { ...pool, volatility: freshVolatility };
    })
  );

  return updated;
}

// ── Format helpers (used in UI) ───────────────────────────────────────────────

// Format APY for display e.g. 14.2 → "14.2%"
export function formatAPY(apy: number): string {
  return `${apy.toFixed(1)}%`;
}

// Format TVL for display e.g. 4200000 → "$4.2M"
export function formatTVL(tvl: number): string {
  if (tvl >= 1_000_000) return `$${(tvl / 1_000_000).toFixed(1)}M`;
  if (tvl >= 1_000) return `$${(tvl / 1_000).toFixed(0)}K`;
  return `$${tvl}`;
}

// Volatility label e.g. 0.62 → "Medium"
export function volatilityLabel(v: number): string {
  if (v < 0.25) return "Low";
  if (v < 0.55) return "Medium";
  if (v < 0.75) return "High";
  return "Very High";
}

// Volatility color class for Tailwind
export function volatilityColor(v: number): string {
  if (v < 0.25) return "text-green-600";
  if (v < 0.55) return "text-yellow-600";
  if (v < 0.75) return "text-orange-500";
  return "text-red-600";
}
