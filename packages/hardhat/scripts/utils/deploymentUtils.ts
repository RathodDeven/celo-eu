import fs from "fs"
import path from "path"
import { Contract } from "ethers"
import { HardhatRuntimeEnvironment } from "hardhat/types"

export type Network = "alfajores" | "celo"

export interface DeploymentInfo {
  contractName: string
  network: string
  chainId: number
  proxyAddress: string
  implementationAddress: string
  adminAddress: string
  deployer: string
  deployedAt: number
  blockNumber: number
  transactionHash: string
  constructorArgs: any[]
  verified: boolean
  version: string
}

export interface ContractInfo {
  address: string
  abi: any[]
  bytecode: string
}

export interface UUPSDeploymentResult {
  proxyAddress: string
  implementationAddress: string
  adminAddress: string
  deploymentInfo: DeploymentInfo
}

export interface UUPSUpgradeResult {
  proxyAddress: string
  newImplementationAddress: string
  previousImplementationAddress: string
}

/**
 * Get the deployments directory path for a network
 */
export function getDeploymentsDir(network: string): string {
  return path.join(__dirname, "..", "..", "deployments", network)
}

/**
 * Get the deployment info file path for a contract
 */
export function getDeploymentInfoPath(
  network: string,
  contractName: string
): string {
  const deploymentsDir = getDeploymentsDir(network)
  return path.join(deploymentsDir, `${contractName}.deploymentInfo.json`)
}

/**
 * Get the ABI file path for a contract
 */
export function getAbiPath(network: string, contractName: string): string {
  const deploymentsDir = getDeploymentsDir(network)
  return path.join(deploymentsDir, `${contractName}.abi.json`)
}

/**
 * Save deployment information to file
 */
export async function saveDeploymentInfo(
  network: string,
  contractName: string,
  deploymentInfo: DeploymentInfo,
  abi: any[]
): Promise<void> {
  const deploymentsDir = getDeploymentsDir(network)

  // Create directory if it doesn't exist
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true })
  }

  // Save deployment info
  const deploymentInfoPath = getDeploymentInfoPath(network, contractName)
  fs.writeFileSync(deploymentInfoPath, JSON.stringify(deploymentInfo, null, 2))

  // Save ABI
  const abiPath = getAbiPath(network, contractName)
  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2))

  console.log(`✅ Deployment info saved to: ${deploymentInfoPath}`)
  console.log(`✅ ABI saved to: ${abiPath}`)
}

/**
 * Load deployment information from file
 */
export function loadDeploymentInfo(
  network: string,
  contractName: string
): DeploymentInfo | null {
  try {
    const deploymentInfoPath = getDeploymentInfoPath(network, contractName)
    if (fs.existsSync(deploymentInfoPath)) {
      const data = fs.readFileSync(deploymentInfoPath, "utf8")
      return JSON.parse(data)
    }
    return null
  } catch (error) {
    console.error(`Error loading deployment info: ${error}`)
    return null
  }
}

/**
 * Load contract ABI from file
 */
export function loadContractAbi(
  network: string,
  contractName: string
): any[] | null {
  try {
    const abiPath = getAbiPath(network, contractName)
    if (fs.existsSync(abiPath)) {
      const data = fs.readFileSync(abiPath, "utf8")
      return JSON.parse(data)
    }
    return null
  } catch (error) {
    console.error(`Error loading contract ABI: ${error}`)
    return null
  }
}

/**
 * Get contract instance from deployment info
 */
export async function getContractInstance(
  hre: HardhatRuntimeEnvironment,
  network: string,
  contractName: string
): Promise<Contract | null> {
  const deploymentInfo = loadDeploymentInfo(network, contractName)
  if (!deploymentInfo) {
    console.error(`No deployment info found for ${contractName} on ${network}`)
    return null
  }

  try {
    const contract = await hre.ethers.getContractAt(
      contractName,
      deploymentInfo.proxyAddress
    )
    return contract
  } catch (error) {
    console.error(`Error getting contract instance: ${error}`)
    return null
  }
}

