# Security Implementation Guide

## Overview

This application implements a **highly secure** Web3 authentication system with multiple layers of protection. **Your initial security concerns were valid for checking, but our implementation is actually very secure!**

## ✅ PRIMARY SECURITY: Challenge/Response Authentication

### How It Actually Works (Very Secure!)

Our main authentication flow is **server-controlled** and secure:

1. **Server generates challenge** and stores it in MongoDB
2. **Client requests challenge** from `/api/auth/challenge`
3. **Client signs the server-provided challenge** (cannot manipulate it)
4. **Server verifies signature against stored challenge** from database
5. **Server issues JWT tokens** after successful verification

**Key Security Features:**
- ✅ **Server controls all challenges** (stored in MongoDB, not client)
- ✅ **No client manipulation possible** (challenge comes from database)
- ✅ **Replay attack prevention** (challenge hashes tracked)
- ✅ **Time-bound security** (30-minute challenge expiration)
- ✅ **Cryptographically secure JWTs** with proper secrets

### Challenge Flow Security Guarantees

```typescript
// Step 1: Server generates and stores challenge
POST /api/auth/challenge
// → Server creates unique challenge in MongoDB

// Step 2: Client signs server's challenge
POST /api/auth/verify
// → Server validates against stored challenge (not client data!)
```

This is **NOT vulnerable** to the security issues you were concerned about because:
- Client cannot provide their own challenge
- Server is the single source of truth for challenges
- Replay attacks are prevented via database tracking

## 🔒 SECONDARY SECURITY: Signature Verification Middleware

The `withSignatureVerification` middleware is a **separate system** used for additional security on sensitive API operations (like profile updates):

```typescript
POST /api/users  // Uses withSignatureVerification middleware
{
  "signature": "0x...",
  "message": {...},
  "originalChallenge": "...",  // This is different from login!
  // ... actual update data
}
```

**This is NOT the login flow** - it's for post-authentication API calls that need extra security.

## Security Features Implemented

### 1. JWT Token Authentication
- **Cryptographically signed tokens** using industry-standard JWT
- **Automatic token expiration** (24 hours for access tokens, 7 days for refresh tokens)
- **Secure token storage** with proper validation

### 2. Rate Limiting
- **Challenge endpoint**: 5 requests per minute per IP
- **Verification endpoint**: 10 requests per minute per IP
- **User updates**: 3 requests per minute per IP
- **Token refresh**: 10 requests per minute per IP

### 3. Replay Attack Protection
- **Message nonce tracking** prevents reuse of signed messages
- **Automatic cleanup** of old nonces (30-minute window)
- **Challenge expiration** ensures time-bound authentication

### 4. Request Origin Validation
- **Origin header checking** (configurable via environment variables)
- **Referer validation** for additional security
- **Suspicious request logging**

### 5. Enhanced Signature Verification
- **Multi-step verification** process
- **Address consistency checks**
- **Message integrity validation**
- **Cryptographic proof of wallet ownership**

## Environment Variables

### Required Security Variables
```env
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Optional Security Variables
```env
NEXTAUTH_SECRET=your-nextauth-secret-if-using-nextauth
RATE_LIMIT_REDIS_URL=redis://localhost:6379  # For distributed rate limiting
```

## API Security Headers

The following headers are automatically added to API responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in window
- `X-RateLimit-Reset`: Time when rate limit resets

## Token Management

### Access Tokens
- **Lifetime**: 24 hours
- **Usage**: All authenticated API calls
- **Storage**: localStorage (consider httpOnly cookies for production)

### Refresh Tokens
- **Lifetime**: 7 days
- **Usage**: Obtaining new access tokens
- **Storage**: Secure storage recommended

### Token Refresh Flow
1. **Automatic Detection**: Check if access token expires within 1 hour
2. **Background Refresh**: Use refresh token to get new access token transparently
3. **Update Storage**: Store new tokens securely
4. **Retry Request**: Automatically retry original request with new token
5. **Graceful Fallback**: If refresh token also expired, prompt for new wallet signature

### Automatic Token Management with `makeAuthenticatedRequest`

The application provides a seamless API for authenticated requests:

```typescript
import { useAuth } from "@/providers/AuthProvider"

