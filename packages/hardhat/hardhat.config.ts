import "@nomicfoundation/hardhat-toolbox"
import "@nomicfoundation/hardhat-verify"
import { config as dotEnvConfig } from "dotenv"
dotEnvConfig()

import { HardhatUserConfig } from "hardhat/config"
import { ethers } from "ethers"

// If PRIVATE_KEY is available, derive the address and set it as DEPLOYER_ADDRESS
if (process.env.PRIVATE_KEY) {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY)
  process.env.DEPLOYER_ADDRESS = wallet.address
}

// Import your custom task definition
import "./scripts/verify-contract"
import "./scripts/mint-task"

const config: HardhatUserConfig = {
  networks: {
    alfajores: {
      accounts: [process.env.PRIVATE_KEY ?? "0x0"],
      url: "https://alfajores-forno.celo-testnet.org",
    },
    celo: {
      accounts: [process.env.PRIVATE_KEY ?? "0x0"],
      url: "https://forno.celo.org",
    },
  },
  etherscan: {
    apiKey: {
      alfajores: process.env.CELOSCAN_API_KEY ?? "",
      celo: process.env.CELOSCAN_API_KEY ?? "",
    },
    customChains: [
      {
        chainId: 44_787,
        network: "alfajores",
        urls: {
          apiURL: "https://api-alfajores.celoscan.io/api",
          browserURL: "https://alfajores.celoscan.io",
        },
      },
      {
        chainId: 42_220,
        network: "celo",
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io/",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
  solidity: "0.8.24", // Or your specific version
}

export default config
