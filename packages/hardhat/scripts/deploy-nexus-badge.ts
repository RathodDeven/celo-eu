#!/usr/bin/env node

import { deployUUPSProxy, parseDeploymentArgs } from "./utils/deploymentUtils"
import { HardhatRuntimeEnvironment } from "hardhat/types"

async function main() {
  const hre = require("hardhat") as HardhatRuntimeEnvironment
  // Parse command line arguments (excluding network - that's handled by Hardhat)
  const parsedArgs = parseDeploymentArgs()
  const { owner, verify } = parsedArgs

  if (!owner) {
    console.error(
      "❌ Error: No owner address specified. Use --owner <address> or set DEPLOYER_ADDRESS in .env"
    )
    process.exit(1)
  }

  console.log("🚀 Starting NexusExplorerBadge deployment...")
  console.log(`📍 Network: ${hre.network.name}`)
  console.log(`👑 Owner: ${owner}`)
  console.log(`🔍 Verify: ${verify}`)
  try {
    // Compile contracts first
    await hre.run("compile")

    const result = await deployUUPSProxy(
      hre,
      "NexusExplorerBadge",
      "contracts/NexusExplorerBadge.sol:NexusExplorerBadge",
      [owner],
      verify
    )

    console.log("🎉 Deployment Summary:")
    console.log(`📍 Network: ${hre.network.name}`)
    console.log(`📝 Proxy Address: ${result.proxyAddress}`)
    console.log(`👑 Owner: ${owner}`)
    console.log(`🔍 Verified: ${verify}`)
  } catch (error) {
    console.error("❌ Deployment failed:", error)
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
