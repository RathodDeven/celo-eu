# Legacy Ignition Deployments Archive

This directory contains the old Ignition-based deployment artifacts for reference.
These have been replaced by the new upgradeable contract system.

## Migration Information

The project has migrated from Hardhat Ignition to OpenZeppelin's UUPS upgradeable proxy pattern.

### Old System (Ignition)

- Used Ignition modules for deployment
- Non-upgradeable contracts
- Deployment info in `ignition/deployments/`

### New System (UUPS Upgradeable)

- Uses custom deployment scripts
- UUPS upgradeable proxy pattern
- Deployment info in `deployments/`

## Legacy Deployment Addresses

### Alfajores (Chain ID: 44787)

Check `chain-44787/deployed_addresses.json` for the old contract address.

### Celo Mainnet (Chain ID: 42220)

Check `chain-42220/deployed_addresses.json` for the old contract address.

## Important Notes

1. **Frontend Integration**: Update frontend to use new deployment info files
2. **Contract Interactions**: Old contract addresses remain functional but are not upgradeable
3. **New Deployments**: All new deployments should use the upgradeable system

For more information, see `UPGRADEABLE_SYSTEM.md` in the hardhat package root.
