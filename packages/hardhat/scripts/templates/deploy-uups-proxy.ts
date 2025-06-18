#!/usr/bin/env node

import { deployUUPSProxy } from "../utils/deploymentUtils"
import { HardhatRuntimeEnvironment } from "hardhat/types"

/**
 * Generic UUPS proxy deployment script template
 *
 * Usage examples:
 *
 * 1. Deploy MyToken with initial supply:
 *    npx hardhat run scripts/templates/deploy-uups-proxy.ts --network alfajores
 *
 * 2. Deploy without verification:
 *    npx hardhat run scripts/templates/deploy-uups-proxy.ts --network alfajores --no-verify
 *
 * 3. Deploy with custom args:
 *    npx hardhat run scripts/templates/deploy-uups-proxy.ts --network alfajores --args "arg1,arg2,arg3"
 */

async function main() {
  const hre = require("hardhat") as HardhatRuntimeEnvironment

  // Get command line arguments
  const args = process.argv.slice(2)
  const networkFlag = args.indexOf("--network")
  const contractFlag = args.indexOf("--contract")
  const argsFlag = args.indexOf("--args")
  const noVerifyFlag = args.indexOf("--no-verify")

  const network = networkFlag !== -1 ? args[networkFlag + 1] : "alfajores"
  const contractName =
    contractFlag !== -1 ? args[contractFlag + 1] : "MyContract"
  const constructorArgs = argsFlag !== -1 ? args[argsFlag + 1].split(",") : []
  const verify = noVerifyFlag === -1

  console.log("🚀 Starting UUPS Proxy deployment...")
  console.log(`📍 Network: ${network}`)
  console.log(`🏗️ Contract: ${contractName}`)
  console.log(`📝 Constructor Args: ${JSON.stringify(constructorArgs)}`)
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
        `💡 Please run with: npx hardhat run scripts/templates/deploy-uups-proxy.ts --network ${network}`
      )
      process.exit(1)
    }

    const result = await deployUUPSProxy(
      hre,
      contractName,
      `contracts/${contractName}.sol:${contractName}`,
      constructorArgs,
      verify
    )

    console.log("🎉 Deployment Summary:")
    console.log(`📍 Network: ${network}`)
    console.log(`🏗️ Contract: ${contractName}`)
    console.log(`📝 Proxy Address: ${result.proxyAddress}`)
    console.log(`📋 Implementation: ${result.implementationAddress}`)
    console.log(`🔧 Admin: ${result.adminAddress}`)
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
