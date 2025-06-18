#!/usr/bin/env node

import { upgradeUUPSProxy, parseDeploymentArgs } from "./utils/deploymentUtils"
import { HardhatRuntimeEnvironment } from "hardhat/types"

async function main() {
  const hre = require("hardhat") as HardhatRuntimeEnvironment

  // Parse command line arguments
  const parsedArgs = parseDeploymentArgs()
  const { verify } = parsedArgs

  console.log("🔄 Starting NexusExplorerBadge upgrade...")
  console.log(`📍 Network: ${hre.network.name}`)
  console.log(`🔍 Verify: ${verify}`)
  try {
    // Compile contracts first
    await hre.run("compile")

    const result = await upgradeUUPSProxy(
      hre,
      "NexusExplorerBadge",
      "contracts/NexusExplorerBadge.sol:NexusExplorerBadge",
      verify
    )

    console.log("🎉 Upgrade Summary:")
    console.log(`📍 Network: ${hre.network.name}`)
    console.log(`📝 Proxy Address: ${result.proxyAddress}`)
    console.log(
      `🆕 New Implementation Address: ${result.newImplementationAddress}`
    )
    console.log(`🔍 Verified: ${verify}`)
  } catch (error) {
    console.error("❌ Upgrade failed:", error)
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
