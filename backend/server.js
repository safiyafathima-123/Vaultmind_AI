// backend/server.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow production frontend URL in addition to localhost
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL, // Add this to Render env vars
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
  methods: ["GET", "POST"],
}));
app.use(express.json());

// ── Mock data ──────────────────────────────────────────────────────────
const MOCK_POOLS = [
  { id: "pool-eth-usdc",  name: "ETH / USDC",  apy: 14.2, volatility: 0.62, confidence: 0.78, tvl: 4200000, token: "ETH"  },
  { id: "pool-one-usdo",  name: "ONE / USDO",  apy: 22.7, volatility: 0.81, confidence: 0.65, tvl: 1800000, token: "ONE"  },
  { id: "pool-usdc-usdo", name: "USDC / USDO", apy: 6.1,  volatility: 0.08, confidence: 0.95, tvl: 9500000, token: "USDC" },
  { id: "pool-btc-usdc",  name: "BTC / USDC",  apy: 9.8,  volatility: 0.55, confidence: 0.72, tvl: 6100000, token: "BTC"  },
  { id: "pool-one-eth",   name: "ONE / ETH",   apy: 18.4, volatility: 0.74, confidence: 0.61, tvl: 2300000, token: "ONE"  },
];

const MOCK_VOLATILITY = {
  ETH: 0.62, BTC: 0.55, ONE: 0.78, USDC: 0.06, USDO: 0.05,
};

// ── Logic Helpers ──────────────────────────────────────────────────────

async function getPoolsInternal() {
  try {
    const onedexUrl = process.env.ONEDEX_API_URL;
    if (!onedexUrl) throw new Error("No OneDEX URL");
    const response = await axios.get(`${onedexUrl}/pools`, { timeout: 4000 });
    return response.data;
  } catch (err) {
    return MOCK_POOLS;
  }
}

async function getVolatilityInternal(token) {
  try {
    const predictUrl = process.env.ONEPREDICT_API_URL;
    if (!predictUrl) throw new Error("No OnePredict URL");
    const response = await axios.get(`${predictUrl}/forecast/${token}`, { timeout: 4000 });
    return response.data.volatility;
  } catch (err) {
    return MOCK_VOLATILITY[token] ?? 0.5;
  }
}

// ── Routes ─────────────────────────────────────────────────────────────

app.get("/api/pools", async (req, res) => {
  const pools = await getPoolsInternal();
  res.json(pools);
});

app.get("/api/volatility/:token", async (req, res) => {
  const { token } = req.params;
  const volatility = await getVolatilityInternal(token);
  res.json({ volatility });
});

app.get("/api/market-snapshot", async (req, res) => {
  try {
    const pools = await getPoolsInternal();
    const enriched = await Promise.all(
      pools.map(async (pool) => {
        const vol = await getVolatilityInternal(pool.token);
        return { ...pool, volatility: vol };
      })
    );
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: "Snapshot failed" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const { runDebateEngine, rankPools } = require("./aiStrategy");

app.post("/api/ai/strategy", (req, res) => {
  try {
    const { pools, profile } = req.body;
    if (!pools || !profile) return res.status(400).json({ error: "Required fields missing" });
    const decision = runDebateEngine(pools, profile);
    res.json(decision);
  } catch (err) {
    res.status(500).json({ error: "AI failed" });
  }
});

app.post("/api/ai/score-pools", (req, res) => {
  try {
    const { pools, profile } = req.body;
    const ranked = rankPools(pools, profile);
    res.json(ranked);
  } catch (err) {
    res.status(500).json({ error: "Scoring failed" });
  }
});

const { buildPTB, simulateExecution } = require("./ptbBuilder");

app.post("/api/ptb/build", (req, res) => {
  try {
    const { fromPool, toPool, amount, profile } = req.body;
    const tx = buildPTB(fromPool, toPool, amount, profile);
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const { writeProofToNear } = require("./nearProof");

app.post("/api/ptb/execute", async (req, res) => {
  try {
    const { tx, profile } = req.body;
    const result = await simulateExecution(tx);
    
    // Generate proof payload
    const proofPayload = {
      session_id: Date.now().toString(),
      agent_id: profile?.address || "anonymous",
      decision: tx,
      confidence_score: 0.95, // mocked confidence from ML model
      timestamp: new Date().toISOString()
    };

    const nearProof = await writeProofToNear(proofPayload);

    res.json({ ...result, nearProof });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`One-Vantage backend running on port ${PORT}`);
});
