// pages/index.tsx (Home page)
"use client";

import { useWeb3 } from "@/contexts/useWeb3";
import Image from "next/image";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createPublicClient, custom, http } from "viem";
import { celo } from "viem/chains";
import { nexusExplorerAbi, nexusExplorerAddress } from "@/lib/abi/NexusExplorerBadge";

export default function Home() {
  const { address, getUserAddress } = useWeb3();
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: celo,
        transport: http(),
      }),
    []
  );

  const formatAddress = (addr: string) =>
    addr.toLowerCase().startsWith("0x") ? (addr as `0x${string}`) : (`0x${addr}` as `0x${string}`);

  useEffect(() => {
    const init = async () => {
      await getUserAddress();
      setCheckingConnection(false);
    };
    init();
  }, [getUserAddress]);

  const handleAccessWorkspace = async () => {
    if (!address || typeof window === "undefined" || !window.ethereum) {
      setErrorMessage("Please connect your wallet to Celo mainnet.");
      setTimeout(() => window.location.reload(), 30000); // Reload the page after 30 seconds
      return;
    }

    setWalletConnected(true);
    await checkBadges();
  };

  const checkBadges = async () => {
    if (!address) return;
    
    try {
      const tokenIds = await publicClient.readContract({
        address: nexusExplorerAddress,
        abi: nexusExplorerAbi,
        functionName: "getNFTsByAddress",
        args: [formatAddress(address)],
      }) as bigint[];

      const explorerBadgeIds = Array.from({ length: 500 }, (_, i) => BigInt(i)); // IDs from 0 to 500 for Explorer badge
      const hasExplorerBadge = tokenIds.some((id) => explorerBadgeIds.includes(id));

      if (hasExplorerBadge) {
        router.push("/nexus"); // Redirect to the Nexus Program page if Explorer badge is found
      } else {
        setErrorMessage("You do not have the required badge to access the workspace.");
      }
    } catch (err) {
      console.error("❌ Error checking NFT ownership:", err);
    }
  };

  if (checkingConnection) {
    return <div className="text-center py-20">🔄 Checking wallet connection...</div>;
  }

  return (
    <div className="flex flex-col justify-center items-center px-4 py-8 max-w-4xl mx-auto">
      <Image
        src="/explorer badge.png"
        alt="Celo Europe Veki"
        width={160}
        height={160}
        className="mb-6 rounded-full shadow-md"
        priority
      />
      <h1 className="text-3xl font-bold text-center mb-4">Accelerating Celo in Europe</h1>
      <p className="text-center text-gray-600 max-w-xl mb-4">
        #CeloEU supports mission-driven entrepreneurs and creators to build lasting solutions that leverage the Celo Ecosystem.
      </p>

      <button
        onClick={handleAccessWorkspace}
        className="mb-6 rounded-full bg-[#022a80] px-6 py-2 text-sm font-semibold text-white hover:bg-[#FFCC00]"
      >
        Access Celo EU Workspace
      </button>

      {errorMessage && (
        <div className="mt-4 text-red-600 font-semibold">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
