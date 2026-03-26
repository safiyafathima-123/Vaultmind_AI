// src/lib/types.ts

// Represents a connected wallet user
export interface User {
  address: string;           // wallet address like "0xabc..."
  isConnected: boolean;      // true if wallet is connected
}

// Risk preference the user selects
export type RiskLevel = "low" | "medium" | "high";

// User's full identity/preference profile (from OneID)
export interface UserProfile {
  address: string;
  riskLevel: RiskLevel;
  preferStablecoins: boolean;   // true = move to USDC when risky
  maxRebalancePercent: number;  // how much % of funds AI can move (e.g. 80)
}

// A single liquidity pool on OneDEX
export interface Pool {
  id: string;
  name: string;              // e.g. "ETH/USDC Pool"
  apy: number;               // annual yield % e.g. 12.5
  volatility: number;        // predicted risk score 0–1
  confidence: number;        // AI confidence in forecast 0–1
  tvl: number;               // total value locked in USD
  token: string;             // main token symbol e.g. "ETH"
}

// AI score result for a pool
export interface PoolScore {
  pool: Pool;
  score: number;             // final calculated score
  recommendation: string;    // "move here" | "stay" | "avoid"
}

// One AI strategy agent's opinion
export interface AgentOpinion {
  agentName: "Yield Hunter" | "Risk Guardian" | "Stability AI";
  recommendation: string;    // what this agent suggests
  reasoning: string;         // why
  targetPool: string;        // which pool it recommends
  confidence: number;        // how confident this agent is 0–100
}

// Final AI decision after debate
export interface FinalDecision {
  action: "rebalance" | "hold" | "move-to-stable";
  targetPool: string;
  explanation: string;       // OneBox plain-English message
  estimatedGain: number;     // expected $ improvement
  agentOpinions: AgentOpinion[];
}

// Helper: load saved profile from localStorage
export function loadSavedProfile(): UserProfile | null {
  if (typeof window === "undefined") return null; // server-side guard
  const saved = localStorage.getItem("oneVantageProfile");
  return saved ? (JSON.parse(saved) as UserProfile) : null;
}

// A single step inside a PTB
export interface PTBStep {
  type: "withdraw" | "swap" | "deposit";
  fromPool?: string;       // pool id to withdraw from
  toPool?: string;         // pool id to deposit into
  token?: string;          // token being swapped
  amount: number;          // amount in USD
  estimatedGas: number;    // gas cost estimate in USD
  status: "pending" | "success" | "failed" | "reverted";
}

// The full PTB transaction object
export interface PTBTransaction {
  id: string;              // unique tx id
  steps: PTBStep[];        // all steps in order
  totalAmount: number;     // total USD being moved
  estimatedTotalGas: number;
  status: "building" | "ready" | "executing" | "success" | "failed";
  createdAt: Date;
  txHash?: string;         // on-chain hash after execution
  error?: string;          // error message if failed
}

// Result returned after execution
export interface PTBResult {
  success: boolean;
  txHash?: string;
  gasUsed?: number;
  error?: string;
  steps: PTBStep[];
}
