"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { connectorsForWallets } from "@rainbow-me/rainbowkit"
import { WagmiProvider, createConfig, http } from "wagmi"
import { celoAlfajores, celo } from "wagmi/chains"
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets"

// Determine which chain to use based on environment
const isProduction = process.env.NEXT_PUBLIC_IS_PROD === "true"
export const currentChain = isProduction ? celo : celoAlfajores
export const isProductionEnvironment = isProduction

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [injectedWallet],
    },
  ],
  {
    appName: "Celo EU",
    projectId:
      process.env.REOWN_PROJECT_ID ?? "044601f65212332475a09bc14ceb3c34",
  }
)

const config = createConfig({
  connectors,
  chains: [currentChain],
  transports: {
    [celoAlfajores.id]: http(),
    [celo.id]: http(),
  },
})

const queryClient = new QueryClient()

interface WagmiWrapperProps {
  children: React.ReactNode
}

export default function WagmiWrapper({ children }: WagmiWrapperProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
