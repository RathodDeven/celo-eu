"use client"

import { useAccount } from "wagmi"
import { useAuth } from "@/providers/AuthProvider"
import { WalletConnectionPrompt, SignInPrompt } from "./AuthPrompts"

interface AuthGuardProps {
  children: React.ReactNode
  walletPromptTitle?: string
  walletPromptDescription?: string
  signInPromptTitle?: string
  signInPromptDescription?: string
  loadingComponent?: React.ReactNode
}

export function AuthGuard({
  children,
  walletPromptTitle,
  walletPromptDescription,
  signInPromptTitle,
  signInPromptDescription,
  loadingComponent
}: AuthGuardProps) {
  const { isConnected } = useAccount()
  const { isSignedIn, isLoading } = useAuth()

  // Show loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show wallet connection prompt if not connected
  if (!isConnected) {
    return (
      <WalletConnectionPrompt
        title={walletPromptTitle}
        description={walletPromptDescription}
      />
    )
  }

  // Show sign-in prompt if connected but not signed in
  if (!isSignedIn) {
    return (
      <SignInPrompt
        title={signInPromptTitle}
        description={signInPromptDescription}
      />
    )
  }

  // User is authenticated, show the protected content
  return <>{children}</>
}
