"use client";

<<<<<<< HEAD
import { useState } from "react";
import {
  ConnectButton,
  useCurrentAccount,
  useOwnedCoins,
  useDisconnectWallet,
} from "@onelabs/dapp-kit";
import { UserProfile, RiskLevel } from "@/lib/types";
=======
import { useState, useEffect } from "react";
import { UserProfile, RiskLevel, loadSavedProfile } from "@/lib/types";
import { LogOut, Wallet, Shield, Zap, TrendingUp, X } from "lucide-react";
import { ConnectButton, useCurrentAccount, useDisconnectWallet } from "@onelabs/dapp-kit";
>>>>>>> f38165e (Commited)

interface WalletConnectProps {
<<<<<<< HEAD
  onProfileReady: (profile: UserProfile) => void;
}

export default function WalletConnect({ onProfileReady }: WalletConnectProps) {
  const currentAccount         = useCurrentAccount();
  const { data: coins }        = useOwnedCoins();
  const { mutate: disconnect } = useDisconnectWallet();
=======
  onProfileReady: (profile: UserProfile | null) => void;
}

export default function WalletConnect({ onProfileReady }: WalletConnectProps) {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnectReal } = useDisconnectWallet();

  // Local state for our mock connection
  const [customAddress, setCustomAddress] = useState<string | null>(null);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const [showProfileSetup, setShowProfileSetup] = useState(false);
>>>>>>> f38165e (Commited)

  const [showProfile,  setShowProfile]  = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [riskLevel,    setRiskLevel]    = useState<RiskLevel>("medium");
  const [preferStable, setPreferStable] = useState(true);
  const [maxRebalance, setMaxRebalance] = useState(80);

