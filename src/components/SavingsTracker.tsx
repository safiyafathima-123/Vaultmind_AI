// src/components/SavingsTracker.tsx
"use client";

import { useState, useEffect } from "react";
import { Pool, UserProfile, FinalDecision } from "@/lib/types";
import { runDebateEngine, rankPools } from "@/lib/aiEngine";

interface SavingsTrackerProps {
  pools: Pool[];
  profile: UserProfile;
}

interface RebalanceEvent {
  id: string;
  timestamp: Date;
  action: FinalDecision["action"];
  fromPool: string;
  toPool: string;
  lossAvoided: number;    // USD
  yieldGained: number;    // USD
  explanation: string;
}

// Generate a realistic history of past AI actions for demo
function generateHistory(pools: Pool[], profile: UserProfile): RebalanceEvent[] {
  const ranked = rankPools(pools, profile);

  return [
    {
      id: "evt-1",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),   // 2 days ago
      action: "rebalance",
      fromPool: pools[1]?.name ?? "ONE/USDO",
      toPool:   ranked[0].pool.name,
      lossAvoided: 0,
      yieldGained: 18,
      explanation: `Moved to ${ranked[0].pool.name} for better risk-adjusted yield.`,
    },
    {
      id: "evt-2",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),   // 5 days ago
      action: "move-to-stable",
      fromPool: pools[0]?.name ?? "ETH/USDC",
      toPool:   "USDC/USDO",
      lossAvoided: 34,
      yieldGained: 0,
      explanation: "Volatility spike detected. Moved to stablecoin pool for protection.",
    },
    {
      id: "evt-3",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),   // 9 days ago
      action: "rebalance",
      fromPool: "USDC/USDO",
      toPool:   pools[4]?.name ?? "ONE/ETH",
      lossAvoided: 0,
      yieldGained: 12,
      explanation: "Market stabilised. Rebalanced back to higher yield pool.",
    },
  ];
}

const ACTION_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  "rebalance":      { label: "Rebalanced",     color: "text-purple-700", bg: "bg-purple-50"  },
  "hold":           { label: "Held",            color: "text-gray-600",   bg: "bg-gray-50"    },
  "move-to-stable": { label: "Safe haven move", color: "text-blue-700",   bg: "bg-blue-50"    },
};

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function SavingsTracker({ pools, profile }: SavingsTrackerProps) {
  const [history] = useState<RebalanceEvent[]>(() =>
    generateHistory(pools, profile)
  );

  const totalLossAvoided = history.reduce((s, e) => s + e.lossAvoided, 0);
  const totalYieldGained = history.reduce((s, e) => s + e.yieldGained, 0);
  const totalBenefit     = totalLossAvoided + totalYieldGained;

  // Smart alert messages
  const [alerts] = useState([
    "Volatility spike detected in ONE/USDO — funds protected.",
    "New best yield opportunity found in ETH/USDC.",
    "Rebalance completed in one atomic block.",
  ]);
  const [alertIdx, setAlertIdx] = useState(0);

  // Cycle through alerts every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setAlertIdx((i) => (i + 1) % alerts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [alerts.length]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50">
        <h3 className="font-semibold text-gray-800 text-sm">AI savings tracker</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          What the AI has done for your capital
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Live alert ticker */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 animate-pulse" />
          <p
            key={alertIdx}
            className="text-xs text-gray-600 transition-opacity duration-500"
          >
            {alerts[alertIdx]}
          </p>
        </div>

        {/* Savings summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-center">
            <p className="text-xs text-green-600">Loss avoided</p>
            <p className="text-xl font-bold text-green-700 mt-1">
              ${totalLossAvoided}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-center">
            <p className="text-xs text-purple-500">Better yield</p>
            <p className="text-xl font-bold text-purple-700 mt-1">
              ${totalYieldGained}
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
            <p className="text-xs text-amber-600">Total AI benefit</p>
            <p className="text-xl font-bold text-amber-700 mt-1">
              ${totalBenefit}
            </p>
          </div>
        </div>

        {/* Benefit breakdown bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Benefit breakdown</span>
            <span>${totalBenefit} total</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
            <div
              className="bg-green-400 transition-all duration-700"
              style={{ width: `${(totalLossAvoided / totalBenefit) * 100}%` }}
            />
            <div
              className="bg-purple-400 transition-all duration-700"
              style={{ width: `${(totalYieldGained / totalBenefit) * 100}%` }}
            />
          </div>
          <div className="flex gap-4 mt-1.5">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              Loss avoided
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
              Yield gained
            </span>
          </div>
        </div>

        {/* Event history */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
            Recent AI actions
          </p>
          <div className="space-y-3">
            {history.map((evt) => {
              const meta = ACTION_LABELS[evt.action];
              return (
                <div
                  key={evt.id}
                  className="flex gap-3 p-3 rounded-xl border border-gray-50 bg-gray-50"
                >
                  {/* Action badge */}
                  <div className={`px-2 py-1 rounded-lg text-xs font-semibold self-start flex-shrink-0 ${meta.bg} ${meta.color}`}>
                    {meta.label}
                  </div>
                  {/* Detail */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {evt.explanation}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-gray-400">
                        {evt.fromPool} → {evt.toPool}
                      </span>
                      {evt.lossAvoided > 0 && (
                        <span className="text-xs text-green-600 font-medium">
                          −${evt.lossAvoided} loss avoided
                        </span>
                      )}
                      {evt.yieldGained > 0 && (
                        <span className="text-xs text-purple-600 font-medium">
                          +${evt.yieldGained} yield
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Timestamp */}
                  <span className="text-xs text-gray-300 flex-shrink-0 self-start">
                    {timeAgo(evt.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
