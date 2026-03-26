// src/components/WalletConnect.tsx
"use client";

import { useState } from "react";
import { UserProfile, RiskLevel } from "@/lib/types";

// Props this component receives from its parent
interface WalletConnectProps {
  onProfileReady: (profile: UserProfile) => void; // called when user is set up
}

export default function WalletConnect({ onProfileReady }: WalletConnectProps) {
  // Track connection state
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Risk profile form state
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("medium");
  const [preferStable, setPreferStable] = useState(true);
  const [maxRebalance, setMaxRebalance] = useState(80);

  // Simulates connecting OneWallet
  // In production replace this with @onelabs/dapp-kit connect()
  async function handleConnect() {
    setIsConnecting(true);
    try {
      // --- REAL ONEWALLET CONNECTION (uncomment when OneChain SDK is ready) ---
      // const { connect, account } = useOneWallet();
      // await connect();
      // setAddress(account.address);

      // MOCK for hackathon demo:
      await new Promise((r) => setTimeout(r, 1200)); // simulate delay
      const mockAddress = "0x" + Math.random().toString(16).slice(2, 12).toUpperCase();
      setAddress(mockAddress);
      setIsConnected(true);
      setShowProfileSetup(true); // show risk profile setup next
    } catch (err) {
      console.error("Wallet connection failed:", err);
    } finally {
      setIsConnecting(false);
    }
  }

  // Called when user saves their risk profile
  function handleSaveProfile() {
    const profile: UserProfile = {
      address,
      riskLevel,
      preferStablecoins: preferStable,
      maxRebalancePercent: maxRebalance,
    };

    // Save to localStorage so it persists across page refreshes
    localStorage.setItem("oneVantageProfile", JSON.stringify(profile));

    // Tell the parent component the profile is ready
    onProfileReady(profile);
    setShowProfileSetup(false);
  }

  // ── UI: Not connected yet ──
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-gray-200 rounded-2xl bg-white shadow-sm max-w-sm mx-auto">
        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
          <span className="text-purple-600 text-xl">◈</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Connect your wallet</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Connect OneWallet to start using One-Vantage AI
        </p>
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium rounded-xl transition-colors"
        >
          {isConnecting ? "Connecting..." : "Connect OneWallet"}
        </button>
      </div>
    );
  }

  // ── UI: Risk profile setup ──
  if (showProfileSetup) {
    return (
      <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
          <span className="text-xs text-gray-400 font-mono">{address}</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Set your risk profile</h2>
        <p className="text-sm text-gray-500 mb-6">
          The AI uses these preferences to make decisions on your behalf.
        </p>

        {/* Risk Level selector */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Risk tolerance
          </label>
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
            {riskLevel === "low" && "AI will prioritize safety. Moves to stablecoins quickly."}
            {riskLevel === "medium" && "AI balances yield and safety based on market conditions."}
            {riskLevel === "high" && "AI chases maximum yield. Higher risk accepted."}
          </p>
        </div>

        {/* Prefer stablecoins toggle */}
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
            type="range"
            min={10}
            max={100}
            step={5}
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

  // ── UI: Connected & profile saved ──
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 border border-purple-100 rounded-xl">
      <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
      <span className="text-sm text-purple-700 font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
      <span className="text-xs text-purple-400">Connected</span>
    </div>
  );
}
