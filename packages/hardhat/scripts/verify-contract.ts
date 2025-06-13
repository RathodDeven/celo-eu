import { HardhatRuntimeEnvironment } from "hardhat/types"
import { task } from "hardhat/config"
import { getDeployedAddress, Network } from "./getDeployedAddress"

// Fix: Remove the network parameter since it conflicts with Hardhat's global --network flag
task(
  "verify-contract",
  "Verifies the contract on Celoscan after deployment"
).setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
  // Access network from hre instead
  const network = hre.network.name as Network

  console.log(`🔍 Verifying contract on ${network}...`)

  try {
    // Get contract address using the shared function
    const contractAddress = await getDeployedAddress(network)
    console.log(`Found deployed contract address: ${contractAddress}`)
    console.log("Getting constructor arguments...")

    // Get the initialOwner from environment or use the deployer address
    const initialOwner =
      process.env.DEPLOYER_ADDRESS || (await hre.ethers.getSigners())[0].address

    console.log(`Verifying contract with owner: ${initialOwner}`)

    // Run verification
    await hre.run("verify:verify", {
      address: contractAddress,
      contract: "contracts/NexusExplorerBadge.sol:NexusExplorerBadge",
      constructorArguments: [initialOwner],
      // No need to pass network here - hre already has it
    })

    console.log("✅ Contract verification completed successfully")
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!")
    } else {
      console.error("❌ Verification failed:", error)
    }
  }
})

// For direct execution
async function main() {
  // When running directly, we need to set up hardhat with the network
  const hre = require("hardhat")

  // Need to run in hardhat context with correct network
  await hre.run("verify-deployed")
}

// Check if the script is being run directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
