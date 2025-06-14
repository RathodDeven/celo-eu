"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi"
import {
  Check,
  User,
  Mail,
  AtSign,
  Award,
  ArrowRight,
  Loader2,
  ExternalLink,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthHook } from "@/hooks/useAuth"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import {
  nexusExplorerAddress,
  nexusExplorerAbi,
} from "@/lib/abi/NexusExplorerBadge"

interface FormData {
  name: string
  username: string
  email: string
}

export default function VekiProgram() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { isSignedIn, isLoading, signIn, error, clearError } = useAuthHook()
  const { openConnectModal } = useConnectModal()

  // Contract interactions
  const { data: hasMinted } = useReadContract({
    address: nexusExplorerAddress,
    abi: nexusExplorerAbi,
    functionName: "hasMinted",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected && isSignedIn,
    },
  })

  const {
    writeContract,
    data: hash,
    error: mintError,
    isPending: isMinting,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  // Component state
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    username: "",
    email: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({})
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  )
  // User existence state
  const [userExists, setUserExists] = useState<boolean | null>(null)
  const [userCheckLoading, setUserCheckLoading] = useState(false)

  // Username availability check
  useEffect(() => {
    const checkUsername = async () => {
      if (formData.username.length >= 3) {
        try {
          const response = await fetch(
            `/api/users/check-username?username=${formData.username}`
          )
          const data = await response.json()
          setUsernameAvailable(data.available)
        } catch (error) {
          console.error("Username check error:", error)
        }
      } else {
        setUsernameAvailable(null)
      }
    }

    const debounce = setTimeout(checkUsername, 500)
    return () => clearTimeout(debounce)
  }, [formData.username])

  // Check if user exists for the connected wallet
  useEffect(() => {
    const checkUserExists = async () => {
      if (address && isConnected && isSignedIn) {
        setUserCheckLoading(true)
        try {
          const res = await fetch(`/api/users/exists?address=${address}`)
          const data = await res.json()
          setUserExists(!!data.exists)
          // If user exists and badge is not minted, go to step 2
          if (data.exists && !hasMinted) {
            setCurrentStep(2)
          }
        } catch (e) {
          setUserExists(null)
        } finally {
          setUserCheckLoading(false)
        }
      } else {
        setUserExists(null)
      }
    }
    checkUserExists()
    // Only re-run when address, isConnected, isSignedIn, or hasMinted changes
  }, [address, isConnected, isSignedIn, hasMinted])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormErrors({})

    try {
      // Validate form
      const errors: Partial<FormData> = {}
      if (!formData.name.trim()) errors.name = "Name is required"
      if (!formData.username.trim()) errors.username = "Username is required"
      if (formData.username.length < 3)
        errors.username = "Username must be at least 3 characters"
      if (!formData.email.trim()) errors.email = "Email is required"
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        errors.email = "Invalid email format"

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        setIsSubmitting(false)
        return
      }

      if (!usernameAvailable) {
        setFormErrors({ username: "Username is not available" })
        setIsSubmitting(false)
        return
      }

      // Save user data
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          ...formData,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save user data")
      }

      // Move to next step
      setCurrentStep(2)
    } catch (error: any) {
      console.error("Form submission error:", error)
      setFormErrors({ email: error.message || "Something went wrong" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMintBadge = () => {
    if (!address) return

    writeContract({
      address: nexusExplorerAddress,
      abi: nexusExplorerAbi,
      functionName: "mintExplorerBadge",
    })
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  }
  // Show connect wallet screen
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-card">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 max-w-md mx-auto"
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
            Connect your wallet to access the Veki Program and claim your
            Explorer Badge.
          </p>{" "}
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

  // Show sign in screen
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-card">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 max-w-md mx-auto"
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
            Please sign the message to verify your wallet ownership and access
            the Veki Program.
          </p>{" "}
          <Button
            title={isLoading ? "Signing In..." : "Sign In"}
            onClick={() => {
              clearError()
              signIn()
            }}
            disabled={isLoading}
            size="lg"
            className="w-full bg-primary text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <User className="mr-2 h-5 w-5" />
                Sign In
              </>
            )}
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
  // Show badge already owned screen
  if (hasMinted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-brand-primary/5 to-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 max-w-lg mx-auto"
        >
          {/* Animated success indicator */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
            className="relative mb-8"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Award className="text-white" size={40} />
            </div>
            {/* Celebration particles */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: [0, Math.cos((i * 45 * Math.PI) / 180) * 60],
                    y: [0, Math.sin((i * 45 * Math.PI) / 180) * 60],
                  }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 1.5 }}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-4xl font-bold text-foreground mb-4">
              🎉 Congratulations!
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              You're officially part of the{" "}
              <span className="text-brand-primary font-semibold">
                Celo Europe
              </span>{" "}
              community! Your Explorer Badge proves your commitment to building
              a regenerative future.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <div className="relative">
              <img
                src="/explorer badge.png"
                alt="Explorer Badge"
                className="w-40 h-40 mx-auto rounded-xl shadow-xl border-4 border-gradient-to-r from-emerald-400 to-green-500"
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center"
              >
                <Check className="text-white" size={16} />
              </motion.div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 font-medium">
              Explorer Badge NFT • Owned by you
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <Button
              title="Access Cel'EU Dashboard"
              onClick={() => router.push("/dashboard")}
              size="lg"
              className="w-full bg-brand-primary text-white shadow-lg hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-all duration-200"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Access Cel'EU Dashboard
            </Button>

            <p className="text-xs text-muted-foreground">
              Explore exclusive resources, events, and opportunities in the Celo
              ecosystem
            </p>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // In the return, add a loading state for user check
  if (userCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span className="ml-4 text-lg text-muted-foreground">
          Checking your profile...
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card/50 to-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            The Veki Program
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join Celo Europe's community-powered badge system. Collect your
            Explorer Badge and shape decentralized regenerative solutions across
            Europe.
          </p>
        </motion.div>

        {/* Step Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-12"
        >
          <div className="flex items-center space-x-8">
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    currentStep >= step
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step ? <Check size={20} /> : step}
                </div>
                <span
                  className={`ml-3 font-medium transition-colors ${
                    currentStep >= step
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step === 1 ? "Register" : "Claim Badge"}
                </span>
                {step < 2 && (
                  <ArrowRight
                    className={`ml-8 transition-colors ${
                      currentStep > step
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                    size={20}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="max-w-md mx-auto"
            >
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-card border rounded-xl p-8 shadow-lg"
              >
                <motion.div
                  variants={itemVariants}
                  className="text-center mb-6"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="text-primary" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Create Your Profile
                  </h2>
                  <p className="text-muted-foreground">
                    Tell us about yourself to get started
                  </p>
                </motion.div>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className={formErrors.name ? "border-destructive" : ""}
                    />
                    {formErrors.name && (
                      <p className="text-destructive text-sm mt-1">
                        {formErrors.name}
                      </p>
                    )}
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <AtSign
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        size={16}
                      />
                      <Input
                        type="text"
                        placeholder="Choose a unique username"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            username: e.target.value,
                          }))
                        }
                        className={`pl-10 ${
                          formErrors.username
                            ? "border-destructive"
                            : usernameAvailable === false
                            ? "border-destructive"
                            : usernameAvailable === true
                            ? "border-green-500"
                            : ""
                        }`}
                      />
                      {formData.username.length >= 3 && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {usernameAvailable === null ? (
                            <Loader2
                              className="animate-spin text-muted-foreground"
                              size={16}
                            />
                          ) : usernameAvailable ? (
                            <Check className="text-green-500" size={16} />
                          ) : (
                            <span className="text-destructive text-sm">✕</span>
                          )}
                        </div>
                      )}
                    </div>
                    {formErrors.username && (
                      <p className="text-destructive text-sm mt-1">
                        {formErrors.username}
                      </p>
                    )}
                    {usernameAvailable === false && (
                      <p className="text-destructive text-sm mt-1">
                        Username is already taken
                      </p>
                    )}
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        size={16}
                      />
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className={`pl-10 ${
                          formErrors.email ? "border-destructive" : ""
                        }`}
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-destructive text-sm mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </motion.div>{" "}
                  <motion.div variants={itemVariants}>
                    <Button
                      type="submit"
                      title={
                        isSubmitting ? "Saving..." : "Continue to Badge Claim"
                      }
                      onClick={() => {}}
                      disabled={isSubmitting || !usernameAvailable}
                      className="w-full bg-primary text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Continue to Badge Claim
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="max-w-md mx-auto"
            >
              {!isConfirmed ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-card border rounded-xl p-8 shadow-lg text-center"
                >
                  <motion.div variants={itemVariants} className="mb-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="text-primary" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Claim Your Explorer Badge
                    </h2>
                    <p className="text-muted-foreground">
                      Mint your unique NFT badge to join the Celo Europe
                      community
                    </p>
                  </motion.div>
                  <motion.div variants={itemVariants} className="mb-6">
                    <img
                      src="/explorer badge.png"
                      alt="Explorer Badge"
                      className="w-32 h-32 mx-auto rounded-lg shadow-md"
                    />
                  </motion.div>{" "}
                  <motion.div variants={itemVariants}>
                    <Button
                      title={
                        isMinting || isConfirming
                          ? isMinting
                            ? "Confirming Transaction..."
                            : "Minting Badge..."
                          : "Claim Explorer Badge"
                      }
                      onClick={handleMintBadge}
                      disabled={isMinting || isConfirming}
                      className="w-full bg-brand-primary text-white shadow-lg hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      size="lg"
                    >
                      {isMinting || isConfirming ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isMinting
                            ? "Confirming Transaction..."
                            : "Minting Badge..."}
                        </>
                      ) : (
                        <>
                          Claim Explorer Badge
                          <Award className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    {mintError && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                      >
                        <p className="text-destructive text-sm">
                          {mintError.message ||
                            "Failed to mint badge. Please try again."}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-card border rounded-xl p-8 shadow-lg text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Check className="text-green-500" size={32} />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Explorer Badge Collected!
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Welcome to the Celo Europe community. Your journey begins
                    now.
                  </p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6"
                  >
                    <img
                      src="/explorer badge.png"
                      alt="Explorer Badge"
                      className="w-32 h-32 mx-auto rounded-lg shadow-md border-2 border-green-500/20"
                    />
                  </motion.div>{" "}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button
                      title="Access My Cel'EU Dashboard"
                      onClick={() => router.push("/dashboard")}
                      className="w-full bg-brand-primary text-white shadow-lg hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-all duration-200"
                      size="lg"
                    >
                      Access My Cel'EU Dashboard
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                  {hash && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="mt-4"
                    >
                      <p className="text-xs text-muted-foreground">
                        Transaction:{" "}
                        <a
                          href={`https://celoscan.io/tx/${hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View on Celoscan
                        </a>
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
