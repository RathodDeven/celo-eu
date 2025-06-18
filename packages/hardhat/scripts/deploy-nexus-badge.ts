#!/usr/bin/env node

import { deployUUPSProxy } from "./utils/deploymentUtils"
import { HardhatRuntimeEnvironment } from "hardhat/types"

async function main() {
  const hre = require("hardhat") as HardhatRuntimeEnvironment

  // Get command line arguments
  const args = process.argv.slice(2)
  const networkFlag = args.indexOf("--network")
  const ownerFlag = args.indexOf("--owner")
  const noVerifyFlag = args.indexOf("--no-verify")

  const network = networkFlag !== -1 ? args[networkFlag + 1] : "alfajores"
  const owner =
    ownerFlag !== -1 ? args[ownerFlag + 1] : process.env.DEPLOYER_ADDRESS
  const verify = noVerifyFlag === -1

  if (!owner) {
    console.error(
      "❌ Error: No owner address specified. Use --owner <address> or set DEPLOYER_ADDRESS in .env"
    )
    process.exit(1)
  }

  console.log("🚀 Starting NexusExplorerBadge deployment...")
  console.log(`📍 Network: ${network}`)
  console.log(`👑 Owner: ${owner}`)
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
        `💡 Please run with: npx hardhat run scripts/deploy-nexus-badge.ts --network ${network}`
      )
      process.exit(1)
    }
    const result = await deployUUPSProxy(
      hre,
      "NexusExplorerBadge",
      "contracts/NexusExplorerBadge.sol:NexusExplorerBadge",
      [owner],
      verify
    )

    console.log("🎉 Deployment Summary:")
    console.log(`📍 Network: ${network}`)
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
