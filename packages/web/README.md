# Celo Europe Web Application

A Next.js Web3 application for the Celo Europe ecosystem, featuring secure wallet authentication, NFT badge system, and community features.

## 🚀 Features

- 🔐 **Secure Web3 Authentication**: Wallet-based login with JWT tokens and automatic refresh
- 🏆 **Nexus Explorer Badge**: NFT badge system for community members
- 📱 **Responsive Design**: Modern UI with dark/light theme support
- 🛡️ **Enterprise Security**: Rate limiting, replay protection, and secure token management
- 🔄 **Automatic Token Refresh**: Seamless authentication without user intervention
- 📚 **Educational Content**: Guides and documentation for Celo ecosystem

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Web3**: Wagmi, Viem, RainbowKit
- **Authentication**: Custom JWT system with automatic refresh
- **Database**: MongoDB for user data and challenge storage
- **Blockchain**: Celo (Alfajores testnet & Mainnet)
- **UI Components**: Shadcn/ui with custom theme system

## 📦 Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Configure your environment variables
# Edit .env.local with your values

# Run development server
pnpm dev
```

## 🔧 Environment Configuration

Required environment variables in `.env.local`:

```bash
# Authentication & Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# MongoDB Configuration
MONGO_DB_URI_PRODUCTION=mongodb://localhost:27017/celo-eu-production
MONGO_DB_URI_DEVELOPMENT=mongodb://localhost:27017/celo-eu-development

# Web3
REOWN_PROJECT_ID=your-walletconnect-project-id

# Network Configuration
# Set to true for production (Celo mainnet), false for development (Alfajores testnet)
NEXT_PUBLIC_IS_PROD=false
```

### Environment Variables Explained

- **`JWT_SECRET`**: Cryptographic key for JWT token signing (minimum 32 characters)
- **`ALLOWED_ORIGINS`**: Comma-separated list of allowed CORS origins
- **`MONGO_DB_URI_PRODUCTION`**: MongoDB connection string for production database
- **`MONGO_DB_URI_DEVELOPMENT`**: MongoDB connection string for development database
- **`REOWN_PROJECT_ID`**: WalletConnect project ID for wallet connectivity
- **`NEXT_PUBLIC_IS_PROD`**:
  - `true` = Production mode (Celo mainnet + production database)
  - `false` = Development mode (Alfajores testnet + development database)

### Network Modes

**Development Mode (`NEXT_PUBLIC_IS_PROD=false`)**:

- Uses Celo Alfajores testnet
- Connects to development MongoDB database
- Uses testnet contract addresses
- Ideal for local development and testing

**Production Mode (`NEXT_PUBLIC_IS_PROD=true`)**:

- Uses Celo mainnet
- Connects to production MongoDB database
- Uses mainnet contract addresses
- For live deployment

See `.env.example` for complete configuration template.

## 📚 Documentation

### Core Documentation

- **[Authentication Flow](./AUTHENTICATION_FLOW.md)** - Complete authentication system overview
- **[Automatic Token Refresh](./TOKEN_REFRESH_GUIDE.md)** - Token management and refresh system
- **[Security Guide](./SECURITY.md)** - Security implementation and best practices
- **[Refactoring Summary](./REFACTORING_SUMMARY.md)** - Recent changes and improvements

### Development Guides

- **[UI Components](./UI_COMPONENTS.md)** - Component library and usage
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Production deployment instructions

## 🔐 Authentication System

This application features a sophisticated authentication system:

### Key Features

- **Web3 Wallet Authentication**: Sign challenges with your wallet
- **JWT Token System**: Secure, stateless authentication
- **Automatic Token Refresh**: Seamless token management
- **Route Protection**: Secure access to protected pages
- **Graceful Fallback**: Re-authentication when tokens expire

### Quick Usage

```typescript
import { useAuth } from "@/providers/AuthProvider"

