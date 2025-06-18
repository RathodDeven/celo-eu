# Hardhat Development Guide

This guide provides instructions for developing, deploying, and interacting with upgradeable smart contracts using Hardhat and OpenZeppelin's UUPS proxy pattern.

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

## Upgradeable Contract System

All contracts are now deployed using OpenZeppelin's UUPS (Universal Upgradeable Proxy Standard) pattern, which provides:

- **Upgradeability**: Contracts can be upgraded while preserving state and address
- **Security**: Only authorized accounts can perform upgrades
- **Gas Efficiency**: Proxy overhead is minimal
- **Compatibility**: Works seamlessly with existing tooling

### Deployment Structure

Deployments are organized in the following structure:

```
packages/hardhat/deployments/
├── alfajores/
│   ├── NexusExplorerBadge.deploymentInfo.json
│   └── NexusExplorerBadge.abi.json
└── celo/
    ├── NexusExplorerBadge.deploymentInfo.json
    └── NexusExplorerBadge.abi.json
```

Each deployment includes:

- **deploymentInfo.json**: Complete deployment metadata including proxy address, implementation address, deployer, version, etc.
- **abi.json**: Contract ABI for frontend integration

## Deployment Commands

### Deploy New Contract

Deploy the Nexus Explorer Badge contract:

```bash
# Deploy to Alfajores testnet
pnpm deploy:nexus --network alfajores

# Deploy to Celo mainnet
pnpm deploy:nexus --network celo

# Deploy with custom owner
pnpm deploy:nexus --network alfajores --owner 0xYourOwnerAddress

# Deploy without verification
pnpm deploy:nexus --network alfajores --no-verify
```

### Upgrade Existing Contract

Upgrade an already deployed contract:

```bash
# Upgrade on Alfajores testnet
pnpm upgrade:nexus --network alfajores

# Upgrade on Celo mainnet
pnpm upgrade:nexus --network celo

# Upgrade without verification
pnpm upgrade:nexus --network alfajores --no-verify
```

### Alternative Deployment Methods

You can also use hardhat run directly:

```bash
# Deploy
npx hardhat run scripts/deploy-nexus-badge.ts --network alfajores

# Upgrade
npx hardhat run scripts/upgrade-nexus-badge.ts --network alfajores
```

## Deployment Management

### List All Deployments

View all deployed contracts on the current network:

```bash
# List deployments on current network
pnpm deployments --network alfajores

# Or using hardhat directly
npx hardhat deployments --network alfajores
```

### Get Deployment Details

Get detailed information about a specific contract:

```bash
# Get deployment info
pnpm deployment-info --contract NexusExplorerBadge --network alfajores

# Or using hardhat directly
npx hardhat deployment-info --contract NexusExplorerBadge --network alfajores
```

## Minting Badges

Mint a Nexus Explorer Badge to your account or another address:

```bash
# Self-mint (using the account from PRIVATE_KEY)
npx hardhat mint --network alfajores

# Mint to a specific address (requires owner privileges)
npx hardhat mint --recipient 0xYourRecipientAddressHere --network alfajores
```

The mint task automatically uses the deployed contract address from the deployment info.

## Contract Verification

Contracts are automatically verified during deployment. If verification fails or you need to verify manually:

- Implementation contracts are verified automatically
- Proxy contracts don't need separate verification as they use standard OpenZeppelin proxy bytecode

## Developing New Upgradeable Contracts

When creating new upgradeable contracts:

1. **Use the Template**: Copy `scripts/templates/upgradeableContractTemplate.ts` and modify for your contract
2. **Follow Upgradeable Patterns**:

   - Inherit from OpenZeppelin's upgradeable contracts
   - Use `initialize()` instead of `constructor()`
   - Add `_authorizeUpgrade()` function for UUPS
   - Add `_disableInitializers()` in constructor

3. **Example Contract Structure**:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract YourContract is
    Initializable,
    ERC721Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __ERC721_init("Your Contract", "YC");
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
```

## Deployment Info Structure

Each deployment creates a comprehensive info file:

```json
{
  "contractName": "NexusExplorerBadge",
  "network": "alfajores",
  "chainId": 44787,
  "proxyAddress": "0x...",
  "implementationAddress": "0x...",
  "adminAddress": "0x...",
  "deployer": "0x...",
  "deployedAt": 1671234567890,
  "blockNumber": 12345678,
  "transactionHash": "0x...",
  "constructorArgs": ["0x..."],
  "verified": true,
  "version": "1.0.0"
}
```

## Troubleshooting

### Common Issues

1. **"No deployment found"**: Ensure the contract was deployed to the correct network
2. **"Upgrade failed"**: Check that you're the contract owner and the new implementation is compatible
3. **"Verification failed"**: Check that CELOSCAN_API_KEY is set correctly

### Getting Help

- Check deployment info: `pnpm deployments --network <network>`
- View contract details: `pnpm deployment-info --contract <name> --network <network>`
- Verify network connection: Ensure you're using the correct network flag

## Security Considerations

- **Owner Key Security**: Keep your private key secure as it controls contract upgrades
- **Upgrade Testing**: Always test upgrades on testnets first
- **State Compatibility**: Ensure new contract versions are storage-compatible with previous versions
- **Access Controls**: Verify that only authorized accounts can trigger upgrades
