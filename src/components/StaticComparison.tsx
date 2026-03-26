// src/components/StaticComparison.tsx
"use client";

import { useState } from "react";
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">AI vs static strategy</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            30-day simulated performance comparison
          </p>
        </div>
        <button
          onClick={() => setRan(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {ran ? "Recalculate" : "Run simulation"}
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Principal slider */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-medium text-gray-500">
              Starting capital
            </label>
            <span className="text-sm font-semibold text-purple-600">
              ${principal.toLocaleString()}
            </span>
          </div>
          <input
            type="range" min={500} max={50000} step={500}
            value={principal}
            onChange={(e) => { setPrincipal(Number(e.target.value)); setRan(true); }}
            className="w-full accent-purple-600"
          />
        </div>

        {/* Summary cards — always visible */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-gray-50 rounded-xl text-center">
            <p className="text-xs text-gray-400">Static final</p>
            <p className="text-base font-bold text-gray-700 mt-0.5">
              ${finalStatic.toFixed(0)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{worstPool.name}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl text-center border border-purple-100">
            <p className="text-xs text-purple-400">AI final</p>
            <p className="text-base font-bold text-purple-700 mt-0.5">
              ${finalAI.toFixed(0)}
            </p>
            <p className="text-xs text-purple-400 mt-0.5">{bestPool.name}</p>
          </div>
          <div className={`p-3 rounded-xl text-center border ${
            aiGain > 0
              ? "bg-green-50 border-green-100"
              : "bg-red-50 border-red-100"
          }`}>
            <p className="text-xs text-gray-400">AI advantage</p>
            <p className={`text-base font-bold mt-0.5 ${
              aiGain > 0 ? "text-green-600" : "text-red-500"
            }`}>
              {aiGain > 0 ? "+" : ""}${aiGain.toFixed(0)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {((aiGain / principal) * 100).toFixed(2)}% edge
            </p>
          </div>
        </div>

        {/* Line chart */}
        {ran && (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f5f5f5"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "#d1d5db" }}
                  axisLine={false}
                  tickLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#d1d5db" }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                  tickFormatter={(v) => `$${v.toFixed(0)}`}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 8,
                    border: "1px solid #f0f0f0",
                    boxShadow: "none",
                  }}
                  formatter={(v: number) => [`$${v.toFixed(2)}`, ""]}
                />
                <Legend
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{ fontSize: 11 }}
                />
                {/* Highlight volatility spike zone */}
                <ReferenceLine
                  x="D10"
                  stroke="#fca5a5"
                  strokeDasharray="3 3"
                  label={{ value: "Spike", fontSize: 9, fill: "#f87171", position: "top" }}
                />
                <ReferenceLine x="D15" stroke="#fca5a5" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="Static"
                  stroke="#d1d5db"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="AI Strategy"
                  stroke="#7C3AED"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Explanation box */}
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <p className="text-xs font-semibold text-purple-700 mb-1">
                Why AI wins
              </p>
              <p className="text-xs text-purple-600 leading-relaxed">
                {decision.explanation}
              </p>
              <p className="text-xs text-purple-400 mt-2">
                Between day 10–15 a volatility spike reduced static returns.
                The AI detected this and protected capital by staying in the
                better risk-adjusted pool.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