function MyComponent() {
  const { makeAuthenticatedRequest } = useAuth()

  // Automatic token refresh handling
  const response = await makeAuthenticatedRequest("/api/users", {
    method: "POST",
    body: JSON.stringify({ name, email }),
  })
}
```

See [Token Refresh Guide](./TOKEN_REFRESH_GUIDE.md) for detailed usage.

## 🏗️ Project Structure

```
packages/web/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── users/         # User management
│   ├── dashboard/         # User dashboard (protected)
│   ├── veki/             # Veki program (protected)
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── ui/               # UI component library
│   └── Layout.tsx        # Main layout
├── lib/                  # Utility libraries
│   ├── auth/             # Authentication utilities
│   ├── models/           # Database models
│   └── utils.ts          # General utilities
├── providers/            # React context providers
│   ├── AuthProvider.tsx  # Authentication context
│   └── AppProvider.tsx   # Main app provider
└── styles/               # Global styles
```

## 🛡️ Security Features

- ✅ **JWT Authentication**: Cryptographically signed tokens
- ✅ **Rate Limiting**: Prevents abuse on all auth endpoints
- ✅ **Replay Protection**: Prevents signature reuse attacks
- ✅ **Origin Validation**: CORS protection for API calls
- ✅ **Automatic Token Refresh**: Secure token management
- ✅ **Environment Security**: Sensitive data in env variables

## 🚀 Deployment

### Prerequisites

- Node.js 18+
- MongoDB database
- Environment variables configured

### Build Process

```bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Start production server
pnpm start
```

### Environment Setup

1. Copy `.env.example` to `.env.local`
2. Configure all required environment variables:
   - **For Development**: Set `NEXT_PUBLIC_IS_PROD=false`
   - **For Production**: Set `NEXT_PUBLIC_IS_PROD=true`
3. Configure MongoDB URIs for both environments
4. Ensure MongoDB databases are accessible
5. Set up proper CORS origins for your deployment

### Database Setup

The application automatically selects the appropriate database based on the `NEXT_PUBLIC_IS_PROD` setting:

- **Development**: Uses `MONGO_DB_URI_DEVELOPMENT`
- **Production**: Uses `MONGO_DB_URI_PRODUCTION`

This allows you to safely test with development data while keeping production data separate.

### Smart Contract Configuration

Contract addresses are automatically selected based on the environment:

- **Development**: Uses Alfajores testnet contracts from `lib/abi/alfajores/`
- **Production**: Uses Celo mainnet contracts from `lib/abi/celo/`

**Note**: Ensure mainnet contract addresses are updated in `lib/abi/celo/NexusExplorerBadge.ts` before production deployment.

See [Deployment Guide](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use the existing component patterns
- Add documentation for new features
- Test authentication flows thoroughly
- Update documentation when making changes

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with 💛 by AXMC for Celo Europe
- Powered by Celo Composer
- UI components from Shadcn/ui
- Web3 integration via Wagmi and RainbowKit

## 🆘 Support

For questions or support:

- Check the documentation in this repository
- Review the troubleshooting guides below
- Open an issue for bugs or feature requests

### 🔧 Troubleshooting

**Environment Configuration Issues:**

1. **MongoDB Connection Errors**:

   - Verify the correct MongoDB URI is configured for your environment
   - Check if `NEXT_PUBLIC_IS_PROD` is set correctly
   - Ensure MongoDB service is running and accessible

2. **Wrong Network/Chain Issues**:

   - Verify `NEXT_PUBLIC_IS_PROD` setting matches your intended environment
   - Development: `NEXT_PUBLIC_IS_PROD=false` (Alfajores testnet)
   - Production: `NEXT_PUBLIC_IS_PROD=true` (Celo mainnet)

3. **Contract Address Issues**:

   - For production, ensure mainnet contract addresses are updated in `lib/abi/celo/`
   - Development automatically uses testnet addresses from `lib/abi/alfajores/`

4. **Authentication Issues**:
   - Ensure `JWT_SECRET` is at least 32 characters long
   - Verify `ALLOWED_ORIGINS` includes your domain
   - Check that both MongoDB URIs are configured

**Quick Environment Check:**

```bash
# Verify your environment configuration
echo "Is Production: $NEXT_PUBLIC_IS_PROD"
echo "Development DB: $MONGO_DB_URI_DEVELOPMENT"
echo "Production DB: $MONGO_DB_URI_PRODUCTION"
```

---

**Celo Europe** - Building the regenerative economy on Celo 🌱
