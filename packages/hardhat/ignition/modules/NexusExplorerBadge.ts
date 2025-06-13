import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"

// Remove the problematic import and use a more generic type annotation
const NexusExplorerBadgeModule = buildModule(
  "NexusExplorerBadgeModule",
  (m) => {
    // We can't use getContext() to access ethers directly in the module builder
    // Instead, use a parameter with a default value from env
    const initialOwner = m.getParameter(
      "initialOwner",
      process.env.DEPLOYER_ADDRESS ||
        "0xB522133dBd9C8B424429D89d821aeb2a115dB678"
    )

    const explorerBadge = m.contract("NexusExplorerBadge", [initialOwner], {
      verify: true,
    })

    return { explorerBadge }
  }
)

export default NexusExplorerBadgeModule
