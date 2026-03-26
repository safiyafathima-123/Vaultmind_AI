// src/components/MarketRadar.tsx
"use client";

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from "recharts";
import { Pool } from "@/lib/types";
import { volatilityLabel, volatilityColor, formatAPY } from "@/lib/poolData";
import { isCircuitBreakerActive } from "@/lib/aiEngine";

interface MarketRadarProps {
  pools: Pool[];
}

// Color per pool for charts
const POOL_COLORS = ["#7C3AED","#059669","#D97706","#DC2626","#2563EB"];

export default function MarketRadar({ pools }: MarketRadarProps) {
  if (!pools.length) return null;

  const circuitBreaker = isCircuitBreakerActive(pools);

  // ── Radar chart data: each pool scored on 4 axes ─────────────────────────
  // Recharts radar needs one entry per axis, with a value per pool
  // We flip volatility so "low volatility = high score on radar"
  const radarData = [
    {
      axis: "APY",
      ...Object.fromEntries(
        pools.map((p) => [p.name, parseFloat((p.apy / 25 * 100).toFixed(1))])
      ),
    },
    {
      axis: "Safety",
      ...Object.fromEntries(
        pools.map((p) => [p.name, parseFloat(((1 - p.volatility) * 100).toFixed(1))])
      ),
    },
    {
      axis: "Confidence",
      ...Object.fromEntries(
        pools.map((p) => [p.name, parseFloat((p.confidence * 100).toFixed(1))])
      ),
    },
    {
      axis: "Liquidity",
      ...Object.fromEntries(
        pools.map((p) => [p.name, parseFloat((Math.min(p.tvl / 10_000_000, 1) * 100).toFixed(1))])
      ),
    },
  ];

  // ── Bar chart data: APY vs Volatility side by side ────────────────────────
  const barData = pools.map((p) => ({
    name: p.name.split(" / ")[0],   // shorten label
    APY: parseFloat(p.apy.toFixed(1)),
    Risk: parseFloat((p.volatility * 100).toFixed(1)),
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">Market radar</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Live pool analysis across 4 dimensions
          </p>
        </div>
        {/* Circuit breaker alert */}
        {circuitBreaker && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
            <span className="text-xs font-semibold text-red-600">
              Circuit breaker active
            </span>
          </div>
        )}
      </div>

      <div className="p-5 space-y-6">
        {/* ── Pool health cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-5 gap-2">
          {pools.map((pool, i) => (
            <div
              key={pool.id}
              className="p-3 rounded-xl border border-gray-50 bg-gray-50 text-center"
            >
              <p className="text-xs font-semibold text-gray-700 truncate">
                {pool.name.split(" / ")[0]}
              </p>
              <p className="text-base font-bold mt-1"
                style={{ color: POOL_COLORS[i] }}>
                {formatAPY(pool.apy)}
              </p>
              <p className={`text-xs mt-0.5 font-medium ${volatilityColor(pool.volatility)}`}>
                {volatilityLabel(pool.volatility)}
              </p>
            </div>
          ))}
        </div>

        {/* ── Radar chart ─────────────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">
            Pool comparison radar
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#f0f0f0" />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: "1px solid #f0f0f0",
                  boxShadow: "none",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              {pools.map((pool, i) => (
                <Radar
                  key={pool.id}
                  name={pool.name}
                  dataKey={pool.name}
                  stroke={POOL_COLORS[i]}
                  fill={POOL_COLORS[i]}
                  fillOpacity={0.08}
                  strokeWidth={1.5}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* ── APY vs Risk bar chart ────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">
            APY % vs risk %
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={barData}
              barCategoryGap="30%"
              barGap={3}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#d1d5db" }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: "1px solid #f0f0f0",
                  boxShadow: "none",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: 11 }}
              />
              <Bar dataKey="APY" radius={[4, 4, 0, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={POOL_COLORS[i]} />
                ))}
              </Bar>
              <Bar dataKey="Risk" radius={[4, 4, 0, 0]} fill="#fca5a5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Volatility forecast strip ────────────────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">
            Predicted risk zones
          </p>
          <div className="space-y-2">
            {pools.map((pool) => (
              <div key={pool.id} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24 truncate">{pool.name}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pool.volatility * 100}%`,
                      backgroundColor:
                        pool.volatility < 0.25 ? "#22c55e"
                        : pool.volatility < 0.55 ? "#eab308"
                        : pool.volatility < 0.75 ? "#f97316"
                        : "#ef4444",
                    }}
                  />
                </div>
                <span className={`text-xs font-medium w-16 text-right ${volatilityColor(pool.volatility)}`}>
                  {(pool.volatility * 100).toFixed(0)}% risk
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
