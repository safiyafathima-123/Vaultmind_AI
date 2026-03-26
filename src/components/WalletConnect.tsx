"use client";

import { useState } from "react";
import {
  ConnectButton,
  useCurrentAccount,
  useOwnedCoins,
  useDisconnectWallet,
} from "@onelabs/dapp-kit";
import { UserProfile, RiskLevel } from "@/lib/types";

interface WalletConnectProps {
  onProfileReady: (profile: UserProfile) => void;
}

export default function WalletConnect({ onProfileReady }: WalletConnectProps) {
  const currentAccount         = useCurrentAccount();
  const { data: coins }        = useOwnedCoins();
  const { mutate: disconnect } = useDisconnectWallet();

  const [showProfile,  setShowProfile]  = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [riskLevel,    setRiskLevel]    = useState<RiskLevel>("medium");
  const [preferStable, setPreferStable] = useState(true);
  const [maxRebalance, setMaxRebalance] = useState(80);

  // Calculate OCT balance from owned coins
  const totalBalance =
    coins?.data.reduce((sum, coin) => sum + parseInt(coin.balance), 0) ?? 0;
  const balanceOCT = (totalBalance / 1e9).toFixed(4);

  // Load saved profile from localStorage on mount
  useState(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("oneVantageProfile");
    if (saved) {
      const parsed = JSON.parse(saved) as UserProfile;
      setRiskLevel(parsed.riskLevel);
      setPreferStable(parsed.preferStablecoins);
      setMaxRebalance(parsed.maxRebalancePercent);
      setProfileSaved(true);
      onProfileReady(parsed);
    }
  });

  function handleSaveProfile() {
    if (!currentAccount) return;
    const profile: UserProfile = {
      address:             currentAccount.address,
      riskLevel,
      preferStablecoins:   preferStable,
      maxRebalancePercent: maxRebalance,
    };
    localStorage.setItem("oneVantageProfile", JSON.stringify(profile));
    onProfileReady(profile);
    setProfileSaved(true);
    setShowProfile(false);
  }

  // ── Not connected: show official ConnectButton ─────────────────────────────
  if (!currentAccount) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-gray-200 rounded-2xl bg-white shadow-sm max-w-sm mx-auto">
        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
          <span className="text-purple-600 text-xl">◈</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Connect your wallet</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Connect OneWallet to start using One-Vantage AI
        </p>
        <ConnectButton className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors" />
      </div>
    );
  }

  // ── Risk profile setup (first time) ───────────────────────────────────────
  if (!profileSaved || showProfile) {
    return (
      <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm max-w-md mx-auto">
        {/* Wallet address + balance */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs text-gray-400 font-mono">
              {currentAccount.address.slice(0, 8)}...{currentAccount.address.slice(-6)}
            </span>
          </div>
          <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
            {balanceOCT} OCT
          </span>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-1">Set your risk profile</h2>
        <p className="text-sm text-gray-500 mb-5">
          The AI uses these to make decisions on your behalf.
        </p>

        {/* Risk Level */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Risk tolerance</label>
          <div className="flex gap-2">
            {(["low", "medium", "high"] as RiskLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setRiskLevel(level)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors capitalize ${
                  riskLevel === level
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {riskLevel === "low"    && "AI prioritises safety. Moves to stablecoins quickly."}
            {riskLevel === "medium" && "AI balances yield and safety based on market conditions."}
            {riskLevel === "high"   && "AI chases maximum yield. Higher risk accepted."}
          </p>
        </div>

        {/* Stablecoin toggle */}
        <div className="flex items-center justify-between mb-5 p-3 bg-gray-50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-gray-700">Move to stablecoins during risk</p>
            <p className="text-xs text-gray-400">AI uses USDC/USDO as a safe haven</p>
          </div>
          <button
            onClick={() => setPreferStable(!preferStable)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              preferStable ? "bg-purple-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                preferStable ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Max rebalance slider */}
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Max rebalance</label>
            <span className="text-sm font-semibold text-purple-600">{maxRebalance}%</span>
          </div>
          <input
            type="range" min={10} max={100} step={5}
            value={maxRebalance}
            onChange={(e) => setMaxRebalance(Number(e.target.value))}
            className="w-full accent-purple-600"
          />
          <p className="text-xs text-gray-400 mt-1">
            AI can move up to {maxRebalance}% of your funds per rebalance
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
        >
          Save profile &amp; continue
        </button>
      </div>
    );
  }

  // ── Connected + profile saved: compact header badge ───────────────────────
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-xl">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        <span className="text-xs text-purple-700 font-mono">
          {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
        </span>
        <span className="text-xs text-purple-400 font-medium">{balanceOCT} OCT</span>
      </div>
      <button
        onClick={() => setShowProfile(true)}
        className="text-xs text-gray-400 hover:text-purple-600 px-2 py-1.5 rounded-lg hover:bg-purple-50 transition-colors"
      >
        Edit profile
      </button>
      <button
        onClick={() => {
          disconnect();
          localStorage.removeItem("oneVantageProfile");
          setProfileSaved(false);
        }}
        className="text-xs text-gray-300 hover:text-red-400 px-2 py-1.5 rounded-lg transition-colors"
      >
        Disconnect
      </button>
    </div>
  );
}
