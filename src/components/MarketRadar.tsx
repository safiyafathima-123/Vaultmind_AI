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
// Color per pool for charts - Neon palette
const POOL_COLORS = ["#bf00ff", "#ff5e00", "#00f2ff", "#ff007f", "#bcff00"];

export default function MarketRadar({ pools }: MarketRadarProps) {
  if (!pools.length) return null;

  const circuitBreaker = isCircuitBreakerActive(pools);

  // ── Radar chart data ────────────────────────────────────────────────────
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
      axis: "Logic",
      ...Object.fromEntries(
        pools.map((p) => [p.name, parseFloat((p.confidence * 100).toFixed(1))])
      ),
    },
    {
      axis: "TVL Cap",
      ...Object.fromEntries(
        pools.map((p) => [p.name, parseFloat((Math.min(p.tvl / 10_000_000, 1) * 100).toFixed(1))])
      ),
    },
  ];

  const barData = pools.map((p) => ({
    name: p.name.split(" / ")[0],
    APY: parseFloat(p.apy.toFixed(1)),
    Risk: parseFloat((p.volatility * 100).toFixed(1)),
  }));

  return (
    <div className="glass-dark rounded-3xl overflow-hidden smooth-transition border border-white/5 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
        <div>
          <h3 className="font-black text-white text-xs uppercase tracking-[0.2em] italic">Neural Market Radar</h3>
          <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-tighter">
            Multidimensional Analytical Array
          </p>
        </div>
        {circuitBreaker && (
          <div className="flex items-center gap-2 px-4 py-2 bg-neon-orange/10 border border-neon-orange/20 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-neon-orange shadow-[0_0_10px_var(--neon-orange)] animate-pulse" />
            <span className="text-[10px] font-black text-neon-orange uppercase tracking-widest">Circuit Breaker Active</span>
          </div>
        )}
      </div>

      <div className="p-8 space-y-10">
        {/* Pool health cards */}
        <div className="grid grid-cols-5 gap-3">
          {pools.map((pool, i) => (
            <div
              key={pool.id}
              className="p-4 rounded-2xl border border-white/5 bg-black/40 text-center hover-glow-purple smooth-transition group"
            >
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest truncate group-hover:text-white transition-colors">
                {pool.name.split(" / ")[0]}
              </p>
              <p className="text-lg font-black mt-2 italic tracking-tighter"
                style={{ color: POOL_COLORS[i] }}>
                {formatAPY(pool.apy)}
              </p>
            </div>
          ))}
        </div>

        {/* Radar and Bar Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Radar */}
          <div>
            <p className="text-[10px] font-black text-gray-600 mb-6 uppercase tracking-[0.3em] font-mono">Comparative Neural Topology</p>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#262626" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fontSize: 9, fill: "#737373", fontWeight: 900 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    color: "#fff"
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={6}
                  wrapperStyle={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", paddingTop: "20px" }}
                />
                {pools.map((pool, i) => (
                  <Radar
                    key={pool.id}
                    name={pool.name}
                    dataKey={pool.name}
                    stroke={POOL_COLORS[i]}
                    fill={POOL_COLORS[i]}
                    fillOpacity={0.05}
                    strokeWidth={2}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar */}
          <div>
            <p className="text-[10px] font-black text-gray-600 mb-6 uppercase tracking-[0.3em] font-mono">Relative Efficiency metrics</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} barCategoryGap="40%">
                <CartesianGrid strokeDasharray="3 3" stroke="#171717" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: "#737373", fontWeight: 900 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 8, fill: "#404040", fontWeight: 900 }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                   contentStyle={{
                    backgroundColor: "#000",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "10px",
                    fontWeight: "bold"
                  }}
                />
                <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px" }} />
                <Bar dataKey="APY" radius={[6, 6, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={POOL_COLORS[i]} />
                  ))}
                </Bar>
                <Bar dataKey="Risk" radius={[6, 6, 0, 0]} fill="#262626" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Forecast strip */}
        <div className="pt-6 border-t border-white/5">
          <p className="text-[10px] font-black text-gray-600 mb-6 uppercase tracking-[0.3em] font-mono">Neural risk Forecasting</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            {pools.map((pool) => (
              <div key={pool.id} className="flex items-center gap-4 group">
                <span className="text-[10px] font-black text-gray-400 w-28 truncate group-hover:text-white transition-colors">{pool.name}</span>
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full smooth-transition"
                    style={{
                      width: `${pool.volatility * 100}%`,
                      backgroundColor: pool.volatility < 0.3 ? "#bf00ff" : "#ff5e00",
                      boxShadow: pool.volatility < 0.3 ? "0 0 10px rgba(191,0,255,0.4)" : "0 0 10px rgba(255,94,0,0.4)"
                    }}
                  />
                </div>
                <span className="text-[10px] font-black w-14 text-right uppercase italic font-mono" style={{ color: pool.volatility < 0.3 ? "#bf00ff" : "#ff5e00" }}>
                  {Math.round(pool.volatility * 100)}% Risk
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
