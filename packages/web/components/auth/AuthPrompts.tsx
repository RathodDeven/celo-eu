"use client"

import { motion } from "framer-motion"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useAuth } from "@/providers/AuthProvider"
import { Button } from "@/components/ui/button"
import { Wallet, User, Loader2 } from "lucide-react"

interface WalletConnectionPromptProps {
  title?: string
  description?: string
  className?: string
}

export function WalletConnectionPrompt({ 
  title = "Connect Your Wallet",
  description = "Connect your wallet to access this feature.",
  className = ""
}: WalletConnectionPromptProps) {
  const { openConnectModal } = useConnectModal()

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-card ${className}`}>
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
          {title}
        </h1>
        <p className="text-muted-foreground mb-8">
          {description}
        </p>        <Button
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

interface SignInPromptProps {
  title?: string
  description?: string
  className?: string
}

export function SignInPrompt({ 
  title = "Sign In Required",
  description = "Please sign the message to verify your wallet ownership.",
  className = ""
}: SignInPromptProps) {
  const {
    isLoading,
    signIn,
    error,
    clearError,
  } = useAuth()

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-card ${className}`}>
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
          {title}
        </h1>
        <p className="text-muted-foreground mb-8">
          {description}
        </p>        <Button
          title={isLoading ? "Signing In..." : "Sign In"}
          onClick={() => {
            clearError()
            signIn()
          }}
          disabled={isLoading}
          loading={isLoading}
          size="lg"
          className="w-full bg-primary text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <User className="mr-2 h-5 w-5" />
          )}
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
          >
            <p className="text-destructive text-sm">{error}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
