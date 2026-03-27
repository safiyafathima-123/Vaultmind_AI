<<<<<<< HEAD
"use client";

=======
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "@onelabs/dapp-kit/dist/index.css";
>>>>>>> f38165e (Commited)
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
<<<<<<< HEAD
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
=======
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
        </Providers>
>>>>>>> f38165e (Commited)
      </body>
    </html>
  );
}
