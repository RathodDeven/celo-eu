"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { nexusExplorerAbi, nexusExplorerAddress } from "@/lib/abi/contracts"
import { motion } from "framer-motion"
import {
  Award,
  Users,
  Zap,
  ChevronDown,
  Globe,
  Star,
  MessageSquare,
  Calendar,
  Shield,
  Wallet,
} from "lucide-react"
import { useAccount, useReadContract } from "wagmi"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { celoAlfajores } from "viem/chains"
import { currentChain } from "@/providers/WagmiWrapper"
import { useAuth } from "@/providers/AuthProvider"

export default function Home() {
  const [isCheckingBadge, setIsCheckingBadge] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()

  // Using our custom auth hook
  const {
    isSignedIn,
    isLoading: isSigningIn,
    signIn,
    error: signInError,
    clearError,
  } = useAuth()
  // Use Wagmi's useReadContract hook to check for NFT ownership using hasMinted
  const { data: hasMinted, isLoading: isLoadingTokens } = useReadContract({
    address: nexusExplorerAddress,
    abi: nexusExplorerAbi,
    functionName: "hasMinted",
    args: address ? [address] : undefined,
    chainId: currentChain.id,
    query: {
      enabled: !!address && isConnected && isSignedIn,
    },
  })

  // Determine if user has Explorer Badge
  const hasExplorerBadge = hasMinted || false
  const handleButtonClick = async () => {
    if (!isConnected || !address) {
      // Open RainbowKit connect modal if wallet is not connected
      openConnectModal?.()
      return
    }

    if (!isSignedIn) {
      // Sign in if not signed in
      clearError()
      await signIn()
      return
    }

    setIsCheckingBadge(true)
    setErrorMessage(null)

    try {
      if (hasExplorerBadge) {
        router.push("/dashboard")
      } else {
        router.push("/veki")
      }
    } catch (err) {
      console.error("❌ Error navigating:", err)
      setErrorMessage(
        "An error occurred. Please refresh the page and try again."
      )
    } finally {
      setIsCheckingBadge(false)
    }
  }
  // Determine button text based on connection and badge status
  const getButtonText = () => {
    if (!isConnected) return "Connect to Start"
    if (!isSignedIn) return "Sign In to Continue"
    if (isLoadingTokens) return "Checking Badge..."
    return hasExplorerBadge ? "Access Dashboard" : "Join the Veki Program"
  }

  // Determine button icon based on connection and badge status
  const getButtonIcon = () => {
    if (!isConnected) return <Wallet size={18} />
    if (!isSignedIn) return <Wallet size={18} />
    if (hasExplorerBadge) return <Award size={18} />
    return <Zap size={18} />
  }

  // Animation variants remain the same
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const badgeContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.4,
      },
    },
  }

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 15,
      },
    },
  }
  // Show loading indicator while checking token data
  if (isConnected && isSignedIn && isLoadingTokens) {
    return (
      <div className="h-screen flex justify-center items-center bg-gradient-to-b from-brand-primary to-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-white"
        >
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium">Checking your badges...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute w-[500px] h-[500px] rounded-full bg-brand-primary/20 top-0 -left-64 blur-3xl"></div>
          <div className="absolute w-[500px] h-[500px] rounded-full bg-brand-secondary/20 -bottom-64 -right-64 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            className="flex flex-col items-center text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="mb-6 relative">
              <Image
                src="/explorer badge.png"
                alt="Celo Europe Veki"
                width={180}
                height={180}
                className="rounded-full shadow-xl border-4 border-brand-secondary"
                priority
              />
              <motion.div
                className="absolute -bottom-2 -right-2 bg-brand-secondary text-background rounded-full p-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 500 }}
              >
                <Award size={24} />
              </motion.div>
            </motion.div>
            <motion.h1
              variants={fadeIn}
              className="text-4xl md:text-5xl font-bold mb-4 text-foreground bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary"
            >
              Accelerating Celo in Europe
            </motion.h1>
            <motion.p
              variants={fadeIn}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8"
            >
              #CeloEU supports mission-driven entrepreneurs and creators to
              build lasting solutions that leverage the Celo ecosystem.
            </motion.p>{" "}
            <motion.div
              variants={fadeIn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={handleButtonClick}
                disabled={isCheckingBadge || isSigningIn}
                className="relative overflow-hidden rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary px-8 py-3 text-base font-semibold text-white shadow-lg group disabled:opacity-70"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isCheckingBadge || isSigningIn ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isSigningIn ? "Signing..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      {getButtonIcon()}
                      {getButtonText()}
                    </>
                  )}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-brand-secondary to-brand-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            </motion.div>
            {isConnected && isSignedIn && hasExplorerBadge && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-brand-secondary font-medium bg-brand-secondary/10 px-4 py-2 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Award size={16} />
                  Explorer Badge Detected
                </div>
              </motion.div>
            )}
            {(errorMessage || signInError) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-destructive font-medium bg-destructive/10 px-4 py-2 rounded-lg"
              >
                {errorMessage || signInError}
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="mt-12 animate-bounce"
            >
              <ChevronDown size={32} className="text-muted-foreground" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Veki Program Section */}
      <section className="py-16 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.div variants={fadeIn} className="inline-block mb-2">
              <Shield size={32} className="mx-auto text-brand-secondary" />
            </motion.div>
            <motion.h2
              variants={fadeIn}
              className="text-3xl md:text-4xl font-bold mb-4 text-foreground"
            >
              The Veki Program
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-lg text-muted-foreground max-w-3xl mx-auto"
            >
              Veki is Celo Europe&apos;s community-powered badge system. By
              collecting a Veki badge, you join the movement to shape
              decentralized regenerative solutions across Europe.
            </motion.p>
          </motion.div>
          <motion.div
            variants={badgeContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12"
          >
            {/* Explorer Badge Card */}
            <motion.div
              variants={badgeVariants}
              whileHover={{
                y: -10,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              className="bg-gradient-to-br from-background to-card border border-border rounded-2xl overflow-hidden shadow-lg"
            >
              <div className="p-8">
                <div className="mb-6 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand-primary/10 p-3 rounded-full">
                      <Globe className="text-brand-primary h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">
                      Explorer Badge
                    </h3>
                  </div>
                  <div className="bg-brand-primary/10 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium text-brand-primary">
                      Level 1
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-8">
                  The first level of our membership is the Explorer Pass.
                  It&apos;s open to anyone and can be minted directly from our
                  dashboard.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="text-brand-secondary h-5 w-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Access to our workspace for coordination and
                      community discussions
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="text-brand-secondary h-5 w-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Early-bird access to local events and workshops
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="text-brand-secondary h-5 w-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Feedback channels and community support
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contributor Badge Card */}
            <motion.div
              variants={badgeVariants}
              whileHover={{
                y: -10,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              className="bg-gradient-to-br from-background to-card border border-border rounded-2xl overflow-hidden shadow-lg"
            >
              <div className="p-8">
                <div className="mb-6 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand-secondary/10 p-3 rounded-full">
                      <Star className="text-brand-secondary h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">
                      Contributor Badge
                    </h3>
                  </div>
                  <div className="bg-brand-secondary/10 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium text-brand-secondary">
                      Level 2
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-8">
                  Awarded during IRL events and quests. Unlocks access to the
                  workspace, and project collaborations.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Award className="text-brand-primary h-5 w-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Participate in missions
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="text-brand-primary h-5 w-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Access to our workspace and earn reputation
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="text-brand-primary h-5 w-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Collaborate on community projects
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>{" "}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-16 text-center"
          >
            <button
              onClick={handleButtonClick}
              disabled={isCheckingBadge || isSigningIn}
              className="relative overflow-hidden rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-2.5 text-base font-semibold text-white shadow-lg group disabled:opacity-70"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isCheckingBadge || isSigningIn ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isSigningIn ? "Signing..." : "Processing..."}
                  </>
                ) : (
                  <>
                    {getButtonIcon()}
                    {getButtonText()}
                  </>
                )}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-brand-secondary to-brand-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row justify-between items-center"
          >
            <div className="flex items-center mb-4 md:mb-0">
              <Image
                src="/explorer badge.png"
                alt="Celo Europe Logo"
                width={40}
                height={40}
                className="rounded-full mr-2"
              />
              <span className="text-foreground font-semibold">Celo Europe</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Celo EU. All rights reserved.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}
