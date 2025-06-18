// Export the appropriate contract configuration based on environment
import {
  nexusExplorerAbi as nexusExplorerAbiAlfajores,
  nexusExplorerAddress as nexusExplorerAddressAlfajores,
} from "./alfajores/NexusExplorerBadge"

import {
  nexusExplorerAbi as nexusExplorerAbiCelo,
  nexusExplorerAddress as nexusExplorerAddressCelo,
} from "./celo/NexusExplorerBadge"

// Check environment variable to determine which contracts to use
const isProduction = process.env.NEXT_PUBLIC_IS_PROD === "true"

// Export the appropriate ABI and address based on environment
export const nexusExplorerAbi = isProduction
  ? nexusExplorerAbiCelo
  : nexusExplorerAbiAlfajores
export const nexusExplorerAddress = isProduction
  ? nexusExplorerAddressCelo
  : nexusExplorerAddressAlfajores

// Also export the chain information
export const currentChain = isProduction ? "celo" : "alfajores"
export const isProductionEnvironment = isProduction
