"use client"

import { motion } from "framer-motion"
import { useAccount } from "wagmi"
import { useAuth } from "@/providers/AuthProvider"
import { Button } from "@/components/ui/button"
import { AuthGuard } from "@/components/auth/AuthGuard"
import {
  Loader2,
  Check,
  X,
  ArrowRight,
  ExternalLink,
  PartyPopper,
  Users,
  Copy,
  ShieldCheck,
  Award,
  Coins,
} from "lucide-react"
import { useState, useEffect } from "react"
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi"
import {
  nexusExplorerAbi,
  nexusExplorerAddress,
  contributorPassAbi,
  contributorPassAddress,
} from "@/lib/abi/contracts"
import { useRouter } from "next/navigation"
import { formatEther } from "viem"

interface Requirements {
  hasExplorerBadge: boolean
  hasEnoughReferrals: boolean
  isApprovedByAdmin: boolean
}

function ContributorPassContent() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { isSignedIn } = useAuth()
  const [copied, setCopied] = useState(false)
  const [requirements, setRequirements] = useState<Requirements>({
    hasExplorerBadge: false,
    hasEnoughReferrals: false,
    isApprovedByAdmin: false,
  })

  // Contract reads
  const { data: hasExplorerBadge } = useReadContract({
    address: nexusExplorerAddress,
    abi: nexusExplorerAbi,
    functionName: "hasMinted",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected && isSignedIn,
    },
  })

  const { data: hasContributorPass } = useReadContract({
    address: contributorPassAddress,
    abi: contributorPassAbi,
    functionName: "hasMinted",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected && isSignedIn,
    },
  })

  const { data: referralCount } = useReadContract({
    address: nexusExplorerAddress,
    abi: nexusExplorerAbi,
    functionName: "referralCount",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected && isSignedIn,
    },
  })

  const { data: minReferralCount } = useReadContract({
    address: contributorPassAddress,
    abi: contributorPassAbi,
    functionName: "minReferralCount",
    args: [],
    query: {
      enabled: !!address && isConnected && isSignedIn,
    },
  })

  const { data: isApprovedMinter } = useReadContract({
    address: contributorPassAddress,
    abi: contributorPassAbi,
    functionName: "approvedMinters",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected && isSignedIn,
    },
  })

  const { data: celoRewardAmount } = useReadContract({
    address: contributorPassAddress,
    abi: contributorPassAbi,
    functionName: "celoRewardAmount",
    args: [],
    query: {
      enabled: !!address && isConnected && isSignedIn,
    },
  })

  // Transaction handling
  const {
    writeContract,
    data: hash,
    error: claimError,
    isPending: isClaiming,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  // Update requirements state
  useEffect(() => {
    setRequirements({
      hasExplorerBadge: !!hasExplorerBadge,
      hasEnoughReferrals:
        !!referralCount &&
        !!minReferralCount &&
        Number(referralCount) >= Number(minReferralCount),
      isApprovedByAdmin: !!isApprovedMinter,
    })
  }, [hasExplorerBadge, referralCount, minReferralCount, isApprovedMinter])

  const handleCopy = () => {
    const referralLink = `${window.location.origin}/veki?ref=${address}`
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClaimContributorPass = async () => {
    if (!address) return

    try {
      writeContract({
        address: contributorPassAddress,
        abi: contributorPassAbi,
        functionName: "claimContributorPass",
      })
    } catch (error) {
      console.error("Claiming error:", error)
    }
  }

  const canClaim =
    requirements.hasExplorerBadge &&
    (requirements.hasEnoughReferrals || requirements.isApprovedByAdmin)

  // Success state - already has contributor pass
  if (hasContributorPass || isConfirmed) {
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
            You have successfully claimed your Contributor Pass! Welcome to the
            next level of the Celo Europe Guild.
          </p>
          <motion.img
            src="/badge 1.png"
            alt="Contributor Pass"
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
              title="View on Explorer"
              variant="outline"
              onClick={() =>
                window.open(
                  `https://explorer.celo.org/address/${contributorPassAddress}`,
                  "_blank"
                )
              }
              className="w-full"
              size="lg"
            >
              <ExternalLink className="mr-2" /> View on Explorer
            </Button>
          </div>
        </motion.div>
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
            Contributor Pass
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock advanced features and governance rights within the Celo
            Europe Guild. Meet the requirements below to claim your pass.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Requirements Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Requirements
            </h2>

            {/* Requirement 1: Explorer Badge */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-start gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    requirements.hasExplorerBadge
                      ? "bg-green-500/20 text-green-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {requirements.hasExplorerBadge ? (
                    <Check size={16} />
                  ) : (
                    <X size={16} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    1. Own Explorer Badge
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    You must first mint the Nexus Explorer Badge to be eligible
                    for the Contributor Pass.
                  </p>
                  {requirements.hasExplorerBadge ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                      <ShieldCheck size={16} />
                      Explorer Badge owned
                    </div>
                  ) : (
                    <Button
                      onClick={() => router.push("/veki")}
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                      title="Mint Explorer Badge"
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Mint Explorer Badge
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Requirement 2: Referrals OR Admin Approval */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-start gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    requirements.hasEnoughReferrals ||
                    requirements.isApprovedByAdmin
                      ? "bg-green-500/20 text-green-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {requirements.hasEnoughReferrals ||
                  requirements.isApprovedByAdmin ? (
                    <Check size={16} />
                  ) : (
                    <X size={16} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    2. Referrals OR Admin Approval
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Either refer {minReferralCount?.toString() || "2"} friends
                    to mint Explorer Badges, or be approved by an admin.
                  </p>

                  {/* Referral Status */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium">
                        Your Referrals:
                      </span>
                      <span className="text-sm font-bold">
                        {referralCount?.toString() || "0"} /{" "}
                        {minReferralCount?.toString() || "2"}
                      </span>
                    </div>

                    {requirements.hasEnoughReferrals ? (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <Users size={16} />
                        Sufficient referrals ({referralCount?.toString()})
                      </div>
                    ) : requirements.isApprovedByAdmin ? (
                      <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                        <Award size={16} />
                        Approved by admin
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Share your referral link to invite friends:
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleCopy}
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            title={copied ? "Copied!" : "Copy Referral Link"}
                          >
                            {copied ? (
                              <Check className="mr-2 h-4 w-4" />
                            ) : (
                              <Copy className="mr-2 h-4 w-4" />
                            )}
                            {copied ? "Copied!" : "Copy Referral Link"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <>
              {/* Contributor Pass Preview */}
              <div className="bg-card rounded-xl p-6 border border-border text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/badge 1.png"
                  alt="Contributor Pass"
                  width={200}
                  height={200}
                  className="mx-auto mb-4 rounded-lg"
                />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Contributor Pass
                </h3>
                <p className="text-muted-foreground text-sm">
                  Unlock governance rights and advanced features in the Celo
                  Europe ecosystem.
                </p>
              </div>

              {/* Reward Information */}
              {celoRewardAmount && Number(celoRewardAmount) > 0 && (
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Coins className="text-primary" size={24} />
                    <h3 className="text-lg font-semibold text-foreground">
                      CELO Reward
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {celoRewardAmount && Number(celoRewardAmount) > 0
                      ? formatEther(celoRewardAmount as bigint)
                      : "0"}{" "}
                    CELO
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You&apos;ll receive this reward upon claiming your pass
                  </p>
                </div>
              )}

              {/* Soulbound NFT Warning */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck
                      className="text-amber-600 dark:text-amber-400"
                      size={18}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                      ⚠️ Soulbound NFT
                    </h3>
                    <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">
                      This Contributor Pass is a <strong>soulbound NFT</strong>{" "}
                      that cannot be transferred to another wallet once claimed.
                      Please ensure you&apos;re using the correct wallet address
                      before proceeding with the claim.
                    </p>
                  </div>
                </div>
              </div>

              {/* Claim Action */}
              <div className="bg-card rounded-xl p-6 border border-border">
                {claimError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
                  >
                    <p className="text-destructive text-sm">
                      {claimError?.message?.includes("User rejected")
                        ? "Transaction rejected. Please try again."
                        : "Failed to claim. Please try again."}
                    </p>
                  </motion.div>
                )}

                <Button
                  onClick={handleClaimContributorPass}
                  disabled={!canClaim || isClaiming || isConfirming}
                  className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 focus:ring-ring shadow-lg"
                  size="lg"
                  title={
                    isClaiming
                      ? "Processing..."
                      : isConfirming
                      ? "Confirming..."
                      : canClaim
                      ? "Claim Contributor Pass"
                      : "Requirements Not Met"
                  }
                >
                  {isClaiming || isConfirming ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Award className="mr-2 h-5 w-5" />
                  )}
                  {isClaiming
                    ? "Processing..."
                    : isConfirming
                    ? "Confirming..."
                    : canClaim
                    ? "Claim Contributor Pass"
                    : "Requirements Not Met"}
                </Button>

                {!canClaim && (
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Complete all requirements above to unlock the claim button
                  </p>
                )}
              </div>
            </>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function ContributorPage() {
  return (
    <AuthGuard>
      <ContributorPassContent />
    </AuthGuard>
  )
}