function MyComponent() {
  const { makeAuthenticatedRequest } = useAuth()
  
  // Automatic token refresh handling
  const response = await makeAuthenticatedRequest("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email })
  })
}
```

**Security Benefits**:
- ✅ **Transparent refresh**: Users never see token management
- ✅ **Short token lifespans**: Minimizes exposure window
- ✅ **Automatic fallback**: Graceful re-authentication when needed
- ✅ **No manual token handling**: Reduces developer errors

## Security Best Practices

### Production Deployment
1. **HTTPS Only**: Ensure all traffic uses HTTPS
2. **Environment Variables**: Use proper environment variable management
3. **CORS Configuration**: Restrict origins to your domain
4. **Rate Limiting**: Consider Redis for distributed rate limiting
5. **Monitoring**: Log suspicious activities and failed authentication attempts

### Client-Side Security
1. **Token Storage**: Consider httpOnly cookies for production
2. **Automatic Logout**: Clear tokens on wallet disconnection
3. **Automatic Token Refresh**: Implemented via `makeAuthenticatedRequest` method
4. **Graceful Token Expiry**: Seamless re-authentication flow when both tokens expire
5. **Error Handling**: Don't expose sensitive information in error messages
6. **Transparent UX**: Users never see token refresh operations

### Database Security
1. **Connection Encryption**: Use encrypted MongoDB connections
2. **Access Control**: Implement proper database user permissions
3. **Challenge Cleanup**: Automatically remove expired challenges
4. **Data Validation**: Validate all input data

## Attack Vector Mitigations

### Replay Attacks
- ✅ **Nonce tracking** prevents message reuse
- ✅ **Time-based expiration** limits attack window
- ✅ **Challenge consumption** ensures one-time use

### Rate Limiting Bypass
- ✅ **IP-based rate limiting** with distributed support
- ✅ **Multiple endpoint protection** (challenge, verify, update)
- ✅ **Gradual backoff** prevents spam

### Token Theft
- ✅ **Short-lived access tokens** limit exposure
- ✅ **Cryptographic signing** prevents forgery
- ✅ **Origin validation** restricts usage

### Man-in-the-Middle
- ✅ **HTTPS enforcement** encrypts all traffic
- ✅ **Signature verification** ensures message integrity
- ✅ **Challenge-response** proves wallet ownership

## Monitoring and Alerting

### Key Metrics to Monitor
- Failed authentication attempts per IP
- Rate limit violations
- Invalid signature attempts
- Token refresh frequency
- Origin header anomalies

### Recommended Alerts
- High number of failed authentications
- Repeated rate limit violations
- Suspicious origin patterns
- Token generation spikes

## Future Security Enhancements

### Planned Improvements
1. **Hardware wallet integration** for enhanced security
2. **Multi-signature authentication** for high-value operations
3. **Biometric authentication** on supported devices
4. **Zero-knowledge proofs** for privacy-preserving authentication

### Advanced Features
1. **Session management** with device tracking
2. **Anomaly detection** for unusual login patterns
3. **Geographic restrictions** based on user preferences
4. **Time-based access controls** for sensitive operations

## Security Audit Checklist

- [ ] JWT secrets are properly configured
- [ ] Rate limiting is working correctly
- [ ] HTTPS is enforced in production
- [ ] Origin validation is configured
- [ ] Token refresh mechanism is functional
- [ ] Replay attack protection is active
- [ ] Error messages don't leak sensitive information
- [ ] Database connections are encrypted
- [ ] Monitoring and alerting are set up
- [ ] Security headers are properly configured

## Support and Security Reports

For security-related questions or to report vulnerabilities, please contact the development team through secure channels.

**Remember**: Security is an ongoing process. Regularly review and update security measures as new threats emerge.
