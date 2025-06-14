import { createPublicClient, http } from "viem"
import { celoAlfajores, mainnet, celo } from "viem/chains"

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