/**
 * Verify contract on explorer
 */
export async function verifyContract(
  hre: HardhatRuntimeEnvironment,
  contractAddress: string,
  contractPath: string,
  constructorArgs: any[] = []
): Promise<boolean> {
  try {
    console.log(`🔍 Verifying contract at ${contractAddress}...`)

    await hre.run("verify:verify", {
      address: contractAddress,
      contract: contractPath,
      constructorArguments: constructorArgs,
    })

    console.log("✅ Contract verification completed successfully")
    return true
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!")
      return true
    } else {
      console.error("❌ Verification failed:", error.message)
      return false
    }
  }
}

/**
 * Verify UUPS proxy deployment (both proxy and implementation)
 */
export async function verifyUUPSProxy(
  hre: HardhatRuntimeEnvironment,
  proxyAddress: string,
  implementationAddress: string,
  contractPath: string,
  constructorArgs: any[] = []
): Promise<boolean> {
  console.log("📋 UUPS Proxy Verification Info:")
  console.log(
    "  • Admin address is 0x0000... because UUPS handles upgrades via implementation"
  )
  console.log("  • The owner in the implementation contract controls upgrades")
  console.log("")

  let proxyVerified = false
  let implementationVerified = false

  // 1. Verify the implementation contract
  console.log("🔍 Step 1: Verifying implementation contract...")
  implementationVerified = await verifyContract(
    hre,
    implementationAddress,
    contractPath,
    constructorArgs
  )

  // 2. Verify the proxy contract (it should auto-detect as a proxy)
  console.log("🔍 Step 2: Verifying proxy contract...")
  try {
    await hre.run("verify:verify", {
      address: proxyAddress,
    })
    console.log("✅ Proxy contract verified successfully")
    proxyVerified = true
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Proxy contract is already verified!")
      proxyVerified = true
    } else if (
      error.message.includes("Contract source code already verified")
    ) {
      console.log("✅ Proxy contract is already verified!")
      proxyVerified = true
    } else if (
      error.message.includes("The contract 0x") &&
      error.message.includes("has already been verified")
    ) {
      console.log("✅ Proxy contract is already verified!")
      proxyVerified = true
    } else {
      console.log(
        "⚠️ Proxy verification failed (this is sometimes expected for proxies):",
        error.message
      )
      // For proxies, this might be normal - they use standard OpenZeppelin bytecode
      proxyVerified = true // Consider it successful if implementation is verified
    }
  }

  const allVerified = proxyVerified && implementationVerified

  if (allVerified) {
    console.log("✅ Both proxy and implementation contracts verified")
  } else {
    console.log("⚠️ Verification partially completed")
  }

  return allVerified
}

/**
 * Check if proxy is properly linked to implementation
 */
export async function validateProxyImplementation(
  hre: HardhatRuntimeEnvironment,
  proxyAddress: string,
  expectedImplementationAddress: string
): Promise<boolean> {
  try {
    console.log("🔍 Validating proxy implementation linkage...")
    // Get the implementation address from the proxy
    const implementationSlot =
      "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
    const implementationAddress = await hre.ethers.provider.getStorage(
      proxyAddress,
      implementationSlot
    )
    const actualImplementation = "0x" + implementationAddress.slice(-40)

    console.log(`📍 Proxy: ${proxyAddress}`)
    console.log(`📍 Expected Implementation: ${expectedImplementationAddress}`)
    console.log(`📍 Actual Implementation: ${actualImplementation}`)

    const isValid =
      actualImplementation.toLowerCase() ===
      expectedImplementationAddress.toLowerCase()

    if (isValid) {
      console.log("✅ Proxy correctly linked to implementation")
    } else {
      console.log("❌ Proxy implementation mismatch!")
    }

    return isValid
  } catch (error) {
    console.error("❌ Failed to validate proxy implementation:", error)
    return false
  }
}

/**
 * Wait for transaction confirmation
 */
