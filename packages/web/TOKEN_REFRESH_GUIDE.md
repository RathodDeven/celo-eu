# Automatic Token Refresh System Guide

## Overview

The Celo Europe application implements a robust **automatic token refresh system** that provides a seamless user experience while maintaining high security standards. Users never need to manually handle token expiry or refresh operations.

## 🚀 Key Features

- ✅ **Transparent Token Refresh**: Automatically refreshes expired tokens behind the scenes
- ✅ **Graceful Fallback**: Prompts for new wallet signature when refresh tokens expire
- ✅ **Zero User Intervention**: Users never see token management operations
- ✅ **Developer-Friendly**: Simple API for authenticated requests
- ✅ **Resilient**: Handles all edge cases and error scenarios

## 🔧 How to Use

### Basic Usage with `makeAuthenticatedRequest`

```typescript
import { useAuth } from "@/providers/AuthProvider"

function MyComponent() {
  const { makeAuthenticatedRequest } = useAuth()
  
  const handleApiCall = async () => {
    try {
      // This method automatically handles token refresh!
      const response = await makeAuthenticatedRequest("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: "John Doe",
          email: "john@example.com"
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("API call successful:", data)
      }
    } catch (error) {
      if (error.message.includes("Authentication required")) {
        // Both tokens expired - AuthGuard will handle re-authentication
        console.log("User needs to sign in again")
      } else {
        console.error("API call failed:", error)
      }
    }
  }
}
```

### Advanced Usage with Custom Options

```typescript
const { makeAuthenticatedRequest } = useAuth()

// GET request
const getUser = async () => {
  const response = await makeAuthenticatedRequest("/api/users/profile")
  return response.json()
}

// PUT request with custom headers
const updateUser = async (userData) => {
  const response = await makeAuthenticatedRequest("/api/users", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Custom-Header": "value"
    },
    body: JSON.stringify(userData)
  })
  return response.json()
}

// DELETE request
const deleteUser = async (userId) => {
  const response = await makeAuthenticatedRequest(`/api/users/${userId}`, {
    method: "DELETE"
  })
  return response.ok
}
```

## 🔄 Token Refresh Flow

### Automatic Refresh Process

1. **Initial Request**: `makeAuthenticatedRequest` uses current access token
2. **Token Expiry Check**: If response returns 401 (Unauthorized)
3. **Automatic Refresh**: Attempts to refresh using stored refresh token
4. **Retry Request**: If refresh succeeds, retries original request with new token
5. **Success**: Returns successful response to user

### When Refresh Tokens Expire

1. **Detection**: Refresh token is also expired/invalid
2. **Cleanup**: Clears all stored authentication data
3. **User Prompt**: `AuthGuard` component shows wallet signature prompt
4. **Re-authentication**: User signs new challenge, gets new tokens
5. **Retry**: Original operation is retried with new authentication

## 🛡️ Security Considerations

### Token Lifespans
- **Access Token**: 24 hours (short-lived for security)
- **Refresh Token**: 7 days (longer-lived for convenience)
- **Challenge**: 30 minutes (time-bound authentication)

### Security Benefits
- **Minimal Exposure**: Short access token lifespans reduce security window
- **No Manual Storage**: Reduces risk of developer token mishandling
- **Automatic Cleanup**: Expired tokens are automatically removed
- **Graceful Degradation**: System handles all failure scenarios

### Rate Limiting
- **Token Refresh**: 10 requests per minute per IP
- **Prevents Abuse**: Rate limiting on refresh endpoint prevents spam
- **Monitoring**: Failed refresh attempts are logged for security monitoring

## 📱 User Experience

### What Users Experience
- **Seamless API Calls**: No interruption for token refresh
- **No Manual Actions**: Never need to "refresh" or "re-login" manually
- **Minimal Wallet Prompts**: Only sign when both tokens expire (every 7 days max)
- **Instant Operations**: API calls work immediately without token checks

### Error Scenarios
- **Network Issues**: Automatic retry with exponential backoff
- **Token Corruption**: Automatic cleanup and re-authentication
- **Wallet Disconnection**: Clear auth state and prompt reconnection
- **API Errors**: Proper error propagation without token confusion

## 🔧 Implementation Details

### AuthProvider Integration

The `AuthProvider` component provides the token refresh functionality:

```typescript
const authContextValue: AuthContextType = {
  // ... other auth state
  makeAuthenticatedRequest, // Main method for authenticated API calls
  refreshToken: refreshAuthToken, // Manual refresh if needed
}
```

### Token Storage

```typescript
interface AuthData {
  token: string          // JWT access token
  refreshToken: string   // JWT refresh token  
  address: string        // Wallet address
  expiresAt: number     // Token expiration timestamp
  challengeMessage: string      // Original challenge (for reference)
  challengeSignature: string    // Original signature (for reference)
}
```

### Refresh API Endpoint

```typescript
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

// Success Response
{
  "token": "eyJhbGciOiJIUzI1NiIs...",       // New access token
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...", // New refresh token
  "address": "0x123...",
  "expiresAt": 1234567890
}

// Error Response (401)
{
  "error": "Invalid or expired refresh token"
}
```

## 🚨 Error Handling

### Common Error Scenarios

```typescript
try {
  const response = await makeAuthenticatedRequest("/api/users", options)
} catch (error) {
  switch (error.message) {
    case "No authentication token available":
      // User not logged in - AuthGuard will handle
      break
      
    case "Authentication required - please sign in again":
      // Both tokens expired - AuthGuard will handle
      break
      
    case "Network request failed":
      // Network issue - retry or show error
      break
      
    default:
      // Other API errors
      console.error("API Error:", error)
  }
}
```

### Debugging Token Issues

```typescript
// Check current auth state
const { isSignedIn, token } = useAuth()
console.log("Auth State:", { isSignedIn, hasToken: !!token })

// Manual token refresh for debugging
const { refreshToken } = useAuth()
const refreshed = await refreshToken()
console.log("Manual refresh result:", refreshed)
```

## 📊 Monitoring and Analytics

### Key Metrics to Track
- Token refresh success rate
- Frequency of refresh operations
- Failed refresh attempts
- Time between authentication sessions
- API call success rate after refresh

### Logging
```typescript
// Successful refresh
console.log("Token refreshed successfully for address:", address)

// Failed refresh
console.warn("Token refresh failed, requiring re-authentication")

// Automatic cleanup
console.log("Expired tokens cleaned up for address:", address)
```

## 🔮 Future Enhancements

### Planned Improvements
- **Background Token Refresh**: Refresh tokens before they expire (proactive)
- **Multiple Refresh Tokens**: Support for multiple device sessions
- **Enhanced Monitoring**: Better analytics and alerting for token issues
- **Offline Support**: Handle token refresh when app comes back online

### Advanced Features
- **Token Rotation**: More frequent refresh token rotation for security
- **Device Fingerprinting**: Enhanced security with device tracking
- **Session Management**: Better control over multiple login sessions
- **Performance Optimization**: Batch token refresh for multiple API calls

## ✅ Best Practices

### For Developers
1. **Always use `makeAuthenticatedRequest`** for authenticated API calls
2. **Don't manually handle tokens** - let the system manage them
3. **Handle authentication errors gracefully** - let AuthGuard manage re-auth
4. **Test token expiry scenarios** in development
5. **Monitor refresh rates** in production

### For Production
1. **Set appropriate token lifespans** based on security requirements
2. **Monitor refresh patterns** for unusual activity
3. **Implement proper error tracking** for token-related issues
4. **Use HTTPS** for all token-related communications
5. **Regular security audits** of token handling

## 🆘 Troubleshooting

### Common Issues

**Issue**: API calls returning 401 errors
**Solution**: Check if `makeAuthenticatedRequest` is being used instead of plain `fetch`

**Issue**: Users getting prompted to sign frequently
**Solution**: Check token lifespans and refresh token functionality

**Issue**: Token refresh failing
**Solution**: Verify refresh endpoint is working and refresh tokens are valid

**Issue**: Authentication state inconsistency
**Solution**: Check localStorage and ensure proper cleanup on errors

### Debug Checklist
- [ ] Using `makeAuthenticatedRequest` for authenticated calls
- [ ] AuthGuard wrapping protected components
- [ ] Environment variables properly configured
- [ ] No manual token manipulation in code
- [ ] Proper error handling for authentication failures
- [ ] Token storage working correctly in localStorage

---

This automatic token refresh system provides a robust, secure, and user-friendly authentication experience while maintaining the highest security standards. The system is designed to be invisible to users while providing developers with a simple and reliable API for authenticated operations.
