#!/usr/bin/env node

import { deployUUPSProxy } from "../utils/deploymentUtils"
import { HardhatRuntimeEnvironment } from "hardhat/types"

/**
 * Example: Deploy an ERC20 Token using the generic UUPS deployment utilities
 *
 * This demonstrates how easy it is to deploy any UUPS proxy contract
 * using the extracted deployment functions.
 */

export async function deployERC20Token(
  hre: HardhatRuntimeEnvironment,
  name: string,
  symbol: string,
  initialSupply: string,
  owner: string,
  verify: boolean = true
): Promise<string> {
  console.log(`🪙 Token Name: ${name}`)
  console.log(`🏷️ Token Symbol: ${symbol}`)
  console.log(`💰 Initial Supply: ${initialSupply}`)
  console.log(`👑 Owner: ${owner}`)

  const result = await deployUUPSProxy(
    hre,
    "ERC20Token",
    "contracts/ERC20Token.sol:ERC20Token",
    [name, symbol, initialSupply, owner],
    verify
  )

  return result.proxyAddress
}

async function main() {
  const hre = require("hardhat") as HardhatRuntimeEnvironment

  // Get command line arguments
  const args = process.argv.slice(2)
  const networkFlag = args.indexOf("--network")
  const nameFlag = args.indexOf("--name")
  const symbolFlag = args.indexOf("--symbol")
  const supplyFlag = args.indexOf("--supply")
  const ownerFlag = args.indexOf("--owner")
  const noVerifyFlag = args.indexOf("--no-verify")

  const network = networkFlag !== -1 ? args[networkFlag + 1] : "alfajores"
  const name = nameFlag !== -1 ? args[nameFlag + 1] : "My Token"
  const symbol = symbolFlag !== -1 ? args[symbolFlag + 1] : "MTK"
  const supply = supplyFlag !== -1 ? args[supplyFlag + 1] : "1000000"
  const owner =
    ownerFlag !== -1 ? args[ownerFlag + 1] : process.env.DEPLOYER_ADDRESS
  const verify = noVerifyFlag === -1

  if (!owner) {
    console.error(
      "❌ Error: No owner address specified. Use --owner <address> or set DEPLOYER_ADDRESS in .env"
    )
    process.exit(1)
  }

  console.log("🚀 Starting ERC20 Token deployment...")
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
        `💡 Please run with: npx hardhat run scripts/examples/deploy-erc20-token.ts --network ${network}`
      )
      process.exit(1)
    }

    const proxyAddress = await deployERC20Token(
      hre,
      name,
      symbol,
      supply,
      owner,
      verify
    )

    console.log("🎉 Deployment Summary:")
    console.log(`📍 Network: ${network}`)
    console.log(`🪙 Token: ${name} (${symbol})`)
    console.log(`📝 Proxy Address: ${proxyAddress}`)
    console.log(`💰 Initial Supply: ${supply}`)
    console.log(`👑 Owner: ${owner}`)
    console.log(`🔍 Verified: ${verify}`)

    console.log("")
    console.log("💡 To upgrade this token:")
    console.log(
      `npx hardhat run scripts/templates/upgrade-uups-proxy.ts --network ${network} --contract ERC20Token`
    )
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
