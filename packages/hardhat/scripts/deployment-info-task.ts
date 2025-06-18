import { task } from "hardhat/config"
import {
  listDeployments,
  loadDeploymentInfo,
  formatAddress,
} from "./utils/deploymentUtils"

task(
  "deployments",
  "List all contract deployments for the current network"
).setAction(async (taskArgs, hre) => {
  const network = hre.network.name
  console.log(`📋 Deployments on ${network}:`)
  console.log("=".repeat(50))

  const deployments = listDeployments(network)

  if (deployments.length === 0) {
    console.log("📭 No deployments found on this network")
    return
  }

  for (const contractName of deployments) {
    const deploymentInfo = loadDeploymentInfo(network, contractName)
    if (deploymentInfo) {
      console.log(`\n📝 ${contractName}`)
      console.log(`   Proxy:          ${deploymentInfo.proxyAddress}`)
      console.log(
        `   Implementation: ${formatAddress(
          deploymentInfo.implementationAddress
        )}`
      )
      console.log(
        `   Admin:          ${formatAddress(deploymentInfo.adminAddress)}`
      )
      console.log(
        `   Deployer:       ${formatAddress(deploymentInfo.deployer)}`
      )
      console.log(`   Version:        ${deploymentInfo.version}`)
      console.log(`   Verified:       ${deploymentInfo.verified ? "✅" : "❌"}`)
      console.log(
        `   Deployed:       ${new Date(
          deploymentInfo.deployedAt
        ).toLocaleString()}`
      )
    }
  }

  console.log("\n" + "=".repeat(50))
  console.log(`Total deployments: ${deployments.length}`)
})

task(
  "deployment-info",
  "Get detailed info about a specific contract deployment"
)
  .addParam("contract", "The contract name to get info for")
  .setAction(async (taskArgs, hre) => {
    const network = hre.network.name
    const contractName = taskArgs.contract

    console.log(`📋 Deployment info for ${contractName} on ${network}:`)
    console.log("=".repeat(50))

    const deploymentInfo = loadDeploymentInfo(network, contractName)

    if (!deploymentInfo) {
      console.log(`❌ No deployment found for ${contractName} on ${network}`)
      return
    }

    console.log(JSON.stringify(deploymentInfo, null, 2))
  })
