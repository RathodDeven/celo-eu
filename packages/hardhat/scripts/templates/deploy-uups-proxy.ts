#!/usr/bin/env node

import { deployUUPSProxy, parseDeploymentArgs } from "../utils/deploymentUtils"
import { HardhatRuntimeEnvironment } from "hardhat/types"

/**
 * Generic UUPS proxy deployment script template
 *
 * Usage examples:
 *
 * 1. Deploy MyToken with initial supply:
 *    npx hardhat run scripts/templates/deploy-uups-proxy.ts --network alfajores --contract MyContract
 *
 * 2. Deploy without verification:
 *    npx hardhat run scripts/templates/deploy-uups-proxy.ts --network alfajores --contract MyContract --no-verify
 *
 * 3. Deploy with custom args:
 *    npx hardhat run scripts/templates/deploy-uups-proxy.ts --network alfajores --contract MyContract --args "arg1,arg2,arg3"
 */

async function main() {
  const hre = require("hardhat") as HardhatRuntimeEnvironment

  // Parse command line arguments
  const parsedArgs = parseDeploymentArgs()
  const { contractName, constructorArgs, verify } = parsedArgs

  if (!contractName) {
    console.error(
      "❌ Error: Contract name is required. Use --contract <ContractName>"
    )
    console.log(
      "💡 Example: npx hardhat run scripts/templates/deploy-uups-proxy.ts --network alfajores --contract MyToken"
    )
    process.exit(1)
  }

  console.log("🚀 Starting UUPS Proxy deployment...")
  console.log(`📍 Network: ${hre.network.name}`)
  console.log(`🏗️ Contract: ${contractName}`)
  console.log(`📝 Constructor Args: ${JSON.stringify(constructorArgs)}`)
  console.log(`🔍 Verify: ${verify}`)
  try {
    // Compile contracts first
    await hre.run("compile")

    const result = await deployUUPSProxy(
      hre,
      contractName,
      `contracts/${contractName}.sol:${contractName}`,
      constructorArgs || [],
      verify
    )

    console.log("🎉 Deployment Summary:")
    console.log(`📍 Network: ${hre.network.name}`)
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
