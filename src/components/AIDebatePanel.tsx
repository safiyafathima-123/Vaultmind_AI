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
  "Yield Hunter":  { icon: "⚡", bg: "bg-amber-50",  border: "border-amber-200",  badge: "bg-amber-100 text-amber-800"  },
  "Risk Guardian": { icon: "🛡",  bg: "bg-blue-50",   border: "border-blue-200",   badge: "bg-blue-100 text-blue-800"    },
  "Stability AI":  { icon: "⚖️",  bg: "bg-green-50",  border: "border-green-200",  badge: "bg-green-100 text-green-800"  },
};

const ACTION_META = {
  "rebalance":      { label: "Rebalancing",       color: "text-purple-700", bg: "bg-purple-50",  border: "border-purple-200" },
  "hold":           { label: "Holding position",  color: "text-gray-700",   bg: "bg-gray-50",    border: "border-gray-200"   },
  "move-to-stable": { label: "Moving to stable",  color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200"   },
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">AI debate engine</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            3 agents evaluate the market from different perspectives
          </p>
        </div>
        <button
          onClick={runDebate}
          disabled={isRunning || pools.length === 0}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {isRunning ? "Debating..." : "Run debate"}
        </button>
      </div>

      {/* Idle state */}
      {!decision && !isRunning && (
        <div className="px-5 py-10 text-center text-gray-400 text-sm">
          Press <span className="text-purple-500 font-medium">Run debate</span> to
          let the AI agents analyse the market
        </div>
      )}

      {/* Agents thinking animation */}
      {isRunning && (
        <div className="px-5 py-6 space-y-3">
          {["Yield Hunter", "Risk Guardian", "Stability AI"].map((name, i) => {
            const meta = AGENT_META[name as keyof typeof AGENT_META];
            return (
              <div
                key={name}
                className={`flex items-center gap-3 p-3 rounded-xl border ${meta.bg} ${meta.border}`}
                style={{ opacity: step >= 1 ? 1 : 0, transition: `opacity 0.3s ${i * 0.15}s` }}
              >
                <span className="text-lg">{meta.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{name}</p>
                  <div className="mt-1 h-1.5 bg-white rounded-full overflow-hidden w-40">
                    <div
                      className="h-full bg-current rounded-full animate-pulse"
                      style={{ width: "60%" }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-400">Analysing...</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Results */}
      {decision && !isRunning && (
        <div className="divide-y divide-gray-50">
          {/* Agent opinions */}
          <div className="px-5 py-4 space-y-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Agent opinions
            </p>
            {decision.agentOpinions.map((agent) => {
              const meta = AGENT_META[agent.agentName as keyof typeof AGENT_META];
              return (
                <div
                  key={agent.agentName}
                  className={`p-4 rounded-xl border ${meta.bg} ${meta.border}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{meta.icon}</span>
                      <span className="font-semibold text-gray-800 text-sm">
                        {agent.agentName}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.badge}`}>
                      {agent.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mt-2">
                    → {agent.recommendation}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {agent.reasoning}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Final decision */}
          {actionMeta && (
            <div className={`px-5 py-4 ${actionMeta.bg}`}>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Final decision
              </p>
              <div className={`p-4 rounded-xl border ${actionMeta.border} bg-white`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-bold ${actionMeta.color}`}>
                    {actionMeta.label}
                  </span>
                  {decision.estimatedGain > 0 && (
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      +{decision.estimatedGain.toFixed(2)}% APY gain
                    </span>
                  )}
                </div>
                {/* OneBox plain-English explanation */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {decision.explanation}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
