import { NextRequest, NextResponse } from "next/server"

// Simple token validation function
const validateAuthToken = (
  token: string
): { valid: boolean; address?: string } => {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString())

    // Check if token has required fields
    if (!payload.address || !payload.timestamp || !payload.nonce) {
      return { valid: false }
    }

    // Check if token is not older than 24 hours
    const tokenAge = Date.now() - payload.timestamp
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    if (tokenAge > maxAge) {
      return { valid: false }
    }

    return { valid: true, address: payload.address }
  } catch (error) {
    return { valid: false }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    const validation = validateAuthToken(token)

    if (!validation.valid) {
      return NextResponse.json(
        { valid: false, error: "Invalid or expired token" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      valid: true,
      address: validation.address,
    })
  } catch (error) {
    console.error("Token validation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
