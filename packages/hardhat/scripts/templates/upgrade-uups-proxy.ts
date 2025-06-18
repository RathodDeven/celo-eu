#!/usr/bin/env node

import { upgradeUUPSProxy } from "../utils/deploymentUtils"
import { HardhatRuntimeEnvironment } from "hardhat/types"

/**
 * Generic UUPS proxy upgrade script template
 *
 * Usage examples:
 *
 * 1. Upgrade MyToken:
 *    npx hardhat run scripts/templates/upgrade-uups-proxy.ts --network alfajores --contract MyToken
 *
 * 2. Upgrade without verification:
 *    npx hardhat run scripts/templates/upgrade-uups-proxy.ts --network alfajores --contract MyToken --no-verify
 */

async function main() {
  const hre = require("hardhat") as HardhatRuntimeEnvironment

  // Get command line arguments
  const args = process.argv.slice(2)
  const networkFlag = args.indexOf("--network")
  const contractFlag = args.indexOf("--contract")
  const noVerifyFlag = args.indexOf("--no-verify")

  const network = networkFlag !== -1 ? args[networkFlag + 1] : "alfajores"
  const contractName =
    contractFlag !== -1 ? args[contractFlag + 1] : "MyContract"
  const verify = noVerifyFlag === -1

  if (!contractName || contractName === "MyContract") {
    console.error(
      "❌ Error: Contract name is required. Use --contract <ContractName>"
    )
    console.log(
      "💡 Example: npx hardhat run scripts/templates/upgrade-uups-proxy.ts --network alfajores --contract MyToken"
    )
    process.exit(1)
  }

  console.log("🔄 Starting UUPS Proxy upgrade...")
  console.log(`📍 Network: ${network}`)
  console.log(`🏗️ Contract: ${contractName}`)
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
        `💡 Please run with: npx hardhat run scripts/templates/upgrade-uups-proxy.ts --network ${network}`
      )
      process.exit(1)
    }

    const result = await upgradeUUPSProxy(
      hre,
      contractName,
      `contracts/${contractName}.sol:${contractName}`,
      verify
    )

    console.log("🎉 Upgrade Summary:")
    console.log(`📍 Network: ${network}`)
    console.log(`🏗️ Contract: ${contractName}`)
    console.log(`📝 Proxy Address: ${result.proxyAddress}`)
    console.log(
      `📋 Previous Implementation: ${result.previousImplementationAddress}`
    )
    console.log(`🆕 New Implementation: ${result.newImplementationAddress}`)
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
