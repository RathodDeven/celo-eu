import { HardhatRuntimeEnvironment } from "hardhat/types"
import {
  saveDeploymentInfo,
  verifyContract,
  waitForConfirmation,
  getChainId,
  DeploymentInfo,
} from "../utils/deploymentUtils"

/**
 * Template function for deploying upgradeable contracts
 * Copy this template and modify for new contract deployments
 */
export async function deployUpgradeableContract(
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  initializerArgs: any[],
  verify: boolean = true
): Promise<string> {
  const { ethers, network } = hre
  const upgrades = (hre as any).upgrades
  const [deployer] = await ethers.getSigners()

  console.log(`🚀 Deploying ${contractName} to ${network.name}...`)
  console.log(`📝 Deployer: ${deployer.address}`)
  console.log(`🔧 Initializer Args:`, initializerArgs)

  // Deploy the upgradeable contract
  const ContractFactory = await ethers.getContractFactory(contractName)

  console.log("⏳ Deploying proxy contract...")
  const proxy = await upgrades.deployProxy(ContractFactory, initializerArgs, {
    initializer: "initialize",
    kind: "uups",
  })

  await proxy.waitForDeployment()
  const proxyAddress = await proxy.getAddress()

  console.log(`✅ Proxy deployed to: ${proxyAddress}`)

  // Get implementation address
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    proxyAddress
  )
  console.log(`📋 Implementation: ${implementationAddress}`)

  // Get admin address
  const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress)
  console.log(`🔧 Admin: ${adminAddress}`)

  // Get deployment transaction
  const deploymentTx = proxy.deploymentTransaction()
  if (!deploymentTx) {
    throw new Error("Could not get deployment transaction")
  }

  const receipt = await waitForConfirmation(deploymentTx)

  // Get contract artifact for ABI
  const artifact = await hre.artifacts.readArtifact(contractName)

  // Prepare deployment info
  const deploymentInfo: DeploymentInfo = {
    contractName,
    network: network.name,
    chainId: getChainId(network.name),
    proxyAddress,
    implementationAddress,
    adminAddress,
    deployer: deployer.address,
    deployedAt: Date.now(),
    blockNumber: receipt.blockNumber,
    transactionHash: receipt.hash,
    constructorArgs: initializerArgs,
    verified: false,
    version: "1.0.0",
  }

  // Save deployment info
  await saveDeploymentInfo(
    network.name,
    contractName,
    deploymentInfo,
    artifact.abi
  )

  // Verify contracts
  if (verify) {
    console.log("🔍 Verifying contracts...")

    // Verify implementation
    const implementationVerified = await verifyContract(
      hre,
      implementationAddress,
      `contracts/${contractName}.sol:${contractName}`,
      []
    )

    if (implementationVerified) {
      // Update deployment info with verification status
      deploymentInfo.verified = true
      await saveDeploymentInfo(
        network.name,
        contractName,
        deploymentInfo,
        artifact.abi
      )
    }
  }

  console.log(`🎉 ${contractName} deployment completed!`)
  return proxyAddress
}

/**
 * Template function for upgrading contracts
 * Copy this template and modify for contract upgrades
 */
export async function upgradeUpgradeableContract(
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  verify: boolean = true
): Promise<string> {
  const { ethers, network } = hre
  const upgrades = (hre as any).upgrades
  const [deployer] = await ethers.getSigners()

  console.log(`🔄 Upgrading ${contractName} on ${network.name}...`)
  console.log(`📝 Deployer: ${deployer.address}`)

  // Load existing deployment info
  const { loadDeploymentInfo, updateDeploymentInfo } = await import(
    "../utils/deploymentUtils"
  )
  const existingDeployment = loadDeploymentInfo(network.name, contractName)

  if (!existingDeployment) {
    throw new Error(
      `No existing deployment found for ${contractName} on ${network.name}`
    )
  }

  const proxyAddress = existingDeployment.proxyAddress
  console.log(`📍 Proxy Address: ${proxyAddress}`)

  // Deploy new implementation
  const ContractFactory = await ethers.getContractFactory(contractName)

  console.log("⏳ Upgrading contract...")
  const upgraded = await upgrades.upgradeProxy(proxyAddress, ContractFactory)

  await upgraded.waitForDeployment()

  // Get new implementation address
  const newImplementationAddress =
    await upgrades.erc1967.getImplementationAddress(proxyAddress)
  console.log(`✅ New Implementation: ${newImplementationAddress}`)

  // Update deployment info
  const updateInfo = {
    implementationAddress: newImplementationAddress,
    verified: false,
    version: `${parseFloat(existingDeployment.version) + 0.1}.0`, // Increment version
  }

  await updateDeploymentInfo(network.name, contractName, updateInfo)

  // Verify new implementation
  if (verify) {
    console.log("🔍 Verifying new implementation...")

    const implementationVerified = await verifyContract(
      hre,
      newImplementationAddress,
      `contracts/${contractName}.sol:${contractName}`,
      []
    )

    if (implementationVerified) {
      await updateDeploymentInfo(network.name, contractName, { verified: true })
    }
  }

  console.log(`🎉 ${contractName} upgrade completed!`)
  return proxyAddress
}
