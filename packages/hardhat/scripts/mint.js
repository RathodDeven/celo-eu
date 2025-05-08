const hre = require("hardhat");

async function main() {
  const contractAddress = "0x2dF325EC716915A7d940a10B48bd8E5e56ef9c9E"; // Update to latest
  const [deployer] = await hre.ethers.getSigners();

  const contract = await hre.ethers.getContractAt("NexusExplorerBadge", contractAddress, deployer);

  const tx = await contract.mintExplorerBadge("0x3470f73B82C557eD90Fd07D9aE8b3e276af97Df1");
  console.log("📤 Mint transaction sent:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ Mint confirmed in block", receipt.blockNumber);
}

main().catch((error) => {
  console.error("❌ Error in script:", error);
  process.exitCode = 1;
});
