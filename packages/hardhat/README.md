# UUPS Proxy Deployment and Upgrade Utilities

This directory contains generic utilities for deploying and upgrading UUPS (Universal Upgradeable Proxy Standard) proxy contracts. These utilities have been extracted from the NexusExplorerBadge deployment scripts to be reusable for any UUPS proxy contract.

## Quick Start

For a complete development guide including setup, environment configuration, and troubleshooting, see the [Hardhat Development Guide](../docs/HARDHAT_DEV.md).

### Prerequisites

- Node.js (v18+)
- pnpm (v10.12.1+)
- A Celo wallet with testnet (Alfajores) or mainnet tokens

### Environment Setup

1. **Install Dependencies**:

   ```bash
   # From root directory
   pnpm install
   ```

2. **Configure Environment**:

   ```bash
   # Copy example environment file
   cp packages/hardhat/example.env packages/hardhat/.env

   # Edit .env file with your values:
   # PRIVATE_KEY=your_private_key_without_0x_prefix
   # CELOSCAN_API_KEY=your_celoscan_api_key
   # DEPLOYER_ADDRESS=your_deployer_address
   ```

   **Required Environment Variables:**

   - `PRIVATE_KEY`: Your Ethereum/Celo account private key (without 0x prefix). This account must have:
     - Enough CELO tokens for gas fees
     - Tokens to pay for contract deployment
     - Will be set as the default contract owner
   - `CELOSCAN_API_KEY`: API key from [https://celoscan.io/apidashboard](https://celoscan.io/apidashboard) for contract verification
   - `DEPLOYER_ADDRESS`: The address that will be used as the default initialOwner for deployed contracts

3. **Compile Contracts**:

   ```bash
   # From root directory
   pnpm hardhat:compile

   # Or from packages/hardhat directory
   cd packages/hardhat
   pnpm compile
   ```

4. **Clean Build** (if needed):
   ```bash
   # From packages/hardhat directory
   pnpm clean
   pnpm build
   ```

### Supported Networks

- **alfajores**: Celo Testnet (Chain ID: 44787)
- **celo**: Celo Mainnet (Chain ID: 42220)

### Deployment Structure

Deployments are organized in the following structure:

```
packages/hardhat/deployments/
├── alfajores/
│   ├── NexusExplorerBadge.deploymentInfo.json
│   ├── NexusExplorerBadge.abi.json
│   ├── ContributorPass.deploymentInfo.json
│   └── ContributorPass.abi.json
└── celo/
    ├── NexusExplorerBadge.deploymentInfo.json
    ├── NexusExplorerBadge.abi.json
    ├── ContributorPass.deploymentInfo.json
    └── ContributorPass.abi.json
```

Each deployment includes:

- **deploymentInfo.json**: Complete deployment metadata including proxy address, implementation address, deployer, version, etc.
- **abi.json**: Contract ABI for frontend integration

## Available Contracts

Currently supported contracts:

- **NexusExplorerBadge**: ERC721 NFT badge with referral tracking
- **ContributorPass**: Soulbound ERC721 pass with role-based access control and CELO rewards

## Upgradeable Contract System

All contracts are deployed using OpenZeppelin's UUPS (Universal Upgradeable Proxy Standard) pattern, which provides:

- **Upgradeability**: Contracts can be upgraded while preserving state and address
- **Security**: Only authorized accounts can perform upgrades
- **Gas Efficiency**: Proxy overhead is minimal
- **Compatibility**: Works seamlessly with existing tooling

## Key Features

- ✅ **Generic UUPS deployment** - Deploy any UUPS proxy contract
- ✅ **Generic UUPS upgrade** - Upgrade any existing UUPS proxy
- ✅ **Automatic verification** - Verify both proxy and implementation contracts
- ✅ **Deployment tracking** - Save deployment info and ABIs automatically
- ✅ **Network validation** - Ensure you're deploying to the correct network
- ✅ **UUPS admin validation** - Explain and validate UUPS proxy configuration

## Core Functions

### `deployUUPSProxy`

Generic function to deploy any UUPS proxy contract.

```typescript
import { deployUUPSProxy } from "./utils/deploymentUtils"

const result = await deployUUPSProxy(
  hre, // HardhatRuntimeEnvironment
  "MyContract", // Contract name
  "contracts/MyContract.sol:MyContract", // Contract path
  [arg1, arg2], // Initializer arguments
  true // Verify contract (optional, default: true)
)

console.log("Proxy deployed to:", result.proxyAddress)
```

### `upgradeUUPSProxy`

Generic function to upgrade any existing UUPS proxy contract.

```typescript
import { upgradeUUPSProxy } from "./utils/deploymentUtils"

const result = await upgradeUUPSProxy(
  hre, // HardhatRuntimeEnvironment
  "MyContract", // Contract name
  "contracts/MyContract.sol:MyContract", // Contract path
  true // Verify contract (optional, default: true)
)

console.log("New implementation:", result.newImplementationAddress)
```

## Contract Deployment Scripts

### NexusExplorerBadge Deployment

Deploy the Nexus Explorer Badge contract:

```bash
# Using pnpm scripts (recommended)
pnpm deploy:nexus --network alfajores --owner 0xYourAddress

# Or using hardhat directly
npx hardhat run scripts/deploy-nexus-badge.ts --network alfajores
```

**Required Arguments:**

- `--owner <address>` or `DEPLOYER_ADDRESS` in .env: Address that will own the contract

**Optional Arguments:**

- `--verify` / `--no-verify`: Enable/disable contract verification (default: true)

**Environment Variables:**

- `DEPLOYER_ADDRESS`: Default owner address
- `PRIVATE_KEY`: Deployer private key
- `CELOSCAN_API_KEY`: For contract verification

### ContributorPass Deployment

Deploy the ContributorPass contract:

```bash
# Using pnpm scripts (recommended)
pnpm deploy:contributor --network alfajores --owner 0xOwnerAddress --nexus-address=0xNexusBadgeAddress --celo-reward=0.1

# Or using hardhat directly
npx hardhat run scripts/deploy-contributor-pass.ts --network alfajores
```

**Required Arguments:**

- `--owner <address>` or `DEPLOYER_ADDRESS` in .env: Address that will own the contract
- `--nexus-address=<address>` or `NEXUS_EXPLORER_BADGE_ADDRESS` in .env: Address of deployed NexusExplorerBadge contract

**Optional Arguments:**

- `--celo-reward=<amount>` or `CELO_REWARD_AMOUNT` in .env: CELO reward amount in ether (default: 0.1)
- `--verify` / `--no-verify`: Enable/disable contract verification (default: true)

**Environment Variables:**

- `DEPLOYER_ADDRESS`: Default owner address
- `NEXUS_EXPLORER_BADGE_ADDRESS`: NexusExplorerBadge contract address
- `CELO_REWARD_AMOUNT`: Default CELO reward amount
- `PRIVATE_KEY`: Deployer private key
- `CELOSCAN_API_KEY`: For contract verification

**Alternative Method - Using PowerShell Environment Variables:**

Instead of command-line arguments, you can set environment variables (especially useful on Windows PowerShell):

```powershell
# Single line PowerShell command
$env:NEXUS_EXPLORER_BADGE_ADDRESS="0x123456789abcdef123456789abcdef123456789a"; $env:CELO_REWARD_AMOUNT="0.1"; $env:DEPLOYER_ADDRESS="0x123456789abcdef123456789abcdef123456789a"; pnpm deploy:contributor --network alfajores
```

```bash
# Or using bash/terminal
export NEXUS_EXPLORER_BADGE_ADDRESS="0x123456789abcdef123456789abcdef123456789a"
export CELO_REWARD_AMOUNT="0.1"
export DEPLOYER_ADDRESS="0x123456789abcdef123456789abcdef123456789a"

# Then deploy without additional arguments
pnpm deploy:contributor --network alfajores
```

### Contract Upgrades

Upgrade existing contracts:

```bash
# Upgrade NexusExplorerBadge
pnpm upgrade:nexus --network alfajores

# Upgrade ContributorPass
pnpm upgrade:contributor --network alfajores

# Without verification
pnpm upgrade:nexus --network alfajores --no-verify
```

**Optional Arguments:**

- `--verify` / `--no-verify`: Enable/disable contract verification (default: true)

## Deployment Management

### Task System

Hardhat includes built-in tasks for managing deployments:

```bash
# List all deployments on a network
npx hardhat deployments --network alfajores

# Get deployment info for a specific contract
npx hardhat deployment-info --contract NexusExplorerBadge --network alfajores
npx hardhat deployment-info --contract ContributorPass --network alfajores
```

### Using pnpm Scripts

```bash
# List all deployments on a network
pnpm deployments --network alfajores

# Get deployment info for a specific contract
pnpm deployment-info --contract NexusExplorerBadge --network alfajores
pnpm deployment-info --contract ContributorPass --network alfajores
```

### Badge Minting

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

```bash
# Verify NexusExplorerBadge
pnpm verify:nexus --network alfajores

# Verify ContributorPass
pnpm verify:contributor --network alfajores
```

- Implementation contracts are verified automatically
- Proxy contracts don't need separate verification as they use standard OpenZeppelin proxy bytecode
- Manual verification may be required for proxy contracts (instructions provided in deployment output)

## Developing New Upgradeable Contracts

When creating new upgradeable contracts, follow the established patterns:

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

## ContributorPass Specific Features

The ContributorPass contract has unique requirements and features:

The ContributorPass contract has unique requirements and features:

### Prerequisites for Users

1. **Must own NexusExplorerBadge**: Users need to have minted a NexusExplorerBadge first
2. **Referral Requirement**: Users must have referred at least 2 addresses OR be approved by an admin
3. **One-time Minting**: Each address can only mint once

### Admin Functions

Admins can:

- Approve addresses to bypass referral requirements: `approveForMinting(address)`
- Update NexusExplorerBadge address: `setNexusExplorerBadgeAddress(address)`
- Update CELO reward amount: `setCeloRewardAmount(uint256)`
- Withdraw CELO from contract: `withdrawCelo(uint256)`

### Post-Deployment Steps

1. **Fund the Contract**: Send CELO to the contract address for user rewards

   ```bash
   # Example: Send 10 CELO to the contract
   # Use your wallet or a script to send CELO to the deployed contract address
   ```

2. **Grant Admin Roles** (if needed):
   ```solidity
   // Call this function on the deployed contract
   grantRole(ADMIN_ROLE, adminAddress)
   ```

## Generic Usage Examples

### 1. Deploy a New UUPS Proxy Contract

#!/usr/bin/env node

import { deployUUPSProxy } from "./utils/deploymentUtils"
import { HardhatRuntimeEnvironment } from "hardhat/types"

async function deployMyToken(
hre: HardhatRuntimeEnvironment,
name: string,
symbol: string,
initialSupply: string,
verify: boolean = true
): Promise<string> {
const result = await deployUUPSProxy(
hre,
"MyToken",
"contracts/MyToken.sol:MyToken",
[name, symbol, initialSupply],
verify
)

return result.proxyAddress
}

// Use the generic template script
// npx hardhat run scripts/templates/deploy-uups-proxy.ts --network alfajores --contract MyToken --args "MyToken,MTK,1000000"

````

### 2. Upgrade an Existing UUPS Proxy

```typescript
#!/usr/bin/env node

import { upgradeUUPSProxy } from "./utils/deploymentUtils"
import { HardhatRuntimeEnvironment } from "hardhat/types"

async function upgradeMyToken(
  hre: HardhatRuntimeEnvironment,
  verify: boolean = true
): Promise<{ proxyAddress: string; newImplementationAddress: string }> {
  const result = await upgradeUUPSProxy(
    hre,
    "MyToken",
    "contracts/MyToken.sol:MyToken",
    verify
  )

  return {
    proxyAddress: result.proxyAddress,
    newImplementationAddress: result.newImplementationAddress,
  }
}

// Use the generic template script
// npx hardhat run scripts/templates/upgrade-uups-proxy.ts --network alfajores --contract MyToken
````

### 3. Using Template Scripts

The `templates/` directory contains ready-to-use scripts:

#### Deploy any contract:

```bash
# Deploy with default settings
npx hardhat run scripts/templates/deploy-uups-proxy.ts --network alfajores --contract MyContract

# Deploy with constructor arguments
npx hardhat run scripts/templates/deploy-uups-proxy.ts --network alfajores --contract MyToken --args "TokenName,TKN,1000000"

# Deploy without verification
npx hardhat run scripts/templates/deploy-uups-proxy.ts --network alfajores --contract MyContract --no-verify
```

#### Upgrade any contract:

```bash
# Upgrade with verification
npx hardhat run scripts/templates/upgrade-uups-proxy.ts --network alfajores --contract MyContract

# Upgrade without verification
npx hardhat run scripts/templates/upgrade-uups-proxy.ts --network alfajores --contract MyContract --no-verify
```

## Return Types

### UUPSDeploymentResult

```typescript
interface UUPSDeploymentResult {
  proxyAddress: string
  implementationAddress: string
  adminAddress: string // Always 0x0 for UUPS proxies
  deploymentInfo: DeploymentInfo
}
```

### UUPSUpgradeResult

```typescript
interface UUPSUpgradeResult {
  proxyAddress: string
  newImplementationAddress: string
  previousImplementationAddress: string
}
```

## File Structure

After deployment, the following files are automatically created:

```
deployments/
  alfajores/                     # Network name
    MyContract.deploymentInfo.json  # Deployment metadata
    MyContract.abi.json             # Contract ABI
```

## Best Practices

1. **Always compile first**: The functions automatically run `hre.run("compile")` but you can do it manually
2. **Network validation**: The functions validate that you're deploying to the intended network
3. **Verification**: Always verify contracts on public networks (default behavior)
4. **Version tracking**: Upgrades automatically increment the version number
5. **Storage compatibility**: Ensure new implementations are storage-compatible with previous versions

## Migration from Contract-Specific Scripts

If you have existing deployment scripts, you can easily migrate them to use the generic functions directly:

**Before (with intermediate wrapper file):**

```typescript
// deployNexusExplorerBadge.ts - 50+ lines of wrapper code
export async function deployNexusExplorerBadge(
  hre: HardhatRuntimeEnvironment,
  initialOwner: string,
  verify: boolean = true
): Promise<string> {
  const result = await deployUUPSProxy(
    hre,
    "NexusExplorerBadge",
    "contracts/NexusExplorerBadge.sol:NexusExplorerBadge",
    [initialOwner],
    verify
  )
  return result.proxyAddress
}
```

**After (direct usage):**

```typescript
// deploy-nexus-badge.ts - uses generic functions directly
import { deployUUPSProxy } from "./utils/deploymentUtils"

const result = await deployUUPSProxy(
  hre,
  "NexusExplorerBadge",
  "contracts/NexusExplorerBadge.sol:NexusExplorerBadge",
  [owner],
  verify
)
console.log(`Deployed to: ${result.proxyAddress}`)
```

This approach eliminates unnecessary wrapper files and reduces code duplication.

## Error Handling

The generic functions include comprehensive error handling:

- ✅ Network mismatch detection
- ✅ Missing deployment info for upgrades
- ✅ Verification failure handling
- ✅ Transaction confirmation waiting
- ✅ Storage compatibility validation (during upgrades)

## Support for Multiple Networks

The utilities support multiple networks defined in your Hardhat config:

- `alfajores` (Celo Testnet) - Chain ID: 44787
- `celo` (Celo Mainnet) - Chain ID: 42220
- Add more networks as needed in `getChainId()` function

## Troubleshooting

### Common Issues

1. **"No owner address specified"**:

   - Solution: Add `--owner <address>` to command or set `DEPLOYER_ADDRESS` in .env

2. **"No NexusExplorerBadge address specified"** (ContributorPass):

   - Solution: Add `--nexus-address=<address>` or set `NEXUS_EXPLORER_BADGE_ADDRESS` in .env
   - Alternative: Use PowerShell environment variables as shown above

3. **"No deployment found for upgrade"**:

   - Solution: Ensure contract was deployed to the correct network first

4. **"Verification failed"**:

   - Solution: Check `CELOSCAN_API_KEY` in .env file

5. **"Insufficient funds"**:

   - Solution: Ensure deployer account has enough CELO for gas fees

6. **BigInt serialization errors**:
   - Solution: The deployment utilities now automatically handle BigInt values in deployment info

### Getting Help

- Check deployment status: `pnpm deployments --network <network>`
- View contract details: `pnpm deployment-info --contract <name> --network <network>`
- For detailed troubleshooting: See [Hardhat Development Guide](../docs/HARDHAT_DEV.md)
- Check that your private key account has sufficient CELO for gas fees
- Verify that environment variables are set correctly

## Example Usage Scenarios

### Scenario 1: Full Deployment from Scratch

```bash
# 1. Deploy NexusExplorerBadge first
pnpm deploy:nexus --network alfajores --owner 0xYourAddress

# 2. Note the deployed address from output, then deploy ContributorPass
pnpm deploy:contributor --network alfajores --owner 0xYourAddress --nexus-address=0xNexusBadgeAddress --celo-reward=0.1

# Alternative: Using PowerShell environment variables (single line)
$env:DEPLOYER_ADDRESS="0xYourAddress"; $env:NEXUS_EXPLORER_BADGE_ADDRESS="0xNexusBadgeAddress"; $env:CELO_REWARD_AMOUNT="0.1"; pnpm deploy:contributor --network alfajores

# 3. Fund ContributorPass contract with CELO for rewards
# Send CELO to the ContributorPass contract address

# 4. Users can now mint badges and contributor passes
```

### Scenario 2: Upgrade Existing Contracts

```bash
# Upgrade contracts (preserves all state and data)
pnpm upgrade:nexus --network alfajores
pnpm upgrade:contributor --network alfajores
```

### Scenario 3: Verify Contracts Manually

```bash
# If verification failed during deployment
pnpm verify:nexus --network alfajores
pnpm verify:contributor --network alfajores
```

## Contributing

When adding new networks or features:

1. Update the `Network` type in `deploymentUtils.ts`
2. Add the chain ID to `getChainId()` function
3. Test deployment and upgrade on the new network
4. Update this documentation
