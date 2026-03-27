"use client";

import { useMarketData } from "@/lib/useMarketData";
import {
  formatAPY,
  formatTVL,
  volatilityLabel,
  volatilityColor,
} from "@/lib/poolData";
import { TrendingUp, BarChart3, ShieldCheck, Info, Zap } from "lucide-react";

export default function PoolTable() {
  const { pools, isLoading, error, lastUpdated, refresh } = useMarketData();

  if (isLoading) {
    return (
      <div className="glass-dark rounded-3xl p-12 flex flex-col items-center justify-center gap-6 smooth-transition neon-border-purple">
        <div className="w-12 h-12 rounded-2xl bg-neon-purple/10 flex items-center justify-center animate-bounce border border-neon-purple/30">
           <TrendingUp className="w-6 h-6 text-neon-purple" />
        </div>
        <p className="text-[10px] font-black text-neon-purple uppercase tracking-[0.4em] animate-pulse italic">Scanning Neural DEX Nodes...</p>
      </div>
    );
  }

  if (error && pools.length === 0) {
    return (
      <div className="glass-dark rounded-3xl p-8 border-neon-orange/20 bg-neon-orange/5 text-center neon-border-orange">
        <p className="text-neon-orange font-black text-xs uppercase tracking-widest">
          {error} — using neural simulation
        </p>
      </div>
    );
  }

  return (
    <div className="glass-dark rounded-3xl overflow-hidden smooth-transition shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
           <BarChart3 className="w-5 h-5 text-neon-purple" />
           <h3 className="font-black text-white text-xs uppercase tracking-[0.2em] italic">Neural Liquidity Markets</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-neon-purple/10 rounded-full border border-neon-purple/20">
             <div className="w-1.5 h-1.5 rounded-full bg-neon-purple shadow-[0_0_8px_var(--neon-purple)] animate-pulse" />
             <span className="text-[10px] font-black text-neon-purple uppercase tracking-tight">Active Sync</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] bg-black/40">
              <th className="text-left px-8 py-5">Pool Pair</th>
              <th className="text-right px-8 py-5">Est. APY</th>
              <th className="text-right px-8 py-5">Risk Rating</th>
              <th className="text-right px-8 py-5">Capacity</th>
              <th className="text-right px-8 py-5">Neural Trust</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {pools.map((pool, i) => (
              <tr
                key={pool.id}
                className="group hover:bg-neon-purple/[0.04] smooth-transition cursor-default"
              >
                <td className="px-8 py-6">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-[10px] text-gray-400 group-hover:neon-border-purple group-hover:text-neon-purple smooth-transition uppercase border border-white/5">
                        {pool.name.slice(0, 1)}
                      </div>
                      <span className="font-black text-white italic tracking-tight">{pool.name}</span>
                   </div>
                </td>
                <td className="px-8 py-6 text-right">
                   <span className="inline-flex items-center gap-2 font-black text-neon-orange px-3 py-1.5 rounded-xl bg-neon-orange/10 border border-neon-orange/20 group-hover:scale-110 smooth-transition shadow-[0_0_15px_rgba(255,94,0,0.1)]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {formatAPY(pool.apy)}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm ${
                    pool.volatility < 0.3 ? 'bg-neon-purple/10 text-neon-purple border-neon-purple/20' : 
                    pool.volatility < 0.6 ? 'bg-neon-orange/10 text-neon-orange border-neon-orange/20' : 
                    'bg-neon-orange/20 text-neon-orange border-neon-orange/40'
                  }`}>
                    {volatilityLabel(pool.volatility)}
                  </span>
                </td>
                <td className="px-8 py-6 text-right font-black text-gray-400 tabular-nums">
                  {formatTVL(pool.tvl)}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-4">
                    <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neon-purple rounded-full smooth-transition shadow-[0_0_10px_var(--neon-purple)]"
                        style={{ width: `${pool.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-white font-black text-xs min-w-[32px] font-mono">
                      {Math.round(pool.confidence * 100)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer Info */}
      <div className="px-8 py-5 bg-black/40 border-t border-white/5 flex items-center gap-3">
         <ShieldCheck className="w-4 h-4 text-neon-purple/60" />
         <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Neural Network monitoring active • Predicted yield curves stable</p>
      </div>
    </div>
  );
}
