"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAccount } from "wagmi"
import { useAuth } from "@/providers/AuthProvider"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
  requiresAuth?: boolean
}

export function ProtectedRoute({ 
  children, 
  fallback,
  redirectTo,
  requiresAuth = true 
}: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isConnected } = useAccount()
  const { isSignedIn, isLoading } = useAuth()

  useEffect(() => {
    if (!requiresAuth) return

    // Store the current path for redirect after auth
    if (!isConnected || !isSignedIn) {
      sessionStorage.setItem('returnTo', pathname)
    }

    // Redirect logic
    if (redirectTo && (!isConnected || !isSignedIn) && !isLoading) {
      router.push(redirectTo)
    }
  }, [isConnected, isSignedIn, isLoading, router, redirectTo, pathname, requiresAuth])

  // Show loading state
  if (requiresAuth && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
        <span className="ml-4 text-xl text-muted-foreground">
          Loading...
        </span>
      </div>
    )
  }

  // Show fallback if not authenticated and fallback is provided
  if (requiresAuth && (!isConnected || !isSignedIn) && fallback) {
    return <>{fallback}</>
  }

  // Show children if authenticated or no auth required
  if (!requiresAuth || (isConnected && isSignedIn)) {
    return <>{children}</>
  }

  // Default fallback - should not reach here if redirectTo is provided
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="text-muted-foreground">Please connect your wallet and sign in.</p>
      </div>
    </div>
  )
}
