# Hardhat Development Guide

This guide provides instructions for developing, deploying, and interacting with the Nexus Explorer Badge smart contract using Hardhat and Ignition.

## Prerequisites

- Node.js (v18+)
- pnpm (v10.12.1+)
- A Celo wallet with testnet (Alfajores) or mainnet tokens

## Setup

1. Clone the repository and navigate to the project root:

```bash
git clone <repository-url>
cd celo-eu
```

2. Install dependencies using pnpm:

```bash
pnpm install
```

3. Create `.env` file in the `packages/hardhat` directory:

```bash
cp packages/hardhat/example.env packages/hardhat/.env
```

4. Configure your `.env` file with required parameters:
   - `PRIVATE_KEY`: Your Ethereum/Celo account private key (without 0x prefix). This account must have:
     - Enough CELO tokens for gas fees
     - Tokens to pay for contract deployment
     - Will be set as the default contract owner
   - `CELOSCAN_API_KEY`: API key from [https://celoscan.io/apidashboard](https://celoscan.io/apidashboard) for contract verification
   - `DEPLOYER_ADDRESS`: The address that will be used as the default initialOwner for deployed contracts

## Compilation

Compile the smart contracts:

```bash
# From root directory
pnpm hardhat:compile

# Or from packages/hardhat directory
cd packages/hardhat
pnpm compile
```

## Clean Build

To clean and rebuild the project:

```bash
# From packages/hardhat directory
pnpm clean
pnpm build
```

## Deployment with Ignition

Deploy the smart contract to a network (alfajores or celo):

```bash
# From packages/hardhat directory
pnpm hardhat ignition deploy ./ignition/modules/NexusExplorerBadge.ts --network alfajores --parameters '{"initialOwner": "0xYourDesiredOwnerAddress"}'
```

If you don't specify the initialOwner parameter, the deployment will use the address derived from your `PRIVATE_KEY` as both the deployer and contract owner.

## Contract Verification

After deployment, verify your contract on Celoscan:

```bash
# From packages/hardhat directory
pnpm hardhat verify-contract --network alfajores
```

Parameters:

- `--network`: The target network (`alfajores` for testnet, `celo` for mainnet)

## Minting Badges

Mint a Nexus Explorer Badge to your account or another address:

```bash
# Self-mint (using the account from PRIVATE_KEY)
pnpm hardhat mint --network alfajores

# Mint to a specific address (requires owner privileges)
pnpm hardhat mint --recipient 0xYourRecipientAddressHere --network alfajores
```

Parameters:

- `--network`: The target network (`alfajores` for testnet, `celo` for mainnet)
- `--recipient`: (Optional) The address that will receive the minted NFT
