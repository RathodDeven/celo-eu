"use client"

import { useRouter } from "next/navigation"
import { useAccount, useChainId } from "wagmi"
import {
  useReadContract,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi"
import { encodeFunctionData } from "viem"
import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AuthGuard } from "@/components/auth/AuthGuard"

import {
  AlertCircle,
  ArrowRight,
  AtSign,
  Award,
  Bell,
  Calendar,
  Check,
  ExternalLink,
  Gift,
  Loader2,
  Mail,
  MessageSquare,
  ShieldCheck,
  UserCircle,
  UserPlus,
  PartyPopper,
} from "lucide-react"

import { nexusExplorerAddress, nexusExplorerAbi } from "@/lib/abi/contracts"
import { useAuth } from "@/providers/AuthProvider"
import { getDivviDataSuffix, submitDivviReferral } from "@/lib/divvi-utils"

interface FormData {
  name: string
  username: string
  email: string
}

function VekiProgramContent() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const {
    isSignedIn,
    makeAuthenticatedRequest, // Use the new authenticated request method
  } = useAuth()
  // Contract interactions
  const { data: hasMinted, refetch: refetchHasMinted } = useReadContract({
    address: nexusExplorerAddress,
    abi: nexusExplorerAbi,
    functionName: "hasMinted",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected && isSignedIn,
      staleTime: 0, // Ensure fresh data is fetched
      gcTime: 0, // Minimize caching of unused data
    },
  })

  const {
    sendTransaction,
    data: hash,
    error: mintError,
    isPending: isMinting,
  } = useSendTransaction()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  // Submit Divvi referral after successful transaction
  useEffect(() => {
    if (isConfirmed && hash) {
      submitDivviReferral(hash, chainId)
    }
  }, [isConfirmed, hash, chainId])

  // Component state
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    username: "",
    email: "",
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedToMarketing, setAgreedToMarketing] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<
    Partial<FormData & { terms: string }>
  >({})
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  )
  const [_userExists, setUserExists] = useState<boolean | null>(null)
  const [userCheckLoading, setUserCheckLoading] = useState(false)
  const [_isUserProfileComplete, setIsUserProfileComplete] =
    useState<boolean>(false)

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
          setUsernameAvailable(null)
        }
      } else {
        setUsernameAvailable(null)
      }
    }

    const debounce = setTimeout(checkUsername, 500)
    return () => clearTimeout(debounce)
  }, [formData.username])

  // Check if user exists for the connected wallet & handle step navigation
  useEffect(() => {
    const checkUserExistsAndProfile = async () => {
      if (address && isConnected && isSignedIn) {
        if (hasMinted === true) {
          // If user has minted, they are redirected by the top-level `if (hasMinted)` block.
          return
        }

        setUserCheckLoading(true)
        try {
          const res = await fetch(`/api/users/exists?address=${address}`)
          if (!res.ok) {
            console.error("API error checking user existence:", res.status)
            setUserExists(false)
            setIsUserProfileComplete(false)
            setCurrentStep(1) // Default to registration on API error
            return
          }
          const data = await res.json()
          setUserExists(data.exists)

          if (data.exists && data.user) {
            const { name, username, email } = data.user
            // Also populate formData if user exists and details are present
            if (name) setFormData((prev) => ({ ...prev, name }))
            if (username) setFormData((prev) => ({ ...prev, username }))
            if (email) setFormData((prev) => ({ ...prev, email }))

            const profileComplete = !!(name && username && email)
            setIsUserProfileComplete(profileComplete)

            if (profileComplete) {
              // User exists and profile is complete, check mint status
              await refetchHasMinted()
              setCurrentStep(2) // Proceed to minting step
            } else {
              // User exists but profile is incomplete
              setCurrentStep(1)
            }
          } else {
            // User does not exist
            setIsUserProfileComplete(false)
            setCurrentStep(1)
          }
        } catch (e) {
          console.error("Error checking user existence:", e)
          setUserExists(null)
          setIsUserProfileComplete(false)
          setCurrentStep(1) // Fallback to step 1 on error
        } finally {
          setUserCheckLoading(false)
        }
      } else {
        // Not connected or not signed in, reset to default state
        setUserExists(null)
        setIsUserProfileComplete(false)
        setCurrentStep(1)
      }
    }

    checkUserExistsAndProfile()
  }, [address, isConnected, isSignedIn, refetchHasMinted, hasMinted])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormErrors({}) // Client-side checks for critical authentication data
    if (!address) {
      console.error("Form submission error: Wallet address is missing.")
      setFormErrors({
        terms: "Wallet address is not available. Please reconnect.",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const errors: Partial<FormData & { terms: string }> = {}
      if (!formData.name.trim()) errors.name = "Name is required"
      if (!formData.username.trim()) errors.username = "Username is required"
      if (formData.username.length < 3)
        errors.username = "Username must be at least 3 characters"
      if (!formData.email.trim()) errors.email = "Email is required"
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        errors.email = "Invalid email format"
      if (!agreedToTerms) {
        errors.terms = "You must accept the Terms and Conditions"
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        setIsSubmitting(false)
        return
      }

      if (usernameAvailable === false) {
        setFormErrors({ username: "Username is not available" })
        setIsSubmitting(false)
        return
      }
      if (usernameAvailable === null && formData.username.length >= 3) {
        setFormErrors({
          username:
            "Username availability check in progress or failed. Please try again.",
        })
        setIsSubmitting(false)
        return
      } // Use authenticated request with automatic token refresh
      const response = await makeAuthenticatedRequest("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          name: formData.name,
          agreedToMarketing,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save user data")
      }
      setUserExists(true) // User is now created/updated
      setIsUserProfileComplete(true) // Profile is now complete
      setCurrentStep(2) // Move to next step (minting)
    } catch (error: any) {
      console.error("Form submission error:", error)
      setFormErrors({ email: error.message || "Something went wrong" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMintBadge = async () => {
    if (!address) return

    try {
      // Get the Divvi referral data suffix
      const dataSuffix = getDivviDataSuffix()

      // Encode the original function call
      const originalData = encodeFunctionData({
        abi: nexusExplorerAbi,
        functionName: "mintExplorerBadge",
        args: [],
      })

      // Append the Divvi referral suffix
      const dataWithReferral = (originalData + dataSuffix) as `0x${string}`

      // Use sendTransaction to include custom data with Divvi referral
      sendTransaction({
        to: nexusExplorerAddress,
        data: dataWithReferral,
      })
    } catch (error) {
      console.error("Minting error:", error)
    }
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  if (hasMinted || isConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-brand-primary/5 to-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 max-w-lg mx-auto bg-card shadow-xl rounded-xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-green-500/20"
          >
            <PartyPopper className="text-green-500" size={48} />
          </motion.div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Congratulations!
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            You&apos;ve successfully minted your Nexus Explorer Badge! Welcome
            to the Celo Europe Guild.
          </p>
          <motion.img
            src="/explorer badge.png" // Make sure this path is correct
            alt="Nexus Explorer Badge"
            className="w-48 h-48 mx-auto mb-8 rounded-lg shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          />
          <div className="space-y-4">
            <Button
              title="Go to Dashboard"
              onClick={() => router.push("/dashboard")}
              className="w-full"
              variant="default"
              size="lg"
            >
              <ArrowRight className="mr-2" /> Go to Dashboard
            </Button>
            <Button
              title="View Badge on Explorer"
              variant="outline"
              onClick={() =>
                window.open(
                  `https://explorer.celo.org/address/${nexusExplorerAddress}`,
                  "_blank"
                )
              }
              className="w-full"
              size="lg"
            >
              <ExternalLink className="mr-2" /> View Badge on Explorer
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            The Veki Program
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join Celo Europe&apos;s community-powered badge system. Collect your
            Explorer Badge and shape decentralized regenerative solutions across
            Europe.
          </p>
        </motion.div>

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
        <AnimatePresence mode="wait">
          {currentStep === 1 && ( // Show step 1 if currentStep is 1 (logic handled by useEffect)
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-card p-4 md:p-8 rounded-xl shadow-2xl mx-auto md:max-w-3xl"
            >
              <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
                Create Your Veki Profile
              </h2>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <Label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground"
                  >
                    Full Name
                  </Label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Doe"
                      className="pl-10 w-full"
                      disabled={isSubmitting}
                    />
                  </div>
                  {formErrors.name && (
                    <p className="mt-1 text-xs text-destructive">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="username"
                    className="block text-sm font-medium text-foreground"
                  >
                    Username
                  </Label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      placeholder="johndoe"
                      className="pl-10 w-full"
                      disabled={isSubmitting}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {formData.username.length >= 3 &&
                        usernameAvailable === true && (
                          <Check className="h-5 w-5 text-green-500" />
                        )}
                      {formData.username.length >= 3 &&
                        usernameAvailable === false && (
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        )}
                    </div>
                  </div>
                  {formErrors.username && (
                    <p className="mt-1 text-xs text-destructive">
                      {formErrors.username}
                    </p>
                  )}
                  {formData.username.length >= 3 &&
                    usernameAvailable === true && (
                      <p className="mt-1 text-xs text-green-600">
                        Username available!
                      </p>
                    )}
                  {formData.username.length >= 3 &&
                    usernameAvailable === false && (
                      <p className="mt-1 text-xs text-destructive">
                        Username taken.
                      </p>
                    )}
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground"
                  >
                    Email Address
                  </Label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="you@example.com"
                      className="pl-10 w-full"
                      disabled={isSubmitting}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="mt-1 text-xs text-destructive">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <motion.div variants={itemVariants} className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) =>
                        setAgreedToTerms(Boolean(checked))
                      }
                      disabled={isSubmitting}
                      className="mt-0.5"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="terms"
                        className="text-sm font-medium text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I agree to the{" "}
                        <a
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-primary hover:text-primary/80"
                        >
                          Terms and Conditions
                        </a>
                      </Label>
                      {formErrors.terms && (
                        <p className="text-xs text-destructive">
                          {formErrors.terms}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="marketing"
                      checked={agreedToMarketing}
                      onCheckedChange={(checked) =>
                        setAgreedToMarketing(Boolean(checked))
                      }
                      disabled={isSubmitting}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor="marketing"
                      className="text-sm font-medium text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to receive marketing emails (optional)
                    </Label>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    title="Create Account & Proceed"
                    onClick={() => {}} // Required prop, form submission handled by type="submit"
                    disabled={
                      isSubmitting ||
                      (formData.username.length >= 3 &&
                        usernameAvailable === null) ||
                      usernameAvailable === false ||
                      !agreedToTerms
                    }
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 h-5 w-5" />
                    )}
                    {isSubmitting
                      ? "Creating Account..."
                      : "Create Account & Proceed"}
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          )}
          {currentStep === 2 && ( // Show step 2 if currentStep is 2
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-gradient-to-br from-background to-card border border-border p-4 md:p-8 rounded-xl shadow-2xl mx-auto md:max-w-3xl"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
                <div className="flex-1 text-left">
                  <motion.h2
                    variants={itemVariants}
                    className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary"
                  >
                    Claim Your Explorer Badge
                  </motion.h2>
                  <motion.p
                    variants={itemVariants}
                    className="text-muted-foreground mb-6"
                  >
                    You&apos;re one step away! Mint your exclusive Nexus
                    Explorer Badge NFT to mark your entry into the Celo Europe
                    ecosystem.
                  </motion.p>
                  <motion.div
                    variants={itemVariants}
                    className="flex items-center gap-2 text-sm bg-primary/10 text-primary p-3 rounded-lg mb-4"
                  >
                    <Bell className="h-4 w-4" />
                    <span>
                      A small network fee is required for this transaction on
                      Celo.
                    </span>
                  </motion.div>
                </div>

                <motion.div
                  variants={itemVariants}
                  className="relative w-48 h-48 flex-shrink-0"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-full blur-xl"></div>
                  <Image
                    src="/explorer badge.png"
                    alt="Explorer Badge"
                    width={180}
                    height={180}
                    className="relative z-10 rounded-full border-4 border-brand-secondary shadow-xl object-cover"
                  />
                  <motion.div
                    className="absolute -bottom-2 -right-2 bg-brand-secondary text-white rounded-full p-2 shadow-lg z-20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 500 }}
                  >
                    <Award size={24} />
                  </motion.div>
                </motion.div>
              </div>
              {mintError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2"
                >
                  <AlertCircle className="text-destructive h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-destructive font-medium">
                      Error minting badge
                    </p>
                    <p className="text-sm text-destructive/80">
                      {mintError?.message?.includes("User rejected the request")
                        ? "Transaction rejected by user. Please try again."
                        : mintError?.message?.slice(0, 100) + "..." ||
                          "Transaction failed. Please try again."}
                    </p>
                  </div>
                </motion.div>
              )}

              <motion.div
                variants={itemVariants}
                className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6 mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Gift className="text-brand-primary h-6 w-6" />
                    <h3 className="text-lg font-semibold text-foreground">
                      Explorer Badge Details
                    </h3>
                  </div>
                  <div className="bg-brand-primary/10 px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-brand-primary">
                      NFT
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="text-brand-secondary h-5 w-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      This unique NFT signifies your entry into the Celo Europe
                      Veki Program.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="text-brand-secondary h-5 w-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Minted on:{" "}
                      {isConfirmed
                        ? new Date().toLocaleDateString()
                        : "Not minted yet"}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="text-brand-secondary h-5 w-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Verifiably owned by your connected wallet address.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="relative">
                {(isMinting || isConfirming) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm rounded-xl z-10">
                    <div className="flex flex-col items-center gap-4 p-6 bg-background/90 rounded-xl shadow-lg border border-primary/20">
                      <Loader2
                        className="animate-spin text-primary"
                        size={48}
                      />
                      <p className="text-lg font-medium text-foreground">
                        {isMinting
                          ? "Minting Badge..."
                          : "Confirming Transaction..."}
                      </p>
                      <p className="text-sm text-muted-foreground text-center">
                        Please wait, this may take a few moments. Do not close
                        or refresh the page.
                      </p>
                    </div>
                  </div>
                )}

                <div
                  className={`bg-gradient-to-br from-background to-card/60 p-6 rounded-xl border border-border ${
                    isMinting || isConfirming
                      ? "blur-sm pointer-events-none"
                      : ""
                  }`}
                >
                  <div className="grid gap-4 mb-6">
                    <div className="flex items-center justify-between py-2 border-b border-border/40">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-semibold text-foreground">
                        Ready to Mint
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/40">
                      <span className="text-muted-foreground">Network</span>
                      <span className="font-semibold text-foreground">
                        Celo
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/40">
                      <span className="text-muted-foreground">Cost</span>
                      <span className="font-semibold text-foreground">
                        Free
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground">Wallet</span>
                      <span
                        className="font-semibold text-foreground truncate max-w-[150px] md:max-w-xs"
                        title={address || ""}
                      >
                        {address
                          ? `${address.substring(0, 6)}...${address.substring(
                              address.length - 4
                            )}`
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <Button
                    title="Mint Your Explorer Badge"
                    onClick={handleMintBadge}
                    disabled={isMinting || isConfirming}
                    className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 focus:ring-ring shadow-lg"
                    size="lg"
                  >
                    <Award className="mr-2 h-5 w-5" />
                    {isMinting
                      ? "Processing..."
                      : isConfirming
                      ? "Confirming..."
                      : "Mint Your Explorer Badge"}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function VekiProgram() {
  return (
    <AuthGuard>
      <VekiProgramContent />
    </AuthGuard>
  )
}
