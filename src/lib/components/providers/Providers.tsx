'use client';

// This code is EXACTLY from Openfort docs:
// https://www.openfort.io/docs/products/embedded-wallet/react

import React from "react";
import {
  AuthProvider,
  OpenfortProvider,
  getDefaultConfig,
  RecoveryMethod,
} from "@openfort/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig } from "wagmi";
import { baseSepolia } from "viem/chains";

// Create Wagmi config (handles blockchain connections)
const config = createConfig(
  getDefaultConfig({
    appName: "StudentSupport",
    chains: [baseSepolia],  // Base Sepolia testnet
    ssr: true,              // Enable server-side rendering
  })
);

// Create React Query client (handles data fetching)
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OpenfortProvider
          // Your publishable key (safe for browser)
          publishableKey={process.env.NEXT_PUBLIC_OPENFORT_PUBLISHABLE_KEY!}
          
          // Wallet configuration
          walletConfig={{
            shieldPublishableKey: process.env.NEXT_PUBLIC_SHIELD_PUBLISHABLE_KEY!,
            // Backend endpoint for wallet recovery
            createEncryptedSessionEndpoint: "/api/openfort/session",
          }}
          
          // UI configuration
          uiConfig={{
            // Login methods available
            authProviders: [
              AuthProvider.EMAIL_OTP,
              AuthProvider.GOOGLE,
            ],
            // How users recover wallets
            walletRecovery: {
              defaultMethod: RecoveryMethod.AUTOMATIC,
            },
          }}
        >
          {children}
        </OpenfortProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}