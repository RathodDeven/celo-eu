#!/usr/bin/env node

import { deployUUPSProxy, parseDeploymentArgs } from "./utils/deploymentUtils"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { ethers } from "ethers"

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

  // Get additional arguments from command line or environment
  const nexusExplorerBadgeAddress =
    process.env.NEXUS_EXPLORER_BADGE_ADDRESS ||
    process.env.npm_config_nexus_address ||
    process.argv
      .find((arg) => arg.startsWith("--nexus-address="))
      ?.split("=")[1]

  const celoRewardAmountInput =
    process.env.CELO_REWARD_AMOUNT ||
    process.env.npm_config_celo_reward ||
    process.argv
      .find((arg) => arg.startsWith("--celo-reward="))
      ?.split("=")[1] ||
    "0.1"

  console.log("nexusExplorerBadgeAddress", nexusExplorerBadgeAddress)

  if (!nexusExplorerBadgeAddress) {
    console.error(
      "❌ Error: No NexusExplorerBadge address specified. Use --nexus-address=<address> or set NEXUS_EXPLORER_BADGE_ADDRESS in .env"
    )
    process.exit(1)
  }

  // Convert CELO amount to wei (1 CELO = 10^18 wei)
  const celoRewardAmount = ethers.parseEther(celoRewardAmountInput)

  console.log("🚀 Starting ContributorPass deployment...")
  console.log(`📍 Network: ${hre.network.name}`)
  console.log(`👑 Owner: ${owner}`)
  console.log(`🎫 NexusExplorerBadge Address: ${nexusExplorerBadgeAddress}`)
  console.log(`💰 CELO Reward Amount: ${celoRewardAmountInput} CELO`)
  console.log(`🔍 Verify: ${verify}`)

  try {
    // Compile contracts first
    await hre.run("compile")

    const result = await deployUUPSProxy(
      hre,
      "ContributorPass",
      "contracts/ContributorPass.sol:ContributorPass",
      [owner, nexusExplorerBadgeAddress, celoRewardAmount],
      verify
    )

    console.log("🎉 Deployment Summary:")
    console.log(`📍 Network: ${hre.network.name}`)
    console.log(`📝 Proxy Address: ${result.proxyAddress}`)
    console.log(`👑 Owner: ${owner}`)
    console.log(`🎫 NexusExplorerBadge Address: ${nexusExplorerBadgeAddress}`)
    console.log(`💰 CELO Reward Amount: ${celoRewardAmountInput} CELO`)
    console.log(`🔍 Verified: ${verify}`)

    console.log("\n📋 Next Steps:")
    console.log(
      `1. Fund the contract with CELO for rewards: send CELO to ${result.proxyAddress}`
    )
    console.log(`2. Grant admin roles to other addresses if needed`)
    console.log(`3. Users can claim ContributorPass if they meet requirements`)
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
