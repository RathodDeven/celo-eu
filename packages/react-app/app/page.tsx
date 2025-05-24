"use client";

import { useWeb3 } from "@/contexts/useWeb3";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createPublicClient, http } from "viem";
import { celo } from "viem/chains";
import { nexusExplorerAbi, nexusExplorerAddress } from "@/lib/abi/NexusExplorerBadge";

export default function Home() {
  const { address, getUserAddress } = useWeb3();
  const [checkingConnection, setCheckingConnection] = useState(true);
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
      return;
    }

    try {
      const tokenIds = (await publicClient.readContract({
        address: nexusExplorerAddress,
        abi: nexusExplorerAbi,
        functionName: "getNFTsByAddress",
        args: [formatAddress(address)],
      })) as bigint[];

      const explorerBadgeRange = Array.from({ length: 501 }, (_, i) => BigInt(i)); // 0 to 500
      const hasExplorerBadge = tokenIds.some((id) => explorerBadgeRange.includes(id));

      if (hasExplorerBadge) {
        router.push("/dashboard");
      } else {
        router.push("/veki");
      }
    } catch (err) {
      console.error("❌ Error checking NFT ownership:", err);
      setErrorMessage("An error occurred while verifying your badge. Please try again.");
    }
  };

  if (checkingConnection) {
    return <div className="text-center py-20 text-white">Checking wallet connection...</div>;
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
      <h1 className="text-3xl font-bold text-center mb-4 text-white">
        Accelerating Celo in Europe
      </h1>
      <p className="text-center text-gray-400 max-w-xl mb-4">
        #CeloEU supports mission-driven entrepreneurs and creators to build lasting
        solutions that leverage the Celo ecosystem.
      </p>

      <button
        onClick={handleAccessWorkspace}
        className="mb-6 rounded-full bg-[#022a80] px-6 py-2 text-sm font-semibold text-white hover:bg-[#FFCC00]"
      >
        Join the Veki Program
      </button>

      {errorMessage && (
        <div className="mt-4 text-red-500 font-semibold">{errorMessage}</div>
      )}
    </div>
  );
}
