#!/usr/bin/env node

import { upgradeUUPSProxy } from "./utils/deploymentUtils"
import { HardhatRuntimeEnvironment } from "hardhat/types"

async function main() {
  const hre = require("hardhat") as HardhatRuntimeEnvironment

  // Get command line arguments
  const args = process.argv.slice(2)
  const networkFlag = args.indexOf("--network")
  const noVerifyFlag = args.indexOf("--no-verify")

  const network = networkFlag !== -1 ? args[networkFlag + 1] : "alfajores"
  const verify = noVerifyFlag === -1

  console.log("🔄 Starting NexusExplorerBadge upgrade...")
  console.log(`📍 Network: ${network}`)
  console.log(`🔍 Verify: ${verify}`)

  try {
    // Compile contracts first
    await hre.run("compile")

    // Validate network
    if (hre.network.name !== network) {
      console.error(
        `❌ Error: Current network is ${hre.network.name}, but ${network} was requested.`
      )
      console.log(
        `💡 Please run with: npx hardhat run scripts/upgrade-nexus-badge.ts --network ${network}`
      )
      process.exit(1)
    }
    const result = await upgradeUUPSProxy(
      hre,
      "NexusExplorerBadge",
      "contracts/NexusExplorerBadge.sol:NexusExplorerBadge",
      verify
    )

    console.log("🎉 Upgrade Summary:")
    console.log(`📍 Network: ${network}`)
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
