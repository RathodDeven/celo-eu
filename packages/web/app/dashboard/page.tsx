"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useAccount, useReadContract } from "wagmi"
import { useAuth } from "@/providers/AuthProvider"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Loader2,
  User,
  Wallet,
  ShieldCheck,
  ArrowRightCircle,
  Pencil,
  AlertTriangle,
  Mail as MailIcon, // Alias Mail to avoid conflict with User model
  UserCircle2, // Using UserCircle2 for profile icon
  Briefcase, // Icon for Contributor Program
  AtSign, // Added for username icon
} from "lucide-react"
import {
  nexusExplorerAddress,
  nexusExplorerAbi,
} from "@/lib/abi/NexusExplorerBadge"
import { useRouter } from "next/navigation"

interface UserProfile {
  name?: string
  username?: string
  email?: string
  address?: string // Added address to UserProfile
}

interface EditProfileFormData {
  name: string
  email: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const {
    isSignedIn,
    isLoading: authLoading,
    signIn,
    error: authError,
    clearError: clearAuthError,
    challengeMessage, // For signing update requests
    challengeSignature, // For signing update requests
  } = useAuth()
  const { openConnectModal } = useConnectModal()

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userProfileLoading, setUserProfileLoading] = useState(true) // Start true
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [editProfileForm, setEditProfileForm] = useState<EditProfileFormData>({
    name: "",
    email: "",
  })
  const [editProfileError, setEditProfileError] = useState<string | null>(null)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  // Explorer Badge Check
  const {
    data: hasExplorerBadge,
    isLoading: explorerLoading,
    refetch: refetchExplorerBadge,
  } = useReadContract({
    address: nexusExplorerAddress,
    abi: nexusExplorerAbi,
    functionName: "hasMinted",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected && isSignedIn,
    },
  })

  const fetchUserProfile = async () => {
    if (isSignedIn && address) {
      setUserProfileLoading(true)
      try {
        const response = await fetch(`/api/users?address=${address}`)
        if (response.ok) {
          const data = await response.json()
          if (data.exists && data.user) {
            setUserProfile(data.user)
            setEditProfileForm({
              name: data.user.name || "",
              email: data.user.email || "",
            })
          } else {
            setUserProfile(null) // User might exist but no profile data, or doesn't exist
          }
        } else {
          console.error("Failed to fetch user profile")
          setUserProfile(null)
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
        setUserProfile(null)
      } finally {
        setUserProfileLoading(false)
      }
    } else {
      setUserProfile(null)
      setUserProfileLoading(false)
    }
  }

  useEffect(() => {
    fetchUserProfile()
  }, [isSignedIn, address])

  useEffect(() => {
    if (isSignedIn) {
      refetchExplorerBadge()
    }
  }, [isSignedIn, refetchExplorerBadge])

  const handleEditProfileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target
    setEditProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address || !challengeMessage || !challengeSignature) {
      setEditProfileError(
        "Authentication details are missing. Please re-authenticate."
      )
      return
    }
    setIsUpdatingProfile(true)
    setEditProfileError(null)

    try {
      const payload = {
        message: {
          // Data to update
          name: editProfileForm.name,
          email: editProfileForm.email,
        },
        originalChallenge: challengeMessage, // Must match the middleware expectation
        signature: challengeSignature, // The signature of that challengeMessage
        address: address, // Outer address for middleware verification
      }

      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update profile")
      }

      const updatedUserData = await response.json()
      setUserProfile(updatedUserData.user) // Update local profile state
      setEditProfileForm({
        // Reset form with new data or keep it as is if preferred
        name: updatedUserData.user.name || "",
        email: updatedUserData.user.email || "",
      })
      setIsEditProfileOpen(false) // Close dialog on success
    } catch (error: any) {
      console.error("Update profile error:", error)
      setEditProfileError(error.message || "Something went wrong")
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

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
            Connect your wallet to access your Celo Europe Dashboard.
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
            Please sign the message to verify your wallet ownership and access
            your dashboard.
          </p>
          <Button
            title={authLoading ? "Signing In..." : "Sign In"}
            onClick={() => {
              clearAuthError()
              signIn()
            }}
            disabled={authLoading}
            loading={authLoading}
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

  // Main content loading state
  if (authLoading || userProfileLoading || explorerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
        <span className="ml-4 text-xl text-muted-foreground">
          Loading Dashboard...
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card/5 to-background">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Welcome Back,{" "}
            {userProfile?.name || userProfile?.username || "Explorer"}!
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Manage your Celo Europe Guild presence and explore opportunities.
          </p>
        </motion.div>

        {/* Profile Section - Moved to Top */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="mb-8 p-6 bg-card rounded-xl shadow-lg border border-border"
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-1">
                Your Profile
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Keep your information up to date.
              </p>
            </div>
            <Dialog
              open={isEditProfileOpen}
              onOpenChange={setIsEditProfileOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Edit Profile"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="rounded-full hover:bg-accent/50"
                >
                  <Pencil className="h-5 w-5 text-primary" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md p-6 bg-card border-border shadow-xl rounded-lg">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-semibold text-foreground flex items-center">
                    <UserCircle2 className="mr-3 h-6 w-6 text-primary" /> Edit
                    Your Profile
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-1">
                    Update your name and email address.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-muted-foreground flex items-center"
                    >
                      <User className="mr-2 h-4 w-4" /> Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={editProfileForm.name}
                      onChange={handleEditProfileInputChange}
                      className="w-full bg-background border-border focus:ring-primary focus:border-primary"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-muted-foreground flex items-center"
                    >
                      <MailIcon className="mr-2 h-4 w-4" /> Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={editProfileForm.email}
                      onChange={handleEditProfileInputChange}
                      className="w-full bg-background border-border focus:ring-primary focus:border-primary"
                      placeholder="your@email.com"
                    />
                  </div>
                  {editProfileError && (
                    <p className="text-sm text-destructive flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4" />{" "}
                      {editProfileError}
                    </p>
                  )}
                  <DialogFooter className="mt-8 sm:justify-between">
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        title="Cancel"
                        onClick={() => setIsEditProfileOpen(false)}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      disabled={isUpdatingProfile}
                      title="Save Changes"
                      onClick={() => {}}
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isUpdatingProfile && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex items-center space-x-3">
              <UserCircle2 className="h-6 w-6 text-primary" />
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <p className="text-lg font-medium text-foreground">
                  {userProfile?.name || "Not set"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <AtSign className="h-6 w-6 text-primary" />{" "}
              {/* Changed icon for username */}
              <div>
                <Label className="text-xs text-muted-foreground">
                  Username
                </Label>
                <p className="text-lg font-medium text-foreground">
                  {userProfile?.username || "Not set"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MailIcon className="h-6 w-6 text-primary" />
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="text-lg font-medium text-foreground">
                  {userProfile?.email || "Not set"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Wallet className="h-6 w-6 text-primary" />
              <div>
                <Label className="text-xs text-muted-foreground">
                  Wallet Address
                </Label>
                <p
                  className="text-lg font-medium text-foreground truncate"
                  title={address || ""}
                >
                  {address
                    ? `${address.substring(0, 6)}...${address.substring(
                        address.length - 4
                      )}`
                    : "Not connected"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Nexus Explorer Badge */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="p-6 bg-card rounded-xl shadow-lg flex flex-col justify-between border border-border"
          >
            <div>
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                <Image
                  src="/explorer badge.png"
                  alt="Explorer Badge"
                  width={48}
                  height={48}
                  className="rounded-md"
                />{" "}
                {/* Increased size and added rounded-md */}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nexus Explorer Badge
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Your entry pass to the Celo Europe Guild.
              </p>
            </div>
            {hasExplorerBadge ? (
              <div className="flex items-center text-green-500 font-medium">
                <ShieldCheck className="mr-2 h-5 w-5" />
                Badge Minted
              </div>
            ) : (
              <Button
                onClick={() => router.push("/veki")}
                className="w-full mt-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                title="Mint Your Badge"
              >
                <ArrowRightCircle className="mr-2 h-5 w-5" /> Mint Your Badge
              </Button>
            )}
          </motion.div>

          {/* Card 2: Contributor Program */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="p-6 bg-card rounded-xl shadow-lg flex flex-col justify-between border border-border"
          >
            <div>
              <div className="flex items-center justify-center w-16 h-16 bg-brand-secondary/10 rounded-full mb-6">
                <Briefcase className="text-brand-secondary" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Contributor Program
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Elevate your status by contributing to projects and initiatives.
              </p>
            </div>
            <Button
              disabled
              className="w-full mt-auto bg-gray-300 text-gray-500 cursor-not-allowed"
              title="Learn More (Coming Soon)"
              onClick={() => {}}
            >
              Learn More (Coming Soon)
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
