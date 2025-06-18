# UUPS Proxy Deployment and Upgrade Utilities

This directory contains generic utilities for deploying and upgrading UUPS (Universal Upgradeable Proxy Standard) proxy contracts. These utilities have been extracted from the NexusExplorerBadge deployment scripts to be reusable for any UUPS proxy contract.

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

## Usage Examples

### 1. Deploy a New UUPS Proxy Contract

Create a deployment script for your contract:

```typescript
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
```

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
```

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

// deploy-nexus-badge.ts - imports wrapper
import { deployNexusExplorerBadge } from "./deploy/deployNexusExplorerBadge"
const proxyAddress = await deployNexusExplorerBadge(hre, owner, verify)
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

## Contributing

When adding new networks or features:

1. Update the `Network` type in `deploymentUtils.ts`
2. Add the chain ID to `getChainId()` function
3. Test deployment and upgrade on the new network
4. Update this documentation
