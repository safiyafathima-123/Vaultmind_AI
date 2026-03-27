"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@onelabs/dapp-kit";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // We use useState to ensure the QueryClient is only initialized once per session
  const [queryClient] = useState(() => new QueryClient());
  
  // Custom network URLs for OneChain
  const networks = {
    testnet: { url: "https://rpc-testnet.onelabs.cc:443" },
    mainnet: { url: "https://rpc-mainnet.onelabs.cc:443" },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider autoConnect storageKey="one-vantage-wallet-state-v2" enableUnsafeBurner={true}>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
