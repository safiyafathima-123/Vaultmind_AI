import { NextResponse } from "next/server";
import { getControlledArbitrumAccount, executeArbitrumTransfer } from "@/lib/multichain";

// Force route to run dynamically rather than statically compile
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getControlledArbitrumAccount();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Multichain Info Error:", error);
    return NextResponse.json({ error: error.message || "Failed to get cross-chain account info" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, amount } = body;

    if (!to || !amount) {
      return NextResponse.json({ error: "Missing 'to' address or 'amount' (in Wei)" }, { status: 400 });
    }

    const txHash = await executeArbitrumTransfer(to, amount);
    
    return NextResponse.json({ 
      success: true, 
      txHash,
      explorerUrl: `https://sepolia.arbiscan.io/tx/${txHash}` // Defaulting to testnet explorer
    });
  } catch (error: any) {
    console.error("Multichain Transfer Error:", error);
    return NextResponse.json({ error: error.message || "Cross-chain transfer failed" }, { status: 500 });
  }
}
