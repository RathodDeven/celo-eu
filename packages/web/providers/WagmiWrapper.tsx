"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { connectorsForWallets } from "@rainbow-me/rainbowkit"
import { WagmiProvider, createConfig, http } from "wagmi"
import { celoAlfajores } from "wagmi/chains"
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets"

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
  chains: [celoAlfajores],
  transports: {
    [celoAlfajores.id]: http(),
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
