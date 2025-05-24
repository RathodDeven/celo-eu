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

export default function DashboardPage() {
  const { address, getUserAddress } = useWeb3();
  const [badgeImages, setBadgeImages] = useState<string[]>([]);
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
    <div className="flex flex-col items-center justify-center px-4 py-10 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-12 text-white">
        Your Badge Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start w-full">
        <div className="flex justify-center">
          {badgeImages.length > 0 ? (
            <Image
              src="/explorer%20badge.png"
              alt="Explorer Veki Pass Image"
              width={300}
              height={300}
              className="rounded-xl border shadow-md"
            />
          ) : (
            <div className="text-gray-400 text-center border rounded-xl shadow-md w-[300px] h-[300px] flex items-center justify-center">
              No badge found.
            </div>
          )}
        </div>

        <div className="text-white">
          <h2 className="text-2xl font-semibold mb-4">Welcome to the Veki Program</h2>
          <p className="mb-6 text-gray-900">
            You&apos;ve successfully collected your badge. Continue your journey by
            accessing our Charmverse workspace. There you can join governance
            simulations, contribute to proposals, and grow your reputation in the
            Celo Europe ecosystem.
          </p>
          <Link
            href="https://app.charmverse.io/celo-europe"
            target="_blank"
            className="mb-6 rounded-full bg-[#022a80] px-6 py-2 text-sm font-semibold text-white hover:bg-[#FFCC00]"
          >
            Access Charmverse Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
