import { createPublicClient, http } from "viem"
import { celoAlfajores, mainnet } from "viem/chains"

export const viemPublicClientEth = createPublicClient({
  chain: mainnet,
  transport: http(),
})

export const viemPublicClientAlfajores = createPublicClient({
  chain: celoAlfajores,
  transport: http(),
})
