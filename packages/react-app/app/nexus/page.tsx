"use client";

import { useWeb3 } from "@/contexts/useWeb3";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { celoAlfajores } from "viem/chains";
import {
  nexusExplorerAbi,
  nexusExplorerAddress,
} from "@/lib/abi/NexusExplorerBadge";

export default function NexusProgram() {
  const { address, getUserAddress } = useWeb3();
  const [hasNFT, setHasNFT] = useState<boolean>(false);
  const [minting, setMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const router = useRouter();

  const formatAddress = (addr: string) =>
    addr.toLowerCase().startsWith("0x") ? (addr as `0x${string}`) : (`0x${addr}` as `0x${string}`);

  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: celoAlfajores,
        transport: http(),
      }),
    []
  );

  useEffect(() => {
    getUserAddress();
  }, [getUserAddress]);

  useEffect(() => {
    const checkOwnership = async () => {
      if (!address) return;
      try {
        const tokenIds = await publicClient.readContract({
          address: nexusExplorerAddress,
          abi: nexusExplorerAbi,
          functionName: "getNFTsByAddress",
          args: [formatAddress(address)],
        }) as bigint[];
        setHasNFT(tokenIds.length > 0);
      } catch (err) {
        console.error("❌ Error checking NFT ownership:", err);
      }
    };
    checkOwnership();
  }, [address, publicClient]);

  const handleMint = useCallback(async () => {
    setMintError(null);
    if (!address || typeof window === "undefined" || !window.ethereum) {
      setMintError("Wallet not found or not connected.");
      return;
    }

    const provider =
      (window.ethereum.providers?.find((p: any) => p.isMetaMask) ?? window.ethereum) as any;

    const walletClient = createWalletClient({
      chain: celoAlfajores,
      transport: custom(provider),
    });

    try {
      setMinting(true);
      await walletClient.writeContract({
        address: nexusExplorerAddress,
        abi: nexusExplorerAbi,
        functionName: "mintExplorerBadge",
        account: formatAddress(address),
      });
      setHasNFT(true);
    } catch (err) {
      console.error("❌ Minting failed:", err);
      setMintError("Minting failed. Please check your wallet and try again.");
    } finally {
      setMinting(false);
    }
  }, [address]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-6">The Nexus Program</h1>
      <p className="text-center text-gray-700 mb-10">
        The Nexus Program is Celo Europe&apos;s community-powered membership system. By minting a Nexus Pass, you become a recognized contributor to the mission of building regenerative solutions in Europe using blockchain.
      </p>

      <div className="flex flex-col sm:flex-row items-center bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <div className="sm:w-1/3 mb-4 sm:mb-0 sm:mr-6 flex justify-center">
          <Image
            src="/explorer%20badge.png"
            alt="Nexus Explorer Badge"
            width={180}
            height={180}
            className="rounded"
          />
        </div>
        <div className="sm:w-2/3">
          <h2 className="text-2xl font-semibold mb-2">🎒 Nexus Pass: Explorer</h2>
          <p className="text-gray-700">
            The first level of our membership is the <strong>Explorer Pass</strong>. It&apos;s open to anyone and can be minted directly from our dashboard. As an Explorer, you gain access to:
          </p>
          <ul className="list-disc list-inside text-gray-700 mt-2">
            <li>Our Charmverse space for coordination</li>
            <li>Community discussions and feedback channels</li>
            <li>Early-bird access to local events and workshops</li>
          </ul>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">What&apos;s Next?</h2>
        <p className="text-gray-700">
          More membership levels will be introduced soon, each with specific roles and responsibilities in shaping the Celo Europe ecosystem. By participating in missions and events, your pass will evolve — unlocking new powers and access along the way.
        </p>
      </section>

      <section>
        {address ? (
          hasNFT ? (
            <Link href="/dashboard">
              <button className="inline-block bg-yellow-400 text-black px-6 py-3 rounded-md text-sm font-semibold hover:bg-yellow-300">
                Go to Your Dashboard
              </button>
            </Link>
          ) : (
            <button
              onClick={handleMint}
              className="inline-block bg-yellow-400 text-black px-6 py-3 rounded-md text-sm font-semibold hover:bg-yellow-300 disabled:opacity-50"
              disabled={minting}
            >
              {minting ? "Minting..." : "Mint your Nexus Pass"}
            </button>
          )
        ) : (
          <>
            <button
              onClick={() => alert("Please connect your wallet first. You can learn how in the Guide.")}
              className="inline-block bg-yellow-400 text-black px-6 py-3 rounded-md text-sm font-semibold hover:bg-yellow-300"
            >
              🚀 Mint your Nexus Pass
            </button>
            <p className="mt-4 text-sm text-gray-600">
              Don&apos;t have a wallet? <Link href="/guide" className="underline text-blue-600 hover:text-blue-800">Read the guide</Link>
            </p>
          </>
        )}
        {mintError && <p className="text-red-600 mt-4 text-sm">{mintError}</p>}
      </section>
    </div>
  );
}
