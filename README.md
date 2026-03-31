# 🚀 PL Genesis AI: Autonomous Multi-Agent Liquidity Strategist

PL Genesis AI is a hands-free DeFi strategist that autonomously manages and protects your liquidity. It uses a multi-agent debate engine to continuously monitor real-time data, making dynamic, atomic rebalancing decisions explicitly tailored to your exact risk profile. 

**Transparency Update:** All execution decisions made by the AI are now securely anchored with an on-chain proof written directly to the **NEAR** network for transparent verification.

![PL Genesis AI Dashboard](https://via.placeholder.com/1200x600.png?text=PL+Genesis+AI+Dashboard)

## 💡 The Problem
Providing liquidity in DeFi is a full-time job. Users manually chase APY across pools only to get wiped out by sudden volatility and impermanent loss. Existing "set-and-forget" auto-compounding vaults are entirely static, leaving capital exposed during market crashes.

## 🎯 Our Solution
A predictive, autonomous agent specifically optimized for intelligent DeFi execution.
- **User Intent:** The user initializes the AI session and sets strict boundaries ("Max 80% rebalance", "Move to stablecoins if risky").
- **3-Agent Debate Engine:** Our backend utilizes three specialized agents (*Yield Hunter*, *Risk Guardian*, and *Stability AI*) that debate the risk-adjusted value of every pool based on live APY and volatility forecasts.
- **PTB Atomic Execution:** When the AI reaches a consensus, it builds a Programmable Transaction Block (PTB).
- **NEAR Protocol Proofs:** For total accountability, the resulting AI decision block and rationale are instantly hashed and proven on the NEAR Testnet.

## ✨ Key Features
- **Live Market Radar:** A 4-axis real-time charting engine scoring pools on APY, Safety, Confidence, and Liquidity.
- **Volatility Circuit Breaker:** "Safe Haven" feature that detects high market risk and automatically sweeps capital into stablecoin pools (USDC/USDO) to avoid impermanent loss.
- **Explainable AI:** DeFi is built on trust. We don't just move your money; the AI Debate Panel outputs a plain-English explanation of exactly *why* a trade was executed.
- **NEAR Block Verification:** Immediate rendering of the transaction hash and block explorer receipt for every single AI routing action.

## 🛠 Tech Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS, Recharts
- **Backend Analytics Engine:** Node.js, Express, `near-api-js`
- **Proof Anchoring:** NEAR Protocol Testnet

## 🚀 Run It Locally

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Setup the Backend (AI Engine)
```bash
cd backend
npm install
npm run dev
```
The strategy engine will run on http://localhost:5000.

### Setup the Frontend (Dashboard)
Open a new terminal session at the root of the project:
```bash
npm install
npm run dev
```
Visit **http://localhost:3000** to interact with the autonomous strategist!

## 🔮 What's Next? (Post-Hackathon Roadmap)
1. **Account Abstraction Integration:** Migrate our simulated execution models to real, permissioned Smart Contract Meta-Vaults using Account Abstraction primitives, so users can deposit actual funds without sacrificing security.
2. **On-Chain Agent Verification:** Expand our NEAR proof payload to include total transparency of the AI Agent's scoring weights and dynamic daily limits for full verifiability.
3. **Cross-Chain Expansion:** Allow the Yield Hunter agent to sniff out cross-chain APY opportunities extending beyond NEAR via decentralized bridges.
