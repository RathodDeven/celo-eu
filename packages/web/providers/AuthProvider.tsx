"use client"

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react"
import { useAccount, useSignMessage } from "wagmi"

interface AuthContextType {
  isSignedIn: boolean
  isLoading: boolean
  error: string | null
  token: string | null
  signedAddress: string | null
  challengeMessage: string | null
  challengeSignature: string | null
  signIn: () => Promise<boolean>
  clearError: () => void
  updateUserProfile: (
    currentData: { name?: string; email?: string },
    userAddress: string
  ) => Promise<boolean>
  isWalletConnected: boolean
  connectedAddress: string | undefined
}

interface AuthData {
  token: string
  address: string
  expiresAt: number
  challengeMessage: string
  challengeSignature: string
}

const AUTH_STORAGE_KEY = "celo-eu-auth"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [authState, setAuthState] = useState<
    Omit<
      AuthContextType,
      | "signIn"
      | "clearError"
      | "updateUserProfile"
      | "isWalletConnected"
      | "connectedAddress"
    >
  >({
    isSignedIn: false,
    isLoading: false,
    error: null,
    token: null,
    signedAddress: null,
    challengeMessage: null,
    challengeSignature: null,
  })

  // Load auth state from localStorage on mount and address change
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
        if (!storedAuth) {
          // If no stored auth, ensure signature is also cleared from state
          setAuthState((prev) => ({
            ...prev,
            isSignedIn: false,
            token: null,
            signedAddress: null,
            challengeMessage: null,
            challengeSignature: null,
          }))
          return
        }

        const authData: AuthData = JSON.parse(storedAuth)

        // Check if token is expired
        if (Date.now() > authData.expiresAt) {
          localStorage.removeItem(AUTH_STORAGE_KEY)
          setAuthState((prev) => ({
            ...prev,
            isSignedIn: false,
            token: null,
            signedAddress: null,
            challengeMessage: null,
            challengeSignature: null,
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
            challengeMessage: null,
            challengeSignature: null,
          }))
          return
        }

        // If address matches or no address yet (wallet not connected), keep the auth state
        if (
          !address ||
          address.toLowerCase() === authData.address.toLowerCase()
        ) {
          setAuthState((prev) => ({
            ...prev,
            isSignedIn: true,
            token: authData.token,
            signedAddress: authData.address,
            challengeMessage: authData.challengeMessage,
            challengeSignature: authData.challengeSignature,
          }))
        }
      } catch (error) {
        console.error("Error loading auth state:", error)
        localStorage.removeItem(AUTH_STORAGE_KEY)
        setAuthState((prev) => ({
          ...prev,
          isSignedIn: false,
          token: null,
          signedAddress: null,
          challengeMessage: null,
          challengeSignature: null,
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
          challengeMessage: null,
          challengeSignature: null,
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
          challengeMessage: null,
          challengeSignature: null,
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
          challengeMessage: authData.challengeMessage,
          challengeSignature: authData.challengeSignature,
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
        challengeMessage: null,
        challengeSignature: null,
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
      const { message: challengeToSign } = await challengeResponse.json() // Renamed for clarity
      console.log("Challenge received, requesting signature...")

      // Add a small delay to ensure challenge is stored in backend
      await new Promise((resolve) => setTimeout(resolve, 500)) // 500ms delay

      // Step 2: Sign the message
      let signedChallengeHex: string // Variable to store the signature
      try {
        signedChallengeHex = await signMessageAsync({
          message: challengeToSign,
        })
        console.log("Message signed successfully")
      } catch (signError: any) {
        console.error("Error signing message:", signError)
        throw new Error(
          signError.message || "Failed to sign message. Please try again."
        )
      }

      // Step 3: Verify signature with server (with retry logic)
      console.log("Verifying signature...")

      let verifyResponse: Response | undefined
      let retryCount = 0
      const maxRetries = 2

      while (retryCount <= maxRetries) {
        try {
          verifyResponse = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              address,
              signature: signedChallengeHex,
              message: challengeToSign, // Send the original challenge message for verification
            }),
          })
          if (verifyResponse.ok) break
          if (verifyResponse.status === 401 && retryCount < maxRetries) {
            console.warn(
              `Signature verification failed (attempt ${
                retryCount + 1
              }), retrying...`
            )
            await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1s before retry
          } else if (!verifyResponse.ok) {
            const verifyError = await verifyResponse.json()
            throw new Error(
              verifyError.error || "Signature verification failed"
            )
          }
        } catch (fetchError: any) {
          if (retryCount >= maxRetries) throw fetchError
          console.warn(
            `Fetch error during verification (attempt ${retryCount + 1}): ${
              fetchError.message
            }, retrying...`
          )
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
        retryCount++
      }

      if (!verifyResponse || !verifyResponse.ok) {
        throw new Error(
          "Failed to verify signature after multiple retries or unrecoverable error."
        )
      }

      const {
        token,
        address: verifiedAddress,
        expiresAt,
      } = await verifyResponse.json()
      console.log("Authentication successful!")

      // Step 4: Store auth data
      const authData: AuthData = {
        token,
        address: verifiedAddress,
        expiresAt,
        challengeMessage: challengeToSign, // Store challenge message
        challengeSignature: signedChallengeHex, // Store signature
      }

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData))

      setAuthState({
        isSignedIn: true,
        isLoading: false,
        error: null,
        token,
        signedAddress: verifiedAddress,
        challengeMessage: challengeToSign,
        challengeSignature: signedChallengeHex,
      })

      return true
    } catch (error: any) {
      console.error("Sign in error:", error)
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to sign in",
        challengeMessage: null,
        challengeSignature: null,
      }))
      return false
    }
  }, [address, isConnected, signMessageAsync])

  const updateUserProfile = useCallback(
    async (
      currentData: { name?: string; email?: string },
      userAddress: string
    ) => {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

      // Check 1: Wallet connected? (using address and isConnected from useAccount)
      if (!address || !isConnected) {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Wallet not connected. Please connect your wallet.",
        }))
        return false
      }

      // Check 2: User authenticated in app state?
      if (!authState.token || !authState.signedAddress) {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: "User not authenticated. Please sign in.",
        }))
        return false
      }

      // Check 3: Is the operation for the currently authenticated user's address?
      if (authState.signedAddress.toLowerCase() !== userAddress.toLowerCase()) {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            "Mismatch in user address for update. Operation intended for a different user.",
        }))
        return false
      }

      // Check 4: CRITICAL - Does the currently connected wallet match the authenticated user?
      if (address.toLowerCase() !== authState.signedAddress.toLowerCase()) {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            "Connected wallet does not match the authenticated user. Please use the wallet you signed in with or sign in again.",
        }))
        return false
      }

      // If all checks pass, 'address' (from useAccount) is the correct, verified address to use.
      const messageData = {
        address: address, // Use current connected address
        name: currentData.name,
        email: currentData.email,
        timestamp: Date.now(),
      }
      const messageToSign = JSON.stringify(messageData)

      try {
        const signature = await signMessageAsync({ message: messageToSign })

        const payload = {
          message: messageData,
          signature: signature,
          address: address, // Use current connected address
        }

        const response = await fetch("/api/users", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${authState.token}`, // Include if your API also uses token
          },
          body: JSON.stringify(payload),
        })

        const result = await response.json()

        if (!response.ok) {
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
            error: result.error || "Failed to update profile.",
          }))
          return false
        }

        // Update user information in authState if necessary, e.g., if name/email is stored there
        // For now, just clear loading and error.
        setAuthState((prev) => ({ ...prev, isLoading: false, error: null }))
        // console.log("Profile updated successfully:", result);
        return true
      } catch (e: any) {
        console.error("Update profile error:", e)
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            e.message || "An unexpected error occurred while updating profile.",
        }))
        return false
      }
    },
    [
      address,
      isConnected,
      authState.token,
      authState.signedAddress,
      signMessageAsync,
    ]
  )

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }))
  }, [])

  // Combine all state and functions into a single context value
  const authContextValue = {
    ...authState,
    signIn,
    clearError,
    updateUserProfile,
    isWalletConnected: isConnected,
    connectedAddress: address,
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
