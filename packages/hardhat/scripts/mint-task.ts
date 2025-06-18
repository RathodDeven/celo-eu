import { task, types } from "hardhat/config"
import { NexusExplorerBadge } from "../typechain-types"
import {
  getContractInstance,
  loadDeploymentInfo,
  Network,
} from "./utils/deploymentUtils"

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

    // Load deployment info
    const deploymentInfo = loadDeploymentInfo(network, "NexusExplorerBadge")
    if (!deploymentInfo) {
      console.error(
        `❌ No deployment found for NexusExplorerBadge on ${network}`
      )
      console.log(
        `💡 Please deploy the contract first using: npm run deploy --network ${network}`
      )
      return
    }

    const contractAddress = deploymentInfo.proxyAddress
    console.log(`📝 Using contract address: ${contractAddress}`)

    // Get recipient address from task args or use the signer
    const [signer] = await hre.ethers.getSigners()
    const recipient = taskArgs.recipient || signer.address

    console.log(`🎯 Minting to recipient: ${recipient}`)

    // Get contract instance
    const contract = await getContractInstance(
      hre,
      network,
      "NexusExplorerBadge"
    )
    if (!contract) {
      console.error("❌ Failed to get contract instance")
      return
    }

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

      // Get token ID from events
      const mintEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log)
          return parsed?.name === "ExplorerBadgeMinted"
        } catch {
          return false
        }
      })

      if (mintEvent) {
        const parsed = contract.interface.parseLog(mintEvent)
        console.log(`🎉 NFT minted with Token ID: ${parsed?.args.tokenId}`)
      }
    } else {
      console.log("⚠️ Transaction was submitted but receipt was null")
    }
  })
