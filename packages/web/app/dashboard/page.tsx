"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { useAccount, useReadContract } from "wagmi"
import { useAuth } from "@/providers/AuthProvider"
import { AuthGuard } from "@/components/auth/AuthGuard"
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
import { nexusExplorerAddress, nexusExplorerAbi } from "@/lib/abi/contracts"

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

function DashboardContent() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const {
    isSignedIn,
    makeAuthenticatedRequest, // Use the new authenticated request method
  } = useAuth()

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
  const fetchUserProfile = useCallback(async () => {
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
  }, [isSignedIn, address])

  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

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
    if (!address) {
      setEditProfileError(
        "Authentication details are missing. Please re-authenticate."
      )
      return
    }
    setIsUpdatingProfile(true)
    setEditProfileError(null)

    try {
      // Use authenticated request with automatic token refresh
      const response = await makeAuthenticatedRequest("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editProfileForm.name,
          email: editProfileForm.email,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update profile")
      }

      const updatedUserData = await response.json()
      setUserProfile(updatedUserData.user)
      setEditProfileForm({
        name: updatedUserData.user.name || "",
        email: updatedUserData.user.email || "",
      })
      setIsEditProfileOpen(false)
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

  // Main content loading state
  if (userProfileLoading || explorerLoading) {
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
      </div>{" "}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
