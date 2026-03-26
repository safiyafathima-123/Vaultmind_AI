// src/app/page.tsx
"use client";

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
  const { pools, isLoading, lastUpdated, refresh } = useMarketData();

  useEffect(() => {
    const saved = loadSavedProfile();
    if (saved) setProfile(saved);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Top navigation bar ────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">OV</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">One-Vantage AI</span>
              <span className="text-xs text-gray-400 ml-2">on OneChain</span>
            </div>
          </div>
          {profile && (
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <button
                  onClick={refresh}
                  className="text-xs text-gray-400 hover:text-purple-600 transition-colors"
                >
                  ↻ {lastUpdated.toLocaleTimeString()}
                </button>
              )}
              <WalletConnect onProfileReady={(p) => setProfile(p)} />
            </div>
          )}
        </div>

        {/* Tab bar — only show when connected */}
        {profile && (
          <div className="max-w-5xl mx-auto px-5 flex gap-1 pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "text-purple-700 border-purple-600 bg-purple-50/50"
                    : "text-gray-400 border-transparent hover:text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-5 py-6">
        {/* Not connected */}
        {!profile && (
          <div className="mt-24 max-w-sm mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">One-Vantage AI</h1>
              <p className="text-gray-400 mt-2 text-sm">
                The first autonomous predictive liquidity strategist on OneChain
              </p>
            </div>
            <WalletConnect onProfileReady={(p) => setProfile(p)} />
          </div>
        )}

        {/* Connected dashboard */}
        {profile && !isLoading && (
          <div className="space-y-6">

            {/* ── OVERVIEW TAB ────────────────────────────────────────────── */}
            {activeTab === "overview" && (
              <>
                {/* Profile strip */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Wallet",       value: `${profile.address.slice(0,6)}...${profile.address.slice(-4)}` },
                    { label: "Risk level",   value: profile.riskLevel,                     },
                    { label: "Safe haven",   value: profile.preferStablecoins ? "On" : "Off" },
                    { label: "Max rebalance",value: `${profile.maxRebalancePercent}%`       },
                  ].map((item) => (
                    <div key={item.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                      <p className="text-xs text-gray-400">{item.label}</p>
                      <p className="text-sm font-semibold text-gray-800 capitalize mt-1 truncate">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Live pool table */}
                <PoolTable />

                {/* Savings snapshot */}
                <SavingsTracker pools={pools} profile={profile} />
              </>
            )}

            {/* ── MARKET RADAR TAB ────────────────────────────────────────── */}
            {activeTab === "radar" && (
              <MarketRadar pools={pools} />
            )}

            {/* ── AI DEBATE TAB ───────────────────────────────────────────── */}
            {activeTab === "debate" && (
              <AIDebatePanel pools={pools} profile={profile} />
            )}

            {/* ── REBALANCE TAB ───────────────────────────────────────────── */}
            {activeTab === "rebalance" && (
              <PTBExecutor pools={pools} profile={profile} />
            )}

            {/* ── PERFORMANCE TAB ─────────────────────────────────────────── */}
            {activeTab === "performance" && (
              <StaticComparison pools={pools} profile={profile} />
            )}

          </div>
        )}

        {/* Loading state */}
        {profile && isLoading && (
          <div className="flex flex-col items-center justify-center mt-32 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin" />
            <p className="text-sm text-gray-400">Loading market data...</p>
          </div>
        )}
      </div>
    </main>
  );
}
