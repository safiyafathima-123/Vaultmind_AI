// src/lib/aiEngine.ts
import { Pool, PoolScore, AgentOpinion, FinalDecision, UserProfile } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// CORE SCORING FORMULA
// Score = (APY × 0.4) + (Confidence × 0.3) - (Volatility × 0.3)
// Higher score = better risk-adjusted opportunity
// ─────────────────────────────────────────────────────────────────────────────
export function scorePool(pool: Pool, profile: UserProfile): number {
  // Base formula weights
  let apyWeight = 0.4;
  let confidenceWeight = 0.3;
  let volatilityWeight = 0.3;

  // Adjust weights based on user's risk preference
  if (profile.riskLevel === "low") {
    // Safety-first: penalise volatility harder, care less about APY
    apyWeight = 0.2;
    confidenceWeight = 0.4;
    volatilityWeight = 0.4;
  } else if (profile.riskLevel === "high") {
    // Yield-first: chase APY, tolerate volatility
    apyWeight = 0.6;
    confidenceWeight = 0.2;
    volatilityWeight = 0.2;
  }

  // Normalise APY to 0–1 range (assume max meaningful APY = 50%)
  const normalisedAPY = Math.min(pool.apy / 50, 1);

  const score =
    normalisedAPY * apyWeight +
    pool.confidence * confidenceWeight -
    pool.volatility * volatilityWeight;

  // Return clamped to 0–1
  return Math.max(0, Math.min(1, score));
}

