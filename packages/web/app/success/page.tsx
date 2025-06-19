"use client"

import { useWeb3 } from "@/contexts/useWeb3"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createPublicClient, http } from "viem"
import { celo } from "viem/chains"
import { currentChain } from "@/providers/RainbowKitWrapper"
import { nexusExplorerAbi, nexusExplorerAddress } from "@/lib/abi/contracts"

export default function SuccessPage() {
  const { address, getUserAddress } = useWeb3()
  const [badgeImage, setBadgeImage] = useState<string | null>(null)
  const [checkingConnection, setCheckingConnection] = useState(true)
  const router = useRouter()
  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: currentChain,
        transport: http(),
      }),
    []
  )

  useEffect(() => {
    const verifyConnection = async () => {
      await getUserAddress()
      setCheckingConnection(false)
    }
    verifyConnection()
  }, [getUserAddress])

  useEffect(() => {
    if (!checkingConnection && !address) {
      router.push("/")
    }
  }, [address, checkingConnection, router])

  useEffect(() => {
    const loadNFT = async () => {
      if (!address) return
      try {
        const tokenIds = (await publicClient.readContract({
          address: nexusExplorerAddress,
          abi: nexusExplorerAbi,
          functionName: "getNFTsByAddress",
          args: [address as `0x${string}`],
        })) as bigint[]

        if (tokenIds.length > 0) {
          const tokenURI = (await publicClient.readContract({
            address: nexusExplorerAddress,
            abi: nexusExplorerAbi,
            functionName: "tokenURI",
            args: [tokenIds[0]],
          })) as string

          const ipfsUrl = tokenURI.replace(
            "ipfs://",
            "https://crimson-peaceful-impala-136.mypinata.cloud/ipfs/"
          )
          setBadgeImage(ipfsUrl)
        }
      } catch (err) {
        console.error("Failed to fetch NFT metadata:", err)
      }
    }

    loadNFT()
  }, [address, publicClient])

  return (
    <div className="flex flex-col justify-center items-center px-4 py-12 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-4 text-center">
        Congratulations!
      </h1>
      <p className="text-lg text-gray-700 text-center mb-6">
        You have successfully claimed your <strong>Veki Explorer Badge</strong>.
      </p>
      {badgeImage ? (
        <div className="relative w-[220px] h-[220px] mb-6">
          <Image
            src={badgeImage}
            alt="Veki Explorer Badge"
            fill
            className="rounded-xl border shadow-lg object-contain"
            sizes="220px"
          />
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-6">Loading your badge...</p>
      )}

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4">
        <Link
          href="/veki"
          className="rounded-full bg-[#022a80] px-6 py-2 text-sm font-semibold text-white hover:bg-[#FFCC00]"
        >
          Veki Program
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full bg-[#022a80] px-6 py-2 text-sm font-semibold text-white hover:bg-[#FFCC00]"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
