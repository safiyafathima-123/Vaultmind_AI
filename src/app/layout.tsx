"use client";

import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@onelabs/dapp-kit";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

// Create clients once outside component so they never re-initialise
const queryClient = new QueryClient();
const suiClient   = new SuiClient({ url: getFullnodeUrl("testnet") });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider client={suiClient}>
            <WalletProvider autoConnect>
              {/* autoConnect = reconnects wallet on page refresh automatically */}
              {children}
            </WalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