// Score all pools and sort best-first
export function rankPools(pools: Pool[], profile: UserProfile): PoolScore[] {
  return pools
    .map((pool) => {
      const score = scorePool(pool, profile);
      let recommendation = "hold";
      if (score > 0.65) recommendation = "move here";
      else if (score < 0.3) recommendation = "avoid";
      return { pool, score, recommendation };
    })
    .sort((a, b) => b.score - a.score); // best score first
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT 1 — YIELD HUNTER
// Goal: maximum APY at all costs
// ─────────────────────────────────────────────────────────────────────────────
export function yieldHunterAgent(pools: Pool[]): AgentOpinion {
  // Simply pick the highest APY pool
  const best = [...pools].sort((a, b) => b.apy - a.apy)[0];

  return {
    agentName: "Yield Hunter",
    recommendation: `Move to ${best.name}`,
    reasoning: `${best.name} offers the highest APY at ${best.apy.toFixed(1)}%. Maximum yield opportunity detected.`,
    targetPool: best.id,
    confidence: Math.round(best.confidence * 100),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT 2 — RISK GUARDIAN
// Goal: lowest volatility, protect capital
// ─────────────────────────────────────────────────────────────────────────────
export function riskGuardianAgent(pools: Pool[]): AgentOpinion {
  // Pick the pool with lowest volatility
  const safest = [...pools].sort((a, b) => a.volatility - b.volatility)[0];

  // Check if market-wide volatility is high (average > 0.6)
  const avgVolatility = pools.reduce((s, p) => s + p.volatility, 0) / pools.length;
  const marketRisky = avgVolatility > 0.6;

  return {
    agentName: "Risk Guardian",
    recommendation: marketRisky
      ? `Move to ${safest.name} — market risk elevated`
      : `Stay in ${safest.name}`,
    reasoning: marketRisky
      ? `Average market volatility is ${(avgVolatility * 100).toFixed(0)}%. Capital protection is the priority. ${safest.name} has the lowest risk at ${(safest.volatility * 100).toFixed(0)}%.`
      : `Market conditions are stable. ${safest.name} provides solid safety with ${safest.apy.toFixed(1)}% APY.`,
    targetPool: safest.id,
    confidence: Math.round((1 - safest.volatility) * 100),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT 3 — STABILITY AI
// Goal: stablecoins during uncertainty, best stable-adjacent pool otherwise
// ─────────────────────────────────────────────────────────────────────────────
export function stabilityAgent(pools: Pool[]): AgentOpinion {
  // Prefer USDC/USDO pools
  const stablePools = pools.filter(
    (p) => p.token === "USDC" || p.token === "USDO"
  );
  const target = stablePools.length > 0
    ? stablePools.sort((a, b) => b.apy - a.apy)[0]  // best APY among stables
    : pools.sort((a, b) => a.volatility - b.volatility)[0]; // fallback: safest

  const highVolatilityDetected = pools.some((p) => p.volatility > 0.75);

  return {
    agentName: "Stability AI",
    recommendation: `Park in ${target.name}`,
    reasoning: highVolatilityDetected
      ? `High volatility detected in ${pools.filter((p) => p.volatility > 0.75).length} pools. ${target.name} provides stable yield at ${target.apy.toFixed(1)}% with minimal risk.`
      : `${target.name} offers steady ${target.apy.toFixed(1)}% yield with predictable performance.`,
    targetPool: target.id,
    confidence: Math.round(target.confidence * 100),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DEBATE ENGINE — runs all 3 agents, picks the winner
// ─────────────────────────────────────────────────────────────────────────────
export function runDebateEngine(
  pools: Pool[],
  profile: UserProfile
): FinalDecision {
  // Step 1: Each agent gives their opinion
  const opinions: AgentOpinion[] = [
    yieldHunterAgent(pools),
    riskGuardianAgent(pools),
    stabilityAgent(pools),
  ];

  // Step 2: Score all pools with this user's profile
  const ranked = rankPools(pools, profile);
  const bestPool = ranked[0];

  // Step 3: Check if circuit breaker should fire
  // If best pool still has very high volatility, override to stable
  const circuitBreakerTriggered =
    bestPool.pool.volatility > 0.8 && profile.preferStablecoins;

  // Step 4: Determine final action
  let action: FinalDecision["action"] = "hold";
  let targetPool = bestPool.pool.id;
  let explanation = "";
  let estimatedGain = 0;

  if (circuitBreakerTriggered) {
    // Override: move everything to stablecoin
    const stable = pools.find((p) => p.token === "USDC" || p.token === "USDO");
    action = "move-to-stable";
    targetPool = stable?.id ?? bestPool.pool.id;
    explanation = `Volatility circuit breaker triggered. Market risk exceeds your threshold. Funds moved to ${stable?.name ?? "stable pool"} for protection until conditions stabilise.`;
    estimatedGain = 0; // safety move, not profit move
  } else if (bestPool.score > 0.55) {
    action = "rebalance";
    explanation = `Your funds were moved to ${bestPool.pool.name} because it offers the best risk-adjusted score of ${(bestPool.score * 100).toFixed(0)}/100. APY: ${bestPool.pool.apy.toFixed(1)}% with ${(bestPool.pool.volatility * 100).toFixed(0)}% predicted volatility.`;
    // Estimate gain vs holding current (assume current APY is average)
    const avgAPY = pools.reduce((s, p) => s + p.apy, 0) / pools.length;
    estimatedGain = parseFloat((bestPool.pool.apy - avgAPY).toFixed(2));
  } else {
    action = "hold";
    explanation = `Current position is optimal. No rebalance needed. The best available alternative scored ${(bestPool.score * 100).toFixed(0)}/100 — not significantly better than your current pool.`;
    estimatedGain = 0;
  }

  return {
    action,
    targetPool,
    explanation,
    estimatedGain,
    agentOpinions: opinions,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CIRCUIT BREAKER CHECKER
// Returns true if market is too dangerous to stay in volatile pools
// ─────────────────────────────────────────────────────────────────────────────
export function isCircuitBreakerActive(pools: Pool[]): boolean {
  const highRiskCount = pools.filter((p) => p.volatility > 0.75).length;
  return highRiskCount >= 2; // 2 or more pools in danger zone
}
