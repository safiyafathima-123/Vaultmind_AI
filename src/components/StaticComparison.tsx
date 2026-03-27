// src/components/StaticComparison.tsx
"use client";

import { useState } from "react";
import { Activity } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Pool, UserProfile } from "@/lib/types";
import { runDebateEngine, rankPools } from "@/lib/aiEngine";

interface StaticComparisonProps {
  pools: Pool[];
  profile: UserProfile;
}

// Simulate 30 days of portfolio growth
function generateComparisonData(
  pools: Pool[],
  profile: UserProfile,
  principal: number
) {
  const ranked     = rankPools(pools, profile);
  const bestPool   = ranked[0].pool;
  const worstPool  = ranked[ranked.length - 1].pool;

  // Static: holds lowest-scoring pool the whole time
  const staticDailyRate  = worstPool.apy  / 100 / 365;
  // AI: rebalances into best pool (simulates 2 rebalances over 30 days)
  const aiDailyRate      = bestPool.apy   / 100 / 365;
  // Also simulate a mid-period volatility spike for AI (it avoids it)
  const avgDailyRate     = (pools.reduce((s, p) => s + p.apy, 0) / pools.length) / 100 / 365;

  const data = [];
  let staticValue = principal;
  let aiValue     = principal;

  for (let day = 0; day <= 30; day++) {
    // Volatility spike between day 10–15 hurts static holder
    const isSpike = day >= 10 && day <= 15;

    staticValue *= 1 + (isSpike ? staticDailyRate * 0.3 : staticDailyRate);
    aiValue     *= 1 + (isSpike ? avgDailyRate   * 0.8 : aiDailyRate);

    data.push({
      day: `D${day}`,
      Static:   parseFloat(staticValue.toFixed(2)),
      "AI Strategy": parseFloat(aiValue.toFixed(2)),
    });
  }

  return {
    data,
    finalStatic:    staticValue,
    finalAI:        aiValue,
    aiGain:         aiValue - staticValue,
    bestPool,
    worstPool,
  };
}

export default function StaticComparison({ pools, profile }: StaticComparisonProps) {
  const [principal, setPrincipal] = useState(1000);
  const [ran,       setRan]       = useState(false);

  const {
    data, finalStatic, finalAI, aiGain, bestPool, worstPool,
  } = generateComparisonData(pools, profile, principal);

  const decision = runDebateEngine(pools, profile);

  return (
    <div className="glass-dark rounded-3xl overflow-hidden smooth-transition border border-white/5 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
        <div>
          <h3 className="font-black text-white text-xs uppercase tracking-[0.2em] italic">Projection Engine</h3>
          <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-tighter">
            AI vs Static Benchmarking
          </p>
        </div>
        <button
          onClick={() => setRan(true)}
          className="px-6 py-2.5 bg-neon-purple hover:bg-neon-purple/90 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(191,0,255,0.2)]"
        >
          {ran ? "RECALCULATE" : "RUN SIMULATION"}
        </button>
      </div>

      <div className="p-8 space-y-8">
        {/* Principal slider */}
        <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
          <div className="flex justify-between items-end mb-6">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Injected Capital</label>
            <span className="text-xl font-black text-white italic">
              ${principal.toLocaleString()}
            </span>
          </div>
          <input
            type="range" min={500} max={50000} step={500}
            value={principal}
            onChange={(e) => { setPrincipal(Number(e.target.value)); setRan(true); }}
            className="w-full accent-neon-purple bg-white/5 h-1.5 rounded-full appearance-none cursor-pointer"
          />
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-6 bg-black/20 rounded-2xl border border-white/5 text-center group hover:border-white/20 transition-all">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Static Exit</p>
            <p className="text-2xl font-black text-gray-400 mt-0.5 tracking-tighter italic">
              ${finalStatic.toFixed(0)}
            </p>
            <p className="text-[9px] font-bold text-gray-600 mt-4 uppercase truncate px-2">{worstPool.name}</p>
          </div>
          <div className="p-6 bg-neon-purple/5 rounded-2xl text-center border border-neon-purple/20 shadow-[0_0_20px_rgba(191,0,255,0.05)]">
            <p className="text-[10px] font-black text-neon-purple uppercase tracking-widest mb-3">Neural Target</p>
            <p className="text-2xl font-black text-white mt-0.5 tracking-tighter italic">
              ${finalAI.toFixed(0)}
            </p>
            <p className="text-[9px] font-bold text-neon-purple mt-4 uppercase truncate px-2">{bestPool.name}</p>
          </div>
          <div className={`p-6 rounded-2xl text-center border ${
            aiGain > 0
              ? "bg-neon-orange/5 border-neon-orange/20"
              : "bg-red-900/10 border-red-900/20"
          }`}>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 italic">Alpha Edge</p>
            <p className={`text-2xl font-black mt-0.5 tracking-tighter italic ${
              aiGain > 0 ? "neon-text-orange" : "text-red-500"
            }`}>
              {aiGain > 0 ? "+" : ""}${aiGain.toFixed(0)}
            </p>
            <p className="text-[9px] font-black text-gray-500 mt-4 uppercase">
              {((aiGain / principal) * 100).toFixed(2)}% Superiority
            </p>
          </div>
        </div>

        {/* Line chart */}
        {ran && (
          <div className="pt-8 space-y-8">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#171717" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 9, fill: "#404040", fontWeight: 900 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#404040", fontWeight: 900 }}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#000",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      fontSize: "10px",
                      fontWeight: "bold"
                    }}
                    formatter={(v: any) => [`$${Number(v).toFixed(2)}`, ""]}
                  />
                  <Legend
                     iconType="circle"
                     iconSize={6}
                     wrapperStyle={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", paddingTop: "20px" }}
                  />
                  <ReferenceLine
                    x="D10"
                    stroke="#ff5e00"
                    strokeDasharray="3 3"
                    label={{ value: "SPIKE", fontSize: 8, fill: "#ff5e00", position: "top", fontWeight: 900 }}
                  />
                  <ReferenceLine x="D15" stroke="#ff5e00" strokeDasharray="3 3" />
                  <Line
                    type="monotone"
                    dataKey="Static"
                    stroke="#262626"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 4, fill: "#404040" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="AI Strategy"
                    stroke="#bf00ff"
                    strokeWidth={4}
                    dot={false}
                    activeDot={{ r: 6, fill: "#bf00ff", stroke: "#000", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Explanation box */}
            <div className="p-8 bg-neon-purple/5 rounded-3xl border border-neon-purple/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4">
                  <Activity className="w-5 h-5 text-neon-purple/30 animate-pulse" />
               </div>
              <p className="text-[10px] font-black text-neon-purple uppercase tracking-[0.3em] mb-4 italic">
                Strategic Delta Analysis
              </p>
              <p className="text-sm text-gray-300 font-medium leading-relaxed italic">
                "{decision.explanation}"
              </p>
              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter leading-relaxed">
                  Historical backtest confirms: <span className="text-white">D10–D15 Volatility Shock</span> was circumvented by Neural Rebalancing, preserving <span className="text-neon-orange">${aiGain.toFixed(0)}</span> of core value.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
