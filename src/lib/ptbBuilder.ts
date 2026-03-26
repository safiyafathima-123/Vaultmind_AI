// src/lib/ptbBuilder.ts
import { Pool, UserProfile, PTBTransaction, PTBStep, PTBResult } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// PTB BUILDER
// Constructs a Programmable Transaction Block for atomic rebalancing
// Real OneChain execution: replace simulateExecution() with actual SDK calls
// ─────────────────────────────────────────────────────────────────────────────

// Gas estimates per step type (in USD)
const GAS_ESTIMATES = {
  withdraw: 0.004,
  swap:     0.008,
  deposit:  0.004,
};

// ── Build a PTB from current pool → target pool ──────────────────────────────
export function buildPTB(
  fromPool: Pool,
  toPool: Pool,
  amount: number,           // USD amount to move
  profile: UserProfile
): PTBTransaction {
  // Cap amount to user's max rebalance setting
  const moveAmount = amount * (profile.maxRebalancePercent / 100);

  // Step 1: Withdraw from current pool
  const withdrawStep: PTBStep = {
    type: "withdraw",
    fromPool: fromPool.id,
    amount: moveAmount,
    estimatedGas: GAS_ESTIMATES.withdraw,
    status: "pending",
  };

  // Step 2: Swap token if pools use different tokens
  const needsSwap = fromPool.token !== toPool.token;
  const swapStep: PTBStep | null = needsSwap
    ? {
        type: "swap",
        token: fromPool.token,         // swapping FROM this token
        toPool: toPool.id,             // swap destination token context
        amount: moveAmount,
        estimatedGas: GAS_ESTIMATES.swap,
        status: "pending",
      }
    : null;

  // Step 3: Deposit into target pool
  const depositStep: PTBStep = {
    type: "deposit",
    toPool: toPool.id,
    amount: moveAmount,
    estimatedGas: GAS_ESTIMATES.deposit,
    status: "pending",
  };

  // Assemble steps (skip swap if same token)
  const steps = [withdrawStep, ...(swapStep ? [swapStep] : []), depositStep];

  const totalGas = steps.reduce((sum, s) => sum + s.estimatedGas, 0);

  return {
    id: `ptb-${Date.now()}`,
    steps,
    totalAmount: moveAmount,
    estimatedTotalGas: parseFloat(totalGas.toFixed(4)),
    status: "ready",
    createdAt: new Date(),
  };
}

// ── Simulate execution (mock for demo) ───────────────────────────────────────
// In production replace each step with real OneChain SDK calls:
//   withdraw: await onedex.withdraw(fromPool.id, amount)
//   swap:     await onedex.swap(fromToken, toToken, amount)
//   deposit:  await onedex.deposit(toPool.id, amount)
export async function simulateExecution(
  tx: PTBTransaction
): Promise<PTBResult> {
  const updatedSteps = [...tx.steps];

  // Execute each step with a small delay to show progress
  for (let i = 0; i < updatedSteps.length; i++) {
    await new Promise((r) => setTimeout(r, 900));

    // Simulate a 5% chance of failure on swap step (for demo realism)
    const shouldFail =
      updatedSteps[i].type === "swap" && Math.random() < 0.05;

    if (shouldFail) {
      // Mark this step and all after it as reverted (atomic guarantee)
      for (let j = i; j < updatedSteps.length; j++) {
        updatedSteps[j] = { ...updatedSteps[j], status: "reverted" as const };
      }
      return {
        success: false,
        error: "Swap failed — insufficient liquidity. All steps reverted.",
        steps: updatedSteps,
      };
    }

    updatedSteps[i] = { ...updatedSteps[i], status: "success" as const };
  }

  // All steps passed — generate a mock tx hash
  const txHash =
    "0x" +
    Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

  return {
    success: true,
    txHash,
    gasUsed: tx.estimatedTotalGas,
    steps: updatedSteps,
  };
}

// ── Helper: get a human-readable step label ───────────────────────────────────
export function stepLabel(step: PTBStep, pools: Pool[]): string {
  const fromPool = pools.find((p) => p.id === step.fromPool);
  const toPool   = pools.find((p) => p.id === step.toPool);

  switch (step.type) {
    case "withdraw":
      return `Withdraw $${step.amount.toFixed(0)} from ${fromPool?.name ?? step.fromPool}`;
    case "swap":
      return `Swap ${fromPool?.token ?? "token"} → ${toPool?.token ?? "token"} on OneDEX`;
    case "deposit":
      return `Deposit $${step.amount.toFixed(0)} into ${toPool?.name ?? step.toPool}`;
    default:
      return "Unknown step";
  }
}
