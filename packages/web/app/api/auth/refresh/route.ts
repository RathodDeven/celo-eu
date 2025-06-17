import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken, generateAuthToken, generateRefreshToken } from "@/lib/auth/jwt"
import { withRateLimit, rateLimitConfigs } from "@/lib/auth/rateLimit"

async function handleRefresh(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      )
    }

    // Verify the refresh token
    const payload = verifyAuthToken(refreshToken)
    
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      )
    }

    // Generate new tokens
    const newToken = generateAuthToken(payload.address)
    const newRefreshToken = generateRefreshToken(payload.address)

    return NextResponse.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
      address: payload.address,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Apply rate limiting to prevent token refresh abuse
export const POST = withRateLimit(handleRefresh, { windowMs: 60 * 1000, maxRequests: 10 })
