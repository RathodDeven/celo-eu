import { task, types } from "hardhat/config"
import { NexusExplorerBadge } from "../typechain-types"
import { getDeployedAddress, Network } from "./getDeployedAddress"

task("mint", "Mint a Nexus Explorer Badge")
  .addOptionalParam(
    "recipient",
    "The address that will receive the minted NFT",
    undefined,
    types.string
  )
  .setAction(async (taskArgs, hre) => {
    const network = hre.network.name as Network
    console.log(`🌐 Using network: ${network}`)

    // Get contract address from ignition deployments using shared function
    const contractAddress = await getDeployedAddress(network)
    console.log(`📝 Using contract address: ${contractAddress}`)

    // Get recipient address from task args or use the signer
    const [signer] = await hre.ethers.getSigners()
    const recipient = taskArgs.recipient || signer.address

    console.log(`🎯 Minting to recipient: ${recipient}`)

    // Get contract instance with explicit typing
    const contract = (await hre.ethers.getContractAt(
      "NexusExplorerBadge",
      contractAddress
    )) as unknown as NexusExplorerBadge

    // Mint the NFT with explicit function calls
    let tx
    if (taskArgs.recipient && recipient !== signer.address) {
      // For minting to another address (requires owner privileges)
      tx = await contract["mintExplorerBadge(address)"](recipient)
      console.log("📤 Minting as owner to recipient:", tx.hash)
    } else {
      // For self-minting
      tx = await contract["mintExplorerBadge()"]()
      console.log("📤 Self-minting transaction sent:", tx.hash)
    }

    const receipt = await tx.wait()
    if (receipt) {
      console.log("✅ Mint confirmed in block", receipt.blockNumber)
    } else {
      console.log("⚠️ Transaction was submitted but receipt was null")
    }
  })
