interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store for rate limiting
// In production, consider using Redis for distributed rate limiting
const rateLimitStore: RateLimitStore = {}

export interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests allowed in the window
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP address, wallet address, etc.)
 * @param options - Rate limiting configuration
 * @returns true if request should be allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): { allowed: boolean; remainingRequests: number; resetTime: number } {
  const now = Date.now()
  const key = identifier

  // Clean up expired entries
  if (rateLimitStore[key] && now > rateLimitStore[key].resetTime) {
    delete rateLimitStore[key]
  }

  // Initialize or get existing entry
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = {
      count: 0,
      resetTime: now + options.windowMs,
    }
  }

  const entry = rateLimitStore[key]

  // Check if limit exceeded
  if (entry.count >= options.maxRequests) {
    return {
      allowed: false,
      remainingRequests: 0,
      resetTime: entry.resetTime,
    }
  }

  // Increment counter and allow request
  entry.count++

  return {
    allowed: true,
    remainingRequests: options.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Rate limiting middleware for Next.js API routes
 */
export function withRateLimit(
  handler: (req: any, res?: any) => Promise<any>,
  options: RateLimitOptions
) {
  return async (request: any, response?: any) => {
    // Extract identifier (IP address or similar)
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown"

    const rateLimitResult = checkRateLimit(ip, options)

    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil(
        (rateLimitResult.resetTime - Date.now()) / 1000
      )

      return new Response(
        JSON.stringify({
          error: "Too many requests",
          retryAfter: retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": options.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        }
      )
    }

    // Add rate limit headers to successful responses
    const result = await handler(request, response)

    if (result && typeof result.headers?.set === "function") {
      result.headers.set("X-RateLimit-Limit", options.maxRequests.toString())
      result.headers.set(
        "X-RateLimit-Remaining",
        rateLimitResult.remainingRequests.toString()
      )
      result.headers.set(
        "X-RateLimit-Reset",
        rateLimitResult.resetTime.toString()
      )
    }

    return result
  }
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  challenge: { windowMs: 60 * 1000, maxRequests: 30 }, // 60 challenges per minute
  verify: { windowMs: 60 * 1000, maxRequests: 30 }, // 60 verification attempts per minute
  userUpdate: { windowMs: 60 * 1000, maxRequests: 30 }, // 60 profile updates per minute
}
