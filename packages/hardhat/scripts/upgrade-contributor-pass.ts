#!/usr/bin/env node

import { upgradeUUPSProxy, parseDeploymentArgs } from "./utils/deploymentUtils"
import { HardhatRuntimeEnvironment } from "hardhat/types"

async function main() {
  const hre = require("hardhat") as HardhatRuntimeEnvironment

  // Parse command line arguments
  const parsedArgs = parseDeploymentArgs()
  const { verify } = parsedArgs

  console.log("🔄 Starting ContributorPass upgrade...")
  console.log(`📍 Network: ${hre.network.name}`)
  console.log(`🔍 Verify: ${verify}`)

  try {
    // Compile contracts first
    await hre.run("compile")

    const result = await upgradeUUPSProxy(
      hre,
      "ContributorPass",
      "contracts/ContributorPass.sol:ContributorPass",
      verify
    )

    console.log("🎉 Upgrade Summary:")
    console.log(`📍 Network: ${hre.network.name}`)
    console.log(`📝 Proxy Address: ${result.proxyAddress}`)
    console.log(
      `🆕 New Implementation Address: ${result.newImplementationAddress}`
    )
    console.log(`🔍 Verified: ${verify}`)

    console.log("\n📋 Post-Upgrade Notes:")
    console.log("1. All existing data and state are preserved")
    console.log("2. Admin roles and permissions remain unchanged")
    console.log("3. Contract balance and settings are maintained")
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
