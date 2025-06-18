# Upgradeable Smart Contract System

This document explains the new upgradeable contract system implemented for the Celo EU project.

## Overview

We've migrated from using Hardhat Ignition to a custom upgradeable deployment system using OpenZeppelin's UUPS (Universal Upgradeable Proxy Standard) proxy pattern. This provides several benefits:

- **Contract Upgradeability**: Update contract logic while preserving state and address
- **Better Organization**: Structured deployment info and ABI management
- **Reusability**: Template system for deploying future contracts
- **Network Management**: Organized deployment tracking per network

## Key Components

### 1. Upgradeable Contract (`NexusExplorerBadge.sol`)

The contract now inherits from OpenZeppelin's upgradeable variants:

- Uses `initialize()` instead of `constructor()`
- Implements UUPS upgrade pattern
- Maintains all original functionality

### 2. Deployment Utils (`scripts/utils/deploymentUtils.ts`)

Common utilities for:

- Saving/loading deployment information
- Contract verification
- ABI management
- Network utilities

### 3. Deployment Scripts

- `deploy-nexus-badge.ts`: Deploy new contract instances
- `upgrade-nexus-badge.ts`: Upgrade existing contracts
- `templates/upgradeableContractTemplate.ts`: Template for future contracts

### 4. Enhanced Tasks

- `mint`: Automatically uses deployed contract address
- `deployments`: List all deployments on current network
- `deployment-info`: Get detailed deployment information

## Directory Structure

```
packages/hardhat/
├── deployments/              # Deployment information
│   ├── alfajores/
│   │   ├── NexusExplorerBadge.deploymentInfo.json
│   │   └── NexusExplorerBadge.abi.json
│   └── celo/
│       ├── NexusExplorerBadge.deploymentInfo.json
│       └── NexusExplorerBadge.abi.json
├── scripts/
│   ├── utils/
│   │   └── deploymentUtils.ts
│   ├── deploy/
│   │   ├── deploy-nexus-badge.ts        # Deploy script using generic utilities
│   │   ├── upgrade-nexus-badge.ts       # Upgrade script using generic utilities
│   ├── templates/
│   │   └── upgradeableContractTemplate.ts
│   ├── deploy-nexus-badge.ts
│   ├── upgrade-nexus-badge.ts
│   └── demo.ts
└── contracts/
    └── NexusExplorerBadge.sol  # Now upgradeable
```

## Quick Start

### 1. Deploy a New Contract

```bash
# Deploy to Alfajores testnet
pnpm deploy:nexus --network alfajores

# Deploy to Celo mainnet
pnpm deploy:nexus --network celo
```

### 2. Upgrade an Existing Contract

```bash
# Upgrade on Alfajores
pnpm upgrade:nexus --network alfajores

# Upgrade on Celo mainnet
pnpm upgrade:nexus --network celo
```

### 3. View Deployments

```bash
# List all deployments
pnpm deployments --network alfajores

# Get specific contract info
pnpm deployment-info --contract NexusExplorerBadge --network alfajores
```

### 4. Mint Badges

```bash
# Mint to yourself
npx hardhat mint --network alfajores

# Mint to specific address (owner only)
npx hardhat mint --recipient 0x... --network alfajores
```

## Deployment Information Structure

Each deployment creates comprehensive metadata:

```json
{
  "contractName": "NexusExplorerBadge",
  "network": "alfajores",
  "chainId": 44787,
  "proxyAddress": "0x...", // Use this for interactions
  "implementationAddress": "0x...", // Current implementation
  "adminAddress": "0x...", // Proxy admin
  "deployer": "0x...", // Deployer address
  "deployedAt": 1671234567890, // Timestamp
  "blockNumber": 12345678, // Block number
  "transactionHash": "0x...", // Deploy tx hash
  "constructorArgs": ["0x..."], // Initialize arguments
  "verified": true, // Verification status
  "version": "1.0.0" // Contract version
}
```

## Frontend Integration

Use the generated files for frontend integration:

