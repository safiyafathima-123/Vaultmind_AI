// @ts-nocheck
import { Account, JsonRpcProvider } from "near-api-js";
import { getAdapter, chains } from "multichain.js";

// Ensure environment variables are loaded (they are injected by Next.js automatically on the server)
const RPC_URL = process.env.NEAR_RPC_URL || "https://rpc.testnet.near.org";
const ACCOUNT_ID = process.env.NEAR_ACCOUNT_ID || "plgenesis-7290deff.testnet";
const PRIVATE_KEY = process.env.NEAR_PRIVATE_KEY || "ed25519:412Zj6xxFzdF4m4tKcQggyYPoF6H3sTzTRMKNh9Tmig7BCZn3CzVSRdQ2UsaXA6rCoKWRP91Na6WdKj9tN2Cuw1m";

/**
 * Initializes the NEAR Multichain adapter for Arbitrum.
 * This runs ONLY on the server to protect your NEAR_PRIVATE_KEY.
 */
export async function setupArbitrumAdapter() {
  if (!ACCOUNT_ID || !PRIVATE_KEY) {
    throw new Error("Missing NEAR_ACCOUNT_ID or NEAR_PRIVATE_KEY in your environment configuring Chain Signatures.");
  }

  // 1. Setup NEAR connection using the Quickstart snippet format or standard connection.
  const nearProvider = new JsonRpcProvider({ url: RPC_URL });
  
  // NOTE: According to the latest NEAR Multichain docs, the Account object can take the private key directly 
  // or we can use a Signer. We use the snippet's exact signature:
  // @ts-ignore - The snippet injects the private key here directly.
  const nearAccount = new Account(ACCOUNT_ID, nearProvider, PRIVATE_KEY);

  // 2. Wrap it with the multichain.js adapter
  const arbitrum = getAdapter({ chain: chains.ARBITRUM, mpcNetwork: "testnet" });
  
  return { arbitrum, nearAccount };
}

/**
 * Derives your single NEAR Account into its controlled Arbitrum address
 */
export async function getControlledArbitrumAccount() {
  const { arbitrum, nearAccount } = await setupArbitrumAdapter();
  
  const arbAddress = await arbitrum.getAddressControlledBy({ nearAddress: nearAccount.accountId });
  const arbBalance = await arbitrum.getBalance({ address: arbAddress });
  
  return {
    address: arbAddress,
    balance: arbBalance,
    nearAccountId: nearAccount.accountId
  };
}

/**
 * Executes a cross-chain transfer on Arbitrum via the NEAR MPC network 
 */
export async function executeArbitrumTransfer(to: string, amountWei: string) {
  const { arbitrum, nearAccount } = await setupArbitrumAdapter();

  // amount Wei should be a string to prevent JS max integer limits (e.g. "10000000000000000" for 0.01 ETH)
  const txHash = await arbitrum.transfer({
    to,
    amount: amountWei,
    nearAccount
  });

  return txHash;
}
