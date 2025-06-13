import fs from "fs"
import path from "path"

// Type for supported networks
export type Network = "alfajores" | "celo"

export async function getDeployedAddress(network: Network): Promise<string> {
  try {
    // Map network names to chain IDs
    const networkToChainId: Record<string, string> = {
      alfajores: "44787",
      celo: "42220",
    }

    const chainId = networkToChainId[network] || network

    // Updated path to match actual deployment structure
    const ignitionDeploymentsPath = path.join(
      __dirname,
      "..",
      "ignition",
      "deployments",
      `chain-${chainId}`,
      "deployed_addresses.json"
    )

    console.log(`Looking for deployment at: ${ignitionDeploymentsPath}`)

    if (fs.existsSync(ignitionDeploymentsPath)) {
      const deployments = JSON.parse(
        fs.readFileSync(ignitionDeploymentsPath, "utf8")
      )
      // Updated to match the actual JSON structure
      return deployments["NexusExplorerBadgeModule#NexusExplorerBadge"] || ""
    }

    throw new Error(`No deployment found at path: ${ignitionDeploymentsPath}`)
  } catch (error) {
    console.error(`Error reading deployment address: ${error}`)
    throw error
  }
}
