// src/components/PTBExecutor.tsx
"use client";

import { useState } from "react";
import { Pool, UserProfile, PTBTransaction, PTBResult, PTBStep } from "@/lib/types";
import { buildPTB, simulateExecution, stepLabel } from "@/lib/ptbBuilder";

interface PTBExecutorProps {
  pools: Pool[];
  profile: UserProfile;
}

// Status icon per step state
function StepIcon({ status }: { status: PTBStep["status"] }) {
  if (status === "success")  return <span className="text-green-500 text-base">✓</span>;
  if (status === "failed")   return <span className="text-red-500 text-base">✗</span>;
  if (status === "reverted") return <span className="text-orange-400 text-base">↩</span>;
  return (
    <span className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-purple-500 animate-spin inline-block" />
  );
}

// Step type badge color
function stepBadgeClass(type: PTBStep["type"]) {
  if (type === "withdraw") return "bg-red-50 text-red-700 border-red-100";
  if (type === "swap")     return "bg-amber-50 text-amber-700 border-amber-100";
  return                          "bg-green-50 text-green-700 border-green-100";
}

export default function PTBExecutor({ pools, profile }: PTBExecutorProps) {
  const [fromPoolId, setFromPoolId] = useState(pools[0]?.id ?? "");
  const [toPoolId,   setToPoolId]   = useState(pools[2]?.id ?? "");
  const [amount,     setAmount]     = useState(1000);

  const [tx,       setTx]       = useState<PTBTransaction | null>(null);
  const [result,   setResult]   = useState<PTBResult | null>(null);
  const [phase,    setPhase]    = useState<"idle"|"built"|"executing"|"done">("idle");
  const [liveSteps, setLiveSteps] = useState<PTBStep[]>([]);

  const fromPool = pools.find((p) => p.id === fromPoolId)!;
  const toPool   = pools.find((p) => p.id === toPoolId)!;

  // ── Step A: Build the PTB ──────────────────────────────────────────────────
  function handleBuild() {
    if (!fromPool || !toPool || fromPool.id === toPool.id) return;
    const built = buildPTB(fromPool, toPool, amount, profile);
    setTx(built);
    setResult(null);
    setLiveSteps(built.steps);
    setPhase("built");
  }

  // ── Step B: Execute the PTB with live step updates ─────────────────────────
  async function handleExecute() {
    if (!tx) return;
    setPhase("executing");
    setResult(null);

    // Animate each step individually so the UI updates live
    const steps = [...tx.steps];
    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 950));

      // 5% chance swap fails
      const fail = steps[i].type === "swap" && Math.random() < 0.05;
      if (fail) {
        const reverted = steps.map((s, j) =>
          j >= i ? { ...s, status: "reverted" as const } : s
        );
        setLiveSteps(reverted);
        setResult({
          success: false,
          error: "Swap failed — insufficient liquidity. All steps reverted atomically.",
          steps: reverted,
        });
        setPhase("done");
        return;
      }

      const updated = steps.map((s, j) =>
        j === i ? { ...s, status: "success" as const } : s
      );
      steps[i] = { ...steps[i], status: "success" as const };
      setLiveSteps([...updated]);
    }

    // All steps succeeded
    const txHash =
      "0x" +
      Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");

    setResult({ success: true, txHash, gasUsed: tx.estimatedTotalGas, steps });
    setPhase("done");
  }

  function handleReset() {
    setTx(null);
    setResult(null);
    setLiveSteps([]);
    setPhase("idle");
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50">
        <h3 className="font-semibold text-gray-800 text-sm">PTB atomic rebalancer</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Withdraw → swap → deposit executed in one atomic block
        </p>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Pool selector */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              From pool
            </label>
            <select
              value={fromPoolId}
              onChange={(e) => setFromPoolId(e.target.value)}
              disabled={phase !== "idle"}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-50"
            >
              {pools.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              To pool
            </label>
            <select
              value={toPoolId}
              onChange={(e) => setToPoolId(e.target.value)}
              disabled={phase !== "idle"}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-50"
            >
              {pools.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount slider */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-medium text-gray-500">Amount to move</label>
            <span className="text-sm font-semibold text-purple-600">
              ${amount.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={100}
            max={10000}
            step={100}
            value={amount}
            disabled={phase !== "idle"}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full accent-purple-600 disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-300 mt-0.5">
            <span>$100</span>
            <span>
              Actual move: ${(amount * profile.maxRebalancePercent / 100).toFixed(0)}
              {" "}({profile.maxRebalancePercent}% of ${amount.toLocaleString()})
            </span>
            <span>$10,000</span>
          </div>
        </div>

        {/* Transaction preview — shown after build */}
        {tx && liveSteps.length > 0 && (
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <span className="text-xs font-medium text-gray-500">
                Transaction steps
              </span>
              <span className="text-xs text-gray-400">
                Est. gas: ${tx.estimatedTotalGas}
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {liveSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  {/* Step number */}
                  <span className="w-5 h-5 rounded-full bg-gray-100 text-xs text-gray-500 flex items-center justify-center font-medium flex-shrink-0">
                    {i + 1}
                  </span>
                  {/* Step type badge */}
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize flex-shrink-0 ${stepBadgeClass(step.type)}`}>
                    {step.type}
                  </span>
                  {/* Step description */}
                  <span className="text-sm text-gray-600 flex-1">
                    {stepLabel(step, pools)}
                  </span>
                  {/* Status icon */}
                  <div className="flex-shrink-0">
                    {phase === "executing" || phase === "done"
                      ? <StepIcon status={step.status} />
                      : <span className="text-gray-300 text-sm">—</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result banner */}
        {result && (
          <div className={`rounded-xl p-4 ${
            result.success
              ? "bg-green-50 border border-green-100"
              : "bg-red-50 border border-red-100"
          }`}>
            {result.success ? (
              <div>
                <p className="text-sm font-semibold text-green-700 mb-1">
                  ✓ Rebalance complete
                </p>
                <p className="text-xs text-green-600 font-mono break-all">
                  {result.txHash}
                </p>
                <p className="text-xs text-green-500 mt-1">
                  Gas used: ${result.gasUsed} · Executed atomically in one block
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-red-700 mb-1">
                  ↩ Transaction reverted
                </p>
                <p className="text-xs text-red-500">{result.error}</p>
                <p className="text-xs text-red-400 mt-1">
                  No funds were moved. Atomic guarantee held.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {phase === "idle" && (
            <button
              onClick={handleBuild}
              disabled={!fromPool || !toPool || fromPool?.id === toPool?.id}
              className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Build PTB
            </button>
          )}
          {phase === "built" && (
            <>
              <button
                onClick={handleExecute}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Execute atomically
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2.5 border border-gray-200 text-gray-500 text-sm rounded-xl hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            </>
          )}
          {phase === "executing" && (
            <button disabled className="flex-1 py-2.5 bg-purple-300 text-white text-sm font-medium rounded-xl">
              Executing on-chain...
            </button>
          )}
          {phase === "done" && (
            <button
              onClick={handleReset}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              New transaction
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
