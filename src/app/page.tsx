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
import { useCurrentAccount } from "@onelabs/dapp-kit";
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
  const currentAccount = useCurrentAccount();

  useEffect(() => {
    const saved = loadSavedProfile();
    if (saved) setProfile(saved);
  }, []);

  // Derive display address preferring the real connected account address
  const displayAddress = currentAccount?.address ?? profile?.address ?? "";

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
              <span className="font-black text-white text-xl tracking-tighter leading-none italic uppercase group-hover:neon-text-purple smooth-transition">One-Vantage AI</span>
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
               The world's most advanced autonomous strategist for <span className="text-white italic">OneChain</span> liquidity optimization.
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
                      extra: currentAccount ? "Dev Burner Active" : "Manual Portal" 
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
               <p className="text-[10px] text-neon-purple font-black mt-2 italic uppercase">Synching OneChain Nodes</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
