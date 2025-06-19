"use client"

import React from "react"
import "@rainbow-me/rainbowkit/styles.css"
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit"
import { useTheme } from "next-themes"
import { WagmiProvider, http } from "wagmi"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { celoAlfajores, celo } from "wagmi/chains"

// Determine which chain to use based on environment
const isProduction = process.env.NEXT_PUBLIC_IS_PROD === "true"
export const currentChain = isProduction ? celo : celoAlfajores
export const isProductionEnvironment = isProduction

const defaultChains = isProduction ? [celo] : [celoAlfajores]

const defaultTransports = {
  [celoAlfajores.id]: http(),
  [celo.id]: http(),
}

const RainbowKitWrapper = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [config, setConfig] = React.useState<any>(null)

  // Create QueryClient inside component to avoid SSR issues
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 0,
            // Prevent queries from running on server
            enabled: typeof window !== "undefined",
          },
        },
      })
  )

  React.useEffect(() => {
    setMounted(true)

    // Dynamically import wallets only on client side
    const loadWallets = async () => {
      try {
        const {
          coinbaseWallet,
          injectedWallet,
          metaMaskWallet,
          trustWallet,
          walletConnectWallet,
          zerionWallet,
        } = await import("@rainbow-me/rainbowkit/wallets")

        const clientConfig = getDefaultConfig({
          appName: "Celo EU",
          projectId:
            process.env.REOWN_PROJECT_ID ?? "044601f65212332475a09bc14ceb3c34",
          // @ts-ignore
          chains: defaultChains,
          transports: defaultTransports,
          wallets: [
            {
              groupName: "Installed",
              wallets: [injectedWallet],
            },
            {
              groupName: "Popular",
              wallets: [
                metaMaskWallet,
                walletConnectWallet,
                zerionWallet,
                coinbaseWallet,
                trustWallet,
              ],
            },
          ],
          ssr: true,
        })

        setConfig(clientConfig)
      } catch (error) {
        console.error("Failed to load wallets:", error)
      }
    }

    loadWallets()
  }, [])

  // Return null on server-side to prevent hydration mismatches
  if (!mounted || !config) {
    return null
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          appInfo={{
            appName: "Celo EU",
          }}
          theme={theme === "dark" ? darkTheme() : lightTheme()}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default RainbowKitWrapper
