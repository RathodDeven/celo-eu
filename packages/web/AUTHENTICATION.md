# Wallet Signature Authentication System

This documentation describes the comprehensive wallet signature authentication system implemented for the Celo Europe platform.

## Overview

The system implements a secure challenge-response authentication flow that verifies wallet ownership through message signing, without requiring any blockchain transactions or gas fees.

## Key Features

- ✅ **Challenge-Response Authentication**: Secure message signing verification
- ✅ **No Gas Fees**: Authentication is completely off-chain
- ✅ **Automatic Token Management**: Tokens stored in localStorage with expiration
- ✅ **Address Validation**: Automatic cleanup when wallet address changes
- ✅ **Secure API Routes**: Backend validation of signatures using Viem
- ✅ **AuthProvider Context**: Centralized authentication state management
- ✅ **React Hook Integration**: Easy-to-use authentication hook
- ✅ **UI Integration**: Seamless header and navigation integration
- ✅ **Mobile Responsive**: Full mobile support with drawer navigation
- ✅ **Auto Sign-Out**: Automatic sign-out on wallet address change and token expiration
- ✅ **Retry-Friendly**: Challenge persistence for multiple sign-in attempts
- ✅ **Persistent Sessions**: Authentication persists through wallet disconnections
- ✅ **Smart Reconnection**: Same wallet auto-signs back in with valid tokens

## Architecture

### Backend API Routes

#### 1. `/api/auth/challenge` (POST)

- Generates unique challenge messages with nonce and timestamp
- Stores challenges temporarily (10-minute expiration)
- Returns message to be signed by the wallet

#### 2. `/api/auth/verify` (POST)

- Verifies the signed message using Viem's `verifyMessage`
- Validates challenge hasn't expired
- Returns authentication token on success

#### 3. `/api/auth/validate` (POST)

- Validates existing authentication tokens
- Checks token expiration (24 hours)
- Returns validation status and address

#### 4. `/api/auth/logout` (POST)

- Handles logout process
- Can be extended for token blacklisting

### Frontend Components

#### 1. `AuthProvider` Context (`providers/AuthProvider.tsx`)

- Centralized authentication state management
- Wraps the entire application
- Provides consistent auth state across all components

#### 2. `useAuthHook` Hook (`hooks/useAuth.ts`)

- Core authentication logic and state management
- Automatic localStorage token handling
- Address change detection and cleanup
- Sign-in functionality with retry support

#### 3. Updated Header Component

- Custom connect button when wallet not connected
- Sign-in button when wallet connected but not authenticated
- RainbowKit ConnectButton only when authenticated
- No manual sign-out (handled automatically)
- Error handling and loading states

#### 4. Updated Home Page

- Authentication-aware button text and actions
- Badge checking only for authenticated users
- Clear user flow from connection → authentication → badge verification

## User Flow

1. **Wallet Connection**: User connects wallet via RainbowKit
2. **Sign-In Prompt**: "Sign In" button appears in header
3. **Challenge Generation**: Backend generates unique challenge message
4. **Message Signing**: User signs message with wallet (no gas required)
5. **Verification**: Backend verifies signature and issues token
6. **Authenticated State**: User gains access to protected features
7. **Automatic Management**: Token stored locally with expiration
8. **Persistent Sessions**: Authentication survives wallet disconnections
9. **Smart Reconnection**: Same wallet auto-restores authentication
10. **Address Change Detection**: Auto-logout only when wallet address changes

## Security Features

### Challenge Message Format

```
Welcome to Celo Europe!

Please sign this message to authenticate.

Address: 0x...
Nonce: [random hex]
Timestamp: [unix timestamp]

This request will not trigger a blockchain transaction or cost any gas fees.
```

### Security Measures

