import { createPublicClient, http } from "viem"
import { celoAlfajores, mainnet, celo } from "viem/chains"

// Determine which chain to use based on environment
const isProduction = process.env.NEXT_PUBLIC_IS_PROD === "true"
const currentCeloChain = isProduction ? celo : celoAlfajores

export const viemPublicClientEth = createPublicClient({
  chain: mainnet,
  transport: http(),
})

export const viemPublicClientAlfajores = createPublicClient({
  chain: celoAlfajores,
  transport: http(),
})

export const viemPublicClientCelo = createPublicClient({
  chain: celo,
  transport: http(),
})

// Export the current chain client based on environment
export const viemPublicClient = createPublicClient({
  chain: currentCeloChain,
  transport: http(),
})
