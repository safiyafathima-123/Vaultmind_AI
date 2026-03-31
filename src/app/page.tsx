"use client";

import AboutProject from "@/components/AboutProject";
import { useState, useEffect } from "react";
import WalletConnect    from "@/components/WalletConnect";
import PoolTable        from "@/components/PoolTable";
import AIDebatePanel    from "@/components/AIDebatePanel";
import PTBExecutor      from "@/components/PTBExecutor";
import MarketRadar      from "@/components/MarketRadar";
import StaticComparison from "@/components/StaticComparison";
import SavingsTracker   from "@/components/SavingsTracker";
import { UserProfile, loadSavedProfile } from "@/lib/types";
import { useMarketData } from "@/lib/useMarketData";

import { RefreshCw, Activity } from "lucide-react";

// Tab definition
const TABS = [
  { id: "overview",    label: "Overview"     },
  { id: "radar",       label: "Market radar" },
  { id: "debate",      label: "AI debate"    },
  { id: "rebalance",   label: "Rebalance"    },
  { id: "performance", label: "Performance"  },
] as const;

type TabId = typeof TABS[number]["id"];

export default function HomePage() {
  const [profile,    setProfile]    = useState<UserProfile | null>(null);
  const [activeTab,  setActiveTab]  = useState<TabId>("overview");
  const { pools, isLoading, isRefreshing, lastUpdated, refresh } = useMarketData();


  useEffect(() => {
    const saved = loadSavedProfile();
    if (saved) setProfile(saved);
  }, []);

  // Derive display address
  const displayAddress = profile?.address ?? "";

  return (
    <main className="min-h-screen bg-black relative overflow-hidden text-white">
      {/* Background decoration for "smooth" feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/20 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-orange/10 rounded-full blur-[160px] pointer-events-none" />

      {/* ── Top navigation bar ────────────────────────────────────────────── */}
      <header className="glass-dark sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab("overview")}>
            <div className="w-10 h-10 rounded-2xl bg-black neon-border-purple flex items-center justify-center group-hover:scale-110 smooth-transition">
              <Activity className="w-6 h-6 text-neon-purple" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-white text-xl tracking-tighter leading-none italic uppercase group-hover:neon-text-purple smooth-transition">PL Genesis AI</span>
              <span className="text-[10px] text-neon-purple/50 font-black uppercase tracking-[0.4em] mt-1">Autonomous Strategist</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {profile && lastUpdated && (
              <button
                onClick={refresh}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-[10px] text-neon-purple hover:neon-border-purple smooth-transition font-black uppercase tracking-widest shadow-sm"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </button>
            )}
            <WalletConnect onProfileReady={(p) => setProfile(p)} />
          </div>
        </div>

        {/* Tab bar — only show when connected */}
        {profile && (
          <div className="max-w-[1400px] mx-auto px-6 flex gap-4 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-neon-purple border-neon-purple bg-neon-purple/5"
                    : "text-gray-500 border-transparent hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 py-12 relative z-10">
        {/* Landing state (Not connected) — handled by header */}
        {!profile && (
          <div className="mt-32 text-center max-w-2xl mx-auto">
             <div className="inline-block px-4 py-1.5 rounded-full bg-neon-purple/10 border border-neon-purple/20 mb-8">
                <span className="text-[10px] font-black text-neon-purple uppercase tracking-[0.3em]">Protocol Status: Mainnet Live</span>
             </div>
             <h1 className="text-7xl font-black text-white italic tracking-tighter leading-[0.9] mb-8 uppercase">
               Yield Excellence <br />
               <span className="neon-text-purple">Unleashed.</span>
             </h1>
             <p className="text-gray-400 text-lg font-medium leading-relaxed mb-12 max-w-lg mx-auto">
               The world's most advanced autonomous strategist for <span className="text-white italic">PL Genesis</span> liquidity optimization.
             </p>

          </div>
        )}

        {!profile && <AboutProject />}

        {/* Connected dashboard */}
        {profile && !isLoading && (
          <div className="space-y-12">

            {/* ── OVERVIEW TAB ────────────────────────────────────────────── */}
            {activeTab === "overview" && (
              <div className="space-y-12">
                {/* Profile strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { 
                      label: "Wallet ID", 
                      value: displayAddress ? `${displayAddress.slice(0,6)}...${displayAddress.slice(-4)}` : "Not Linked", 
                      extra: displayAddress ? "Neural Account" : "Manual Portal" 
                    },
                    { label: "AI Behavior", value: profile.riskLevel, extra: "Dynamic Pivot" },
                    { label: "Safe Haven",   value: profile.preferStablecoins ? "Enabled" : "Off", extra: "Auto-Stable" },
                    { label: "Max Allocation", value: `${profile.maxRebalancePercent}%`, extra: "Autonomous" },
                  ].map((item) => (
                    <div key={item.label} className="glass-dark rounded-3xl p-6 hover-glow-purple smooth-transition group">
                      <p className="text-[10px] font-black text-neon-purple/60 uppercase tracking-widest">{item.label}</p>
                      <p className="text-2xl font-black text-white capitalize mt-3 truncate italic tracking-tighter">
                        {item.value}
                      </p>
                      <p className="text-[10px] text-gray-500 font-bold mt-2 group-hover:text-neon-purple smooth-transition uppercase tracking-tighter">{item.extra}</p>
                    </div>
                  ))}
                </div>

                {/* Main components */}
                <div className="space-y-12">
                  <PoolTable />
                  <SavingsTracker pools={pools} profile={profile} />
                </div>
              </div>
            )}

            {/* ── TABS RENDERING ───────────────────────────────────────────── */}
            {activeTab === "radar" && <div><MarketRadar pools={pools} /></div>}
            {activeTab === "debate" && <div><AIDebatePanel pools={pools} profile={profile} /></div>}
            {activeTab === "rebalance" && <div><PTBExecutor pools={pools} profile={profile} /></div>}
            {activeTab === "performance" && <div><StaticComparison pools={pools} profile={profile} /></div>}

          </div>
        )}

        {/* Loading state */}
        {profile && isLoading && (
          <div className="flex flex-col items-center justify-center mt-40 gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-3xl border-2 border-white/5 border-t-neon-purple animate-spin shadow-[0_0_30px_rgba(191,0,255,0.2)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-2.5 h-2.5 rounded-full bg-neon-purple shadow-[0_0_15px_var(--neon-purple)] animate-pulse" />
              </div>
            </div>
            <div className="text-center">
               <p className="text-[10px] font-black text-white uppercase tracking-[0.5em] animate-pulse">Initializing Neural Link</p>
               <p className="text-[10px] text-neon-purple font-black mt-2 italic uppercase">Synching PL Genesis Nodes</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <footer className="mt-20 py-12 px-8 border-t border-white/5 relative bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse" />
                <span className="text-xs font-black text-white italic tracking-tighter uppercase">PL Genesis AI</span>
             </div>
             <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-loose text-center md:text-left">
               Autonomous multi-agent strategist anchored on permanent web infrastructure.
             </p>
          </div>

          <div className="flex items-center gap-12">
             <div className="flex flex-col items-center gap-3">
                <span className="text-[9px] font-black text-gray-700 uppercase tracking-[0.3em]">Built for</span>
                <div className="flex items-center gap-4 group">
                   <div className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-neon-purple/50 smooth-transition flex items-center gap-3">
                      <div className="w-5 h-5 rounded-md bg-neon-purple flex items-center justify-center text-[10px] font-black text-white">PL</div>
                      <span className="text-[11px] font-black text-white tracking-widest uppercase italic">PL Genesis</span>
                   </div>
                </div>
             </div>

             <div className="flex flex-col items-center gap-3">
                <span className="text-[9px] font-black text-gray-700 uppercase tracking-[0.3em]">Powered by</span>
                <div className="flex items-center gap-4 group">
                   <div className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-neon-orange/50 smooth-transition flex items-center gap-3 text-neon-orange">
                      <div className="w-5 h-5 rounded-full border-2 border-neon-orange flex items-center justify-center">
                         <div className="w-1.5 h-1.5 rounded-full bg-neon-orange" />
                      </div>
                      <span className="text-[11px] font-black text-white tracking-widest uppercase italic">NEAR</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="text-[9px] text-gray-700 font-bold uppercase tracking-widest">
            © 2026 DECENTRALIZED AUTONOMY · v1.4.0
          </div>
        </div>
        
        {/* Subtle background glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-neon-purple to-transparent opacity-20" />
      </footer>
    </main>
  );
}
