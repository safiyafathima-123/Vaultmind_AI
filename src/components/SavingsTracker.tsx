"use client";

import { useState, useEffect } from "react";
import { Pool, UserProfile, FinalDecision } from "@/lib/types";
import { rankPools } from "@/lib/aiEngine";
import { ShieldCheck, TrendingUp, Wallet, ArrowRightLeft, ShieldAlert, Sparkles, ChevronRight, Activity, Zap } from "lucide-react";

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
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      action: "rebalance",
      fromPool: pools[1]?.name ?? "ONE/USDO",
      toPool:   ranked[0].pool.name,
      lossAvoided: 0,
      yieldGained: 18,
      explanation: `Moved capital to ${ranked[0].pool.name} for superior risk-adjusted yield.`,
    },
    {
      id: "evt-2",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      action: "move-to-stable",
      fromPool: pools[0]?.name ?? "ETH/USDC",
      toPool:   "USDC/USDO",
      lossAvoided: 34,
      yieldGained: 0,
      explanation: "Volatile market conditions detected. Automated pivot to stable-haven.",
    },
    {
      id: "evt-3",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
      action: "rebalance",
      fromPool: "USDC/USDO",
      toPool:   pools[4]?.name ?? "ONE/ETH",
      lossAvoided: 0,
      yieldGained: 12,
      explanation: "Market stability restored. Rebalanced to capture emerging yields.",
    },
  ];
}

const ACTION_LABELS: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  "rebalance":      { label: "Pivot",     color: "text-purple-700", bg: "bg-purple-100/50", icon: ArrowRightLeft },
  "hold":           { label: "Hold",      color: "text-gray-600",   bg: "bg-gray-100/50",   icon: ShieldCheck      },
  "move-to-stable": { label: "Protect",   color: "text-blue-700",   bg: "bg-blue-100/50",   icon: ShieldAlert      },
};

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  return `${days}d ago`;
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
    "Volatility spike detected in ONE/USDO — capital protected.",
    "Higher yield threshold reached in ETH/USDC liquidity pool.",
    "Atomic PTB transaction finalized: Portfolio rebalanced.",
    "Market predictive confidence at 98% for OneChain assets.",
  ]);
  const [alertIdx, setAlertIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAlertIdx((i) => (i + 1) % alerts.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [alerts.length]);

  return (
    <div className="glass-dark rounded-3xl overflow-hidden smooth-transition border border-white/5 shadow-2xl">
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
           <Activity className="w-5 h-5 text-neon-purple" />
           <h3 className="font-black text-white text-xs uppercase tracking-[0.2em] italic">Yield Engine</h3>
        </div>
        <div className="px-3 py-1 bg-neon-purple/20 border border-neon-purple/40 text-[10px] font-black text-neon-purple rounded-full uppercase tracking-widest">
           Live Analysis
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Live alert ticker */}
        <div className="flex items-center gap-4 px-6 py-4 bg-black/40 rounded-2xl border border-white/5 group overflow-hidden">
          <div className="relative shrink-0">
             <div className="w-2 h-2 rounded-full bg-neon-purple shadow-[0_0_10px_var(--neon-purple)]" />
             <div className="absolute inset-0 w-2 h-2 rounded-full bg-neon-purple animate-ping" />
          </div>
          <p
            key={alertIdx}
            className="text-[11px] font-bold text-gray-400 italic transition-all duration-700 truncate"
          >
            {alerts[alertIdx]}
          </p>
        </div>

        {/* Primary Savings Metric */}
        <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 group hover:neon-border-orange smooth-transition relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
             <div className="px-3 py-1 rounded-md bg-neon-orange/10 border border-neon-orange/20">
               <span className="text-[10px] font-black text-neon-orange uppercase">+2.4% APR Edge</span>
             </div>
          </div>
          
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Neural Yield Generated</p>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black text-white italic tracking-tighter">${totalBenefit.toFixed(2)}</span>
            <span className="text-sm font-black text-neon-purple italic uppercase tracking-widest">USDC</span>
          </div>
        </div>

        {/* Efficiency Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-black/40 border border-white/5 group hover:border-neon-purple/30 smooth-transition">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Gas Extraction</p>
            <p className="text-2xl font-black text-neon-purple italic">${totalYieldGained.toFixed(2)}</p>
          </div>
          <div className="p-6 rounded-2xl bg-black/40 border border-white/5 group hover:border-neon-orange/30 smooth-transition">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Risk Mitigation</p>
            <p className="text-2xl font-black text-neon-orange italic">${totalLossAvoided.toFixed(2)}</p>
          </div>
        </div>

        {/* Progress to target */}
        <div className="p-6 rounded-2xl border border-white/5 bg-black/20">
          <div className="flex justify-between items-end mb-5">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Monthly Efficiency Target</span>
            <span className="text-xs font-black text-white italic tracking-widest">$1,000.00</span>
          </div>
          <div className="h-2.5 bg-black rounded-full overflow-hidden border border-white/5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-neon-purple to-neon-orange rounded-full smooth-transition shadow-[0_0_15px_rgba(191,0,255,0.4)]"
              style={{ width: `${Math.min((totalBenefit / 1000) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-4">
             <span className="text-[10px] font-black text-neon-purple uppercase italic tracking-widest">
               {Math.round((totalBenefit / 1000) * 100)}% Synchronized
             </span>
             <span className="text-[9px] font-black text-gray-600 uppercase">OneChain Mainnet Consensus</span>
          </div>
        </div>

        {/* Timeline Header */}
        <div className="flex items-center justify-between pt-4">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Autonomous Timeline</p>
          <button className="text-[10px] font-black text-neon-purple uppercase tracking-widest flex items-center gap-2 hover:text-white smooth-transition group">
            FULL LOGS <ChevronRight className="w-3 h-3 group-hover:translate-x-1 smooth-transition" />
          </button>
        </div>

        {/* Event history */}
        <div className="space-y-4">
          {history.map((evt) => {
            const meta = ACTION_LABELS[evt.action];
            const Icon = meta.icon;
            return (
              <div
                key={evt.id}
                className="flex gap-5 p-5 rounded-3xl border border-white/5 bg-black/40 hover:bg-white/[0.04] smooth-transition group"
              >
                {/* Action icon */}
                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center smooth-transition border ${evt.action === 'rebalance' ? 'bg-neon-purple/10 border-neon-purple/20 text-neon-purple' : 'bg-neon-orange/10 border-neon-orange/20 text-neon-orange'} group-hover:scale-110 shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                {/* Detail */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-[11px] font-bold text-gray-300 leading-relaxed mb-2 italic">
                    {evt.explanation}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">
                      {evt.fromPool} <ArrowRightLeft className="inline w-2.5 h-2.5 mx-1 opacity-40" /> {evt.toPool}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    {evt.lossAvoided > 0 && (
                      <span className="text-[10px] text-neon-orange font-black uppercase tracking-tighter">
                        +${evt.lossAvoided} Mitigated
                      </span>
                    )}
                    {evt.yieldGained > 0 && (
                      <span className="text-[10px] text-neon-purple font-black uppercase tracking-tighter">
                        +${evt.yieldGained} Amplified
                      </span>
                    )}
                  </div>
                </div>
                {/* Timestamp */}
                <span className="text-[9px] font-black text-gray-600 uppercase italic self-start mt-1">
                  {timeAgo(evt.timestamp)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
