import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "./jwt"

export interface AuthenticatedRequest extends NextRequest {
  verifiedAddress?: string
}

/**
 * Middleware to verify JWT tokens for authenticated API endpoints
 * This replaces the signature verification middleware for most endpoints
 */
export function withJWTAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      // Extract token from Authorization header
      const authHeader = request.headers.get("authorization")

      if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json(
          { error: "Missing or invalid authorization header" },
          { status: 401 }
        )
      }

      const token = authHeader.substring(7) // Remove "Bearer " prefix

      if (!token) {
        return NextResponse.json(
          { error: "No token provided" },
          { status: 401 }
        )
      }

      // Verify the JWT token
      const payload = verifyAuthToken(token)

      if (!payload) {
        return NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        )
      }

      // Add verified address to request for handler use
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.verifiedAddress = payload.address

      return handler(authenticatedRequest)
    } catch (error) {
      console.error("JWT authentication error:", error)
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      )
    }
  }
}