<<<<<<< HEAD
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
=======
  const activeAddress = currentAccount?.address || customAddress;

  // Initialize from saved profile
  useEffect(() => {
    const saved = loadSavedProfile();
    if (saved?.address) {
      if (!currentAccount?.address) setCustomAddress(saved.address);
      setRiskLevel(saved.riskLevel);
      setPreferStable(saved.preferStablecoins);
      setMaxRebalance(saved.maxRebalancePercent);
      onProfileReady(saved);
    } else {
      onProfileReady(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle connection changes for NEW addresses
  useEffect(() => {
    if (activeAddress) {
      const saved = loadSavedProfile();
      if (saved && saved.address === activeAddress) {
        onProfileReady(saved);
      } else {
        setShowProfileSetup(true);
      }
    } else {
      setShowProfileSetup(false);
      onProfileReady(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAddress]);

  function handleConnectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inputValue.trim()) {
      setCustomAddress(inputValue.trim());
      setShowInputModal(false);
    }
  }

  // Handle Disconnect
  function handleDisconnect() {
    if (currentAccount) {
       disconnectReal();
    }
    setCustomAddress(null);
    setShowProfileSetup(false);
    onProfileReady(null);
    localStorage.removeItem("oneVantageProfile"); // Clear saved profile
  }
>>>>>>> f38165e (Commited)

  function handleSaveProfile() {
<<<<<<< HEAD
    if (!currentAccount) return;
    const profile: UserProfile = {
      address:             currentAccount.address,
=======
    if (!activeAddress) return;

    const profile: UserProfile = {
      address: activeAddress,
>>>>>>> f38165e (Commited)
      riskLevel,
      preferStablecoins:   preferStable,
      maxRebalancePercent: maxRebalance,
    };
<<<<<<< HEAD
=======

>>>>>>> f38165e (Commited)
    localStorage.setItem("oneVantageProfile", JSON.stringify(profile));
    onProfileReady(profile);
    setProfileSaved(true);
    setShowProfile(false);
  }

<<<<<<< HEAD
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
=======
  // Format helper
  const formatAddress = (addr: string | null) => 
    addr && addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr || "";

  // ── UI: Not connected yet ──
  if (!activeAddress && !showInputModal) {
    return (
      <div className="flex flex-col items-center gap-4">
        <button 
          onClick={() => setShowInputModal(true)}
          className="group relative flex items-center gap-4 pl-4 pr-8 py-3 bg-black rounded-2xl smooth-transition neon-border-purple hover-glow-purple overflow-hidden text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative w-10 h-10 rounded-xl bg-neon-purple/10 flex items-center justify-center border border-neon-purple/30 group-hover:border-neon-purple smooth-transition">
            <Wallet className="w-5 h-5 text-neon-purple animate-pulse" />
          </div>
          <div className="relative flex flex-col items-start text-left">
            <span className="text-sm font-black uppercase tracking-tighter text-white">Connect OneWallet</span>
            <span className="text-[10px] font-bold text-neon-purple/60 group-hover:text-neon-purple smooth-transition">Manual Identity Portal</span>
          </div>
        </button>
        
        <ConnectButton 
          className="text-[10px] text-neon-orange font-black uppercase tracking-widest hover:text-white smooth-transition bg-neon-orange/10 px-4 py-2 rounded-full border border-neon-orange/20 cursor-pointer shadow-[0_0_15px_rgba(255,94,0,0.1)] hover:shadow-[0_0_20px_rgba(255,94,0,0.3)]" 
          connectText="OR USE DEV BURNER WALLET →" 
        />
      </div>
    );
  }

  // ── UI: Wallet ID Input Modal ──
  if (!activeAddress && showInputModal) {
    return (
      <div className="p-8 glass-dark rounded-3xl smooth-transition w-[380px] mx-auto neon-border-purple relative shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50">
        <button 
          onClick={() => setShowInputModal(false)}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-neon-orange smooth-transition rounded-xl hover:bg-neon-orange/10"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4 mb-8 pt-2">
          <div className="w-10 h-10 rounded-xl bg-neon-purple/10 flex items-center justify-center border border-neon-purple/30 shadow-[0_0_15px_rgba(191,0,255,0.2)]">
            <Wallet className="w-5 h-5 text-neon-purple" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white italic tracking-tighter uppercase">Link Wallet</h3>
            <p className="text-[10px] text-neon-purple font-bold tracking-widest uppercase mt-0.5">Manual Identity Verification</p>
          </div>
        </div>
        <form onSubmit={handleConnectSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Wallet ID / Address</label>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter 0x..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-neon-purple focus:shadow-[0_0_20px_rgba(191,0,255,0.2)] smooth-transition font-mono placeholder:text-gray-700"
              autoFocus
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-neon-purple hover:bg-neon-purple/90 text-white font-black uppercase tracking-widest rounded-2xl smooth-transition shadow-[0_0_20px_rgba(191,0,255,0.3)] hover:shadow-[0_0_30px_rgba(191,0,255,0.5)] flex items-center justify-center gap-2"
          >
            Authenticate <Zap className="w-4 h-4" />
          </button>
        </form>
>>>>>>> f38165e (Commited)
      </div>
    );
  }

  // ── Risk profile setup (first time) ───────────────────────────────────────
  if (!profileSaved || showProfile) {
    return (
<<<<<<< HEAD
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
=======
      <div className="p-8 glass-dark rounded-3xl smooth-transition max-w-md mx-auto neon-border-purple relative z-50 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-neon-purple shadow-[0_0_10px_rgba(191,0,255,0.8)] animate-pulse" />
            <span className="text-[10px] text-neon-purple font-black tracking-widest uppercase">
              {formatAddress(activeAddress)}
            </span>
          </div>
          <button onClick={handleDisconnect} className="text-gray-500 hover:text-neon-orange hover:bg-neon-orange/10 p-2 rounded-xl smooth-transition">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        
        <h2 className="text-3xl font-black text-white italic tracking-tighter mb-2 uppercase">Risk Strategy</h2>
        <p className="text-sm text-gray-400 mb-10 leading-relaxed font-medium">
          One-Vantage AI builds custom yield strategies for the <span className="text-neon-purple">OneChain</span> ecosystem.
        </p>

        {/* Risk Level selector */}
        <div className="mb-8">
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">
            Strategy Profile
          </label>
          <div className="flex gap-4">
>>>>>>> f38165e (Commited)
            {(["low", "medium", "high"] as RiskLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setRiskLevel(level)}
                className={`flex-1 py-4 px-3 rounded-2xl text-xs font-black border smooth-transition capitalize flex flex-col items-center gap-2 ${
                  riskLevel === level
                    ? "bg-neon-purple text-white border-neon-purple shadow-[0_0_20px_rgba(191,0,255,0.4)] scale-105"
                    : "bg-black/40 text-gray-500 border-white/5 hover:border-neon-purple/30"
                }`}
              >
                {level === "low" && <Shield className="w-5 h-5" />}
                {level === "medium" && <Zap className="w-5 h-5" />}
                {level === "high" && <TrendingUp className="w-5 h-5" />}
                {level}
              </button>
            ))}
          </div>
<<<<<<< HEAD
          <p className="text-xs text-gray-400 mt-1">
            {riskLevel === "low"    && "AI prioritises safety. Moves to stablecoins quickly."}
            {riskLevel === "medium" && "AI balances yield and safety based on market conditions."}
            {riskLevel === "high"   && "AI chases maximum yield. Higher risk accepted."}
          </p>
        </div>

        {/* Stablecoin toggle */}
        <div className="flex items-center justify-between mb-5 p-3 bg-gray-50 rounded-xl">
=======
          <div className="mt-6 p-5 bg-neon-purple/5 rounded-2xl border border-neon-purple/10">
             <p className="text-xs text-neon-purple/80 leading-relaxed font-bold italic">
              {riskLevel === "low" && "Conservative: AI prioritizes stable pools & rapid exits."}
              {riskLevel === "medium" && "Balanced: AI dynamically shifts between yield farming & havens."}
              {riskLevel === "high" && "Aggressive: AI maximizes APY via high-volume volatility."}
            </p>
          </div>
        </div>

        {/* Prefer stablecoins toggle */}
        <div className="flex items-center justify-between mb-8 p-5 bg-black/40 rounded-2xl border border-white/5">
>>>>>>> f38165e (Commited)
          <div>
            <p className="text-sm font-black text-white uppercase tracking-tight">Safety Net</p>
            <p className="text-[10px] text-gray-500 font-bold mt-0.5">Auto-move to USDC during market risk</p>
          </div>
          <button
            onClick={() => setPreferStable(!preferStable)}
            className={`w-14 h-8 rounded-full smooth-transition flex items-center p-1.5 ${
              preferStable ? "bg-neon-purple shadow-[0_0_15px_rgba(191,0,255,0.4)]" : "bg-white/10"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow-lg smooth-transition transform ${
                preferStable ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Max rebalance slider */}
        <div className="mb-10">
          <div className="flex justify-between mb-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Autonomous Range</label>
            <span className="text-sm font-black text-neon-purple">{maxRebalance}%</span>
          </div>
          <input
            type="range" min={10} max={100} step={5}
            value={maxRebalance}
            onChange={(e) => setMaxRebalance(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-purple"
          />
        </div>

        <button
          onClick={handleSaveProfile}
          className="w-full py-5 bg-neon-purple hover:bg-neon-purple/90 text-white font-black uppercase tracking-widest rounded-2xl smooth-transition shadow-[0_0_30px_rgba(191,0,255,0.3)] hover:shadow-[0_0_40px_rgba(191,0,255,0.5)]"
        >
          Initialize Strategy
        </button>
      </div>
    );
  }

  // ── Connected + profile saved: compact header badge ───────────────────────
  return (
<<<<<<< HEAD
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
=======
    <div className="flex items-center gap-5 pl-5 pr-3 py-2.5 bg-black rounded-2xl smooth-transition neon-border-purple hover-glow-purple group">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-2.5 h-2.5 rounded-full bg-neon-purple shadow-[0_0_8px_var(--neon-purple)]" />
          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-neon-purple animate-ping opacity-75" />
        </div>
        <span className="text-xs text-white font-black font-mono tracking-wider">
          <span className="text-neon-purple">ID:</span> {formatAddress(activeAddress)}
        </span>
      </div>
      <div className="w-px h-5 bg-white/10 mx-1" />
      <button 
        onClick={handleDisconnect}
        className="p-2 text-gray-500 hover:text-neon-orange hover:bg-neon-orange/10 rounded-xl smooth-transition"
        title="Disconnect Wallet"
      >
        <LogOut className="w-5 h-5" />
>>>>>>> f38165e (Commited)
      </button>
    </div>
  );
}
