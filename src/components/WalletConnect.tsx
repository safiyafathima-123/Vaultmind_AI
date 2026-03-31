"use client";

import { useState, useEffect } from "react";
import { UserProfile, RiskLevel, loadSavedProfile } from "@/lib/types";
import { LogOut, Wallet, Shield, Zap, TrendingUp, X, Sparkles } from "lucide-react";

interface WalletConnectProps {
  onProfileReady: (profile: UserProfile | null) => void;
}

export default function WalletConnect({ onProfileReady }: WalletConnectProps) {
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const [riskLevel, setRiskLevel] = useState<RiskLevel>("medium");
  const [preferStable, setPreferStable] = useState(true);
  const [maxRebalance, setMaxRebalance] = useState(80);

  useEffect(() => {
    const saved = loadSavedProfile();
    if (saved?.address) {
      setActiveAddress(saved.address);
      setRiskLevel(saved.riskLevel);
      setPreferStable(saved.preferStablecoins);
      setMaxRebalance(saved.maxRebalancePercent);
      onProfileReady(saved);
    } else {
      onProfileReady(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleConnectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inputValue.trim()) {
      setActiveAddress(inputValue.trim());
      setShowInputModal(false);
      
      const saved = loadSavedProfile();
      if (saved && saved.address === inputValue.trim()) {
        onProfileReady(saved);
      } else {
        setShowProfileSetup(true);
      }
    }
  }

  function handleDisconnect() {
    setActiveAddress(null);
    setShowProfileSetup(false);
    onProfileReady(null);
    localStorage.removeItem("oneVantageProfile");
  }

  function handleSaveProfile() {
    if (!activeAddress) return;

    const profile: UserProfile = {
      address: activeAddress,
      riskLevel,
      preferStablecoins: preferStable,
      maxRebalancePercent: maxRebalance,
    };

    localStorage.setItem("oneVantageProfile", JSON.stringify(profile));
    onProfileReady(profile);
    setShowProfileSetup(false);
  }

  const formatAddress = (addr: string | null) => 
    addr && addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr || "";

  if (!activeAddress && !showInputModal) {
    return (
      <div className="flex flex-col items-center">
        <button 
          onClick={() => setShowInputModal(true)}
          className="group relative flex items-center gap-4 pl-4 pr-8 py-3 bg-black rounded-2xl smooth-transition neon-border-purple hover-glow-purple overflow-hidden text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative w-10 h-10 rounded-xl bg-neon-purple/10 flex items-center justify-center border border-neon-purple/30 group-hover:border-neon-purple smooth-transition">
            <Wallet className="w-5 h-5 text-neon-purple animate-pulse" />
          </div>
          <div className="relative flex flex-col items-start text-left">
            <span className="text-sm font-black uppercase tracking-tighter text-white">Initialize Session</span>
            <span className="text-[10px] font-bold text-neon-purple/60 group-hover:text-neon-purple smooth-transition">Enter your NEAR testnet account ID</span>
          </div>
        </button>
      </div>
    );
  }

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
            <h3 className="text-lg font-black text-white italic tracking-tighter uppercase">Link Account</h3>
            <p className="text-[10px] text-neon-purple font-bold tracking-widest uppercase mt-0.5">Manual Identity Verification</p>
          </div>
        </div>
        <form onSubmit={handleConnectSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">NEAR Account ID</label>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="yourname.testnet"
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-neon-purple focus:shadow-[0_0_20px_rgba(191,0,255,0.2)] smooth-transition font-mono placeholder:text-gray-700"
              autoFocus
              required
            />
            <p className="text-[10px] text-gray-600 mt-2 font-bold">e.g. <span className="text-neon-purple/60">safiya2.testnet</span> — your NEAR testnet wallet ID</p>
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-neon-purple hover:bg-neon-purple/90 text-white font-black uppercase tracking-widest rounded-2xl smooth-transition shadow-[0_0_20px_rgba(191,0,255,0.3)] hover:shadow-[0_0_30px_rgba(191,0,255,0.5)] flex items-center justify-center gap-2"
          >
            Authenticate <Zap className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="p-12 glass-dark rounded-[3rem] smooth-transition max-w-5xl mx-auto neon-border-purple relative z-50 shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/5 blur-[80px] -mr-32 -mt-32 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-neon-purple shadow-[0_0_15px_rgba(191,0,255,0.8)] animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-black tracking-[0.2em] uppercase">Security Context</span>
              <span className="text-xs text-neon-purple font-black font-mono tracking-widest uppercase mt-1">
                {formatAddress(activeAddress)}
              </span>
            </div>
          </div>
          <button onClick={handleDisconnect} className="text-gray-500 hover:text-neon-orange hover:bg-neon-orange/10 p-3 rounded-2xl smooth-transition group border border-transparent hover:border-neon-orange/20">
            <LogOut className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
        
        <div className="mb-12 relative z-10">
          <h2 className="text-5xl font-black text-white italic tracking-tighter mb-4 uppercase">Neural Strategy <span className="neon-text-purple">Uplink.</span></h2>
          <p className="text-base text-gray-400 max-w-2xl leading-relaxed font-medium">
            Configure your autonomous execution parameters for the <span className="text-white">VAULT MIND</span> ecosystem. 
            Our AI engine will dynamically optimize your positions based on the selected risk profile below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-2">
               <Shield className="w-4 h-4 text-neon-purple" />
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Target Risk Profile</label>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {(["low", "medium", "high"] as RiskLevel[]).map((level) => (level === riskLevel ? (
                <button
                  key={level}
                  onClick={() => setRiskLevel(level)}
                  className="flex-1 py-8 px-4 rounded-[2rem] text-[10px] font-black border smooth-transition capitalize flex flex-col items-center gap-4 bg-neon-purple text-white border-neon-purple shadow-[0_0_30px_rgba(191,0,255,0.4)] ring-4 ring-neon-purple/10"
                >
                  {level === "low" && <Shield className="w-6 h-6" />}
                  {level === "medium" && <Zap className="w-6 h-6" />}
                  {level === "high" && <TrendingUp className="w-6 h-6" />}
                  {level}
                </button>
              ) : (
                <button
                  key={level}
                  onClick={() => setRiskLevel(level)}
                  className="flex-1 py-8 px-4 rounded-[2rem] text-[10px] font-black border smooth-transition capitalize flex flex-col items-center gap-4 bg-black/40 text-gray-600 border-white/5 hover:border-neon-purple/30 hover:text-gray-300"
                >
                  {level === "low" && <Shield className="w-6 h-6" />}
                  {level === "medium" && <Zap className="w-6 h-6" />}
                  {level === "high" && <TrendingUp className="w-6 h-6" />}
                  {level}
                </button>
              )))}
            </div>
            <div className="p-8 bg-neon-purple/5 rounded-[2rem] border border-neon-purple/10 min-h-[100px] flex items-center justify-center text-center">
               <p className="text-sm text-neon-purple/90 leading-relaxed font-bold italic">
                {riskLevel === "low" && "Conservative Mode: AI prioritizes stable pools with rapid volatility exits."}
                {riskLevel === "medium" && "Balanced Mode: AI dynamically shifts between yield farming & safety havens."}
                {riskLevel === "high" && "Aggressive Mode: AI maximizes APY capture via high-volume relative pivots."}
              </p>
            </div>
          </div>

          <div className="space-y-12">
            <div>
              <div className="flex items-center gap-3 mb-8">
                 <Zap className="w-4 h-4 text-neon-orange" />
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Execution Constraints</label>
              </div>
              
              <div className={`p-8 rounded-[2rem] border smooth-transition flex items-center justify-between mb-8
                ${preferStable ? 'bg-neon-purple/5 border-neon-purple/30 shadow-[0_0_30px_rgba(191,0,255,0.05)]' : 'bg-black/40 border-white/5 opacity-60'}
              `}>
                <div className="flex items-center gap-5">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center border smooth-transition
                     ${preferStable ? 'bg-neon-purple/20 border-neon-purple/40 text-neon-purple' : 'bg-white/5 border-white/10 text-gray-600'}
                   `}>
                      <Shield className="w-6 h-6" />
                   </div>
                   <div>
                    <p className={`text-sm font-black uppercase tracking-tight smooth-transition ${preferStable ? 'text-white' : 'text-gray-600'}`}>Safety Net</p>
                    <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-tighter">Auto-move to USDC during market risk</p>
                  </div>
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

              <div className="p-8 rounded-[2rem] bg-black/40 border border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Autonomous Range</label>
                    <p className="text-[9px] text-gray-600 font-bold uppercase mt-1">Maximum Rebalance Allocation</p>
                  </div>
                  <span className="text-3xl font-black text-white italic tracking-tighter">
                    {maxRebalance}<span className="text-neon-purple">%</span>
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={maxRebalance}
                  onChange={(e) => setMaxRebalance(Number(e.target.value))}
                  className="w-full h-2 bg-white/40 rounded-lg appearance-none cursor-pointer accent-neon-purple hover:accent-white smooth-transition border border-white/20 shadow-inner"
                />
                <div className="flex justify-between mt-4 text-[9px] font-black text-gray-700 uppercase">
                  <span>Pervasive</span>
                  <span>Full Control</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
           <div className="flex items-center gap-4 text-gray-600">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Ready for Neural Synchronization</p>
           </div>
           
           <button
             onClick={handleSaveProfile}
             className="px-12 py-5 bg-neon-purple hover:bg-neon-purple/90 text-white font-black uppercase tracking-[0.2em] rounded-2xl smooth-transition shadow-[0_0_40px_rgba(191,0,255,0.4)] hover:shadow-[0_0_60px_rgba(191,0,255,0.6)] hover:scale-105 active:scale-95 flex items-center gap-3"
           >
             Initialize Strategy <Zap className="w-5 h-5" />
           </button>
        </div>
      </div>
    );
  }

  return (
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
      </button>
    </div>
  );
}
