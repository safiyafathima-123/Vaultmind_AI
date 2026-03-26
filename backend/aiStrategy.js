// backend/aiStrategy.js
// Mirror of the frontend AI engine — runs server-side for API calls

function scorePool(pool, riskLevel) {
  let apyWeight = 0.4;
  let confidenceWeight = 0.3;
  let volatilityWeight = 0.3;

  if (riskLevel === "low") {
    apyWeight = 0.2; confidenceWeight = 0.4; volatilityWeight = 0.4;
  } else if (riskLevel === "high") {
    apyWeight = 0.6; confidenceWeight = 0.2; volatilityWeight = 0.2;
  }

  const normalisedAPY = Math.min(pool.apy / 50, 1);
  const score =
    normalisedAPY * apyWeight +
    pool.confidence * confidenceWeight -
    pool.volatility * volatilityWeight;

  return Math.max(0, Math.min(1, score));
}

function rankPools(pools, profile) {
  return pools
    .map((pool) => {
      const score = scorePool(pool, profile.riskLevel);
      let recommendation = "hold";
      if (score > 0.65) recommendation = "move here";
      else if (score < 0.3) recommendation = "avoid";
      return { pool, score, recommendation };
    })
    .sort((a, b) => b.score - a.score);
}

function yieldHunterAgent(pools) {
  const best = [...pools].sort((a, b) => b.apy - a.apy)[0];
  return {
    agentName: "Yield Hunter",
    recommendation: `Move to ${best.name}`,
    reasoning: `${best.name} offers the highest APY at ${best.apy.toFixed(1)}%. Maximum yield opportunity detected.`,
    targetPool: best.id,
    confidence: Math.round(best.confidence * 100),
  };
}

function riskGuardianAgent(pools) {
  const safest = [...pools].sort((a, b) => a.volatility - b.volatility)[0];
  const avgVolatility = pools.reduce((s, p) => s + p.volatility, 0) / pools.length;
  const marketRisky = avgVolatility > 0.6;
  return {
    agentName: "Risk Guardian",
    recommendation: marketRisky
      ? `Move to ${safest.name} — market risk elevated`
      : `Stay in ${safest.name}`,
    reasoning: marketRisky
      ? `Average market volatility is ${(avgVolatility * 100).toFixed(0)}%. Capital protection priority. ${safest.name} has lowest risk.`
      : `Market is stable. ${safest.name} is safe with ${safest.apy.toFixed(1)}% APY.`,
    targetPool: safest.id,
    confidence: Math.round((1 - safest.volatility) * 100),
  };
}

function stabilityAgent(pools) {
  const stablePools = pools.filter((p) => p.token === "USDC" || p.token === "USDO");
  const target = stablePools.length > 0
    ? stablePools.sort((a, b) => b.apy - a.apy)[0]
    : pools.sort((a, b) => a.volatility - b.volatility)[0];
  const highVol = pools.some((p) => p.volatility > 0.75);
  return {
    agentName: "Stability AI",
    recommendation: `Park in ${target.name}`,
    reasoning: highVol
      ? `High volatility detected. ${target.name} provides stable ${target.apy.toFixed(1)}% yield.`
      : `${target.name} offers steady ${target.apy.toFixed(1)}% with predictable performance.`,
    targetPool: target.id,
    confidence: Math.round(target.confidence * 100),
  };
}

function runDebateEngine(pools, profile) {
  const opinions = [
    yieldHunterAgent(pools),
    riskGuardianAgent(pools),
    stabilityAgent(pools),
  ];
  const ranked = rankPools(pools, profile);
  const bestPool = ranked[0];
  const circuitBreakerTriggered =
    bestPool.pool.volatility > 0.8 && profile.preferStablecoins;

  let action = "hold";
  let targetPool = bestPool.pool.id;
  let explanation = "";
  let estimatedGain = 0;

  if (circuitBreakerTriggered) {
    const stable = pools.find((p) => p.token === "USDC" || p.token === "USDO");
    action = "move-to-stable";
    targetPool = stable?.id ?? bestPool.pool.id;
    explanation = `Volatility circuit breaker triggered. Funds moved to ${stable?.name ?? "stable pool"} for protection.`;
  } else if (bestPool.score > 0.55) {
    action = "rebalance";
    explanation = `Funds moved to ${bestPool.pool.name}. Score: ${(bestPool.score * 100).toFixed(0)}/100. APY: ${bestPool.pool.apy.toFixed(1)}% with ${(bestPool.pool.volatility * 100).toFixed(0)}% predicted volatility.`;
    const avgAPY = pools.reduce((s, p) => s + p.apy, 0) / pools.length;
    estimatedGain = parseFloat((bestPool.pool.apy - avgAPY).toFixed(2));
  } else {
    action = "hold";
    explanation = `Current position optimal. Best alternative scored ${(bestPool.score * 100).toFixed(0)}/100 — no rebalance needed.`;
  }

  return { action, targetPool, explanation, estimatedGain, agentOpinions: opinions, rankedPools: ranked };
}

module.exports = { runDebateEngine, rankPools, scorePool };
