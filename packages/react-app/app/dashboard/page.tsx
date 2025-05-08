"use client";

import { useWeb3 } from "@/contexts/useWeb3";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createPublicClient, http } from "viem";
import { celoAlfajores } from "viem/chains";
import {
  nexusExplorerAbi,
  nexusExplorerAddress,
} from "@/lib/abi/NexusExplorerBadge";

export default function DashboardPage() {
  const { address, getUserAddress } = useWeb3();
  const [badgeImages, setBadgeImages] = useState<string[]>([]);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const router = useRouter();

  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: celoAlfajores,
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
    const loadBadges = async () => {
      if (!address) return;
      try {
        const tokenIds = (await publicClient.readContract({
          address: nexusExplorerAddress,
          abi: nexusExplorerAbi,
          functionName: "getNFTsByAddress",
          args: [address as `0x${string}`],
        })) as bigint[];

        const uris = await Promise.all(
          tokenIds.map(async (tokenId) => {
            const uri = (await publicClient.readContract({
              address: nexusExplorerAddress,
              abi: nexusExplorerAbi,
              functionName: "tokenURI",
              args: [tokenId],
            })) as string;
            return uri.replace(
              "ipfs://",
              "https://crimson-peaceful-impala-136.mypinata.cloud/ipfs/"
            );
          })
        );
        setBadgeImages(uris);
      } catch (err) {
        console.error("Failed to load badge URIs:", err);
      }
    };
    loadBadges();
  }, [address, publicClient]);

  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8 text-[#FFFFFF]">
        Your Badge Dashboard
      </h1>

      {badgeImages.length === 0 ? (
        <p className="text-gray-600">No badges found for this wallet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {badgeImages.map((img, idx) => (
            <Image
              key={idx}
              src={img}
              alt={`Badge ${idx + 1}`}
              width={220}
              height={220}
              className="rounded-xl border shadow-md"
            />
          ))}
        </div>
      )}
    </div>
  );
}
