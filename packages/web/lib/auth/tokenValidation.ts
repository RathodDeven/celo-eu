import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken, TokenPayload } from "./jwt"

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload
}

/**
 * Middleware to validate JWT tokens on protected routes
 */
export function withTokenValidation(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify the token
    const payload = verifyAuthToken(token)
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Add user info to request object
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = payload

    return handler(authenticatedRequest)
  }
}

/**
 * Extract token from request (checks multiple locations)
 */
export function extractToken(request: NextRequest): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Check cookies as fallback
  const cookieToken = request.cookies.get('auth-token')?.value
  if (cookieToken) {
    return cookieToken
  }

  return null
}

/**
 * Flexible token validation that supports multiple token sources
 */
export function withFlexibleTokenValidation(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  options: { required?: boolean } = { required: true }
) {
  return async (request: NextRequest) => {
    const token = extractToken(request)
    
    if (!token) {
      if (options.required) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      // If token not required, proceed without user context
      return handler(request as AuthenticatedRequest)
    }

    // Verify the token
    const payload = verifyAuthToken(token)
    
    if (!payload) {
      if (options.required) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      }
      // If token not required and invalid, proceed without user context
      return handler(request as AuthenticatedRequest)
    }

    // Add user info to request object
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = payload

    return handler(authenticatedRequest)
  }
}
