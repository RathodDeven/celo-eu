"use client"

import { motion } from "framer-motion"
import { useAccount } from "wagmi"
import { useAuth } from "@/providers/AuthProvider"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { Button } from "@/components/ui/button"
import { Loader2, User, Wallet, Construction } from "lucide-react"

export default function ContributorPage() {
  const { address, isConnected } = useAccount()
  const {
    isSignedIn,
    isLoading: authLoading,
    signIn,
    error: authError,
    clearError: clearAuthError,
  } = useAuth()
  const { openConnectModal } = useConnectModal()

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-card">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 max-w-md mx-auto bg-card rounded-xl shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Wallet className="text-primary" size={32} />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-muted-foreground mb-8">
            Connect your wallet to learn about the Contributor Pass.
          </p>
          <Button
            title="Connect Wallet"
            onClick={() => openConnectModal?.()}
            size="lg"
            className="w-full bg-primary text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <Wallet className="mr-2 h-5 w-5" />
            Connect Wallet
          </Button>
        </motion.div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-card">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 max-w-md mx-auto bg-card rounded-xl shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <User className="text-primary" size={32} />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Sign In Required
          </h1>
          <p className="text-muted-foreground mb-8">
            Please sign the message to verify your wallet ownership.
          </p>
          <Button
            title={authLoading ? "Signing In..." : "Sign In"}
            onClick={() => {
              clearAuthError()
              signIn()
            }}
            disabled={authLoading}
            size="lg"
            className="w-full bg-primary text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <User className="mr-2 h-5 w-5" />
            )}
            {authLoading ? "Signing In..." : "Sign In"}
          </Button>
          {authError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
            >
              <p className="text-destructive text-sm">{authError}</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-card/5 to-background text-foreground p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center bg-card p-8 md:p-12 rounded-xl shadow-2xl max-w-lg mx-auto border border-border"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
          className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <Construction className="text-secondary" size={48} />
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
          Contributor Pass - Coming Soon!
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          The Contributor Pass will unlock new levels of participation within
          the Celo Europe ecosystem, including governance rights and more. We
          are working hard to bring this to you.
        </p>
        <p className="text-sm text-foreground mb-2">Stay tuned for updates!</p>
        <p className="text-xs text-muted-foreground">
          Your connected address: {address}
        </p>
      </motion.div>
    </div>
  )
}
