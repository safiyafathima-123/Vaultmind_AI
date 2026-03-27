// src/components/AIDebatePanel.tsx
"use client";

import { useState } from "react";
import { FinalDecision, AgentOpinion, UserProfile, Pool } from "@/lib/types";
import { runDebateEngine } from "@/lib/aiEngine";

interface AIDebatePanelProps {
  pools: Pool[];
  profile: UserProfile;
}

// Emoji + color per agent
const AGENT_META = {
  "Yield Hunter":  { icon: "⚡", bg: "bg-neon-orange/10", border: "border-neon-orange/20", badge: "bg-neon-orange/20 text-neon-orange" },
  "Risk Guardian": { icon: "🛡",  bg: "bg-neon-purple/10", border: "border-neon-purple/20", badge: "bg-neon-purple/20 text-neon-purple" },
  "Stability AI":  { icon: "⚖️",  bg: "bg-neon-purple/20", border: "border-neon-purple/30", badge: "bg-neon-purple/30 text-neon-purple" },
};

const ACTION_META = {
  "rebalance":      { label: "REBALANCING",       color: "text-neon-purple", bg: "bg-neon-purple/5",  border: "border-neon-purple/20" },
  "hold":           { label: "HOLDING POSITION",  color: "text-neon-purple", bg: "bg-neon-purple/10", border: "border-neon-purple/30" },
  "move-to-stable": { label: "MOVING TO STABLE",  color: "text-neon-orange", bg: "bg-neon-orange/5",  border: "border-neon-orange/20" },
};

export default function AIDebatePanel({ pools, profile }: AIDebatePanelProps) {
  const [decision, setDecision] = useState<FinalDecision | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0); // 0=idle 1=agents 2=decision

  async function runDebate() {
    setIsRunning(true);
    setStep(1);
    setDecision(null);

    // Simulate agents "thinking" with a short delay for demo effect
    await new Promise((r) => setTimeout(r, 1400));
    setStep(2);
    await new Promise((r) => setTimeout(r, 600));

    const result = runDebateEngine(pools, profile);
    setDecision(result);
    setIsRunning(false);
  }

  const actionMeta = decision ? ACTION_META[decision.action as keyof typeof ACTION_META] : null;

  return (
    <div className="glass-dark rounded-3xl overflow-hidden smooth-transition border border-white/5 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
        <div>
          <h3 className="font-black text-white text-xs uppercase tracking-[0.2em] italic">Neural Debate Engine</h3>
          <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-tighter">
            Multilateral Market Validation
          </p>
        </div>
        <button
          onClick={runDebate}
          disabled={isRunning || pools.length === 0}
          className="px-6 py-2.5 bg-neon-purple hover:bg-neon-purple/90 disabled:bg-purple-900/50 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(191,0,255,0.2)]"
        >
          {isRunning ? "PROCESSING..." : "RUN DEBATE"}
        </button>
      </div>

      {/* Idle state */}
      {!decision && !isRunning && (
        <div className="px-8 py-16 text-center">
           <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Neural Link Standby</p>
           <p className="text-xs text-gray-400 mt-4 italic max-w-xs mx-auto">
             Initiate <span className="text-neon-purple font-black not-italic">Neural Analysis</span> to trigger real-time consensus logic across agent nodes.
           </p>
        </div>
      )}

      {/* Agents thinking animation */}
      {isRunning && (
        <div className="px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {["Yield Hunter", "Risk Guardian", "Stability AI"].map((name, i) => {
            const meta = AGENT_META[name as keyof typeof AGENT_META];
            return (
              <div
                key={name}
                className={`flex flex-col items-center text-center gap-4 p-8 rounded-2xl border ${meta.bg} ${meta.border} shadow-inner bg-black/40`}
                style={{ opacity: step >= 1 ? 1 : 0, transition: `opacity 0.3s ${i * 0.15}s` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 smooth-transition">
                   <span className="text-3xl">{meta.icon}</span>
                </div>
                <div className="flex-1 w-full text-center">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest mb-4">{name}</p>
                  <div className="h-1 bg-black rounded-full overflow-hidden w-full">
                    <div
                      className="h-full bg-neon-purple rounded-full animate-pulse shadow-[0_0_8px_var(--neon-purple)]"
                      style={{ width: "65%" }}
                    />
                  </div>
                </div>
                <span className="text-[10px] font-black text-gray-500 uppercase italic">Computing...</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Results */}
      {decision && !isRunning && (
        <div className="divide-y divide-white/5">
          {/* Agent opinions */}
          <div className="px-8 py-8">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-8">
              Neural Consensus
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {decision.agentOpinions.map((agent) => {
                const meta = AGENT_META[agent.agentName as keyof typeof AGENT_META];
                return (
                  <div
                    key={agent.agentName}
                    className={`p-8 rounded-2xl border ${meta.bg} ${meta.border} bg-black/20 group hover:border-white/20 smooth-transition flex flex-col`}
                  >
                    <div className="flex flex-col items-center text-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 smooth-transition">
                        <span className="text-2xl">{meta.icon}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="font-black text-white text-xs uppercase tracking-widest italic font-mono">
                          {agent.agentName}
                        </span>
                        <div className="flex justify-center">
                          <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${meta.badge}`}>
                            {agent.confidence}% Accuracy
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-px bg-white/5 mb-6" />
                    <p className="text-sm font-black text-white italic tracking-tight leading-relaxed mb-4">
                      → {agent.recommendation}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                      {agent.reasoning}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final decision */}
          {actionMeta && (
            <div className={`px-8 py-8 ${actionMeta.bg} bg-black/60`}>
              <div className={`p-8 rounded-3xl border ${actionMeta.border} bg-black/80 shadow-2xl relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 p-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-purple shadow-[0_0_10px_var(--neon-purple)] animate-pulse" />
                </div>
                
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6 underline decoration-neon-purple decoration-2 underline-offset-8">
                  Final Directive
                </p>
                
                <div className="flex items-center justify-between mb-6">
                  <span className={`text-2xl font-black italic tracking-tighter ${actionMeta.color}`}>
                    {actionMeta.label}
                  </span>
                  {decision.estimatedGain > 0 && (
                    <span className="text-[10px] font-black text-neon-orange bg-neon-orange/10 border border-neon-orange/20 px-3 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                      +{decision.estimatedGain.toFixed(2)}% Efficiency
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-300 font-medium leading-[1.6]">
                  {decision.explanation}
                </p>
                
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                   <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Decision Hash: NV-4x9</span>
                   <button className="text-[10px] font-black text-neon-purple uppercase tracking-widest hover:text-white smooth-transition">Execute Directive →</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
