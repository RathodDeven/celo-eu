"use client";

import { useWeb3 } from "@/contexts/useWeb3";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { celoAlfajores } from "viem/chains";
import {
  nexusExplorerAbi,
  nexusExplorerAddress,
} from "@/lib/abi/NexusExplorerBadge";

export default function Home() {
  const { address, getUserAddress } = useWeb3();
  const [minting, setMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [hasNFT, setHasNFT] = useState<boolean>(false);

  useEffect(() => {
    getUserAddress();
  }, [getUserAddress]);

  // Public client for reading
  const publicClient = createPublicClient({
    chain: celoAlfajores,
    transport: http(),
  });

  // Check if user already owns the NFT
  useEffect(() => {
    const checkOwnership = async () => {
      if (!address) return;

      try {
        const tokenIds: readonly bigint[] = await publicClient.readContract({
          address: nexusExplorerAddress,
          abi: nexusExplorerAbi,
          functionName: "getNFTsByAddress",
          args: [address as `0x${string}`],
        });

        setHasNFT(tokenIds.length > 0);
      } catch (err) {
        console.error("❌ Error checking NFT ownership:", err);
      }
    };

    checkOwnership();
  }, [address]);

  // Mint NFT
  const handleMint = useCallback(async () => {
    if (!address || typeof window === "undefined" || !window.ethereum) return;

    const walletClient = createWalletClient({
      chain: celoAlfajores,
      transport: custom(window.ethereum),
    });

    try {
      setMinting(true);
      const hash = await walletClient.writeContract({
        address: nexusExplorerAddress,
        abi: nexusExplorerAbi,
        functionName: "mintExplorerBadge",
        args: [address as `0x${string}`],
        account: address as `0x${string}`,
      });
      setTxHash(hash);
    } catch (err) {
      console.error("❌ Minting failed:", err);
    } finally {
      setMinting(false);
    }
  }, [address]);

  return (
    <div className="flex flex-col justify-center items-center px-4 py-8 max-w-4xl mx-auto">
      <Image
        src="/logo-celoeu.png"
        alt="Celo Europe Logo"
        width={160}
        height={160}
        className="mb-6 rounded-full shadow-md"
        priority
      />
      <h1 className="text-3xl font-bold text-center mb-4">Welcome to Celo Europe</h1>
      <p className="text-center text-gray-600 max-w-xl mb-2">
        Celo Europe is a regional initiative supporting builders, educators, and
        ecosystem leaders to drive real-world adoption of regenerative technologies on
        Celo.
      </p>

      <a
        href="https://app.charmverse.io/celo-eu-notebook-defiant-smartcontract-minnow/activities-celoeu-1919356630697271?viewId=e835c64b-5f4f-48c6-a911-337d8b42b07b"
        target="_blank"
        rel="noopener noreferrer"
        className="mb-6 rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Access Celo EU Workspace
      </a>

      <hr className="my-10 w-full border-gray-300" />

      <div className="text-center">
        <Image
          src="/explorer%20badge.png"
          alt="Explorer Nexus Pass"
          width={120}
          height={120}
          className="mx-auto mb-4"
        />
        <p className="text-center text-gray-600 max-w-xl mb-6">
          The Nexus Pass is your verifiable membership credential — it gives you access
          to exclusive events, governance participation, and funding rounds. Mint yours
          and join the movement.
        </p>
        <Link
          href="/nexus"
          className="text-blue-600 font-semibold underline hover:text-blue-800"
        >
          Learn more about the Nexus Program
        </Link>
      </div>

      {!address ? (
        <div className="h1 text-red-600 font-semibold mt-10">
          Please install Metamask and connect.
        </div>
      ) : (
        <div className="text-center mt-10">
          <p className="text-sm text-gray-600 mb-4">
            Connected Wallet: <span className="font-bold">{address}</span>
          </p>

          {hasNFT ? (
            <p className="text-green-600 font-semibold mt-6">
              You already own the Explorer Pass
            </p>
          ) : (
            <button
              onClick={handleMint}
              disabled={minting}
              className="rounded bg-green-600 text-white font-semibold px-6 py-2 hover:bg-green-700 disabled:opacity-50"
            >
              {minting ? "Minting..." : "Mint Explorer Pass"}
            </button>
          )}

          {txHash && (
            <p className="text-sm text-green-600 mt-4 break-all">
              ✅ Transaction sent:{" "}
              <a
                href={`https://alfajores.celoscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {txHash}
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
