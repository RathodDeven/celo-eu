import { useState, useEffect, useCallback } from "react"
import { useAccount, useSignMessage } from "wagmi"

interface AuthState {
  isSignedIn: boolean
  isLoading: boolean
  error: string | null
  token: string | null
  signedAddress: string | null
}

interface AuthData {
  token: string
  address: string
  expiresAt: number
}

const AUTH_STORAGE_KEY = "celo-eu-auth"

export const useAuthHook = () => {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()

  const [authState, setAuthState] = useState<AuthState>({
    isSignedIn: false,
    isLoading: false,
    error: null,
    token: null,
    signedAddress: null,
  })
  // Load auth state from localStorage on mount and address change
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
        if (!storedAuth) return

        const authData: AuthData = JSON.parse(storedAuth)

        // Check if token is expired
        if (Date.now() > authData.expiresAt) {
          localStorage.removeItem(AUTH_STORAGE_KEY)
          setAuthState((prev) => ({
            ...prev,
            isSignedIn: false,
            token: null,
            signedAddress: null,
          }))
          return
        }

        // If we have a connected address and it doesn't match, clear auth
        if (
          address &&
          address.toLowerCase() !== authData.address.toLowerCase()
        ) {
          localStorage.removeItem(AUTH_STORAGE_KEY)
          setAuthState((prev) => ({
            ...prev,
            isSignedIn: false,
            token: null,
            signedAddress: null,
          }))
          return
        }

        // If address matches or no address yet (wallet not connected), keep the auth state
        if (
          !address ||
          address.toLowerCase() === authData.address.toLowerCase()
        ) {
          setAuthState({
            isSignedIn: true,
            isLoading: false,
            error: null,
            token: authData.token,
            signedAddress: authData.address,
          })
        }
      } catch (error) {
        console.error("Error loading auth state:", error)
        localStorage.removeItem(AUTH_STORAGE_KEY)
        setAuthState((prev) => ({
          ...prev,
          isSignedIn: false,
          token: null,
          signedAddress: null,
        }))
      }
    }

    loadAuthState()
  }, [address])
  // Handle address changes and token validation
  useEffect(() => {
    // Don't clear auth state just because wallet is disconnected
    // Only clear when address actually changes or token is invalid

    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!storedAuth) return

    try {
      const authData: AuthData = JSON.parse(storedAuth)

      // Check if token is expired
      if (Date.now() > authData.expiresAt) {
        localStorage.removeItem(AUTH_STORAGE_KEY)
        setAuthState({
          isSignedIn: false,
          isLoading: false,
          error: null,
          token: null,
          signedAddress: null,
        })
        return
      }

      // If wallet is connected and address has changed, clear auth
      if (
        isConnected &&
        address &&
        address.toLowerCase() !== authData.address.toLowerCase()
      ) {
        localStorage.removeItem(AUTH_STORAGE_KEY)
        setAuthState({
          isSignedIn: false,
          isLoading: false,
          error: null,
          token: null,
          signedAddress: null,
        })
        return
      }

      // If wallet reconnects with same address and valid token, restore auth state
      if (
        isConnected &&
        address &&
        address.toLowerCase() === authData.address.toLowerCase()
      ) {
        setAuthState({
          isSignedIn: true,
          isLoading: false,
          error: null,
          token: authData.token,
          signedAddress: authData.address,
        })
      }
    } catch (error) {
      console.error("Error handling auth state:", error)
      localStorage.removeItem(AUTH_STORAGE_KEY)
      setAuthState({
        isSignedIn: false,
        isLoading: false,
        error: null,
        token: null,
        signedAddress: null,
      })
    }
  }, [isConnected, address])
  const signIn = useCallback(async () => {
    if (!address || !isConnected) {
      setAuthState((prev) => ({
        ...prev,
        error: "Please connect your wallet first",
      }))
      return false
    }

    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      console.log("Starting sign-in process for address:", address)

      // Step 1: Request challenge from server
      const challengeResponse = await fetch("/api/auth/challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      })

      if (!challengeResponse.ok) {
        const challengeError = await challengeResponse.json()
        throw new Error(challengeError.error || "Failed to get challenge")
      }
      const { message } = await challengeResponse.json()
      console.log("Challenge received, requesting signature...")

      // Add a small delay to ensure challenge is stored in backend
      await new Promise((resolve) => setTimeout(resolve, 500)) // 500ms delay

      // Step 2: Sign the message
      let signature: string
      try {
        signature = await signMessageAsync({ message })
        console.log("Message signed successfully")
      } catch (signError: any) {
        console.log("User cancelled signature or signing failed:", signError)
        throw new Error("Signature was cancelled or failed. Please try again.")
      } // Step 3: Verify signature with server (with retry logic)
      console.log("Verifying signature...")

      let verifyResponse: Response
      let retryCount = 0
      const maxRetries = 2

      while (retryCount <= maxRetries) {
        try {
          // Add a small delay to ensure challenge is properly stored
          if (retryCount > 0) {
            console.log(`Retry attempt ${retryCount} for verification...`)
            await new Promise((resolve) => setTimeout(resolve, 1000)) // 1 second delay
          }

          verifyResponse = await fetch("/api/auth/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              address,
              signature,
              message,
            }),
          })

          if (verifyResponse.ok) {
            break // Success, exit retry loop
          }

          const errorData = await verifyResponse.json()

          // If it's a "No challenge found" error and we haven't exceeded retries, try again
          if (
            errorData.error?.includes("No challenge found") &&
            retryCount < maxRetries
          ) {
            console.log(
              `Challenge not found, retrying... (attempt ${retryCount + 1}/${
                maxRetries + 1
              })`
            )
            retryCount++
            continue
          }

          // For other errors or max retries exceeded, throw error
          throw new Error(errorData.error || "Verification failed")
        } catch (fetchError) {
          if (retryCount < maxRetries) {
            console.log(
              `Network error, retrying... (attempt ${retryCount + 1}/${
                maxRetries + 1
              })`
            )
            retryCount++
            continue
          }
          throw fetchError
        }
      }

      const {
        token,
        address: verifiedAddress,
        expiresAt,
      } = await verifyResponse!.json()
      console.log("Authentication successful!")

      // Step 4: Store auth data
      const authData: AuthData = {
        token,
        address: verifiedAddress,
        expiresAt,
      }

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData))

      setAuthState({
        isSignedIn: true,
        isLoading: false,
        error: null,
        token,
        signedAddress: verifiedAddress,
      })

      return true
    } catch (error: any) {
      console.error("Sign in error:", error)
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to sign in",
      }))
      return false
    }
  }, [address, isConnected, signMessageAsync])

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }))
  }, [])

  return {
    ...authState,
    signIn,
    clearError,
    isWalletConnected: isConnected,
    connectedAddress: address,
  }
}
