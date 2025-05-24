"use client";

import { useWeb3 } from "@/contexts/useWeb3";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createPublicClient, http } from "viem";
import { celo } from "viem/chains";
import {
  nexusExplorerAbi,
  nexusExplorerAddress,
} from "@/lib/abi/NexusExplorerBadge";

export default function SuccessPage() {
  const { address, getUserAddress } = useWeb3();
  const [badgeImage, setBadgeImage] = useState<string | null>(null);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const router = useRouter();

  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: celo,
        transport: http(),
      }),
    []
  );

  useEffect(() => {
    const verifyConnection = async () => {
      await getUserAddress();
      setCheckingConnection(false);
    };
    verifyConnection();
  }, [getUserAddress]);

  useEffect(() => {
    if (!checkingConnection && !address) {
      router.push("/");
    }
  }, [address, checkingConnection, router]);

  useEffect(() => {
    const loadNFT = async () => {
      if (!address) return;
      try {
        const tokenIds = (await publicClient.readContract({
          address: nexusExplorerAddress,
          abi: nexusExplorerAbi,
          functionName: "getNFTsByAddress",
          args: [address as `0x${string}`],
        })) as bigint[];

        if (tokenIds.length > 0) {
          const tokenURI = (await publicClient.readContract({
            address: nexusExplorerAddress,
            abi: nexusExplorerAbi,
            functionName: "tokenURI",
            args: [tokenIds[0]],
          })) as string;

          const ipfsUrl = tokenURI.replace(
            "ipfs://",
            "https://crimson-peaceful-impala-136.mypinata.cloud/ipfs/"
          );
          setBadgeImage(ipfsUrl);
        }
      } catch (err) {
        console.error("Failed to fetch NFT metadata:", err);
      }
    };

    loadNFT();
  }, [address, publicClient]);

  return (
    <div className="flex flex-col justify-center items-center px-4 py-12 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-[#FFFFFF] mb-4 text-center">
        Congratulations!
      </h1>
      <p className="text-lg text-gray-700 text-center mb-6">
        You have successfully claimed your <strong>Nexus Explorer Badge</strong>.
      </p>
      {badgeImage ? (
        <img
          src={badgeImage}
          alt="Veki Explorer Badge"
          width={220}
          height={220}
          className="mb-6 rounded-xl border shadow-lg"
        />
      ) : (
        <p className="text-sm text-gray-500 mb-6">Loading your badge...</p>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Link
          href="/veki"
          className="bg-[#0070F3] hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded text-center"
        >
          Veki Program
        </Link>
        <Link
          href="/dashboard"
          className="bg-[#0070F3] hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded text-center"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