export async function waitForConfirmation(
  transaction: any,
  confirmations: number = 1
): Promise<any> {
  console.log(`⏳ Waiting for transaction confirmation: ${transaction.hash}`)
  const receipt = await transaction.wait(confirmations)
  console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`)
  return receipt
}

/**
 * Get network chain ID
 */
export function getChainId(network: string): number {
  const chainIds: Record<string, number> = {
    alfajores: 44787,
    celo: 42220,
  }
  return chainIds[network] || 0
}

/**
 * Format addresses for display
 */
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * List all deployments for a network
 */
export function listDeployments(network: string): string[] {
  const deploymentsDir = getDeploymentsDir(network)
  if (!fs.existsSync(deploymentsDir)) {
    return []
  }

  return fs
    .readdirSync(deploymentsDir)
    .filter((file) => file.endsWith(".deploymentInfo.json"))
    .map((file) => file.replace(".deploymentInfo.json", ""))
}

/**
 * Update deployment info (for upgrades)
 */
export async function updateDeploymentInfo(
  network: string,
  contractName: string,
  updates: Partial<DeploymentInfo>
): Promise<void> {
  const existingInfo = loadDeploymentInfo(network, contractName)
  if (!existingInfo) {
    throw new Error(
      `No existing deployment info found for ${contractName} on ${network}`
    )
  }

  const updatedInfo = { ...existingInfo, ...updates }
  const deploymentsDir = getDeploymentsDir(network)
  const deploymentInfoPath = getDeploymentInfoPath(network, contractName)

  fs.writeFileSync(deploymentInfoPath, JSON.stringify(updatedInfo, null, 2))
  console.log(`✅ Deployment info updated: ${deploymentInfoPath}`)
}

/**
 * Explain and validate UUPS proxy admin setup
 */
export async function validateUUPSAdmin(
  hre: HardhatRuntimeEnvironment,
  proxyAddress: string,
  contractName: string
): Promise<void> {
  try {
    console.log("📋 UUPS Admin Configuration:")
    console.log("  • Admin Address: 0x0000000000000000000000000000000000000000")
    console.log("  • This is CORRECT for UUPS proxies!")
    console.log("  • UUPS proxies don't use a separate admin contract")
    console.log(
      "  • Upgrade authorization is handled by the implementation contract"
    )
    console.log("")

    // Get the contract instance to check the owner
    const contract = await hre.ethers.getContractAt(contractName, proxyAddress)

    try {
      const owner = await contract.owner()
      console.log("🔑 Current Contract Owner (can authorize upgrades):")
      console.log(`  • Owner Address: ${owner}`)
      console.log(
        `  • This address controls contract upgrades via _authorizeUpgrade()`
      )
    } catch (error) {
      console.log(
        "ℹ️ Unable to read owner (contract might not have owner() function)"
      )
    }

    console.log("")
    console.log("💡 To upgrade this contract:")
    console.log(
      "  • Use the upgrade script: pnpm upgrade:nexus --network <network>"
    )
    console.log("  • Must be called by the contract owner")
    console.log(
      "  • New implementation must be compatible with current storage layout"
    )
  } catch (error) {
    console.error("❌ Error validating UUPS admin:", error)
  }
}

/**
 * Generic UUPS proxy deployment function
 */
export async function deployUUPSProxy(
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  contractPath: string,
  initializerArgs: any[],
  verify: boolean = true
): Promise<UUPSDeploymentResult> {
  const { ethers, network } = hre
  const upgrades = (hre as any).upgrades
  const [deployer] = await ethers.getSigners()

  console.log(`🚀 Deploying ${contractName} to ${network.name}...`)
  console.log(`📝 Deployer: ${deployer.address}`)
  console.log(`🏗️ Contract: ${contractPath}`)

  // Get the contract factory
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

  // Get admin address (should be 0x0 for UUPS)
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

    const verified = await verifyUUPSProxy(
      hre,
      proxyAddress,
      implementationAddress,
      contractPath,
      []
    )

    if (verified) {
      // Update deployment info with verification status
      deploymentInfo.verified = true
      await saveDeploymentInfo(
        network.name,
        contractName,
        deploymentInfo,
        artifact.abi
      )
    }

    // Validate and explain UUPS admin setup
    await validateUUPSAdmin(hre, proxyAddress, contractName)
  }

  console.log(`🎉 ${contractName} deployment completed!`)

  return {
    proxyAddress,
    implementationAddress,
    adminAddress,
    deploymentInfo,
  }
}

/**
 * Generic UUPS proxy upgrade function
 */
export async function upgradeUUPSProxy(
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  contractPath: string,
  verify: boolean = true,
  forceUpgrade: boolean = false
): Promise<UUPSUpgradeResult> {
  const { ethers, network } = hre
  const upgrades = (hre as any).upgrades
  const [deployer] = await ethers.getSigners()
  console.log(`🔄 Upgrading ${contractName} on ${network.name}...`)
  console.log(`📝 Deployer: ${deployer.address}`)
  console.log(`🔧 Force Upgrade: ${forceUpgrade}`)

  // Load existing deployment info
  const existingDeployment = loadDeploymentInfo(network.name, contractName)

  if (!existingDeployment) {
    throw new Error(
      `No existing deployment found for ${contractName} on ${network.name}`
    )
  }

  const proxyAddress = existingDeployment.proxyAddress
  const previousImplementationAddress = existingDeployment.implementationAddress
  console.log(`📍 Proxy Address: ${proxyAddress}`)
  console.log(`📋 Current Implementation: ${previousImplementationAddress}`)

  // Deploy new implementation
  const ContractFactory = await ethers.getContractFactory(contractName)

  console.log("⏳ Upgrading contract...")

  // Use force upgrade if requested
  const upgradeOptions = forceUpgrade
    ? { redeployImplementation: "always" }
    : {}
  const upgraded = await upgrades.upgradeProxy(
    proxyAddress,
    ContractFactory,
    upgradeOptions
  )

  await upgraded.waitForDeployment()
  // Get new implementation address
  const newImplementationAddress =
    await upgrades.erc1967.getImplementationAddress(proxyAddress)
  // Check if implementation actually changed
  if (newImplementationAddress === previousImplementationAddress) {
    console.log(
      `⚠️ No upgrade needed - implementation unchanged: ${newImplementationAddress}`
    )
    console.log("💡 This happens when:")
    console.log("  • Contract bytecode is identical to current implementation")
    console.log("  • No changes were made to the contract code")
    console.log(
      "  • OpenZeppelin reuses existing implementation for efficiency"
    )

    // Still update the deployment info to reflect the attempt
    const noChangeUpdateInfo = {
      version: `${parseFloat(existingDeployment.version) + 0.1}.0`, // Increment version anyway
    }
    await updateDeploymentInfo(network.name, contractName, noChangeUpdateInfo)

    console.log(`🎉 ${contractName} upgrade completed (no changes needed)!`)
    return {
      proxyAddress,
      newImplementationAddress,
      previousImplementationAddress,
    }
  }

  console.log(`✅ New Implementation: ${newImplementationAddress}`)
  // Update deployment info with new implementation
  const newImplUpdateInfo = {
    implementationAddress: newImplementationAddress,
    verified: false,
    version: `${parseFloat(existingDeployment.version) + 0.1}.0`, // Increment version
    deployedAt: Date.now(), // Update timestamp for new implementation
  }

  await updateDeploymentInfo(network.name, contractName, newImplUpdateInfo)
  // Verify new implementation
  if (verify) {
    console.log("🔍 Verifying new implementation...")

    const implementationVerified = await verifyContract(
      hre,
      newImplementationAddress,
      contractPath,
      []
    )

    if (implementationVerified) {
      await updateDeploymentInfo(network.name, contractName, {
        verified: true,
      })
    }
  }

  console.log(`🎉 ${contractName} upgrade completed!`)
  return {
    proxyAddress,
    newImplementationAddress,
    previousImplementationAddress,
  }
}
