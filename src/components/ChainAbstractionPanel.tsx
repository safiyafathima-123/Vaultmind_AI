"use client";

import { useState, useEffect } from "react";
import { Activity, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";

export default function ChainAbstractionPanel() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/crosschain")
      .then(res => res.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleTestTransfer = async () => {
    setSending(true);
    setTxHash("");
    setError("");

    try {
      const res = await fetch("/api/crosschain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Sending a tiny amount (0.0001 ETH) to a burn address to demonstrate cross-chain signatures
        body: JSON.stringify({ 
          to: "0x000000000000000000000000000000000000dEaD", 
          amount: "100000000000000" 
        })
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      setTxHash(d.txHash);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-dark rounded-3xl p-8 border border-neon-purple/20 animate-pulse">
        <p className="font-black text-neon-purple uppercase tracking-widest text-[10px]">Initializing Chain Signatures MPC...</p>
      </div>
    );
  }

  return (
    <div className="glass-dark rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-neon-orange/10 smooth-transition" />
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-neon-purple/10 border border-neon-purple/30 flex items-center justify-center">
          <Activity className="w-6 h-6 text-neon-purple" />
        </div>
        <div>
          <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">Chain Abstraction</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Powered by NEAR Signatures</p>
        </div>
      </div>

      {error && !data ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 mb-6">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-xs text-red-200 font-medium">{error}</p>
        </div>
      ) : (
        <div className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">Master NEAR Account</span>
                <p className="text-sm font-black italic text-white mt-1 truncate">{data?.nearAccountId || "account.testnet"}</p>
             </div>
             
             <div className="bg-black/40 rounded-2xl p-4 border border-white/5 hover-glow-orange smooth-transition">
                <span className="text-[9px] text-neon-orange font-black uppercase tracking-[0.2em]">Controlled Arbitrum Address</span>
                <p className="text-sm font-black italic text-white mt-1 truncate">{data?.address || "Deriving..."}</p>
             </div>
          </div>
          
          <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
               <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">Arbitrum Testnet Balance</span>
               <p className="text-2xl font-black italic text-white leading-none mt-2 truncate">
                 {data?.balance ? (Number(data.balance) / 1e18).toFixed(4) : "0.0000"} <span className="text-sm text-neon-purple">ETH</span>
               </p>
             </div>
             
             <button 
               onClick={handleTestTransfer}
               disabled={sending || !data?.address}
               className="px-6 py-3 rounded-xl bg-neon-purple text-black font-black italic uppercase tracking-widest text-[10px] hover:bg-neon-orange smooth-transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center shrink-0 shadow-[0_0_20px_rgba(191,0,255,0.4)]"
             >
               {sending ? "Signing via MPC..." : "Test Cross-Chain Transfer"}
               {!sending && <ArrowRight className="w-3 h-3" />}
             </button>
          </div>

          {error && txHash === "" && (
             <div className="text-xs text-red-400 font-bold uppercase tracking-widest bg-red-500/10 p-3 rounded-lg border border-red-500/20 mt-4">
               {error}
             </div>
          )}

          {txHash && (
             <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex flex-col gap-2 mt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-black text-green-400 uppercase tracking-widest">MPC Signature Verified & Sent</span>
                </div>
                <a href={`https://sepolia.arbiscan.io/tx/${txHash}`} target="_blank" rel="noreferrer" className="text-[10px] text-gray-400 hover:text-white underline truncate">
                  {txHash}
                </a>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
