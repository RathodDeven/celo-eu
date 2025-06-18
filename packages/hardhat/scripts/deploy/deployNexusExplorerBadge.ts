import { HardhatRuntimeEnvironment } from "hardhat/types"
import {
  deployUUPSProxy,
  upgradeUUPSProxy,
  UUPSDeploymentResult,
  UUPSUpgradeResult,
} from "../utils/deploymentUtils"

export async function deployNexusExplorerBadge(
  hre: HardhatRuntimeEnvironment,
  initialOwner: string,
  verify: boolean = true
): Promise<string> {
  console.log(` Initial Owner: ${initialOwner}`)

  const result = await deployUUPSProxy(
    hre,
    "NexusExplorerBadge",
    "contracts/NexusExplorerBadge.sol:NexusExplorerBadge",
    [initialOwner],
    verify
  )

  return result.proxyAddress
}

export async function upgradeNexusExplorerBadge(
  hre: HardhatRuntimeEnvironment,
  verify: boolean = true
): Promise<{
  proxyAddress: string
  newImplementationAddress: string
}> {
  const result = await upgradeUUPSProxy(
    hre,
    "NexusExplorerBadge",
    "contracts/NexusExplorerBadge.sol:NexusExplorerBadge",
    verify
  )

  return {
    proxyAddress: result.proxyAddress,
    newImplementationAddress: result.newImplementationAddress,
  }
}
