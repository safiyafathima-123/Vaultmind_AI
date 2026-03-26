// backend/ptbBuilder.js

const GAS_ESTIMATES = { withdraw: 0.004, swap: 0.008, deposit: 0.004 };

// Build a PTB transaction object
function buildPTB(fromPool, toPool, amount, profile) {
  const moveAmount = amount * (profile.maxRebalancePercent / 100);
  const needsSwap  = fromPool.token !== toPool.token;

  const steps = [
    {
      type: "withdraw",
      fromPool: fromPool.id,
      amount: moveAmount,
      estimatedGas: GAS_ESTIMATES.withdraw,
      status: "pending",
    },
    ...(needsSwap
      ? [{
          type: "swap",
          token: fromPool.token,
          toPool: toPool.id,
          amount: moveAmount,
          estimatedGas: GAS_ESTIMATES.swap,
          status: "pending",
        }]
      : []),
    {
      type: "deposit",
      toPool: toPool.id,
      amount: moveAmount,
      estimatedGas: GAS_ESTIMATES.deposit,
      status: "pending",
    },
  ];

  return {
    id: `ptb-${Date.now()}`,
    steps,
    totalAmount: moveAmount,
    estimatedTotalGas: parseFloat(
      steps.reduce((s, step) => s + step.estimatedGas, 0).toFixed(4)
    ),
    status: "ready",
    createdAt: new Date().toISOString(),
  };
}

// Simulate execution server-side
async function simulateExecution(tx) {
  const updatedSteps = [...tx.steps];

  for (let i = 0; i < updatedSteps.length; i++) {
    await new Promise((r) => setTimeout(r, 300));
    const shouldFail = updatedSteps[i].type === "swap" && Math.random() < 0.05;

    if (shouldFail) {
      for (let j = i; j < updatedSteps.length; j++) {
        updatedSteps[j] = { ...updatedSteps[j], status: "reverted" };
      }
      return {
        success: false,
        error: "Swap failed — all steps reverted atomically.",
        steps: updatedSteps,
      };
    }
    updatedSteps[i] = { ...updatedSteps[i], status: "success" };
  }

  const txHash =
    "0x" +
    Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

  return { success: true, txHash, gasUsed: tx.estimatedTotalGas, steps: updatedSteps };
}

module.exports = { buildPTB, simulateExecution };
