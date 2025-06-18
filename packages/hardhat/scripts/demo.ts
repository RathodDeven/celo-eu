#!/usr/bin/env node

/**
 * Example script showing how to use the new deployment system
 * This demonstrates the complete workflow for upgradeable contracts
 */

import { deployUUPSProxy, upgradeUUPSProxy } from "./utils/deploymentUtils"
import { loadDeploymentInfo, listDeployments } from "./utils/deploymentUtils"

async function main() {
  const hre = require("hardhat")

  console.log("🔥 Upgradeable Contract System Demo")
  console.log("===================================")

  const network = hre.network.name
  const [deployer] = await hre.ethers.getSigners()

  console.log(`📍 Network: ${network}`)
  console.log(`👤 Deployer: ${deployer.address}`)

  // Check if we're on a testnet for this demo
  if (
    network !== "alfajores" &&
    network !== "localhost" &&
    network !== "hardhat"
  ) {
    console.log("⚠️  This demo should only be run on testnet or local networks")
    return
  }

  // List existing deployments
  console.log("\n📋 Existing deployments:")
  const deployments = listDeployments(network)
  if (deployments.length === 0) {
    console.log("   No deployments found")
  } else {
    deployments.forEach((contract) => {
      const info = loadDeploymentInfo(network, contract)
      if (info) {
        console.log(`   ${contract}: ${info.proxyAddress} (v${info.version})`)
      }
    })
  }

  // Check if NexusExplorerBadge is already deployed
  const existingDeployment = loadDeploymentInfo(network, "NexusExplorerBadge")

  if (!existingDeployment) {
    console.log("\n🚀 Deploying NexusExplorerBadge...")

    try {
      const result = await deployUUPSProxy(
        hre,
        "NexusExplorerBadge",
        "contracts/NexusExplorerBadge.sol:NexusExplorerBadge",
        [deployer.address],
        true
      )
      console.log(`✅ Deployed successfully to: ${result.proxyAddress}`)
    } catch (error) {
      console.error("❌ Deployment failed:", error)
      return
    }
  } else {
    console.log(
      "\n🔄 NexusExplorerBadge already deployed, demonstrating upgrade..."
    )

    try {
      const result = await upgradeUUPSProxy(
        hre,
        "NexusExplorerBadge",
        "contracts/NexusExplorerBadge.sol:NexusExplorerBadge",
        true
      )
      console.log(`✅ Upgraded successfully: ${result.proxyAddress}`)
    } catch (error) {
      console.error("❌ Upgrade failed:", error)
      return
    }
  }

  // Show final deployment state
  console.log("\n📊 Final deployment state:")
  const finalDeployments = listDeployments(network)
  finalDeployments.forEach((contract) => {
    const info = loadDeploymentInfo(network, contract)
    if (info) {
      console.log(`\n📝 ${contract}:`)
      console.log(`   Proxy: ${info.proxyAddress}`)
      console.log(`   Implementation: ${info.implementationAddress}`)
      console.log(`   Version: ${info.version}`)
      console.log(`   Verified: ${info.verified ? "✅" : "❌"}`)
    }
  })

  console.log("\n🎉 Demo completed!")
  console.log("\n📚 Next steps:")
  console.log("   - Use 'npx hardhat mint --network alfajores' to mint a badge")
  console.log(
    "   - Use 'npx hardhat deployments --network alfajores' to list deployments"
  )
  console.log("   - Use deployment info files for frontend integration")
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
