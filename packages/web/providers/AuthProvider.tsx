"use client"

import React, { createContext, useContext, ReactNode } from "react"
import { useAuthHook } from "@/hooks/useAuth"

interface AuthContextType {
  isSignedIn: boolean
  isLoading: boolean
  error: string | null
  token: string | null
  signedAddress: string | null
  signIn: () => Promise<boolean>
  clearError: () => void
  isWalletConnected: boolean
  connectedAddress: string | undefined
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const authState = useAuthHook()

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
