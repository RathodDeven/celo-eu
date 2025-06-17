# Authentication Flow Documentation

## ✅ CORRECTED: Proper JWT-Based Web3 Authentication

You were absolutely right to question the previous implementation! Here's the **correct** and **secure** authentication flow:

## Overview

Our authentication system now has the **proper separation**:

1. **Initial Wallet Authentication** (Challenge/Response) → Get JWT tokens
2. **API Call Authentication** (JWT tokens only) → No more signatures per request!

## 1. Initial Wallet Authentication Flow (Login)

**Purpose**: Prove wallet ownership ONCE and get long-lived tokens

### Step 1: Request Challenge (`/api/auth/challenge`)

```typescript
POST /api/auth/challenge
{
  "address": "0x123..."
}

Response:
{
  "message": "Welcome to Celo Europe!...",
  "nonce": "abc123",
  "timestamp": 1234567890
}
```

### Step 2: Submit Signed Challenge (`/api/auth/verify`)

```typescript
POST /api/auth/verify
{
  "address": "0x123...",
  "message": "Welcome to Celo Europe!...", // Must match stored challenge
  "signature": "0xabc123..."
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...", // JWT access token (24h)
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...", // JWT refresh token (7d)
  "address": "0x123...",
  "expiresAt": 1234567890
}
```

**Security Features**:

- ✅ Server controls all challenges (stored in MongoDB)
- ✅ Challenge expires in 30 minutes
- ✅ Replay attack prevention
- ✅ Secure JWT generation

## 2. API Call Authentication (The Correct Way!)

**Purpose**: Use JWT tokens for all subsequent API calls

### All API Calls Now Use JWT Tokens

```typescript
// Creating a user profile
POST /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "agreedToMarketing": false
}

// Updating a user profile
PUT /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

**No more signatures per request!** 🎉

## What Changed (Your Concerns Were Valid!)

### ❌ BEFORE (Insecure/Redundant):

```typescript
// Had to sign EVERY API request
const payload = {
  message: { address, name, email },
  signature: challengeSignature,
  originalChallenge: challengeMessage,
  address: address,
}
```

### ✅ AFTER (Secure/Simple):

```typescript
// Just use the JWT token
headers: {
  "Authorization": `Bearer ${token}`
}
body: JSON.stringify({ name, email })
```

## Security Analysis

### Why This Is Now Secure:

1. **One-Time Authentication**: Sign challenge once, get long-lived tokens
2. **No Client Control**: Server controls challenges, client cannot manipulate
3. **Proper Token Usage**: JWTs are cryptographically secure and server-verified
4. **Automatic Expiration**: Tokens expire and can be refreshed
5. **No Per-Request Signing**: Much better UX and security model

### Token Refresh Flow:

```typescript
// When token expires (detected automatically)
POST /api/auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...", // New access token
  "expiresAt": 1234567890
}
```

## Migration Benefits

✅ **Better Security**: No challenge/signature sent on every request
✅ **Better UX**: No wallet popup for every API call  
✅ **Standard Practice**: JWT is industry standard for Web APIs
✅ **Scalability**: Server doesn't need to verify signatures constantly
✅ **Maintainability**: Simpler codebase, fewer security concerns

## Your Questions Answered

> **"Aren't we still sending signature and originalChallenge?"**

**Before**: Yes, we were (incorrectly)
**Now**: No! Only during initial login, then JWT tokens for everything

> **"Shouldn't client sign challenge once, get JWT, then use JWT for API calls?"**

**Exactly!** That's what we implemented now. Perfect understanding!

> **"When JWT expires, ask for new challenge signature?"**

**Yes!** When JWT expires:

1. Try to refresh with refresh token
2. If refresh token also expired, request new challenge/signature
3. Get new JWT tokens

## Code Examples

### Login Flow (AuthProvider):

```typescript
// 1. Get challenge
const challengeResponse = await fetch("/api/auth/challenge", {
  method: "POST",
  body: JSON.stringify({ address }),
})

// 2. Sign challenge
const signature = await signMessageAsync({ message: challenge })

// 3. Verify and get JWT
const verifyResponse = await fetch("/api/auth/verify", {
  method: "POST",
  body: JSON.stringify({ address, signature, message: challenge }),
})

const { token, refreshToken } = await verifyResponse.json()
// Store tokens, use for all future API calls
```

### API Calls (Frontend):

```typescript
// Simple and secure!
const response = await fetch("/api/users", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ name, email, username }),
})
```

## 3. Automatic Token Refresh System

### The `makeAuthenticatedRequest` Method

The application now includes an **automatic token refresh system** that handles token expiry transparently:

```typescript
import { useAuth } from "@/providers/AuthProvider"

function MyComponent() {
  const { makeAuthenticatedRequest } = useAuth()

  // This automatically handles token refresh!
  const response = await makeAuthenticatedRequest("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email }),
  })
}
```

### How Automatic Refresh Works:

1. **First Request**: Uses current access token
2. **If 401 (Unauthorized)**: Automatically attempts token refresh using refresh token
3. **If Refresh Succeeds**: Retries original request with new token
4. **If Refresh Fails**: Prompts user for new wallet signature

### Token Refresh Flow Details:

```typescript
POST /api/auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...", // New access token (24h)
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...", // New refresh token (7d)
  "address": "0x123...",
  "expiresAt": 1234567890
}
```

### What Happens When Both Tokens Expire:

1. **Automatic Detection**: System detects both tokens are expired/invalid
2. **Clear Auth State**: Removes expired tokens from storage
3. **Prompt Re-authentication**: Shows wallet signature prompt via `AuthGuard`
4. **Seamless Flow**: User signs new challenge, gets new tokens, operation retries

### Benefits of Automatic Refresh:

✅ **Seamless UX**: No manual token management required
✅ **Transparent**: Users don't see token refresh happening
✅ **Secure**: Short-lived access tokens with longer refresh tokens
✅ **Resilient**: Handles all edge cases (expired, invalid, missing tokens)
✅ **Developer-Friendly**: Simple API for authenticated requests

This is now a **proper, secure, industry-standard Web3 authentication system** with **automatic token management**!
