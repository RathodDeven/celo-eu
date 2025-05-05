import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NexusExplorerBadgeModule = buildModule(
  "NexusExplorerBadgeModule",
  (m) => {
    const initialOwner = m.getParameter(
      "initialOwner",
      "0x1724707c52de2fa65ad9c586b5d38507f52D3c06" // Replace with your actual wallet address if needed
    );

    const explorerBadge = m.contract("NexusExplorerBadge", [initialOwner]);

    return { explorerBadge };
  }
);

export default NexusExplorerBadgeModule;