- **Unique Nonces**: Prevent replay attacks
- **Timestamp Validation**: 15-minute challenge expiration
- **Address Verification**: Signature must match connected wallet
- **Token Expiration**: 24-hour authentication tokens
- **Automatic Cleanup**: Remove invalid/expired tokens
- **Retry Support**: Challenges persist for multiple sign-in attempts
- **Auto Sign-Out**: Automatic logout on wallet address change
- **Persistent Authentication**: Sessions survive wallet disconnections
- **Smart Reconnection**: Same wallet auto-restores authentication

## Usage Examples

### Using the Authentication Context

```tsx
import { useAuth } from "@/providers/AuthProvider"

function MyComponent() {
  const { isSignedIn, isLoading, signIn, error, clearError } = useAuth()

  return (
    <div>
      {!isSignedIn ? (
        <button onClick={signIn} disabled={isLoading}>
          {isLoading ? "Signing..." : "Sign In"}
        </button>
      ) : (
        <div>Signed in! (Auto sign-out on wallet change)</div>
      )}
      {error && <p>{error}</p>}
    </div>
  )
}
```

### Protecting Routes/Components

```tsx
import { useAuth } from "@/hooks/useAuth"

function ProtectedComponent() {
  const { isSignedIn } = useAuth()

  if (!isSignedIn) {
    return <div>Please sign in to access this feature</div>
  }

  return <div>Protected content here</div>
}
```

## Navigation Behavior

### Desktop Navigation

- **Not Connected**: Home, Guide, Team + Custom Connect Button
- **Connected but Not Signed In**: + Custom Sign In Button
- **Connected and Signed In**: + Resources, Events, Veki Program, Dashboard + RainbowKit ConnectButton

### Mobile Navigation (Drawer)

- Same logic as desktop
- Custom Connect/Sign In buttons in icon format
- RainbowKit ConnectButton only when authenticated
- Error messages displayed inline
- No manual sign-out buttons (automatic sign-out)

## Error Handling

The system handles various error scenarios:

- **Wallet Not Connected**: Prompts to connect wallet
- **Challenge Expired**: Generates new challenge automatically
- **Invalid Signature**: Clear error message to user
- **Network Errors**: Graceful degradation with retry options
- **Token Expiration**: Automatic cleanup and re-authentication prompt

## LocalStorage Management

### Stored Data

```json
{
  "token": "base64-encoded-auth-token",
  "address": "0x...",
  "expiresAt": 1234567890
}
```

### Automatic Cleanup

- Expired tokens removed on page load
- Address mismatch triggers cleanup
- Manual cleanup on sign-out

## Development Notes

### Dependencies Added

- `jsonwebtoken` (if using JWT, current implementation uses simple base64)
- `@types/jsonwebtoken`

### Environment Variables

- Consider adding `JWT_SECRET` for production JWT implementation

### Production Considerations

- Replace in-memory challenge store with Redis/Database
- Implement proper JWT with secret key
- Add rate limiting to API endpoints
- Consider implementing token refresh mechanism
- Add audit logging for authentication events

## Testing the Implementation

1. **Connect Wallet**: Click "Connect" button
2. **Sign In**: Click "Sign In" button when wallet connected
3. **Sign Message**: Approve the signature request in wallet
4. **Verify Authentication**: Check that restricted navigation items appear
5. **Test Persistence**: Refresh page and verify still signed in
6. **Test Address Change**: Switch wallet accounts and verify auto-logout
7. **Test Sign Out**: Click sign out and verify state cleared

## Troubleshooting

### Common Issues

- **Signature Verification Fails**: Check wallet compatibility with Viem
- **Challenge Not Found**: Ensure challenges aren't being cleared too quickly
- **LocalStorage Issues**: Check browser privacy settings
- **Network Errors**: Verify API routes are properly configured

### Debugging

- Check browser console for error messages
- Verify localStorage contains authentication data
- Test API endpoints directly with tools like Postman
- Check Next.js development logs for backend errors

This implementation provides a robust, secure, and user-friendly authentication system that enhances the Celo Europe platform's user experience while maintaining high security standards.
