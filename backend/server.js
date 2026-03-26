// backend/server.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── Mock pool data (mirrors frontend mock for consistency) ────────────────────
const MOCK_POOLS = [
  { id: "pool-eth-usdc",  name: "ETH / USDC",  apy: 14.2, volatility: 0.62, confidence: 0.78, tvl: 4200000, token: "ETH"  },
  { id: "pool-one-usdo",  name: "ONE / USDO",  apy: 22.7, volatility: 0.81, confidence: 0.65, tvl: 1800000, token: "ONE"  },
  { id: "pool-usdc-usdo", name: "USDC / USDO", apy: 6.1,  volatility: 0.08, confidence: 0.95, tvl: 9500000, token: "USDC" },
  { id: "pool-btc-usdc",  name: "BTC / USDC",  apy: 9.8,  volatility: 0.55, confidence: 0.72, tvl: 6100000, token: "BTC"  },
  { id: "pool-one-eth",   name: "ONE / ETH",   apy: 18.4, volatility: 0.74, confidence: 0.61, tvl: 2300000, token: "ONE"  },
];

// ── Mock volatility data per token ────────────────────────────────────────────
const MOCK_VOLATILITY = {
  ETH: 0.62, BTC: 0.55, ONE: 0.78, USDC: 0.06, USDO: 0.05,
};

// ── Route: GET /api/pools ─────────────────────────────────────────────────────
// Tries real OneDEX API first, falls back to mock
app.get("/api/pools", async (req, res) => {
  try {
    const onedexUrl = process.env.ONEDEX_API_URL;
    if (!onedexUrl) throw new Error("No OneDEX URL configured");

    const response = await axios.get(`${onedexUrl}/pools`, { timeout: 4000 });
    return res.json(response.data);
  } catch (err) {
    console.warn("OneDEX API unavailable — returning mock pools");
    return res.json(MOCK_POOLS);
  }
});

// ── Route: GET /api/volatility/:token ────────────────────────────────────────
// Tries real OnePredict API first, falls back to mock
app.get("/api/volatility/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const predictUrl = process.env.ONEPREDICT_API_URL;
    if (!predictUrl) throw new Error("No OnePredict URL configured");

    const response = await axios.get(`${predictUrl}/forecast/${token}`, {
      timeout: 4000,
    });
    return res.json({ volatility: response.data.volatility });
  } catch (err) {
    console.warn(`OnePredict unavailable for ${token} — returning mock`);
    const volatility = MOCK_VOLATILITY[token] ?? 0.5;
    return res.json({ volatility });
  }
});

// ── Route: GET /api/market-snapshot ──────────────────────────────────────────
// Returns all pools with fresh volatility injected — one call gets everything
app.get("/api/market-snapshot", async (req, res) => {
  try {
    // Fetch all pools (with fallback)
    let pools = [];
    try {
      const r = await axios.get(`http://localhost:${PORT}/api/pools`);
      pools = r.data;
    } catch {
      pools = MOCK_POOLS;
    }

    // Inject fresh volatility into each pool
    const enriched = await Promise.all(
      pools.map(async (pool) => {
        try {
          const r = await axios.get(
            `http://localhost:${PORT}/api/volatility/${pool.token}`
          );
          return { ...pool, volatility: r.data.volatility };
        } catch {
          return pool; // keep original if fetch fails
        }
      })
    );

    return res.json(enriched);
  } catch (err) {
    console.error("Market snapshot error:", err.message);
    return res.status(500).json({ error: "Failed to fetch market snapshot" });
  }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const { runDebateEngine, rankPools } = require("./aiStrategy");

// ── Route: POST /api/ai/strategy ─────────────────────────────────────────────
// Body: { pools: Pool[], profile: UserProfile }
// Returns full debate result + final decision
app.post("/api/ai/strategy", (req, res) => {
  try {
    const { pools, profile } = req.body;
    if (!pools || !profile) {
      return res.status(400).json({ error: "pools and profile are required" });
    }
    const decision = runDebateEngine(pools, profile);
    return res.json(decision);
  } catch (err) {
    console.error("AI strategy error:", err.message);
    return res.status(500).json({ error: "AI strategy failed" });
  }
});

// ── Route: POST /api/ai/score-pools ──────────────────────────────────────────
// Returns pools ranked by score for this user's profile
app.post("/api/ai/score-pools", (req, res) => {
  try {
    const { pools, profile } = req.body;
    const ranked = rankPools(pools, profile);
    return res.json(ranked);
  } catch (err) {
    return res.status(500).json({ error: "Scoring failed" });
  }
});

const { buildPTB, simulateExecution } = require("./ptbBuilder");

// ── Route: POST /api/ptb/build ────────────────────────────────────────────────
// Body: { fromPool, toPool, amount, profile }
app.post("/api/ptb/build", (req, res) => {
  try {
    const { fromPool, toPool, amount, profile } = req.body;
    if (!fromPool || !toPool || !amount || !profile) {
      return res.status(400).json({ error: "fromPool, toPool, amount, profile required" });
    }
    const tx = buildPTB(fromPool, toPool, amount, profile);
    return res.json(tx);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── Route: POST /api/ptb/execute ─────────────────────────────────────────────
// Body: { tx: PTBTransaction }
app.post("/api/ptb/execute", async (req, res) => {
  try {
    const { tx } = req.body;
    if (!tx) return res.status(400).json({ error: "tx is required" });
    const result = await simulateExecution(tx);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`One-Vantage backend running on http://localhost:${PORT}`);
});