```typescript
// Load deployment info
import deploymentInfo from "./deployments/alfajores/NexusExplorerBadge.deploymentInfo.json"
import contractAbi from "./deployments/alfajores/NexusExplorerBadge.abi.json"

// Use proxy address for all interactions
const contractAddress = deploymentInfo.proxyAddress
const contract = new ethers.Contract(contractAddress, contractAbi, signer)
```

## Adding New Contracts

To add a new upgradeable contract (e.g., ContributorPass):

### 1. Create the Contract

```solidity
// contracts/ContributorPass.sol
import "@openzeppelin/contracts-upgradeable/...";

contract ContributorPass is
    Initializable,
    ERC721Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __ERC721_init("Contributor Pass", "CP");
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
```

### 2. Create Deployment Scripts

Copy and modify the template:

```typescript
// scripts/deploy/deployContributorPass.ts
import {
  deployUpgradeableContract,
  upgradeUpgradeableContract,
} from "../templates/upgradeableContractTemplate"

export async function deployContributorPass(hre, initialOwner, verify = true) {
  return deployUpgradeableContract(
    hre,
    "ContributorPass",
    [initialOwner],
    verify
  )
}

export async function upgradeContributorPass(hre, verify = true) {
  return upgradeUpgradeableContract(hre, "ContributorPass", verify)
}
```

### 3. Create CLI Scripts

```typescript
// scripts/deploy-contributor-pass.ts
import { deployContributorPass } from "./deploy/deployContributorPass"
// ... similar to deploy-nexus-badge.ts
```

### 4. Add Package Scripts

```json
{
  "scripts": {
    "deploy:contributor": "hardhat run scripts/deploy-contributor-pass.ts",
    "upgrade:contributor": "hardhat run scripts/upgrade-contributor-pass.ts"
  }
}
```

## Best Practices

### 1. Storage Layout Compatibility

When upgrading contracts, ensure storage layout compatibility:

```solidity
// ✅ Safe: Adding new variables at the end
contract V2 {
    uint256 existingVar;    // Keep existing
    string newVar;          // Add new at end
}

// ❌ Unsafe: Changing existing variable types/order
contract V2 {
    string existingVar;     // Changed type - BAD!
    uint256 newVar;         // Inserted in middle - BAD!
}
```

### 2. Testing Upgrades

Always test upgrades on testnets first:

```bash
# Deploy V1 on testnet
pnpm deploy:nexus --network alfajores

# Test V1 functionality
npx hardhat mint --network alfajores

# Upgrade to V2
pnpm upgrade:nexus --network alfajores

# Test V2 functionality
# Verify existing state is preserved
```

### 3. Version Management

Use semantic versioning in deployment info:

- Major version: Breaking changes requiring migration
- Minor version: New features, backward compatible
- Patch version: Bug fixes

### 4. Security Considerations

- Keep deployer private key secure (controls upgrades)
- Use multisig for mainnet deployments
- Implement timelock for critical upgrades
- Consider using OpenZeppelin Defender for upgrade management

## Migration from Ignition

The old Ignition-based deployment system has been replaced. To migrate:

1. **Remove Ignition Dependencies**: Old `ignition/` folder and related files
2. **Use New Scripts**: Replace `ignition deploy` with `pnpm deploy:nexus`
3. **Update Frontend**: Use new deployment info files instead of Ignition artifacts
4. **Update CI/CD**: Use new deployment commands

## Troubleshooting

### Common Issues

1. **"No deployment found"**

   - Ensure contract was deployed to correct network
   - Check `deployments/<network>/` directory exists

2. **"Storage layout incompatible"**

   - Review storage layout changes
   - Use OpenZeppelin's upgrade safety checks

3. **"Not authorized to upgrade"**
   - Ensure you're using the correct deployer account
   - Check contract ownership

### Getting Help

- Check deployment status: `pnpm deployments --network <network>`
- View contract details: `pnpm deployment-info --contract <name> --network <network>`
- Run demo script: `npx hardhat run scripts/demo.ts --network alfajores`

## Resources

- [OpenZeppelin Upgrades Documentation](https://docs.openzeppelin.com/upgrades-plugins/1.x/)
- [UUPS Proxy Pattern](https://docs.openzeppelin.com/contracts/4.x/api/proxy#UUPSUpgradeable)
- [Writing Upgradeable Contracts](https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable)
