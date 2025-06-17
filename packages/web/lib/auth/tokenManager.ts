import { AuthData } from "@/providers/AuthProvider"

const AUTH_STORAGE_KEY = "celo-eu-auth"

/**
 * Utility to make authenticated API calls with automatic token refresh
 */
export async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit = {},
  onAuthRequired?: () => Promise<boolean>
): Promise<Response> {
  const authData = getStoredAuthData()

  if (!authData) {
    throw new Error("No authentication data available")
  }

  // First, try with current token
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${authData.token}`,
    },
  })

  // If token is expired (401), try to refresh
  if (response.status === 401) {
    console.log("Token expired, attempting refresh...")

    const refreshed = await refreshAuthToken()

    if (refreshed) {
      // Retry the original request with new token
      const newAuthData = getStoredAuthData()
      if (newAuthData) {
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newAuthData.token}`,
          },
        })
      }
    } else {
      // Refresh failed, need new authentication
      console.log("Token refresh failed, authentication required")
      if (onAuthRequired) {
        const authenticated = await onAuthRequired()
        if (authenticated) {
          // Retry with new authentication
          const newAuthData = getStoredAuthData()
          if (newAuthData) {
            response = await fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${newAuthData.token}`,
              },
            })
          }
        }
      } else {
        throw new Error("Authentication required")
      }
    }
  }

  return response
}

/**
 * Attempt to refresh the access token using the refresh token
 */
async function refreshAuthToken(): Promise<boolean> {
  try {
    const authData = getStoredAuthData()
    if (!authData?.refreshToken) {
      console.log("No refresh token available")
      return false
    }

    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: authData.refreshToken,
      }),
    })

    if (!response.ok) {
      console.log("Refresh token request failed:", response.status)
      // Clear invalid auth data
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return false
    }

    const { token, refreshToken, address, expiresAt } = await response.json()

    // Update stored auth data with new tokens
    const newAuthData: AuthData = {
      ...authData,
      token,
      refreshToken,
      address,
      expiresAt,
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthData))
    console.log("Token refreshed successfully")
    return true
  } catch (error) {
    console.error("Token refresh error:", error)
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return false
  }
}

/**
 * Get stored authentication data
 */
function getStoredAuthData(): AuthData | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored) as AuthData
  } catch {
    return null
  }
}

/**
 * Check if token is expired or expiring soon
 */
export function isTokenExpired(authData: AuthData): boolean {
  return Date.now() > authData.expiresAt
}

/**
 * Check if token is expiring within the next hour
 */
export function isTokenExpiringSoon(authData: AuthData): boolean {
  const oneHour = 60 * 60 * 1000 // 1 hour in milliseconds
  return Date.now() > authData.expiresAt - oneHour
}
