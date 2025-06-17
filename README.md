# Celo Europe Web App

Welcome to the official Celo Europe front-end application — a Next.js-based dApp enabling users to connect their wallets, learn about Celo, and participate in the Nexus Program.

## 🚀 Features

- 🔐 **Secure Web3 Authentication**: Wallet-based login with automatic JWT token refresh
- 🪪 **Nexus Explorer Badge**: NFT badge system for verifiable Celo Europe membership
- 📚 **Educational Content**: Comprehensive guide to help onboard users to the Celo ecosystem
- 📝 **Community Platform**: Blog and collaborative features (coming soon)
- 🛡️ **Enterprise Security**: Rate limiting, replay protection, and secure authentication

## 🛠️ Tech Stack

- **Next.js** (App Router) with TypeScript
- **Tailwind CSS** with custom theme system
- **Wagmi & Viem** for Web3 wallet connectivity
- **RainbowKit** for wallet UI components
- **MongoDB** for user data and authentication
- **Custom JWT Authentication** with automatic token refresh
- **CELO** blockchain (Alfajores/Testnet & Mainnet support)

## 📦 Setup Instructions

```bash
# Install dependencies
pnpm install

# Configure environment (see packages/web/.env.example)
cp packages/web/.env.example packages/web/.env.local

# Run the local dev server
pnpm dev
```

## 📚 Documentation

Comprehensive documentation is available in the `packages/web/` directory:

- **[Authentication System](packages/web/AUTHENTICATION_FLOW.md)** - Complete authentication flow
- **[Token Refresh Guide](packages/web/TOKEN_REFRESH_GUIDE.md)** - Automatic token management
- **[Security Implementation](packages/web/SECURITY.md)** - Security features and best practices
- **[Refactoring Summary](packages/web/REFACTORING_SUMMARY.md)** - Recent improvements
- **[Web App README](packages/web/README.md)** - Detailed setup and usage guide

## 🏗️ Project Structure

```
celo-eu/
├── packages/
│   ├── web/           # Next.js Web3 application
│   │   ├── app/       # App router pages and API routes
│   │   ├── components/# React components and auth system
│   │   ├── lib/       # Authentication and utility libraries
│   │   └── docs/      # Comprehensive documentation
│   └── hardhat/      # Smart contracts and deployment
└── README.md         # This file
```

Created with 💛 by AXMC for Celo Europe using Celo Composer
