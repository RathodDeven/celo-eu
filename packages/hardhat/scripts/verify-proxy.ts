#!/usr/bin/env node

import {
  verifyUUPSProxy,
  parseDeploymentArgs,
  loadDeploymentInfo,
} from "./utils/deploymentUtils"
import { HardhatRuntimeEnvironment } from "hardhat/types"

/**
 * Verify an already deployed UUPS proxy contract
 *
 * Usage examples:
 *
 * 1. Using environment variable:
 *    CONTRACT_NAME=NexusExplorerBadge pnpm hardhat run scripts/verify-proxy.ts --network celo
 *
 * 2. Using command line argument:
 *    pnpm hardhat run scripts/verify-proxy.ts --network alfajores NexusExplorerBadge
 */

async function main() {
  const hre = require("hardhat") as HardhatRuntimeEnvironment

  // Get contract name from environment variable or command line args
  const contractName = process.env.CONTRACT_NAME || process.argv[2]

  if (!contractName) {
    console.error("❌ Error: Contract name is required.")
    console.log("💡 Usage options:")
    console.log(
      "   1. CONTRACT_NAME=NexusExplorerBadge pnpm hardhat run scripts/verify-proxy.ts --network alfajores"
    )
    console.log(
      "   2. pnpm hardhat run scripts/verify-proxy.ts --network alfajores NexusExplorerBadge"
    )
    process.exit(1)
  }

  console.log("🔍 Starting proxy verification...")
  console.log(`📍 Network: ${hre.network.name}`)
  console.log(`🏗️ Contract: ${contractName}`)

  try {
    // Load deployment info for the contract
    const deploymentInfo = loadDeploymentInfo(hre.network.name, contractName)

    if (!deploymentInfo) {
      console.error(
        `❌ No deployment info found for ${contractName} on ${hre.network.name}`
      )
      console.log(`💡 Make sure the contract has been deployed to this network`)
      process.exit(1)
    }
    console.log(`📝 Proxy Address: ${deploymentInfo.proxyAddress}`)
    console.log(`📋 Implementation: ${deploymentInfo.implementationAddress}`)
    console.log("")

    // Verify the contract
    const verified = await verifyUUPSProxy(
      hre,
      deploymentInfo.proxyAddress,
      deploymentInfo.implementationAddress,
      `contracts/${contractName}.sol:${contractName}`,
      deploymentInfo.constructorArgs
    )

    if (verified) {
      console.log("🎉 Proxy verification completed successfully!")
      console.log("")
      console.log("📍 Contract Details:")
      const baseUrl =
        hre.network.name === "celo" ? "celoscan.io" : "alfajores.celoscan.io"
      console.log(
        `🔗 Proxy: https://${baseUrl}/address/${deploymentInfo.proxyAddress}`
      )
      console.log(
        `🔗 Implementation: https://${baseUrl}/address/${deploymentInfo.implementationAddress}`
      )
      console.log("")
      console.log(
        "💡 The proxy should now show 'Read as Proxy' and 'Write as Proxy' tabs"
      )
    } else {
      console.log("⚠️ Proxy verification completed with some issues")
      console.log("💡 You may need to manually verify the proxy on Celoscan")
    }
  } catch (error) {
    console.error("❌ Verification failed:", error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
