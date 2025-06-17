import jwt from "jsonwebtoken"

// JWT Secret - In production, this should be in environment variables
const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "fallback-secret-change-in-production"

if (!process.env.JWT_SECRET && !process.env.NEXTAUTH_SECRET) {
  console.warn(
    "⚠️  JWT_SECRET not set in environment variables. Using fallback secret."
  )
}

export interface TokenPayload {
  address: string
  timestamp: number
  iat?: number
  exp?: number
}

/**
 * Generate a cryptographically secure JWT token
 */
export function generateAuthToken(address: string): string {
  const payload: TokenPayload = {
    address: address.toLowerCase(),
    timestamp: Date.now(),
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h",
    issuer: "celo-eu-guild",
    subject: address.toLowerCase(),
  })
}

/**
 * Verify and decode a JWT token
 */
export function verifyAuthToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}

/**
 * Generate a refresh token with longer expiration
 */
export function generateRefreshToken(address: string): string {
  const payload: TokenPayload = {
    address: address.toLowerCase(),
    timestamp: Date.now(),
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
    issuer: "celo-eu-guild",
    subject: address.toLowerCase(),
  })
}

/**
 * Check if a token is about to expire (within 1 hour)
 */
export function isTokenExpiringSoon(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as any
    if (!decoded || !decoded.exp) return true

    const oneHourFromNow = Math.floor(Date.now() / 1000) + 60 * 60
    return decoded.exp < oneHourFromNow
  } catch {
    return true
  }
}
