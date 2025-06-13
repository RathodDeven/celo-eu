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
  const { address, getUserAddress, mintExplorerBadge, checkIfBadgeMinted } =
    useWeb3();
  const [badgeImages, setBadgeImages] = useState<string[]>([]);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [hasMintedBadge, setHasMintedBadge] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintingError, setMintingError] = useState<string | null>(null);
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

  useEffect(() => {
    const checkBadgeStatus = async () => {
      if (address) {
        try {
          const minted = await checkIfBadgeMinted();
          setHasMintedBadge(minted);
        } catch (error) {
          console.error("Failed to check badge status:", error);
          // Optionally set an error state here to inform the user
        }
      }
    };
    if (!checkingConnection) {
      checkBadgeStatus();
    }
  }, [address, checkIfBadgeMinted, checkingConnection, getUserAddress]);

  const handleMintBadge = async () => {
    setIsMinting(true);
    setMintingError(null);
    try {
      await mintExplorerBadge();
      setHasMintedBadge(true);
      setIsMinting(false);
      // Assuming loadBadges will be triggered by address change or manual call
      // If not, explicitly call loadBadges() or similar logic here
    } catch (error) {
      console.error("Failed to mint badge:", error);
      setMintingError(
        "Failed to mint your Explorer Badge. Please try again."
      );
      setIsMinting(false);
    }
  };

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
      if (uris.length > 0) {
        setHasMintedBadge(true); // Ensure hasMintedBadge is true if images are loaded
      }
    } catch (err) {
      console.error("Failed to load badge URIs:", err);
    }
  };

  // Re-load badges if hasMintedBadge becomes true and there are no images
  // This can happen right after minting
  useEffect(() => {
    if (hasMintedBadge && badgeImages.length === 0 && address) {
      loadBadges();
    }
  }, [hasMintedBadge, badgeImages, address, loadBadges]);


  if (checkingConnection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <p>Please connect your wallet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-12 text-white">
        Your Badge Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start w-full">
        <div className="flex flex-col items-center justify-center">
          {hasMintedBadge && badgeImages.length > 0 ? (
            <Image
              src="/explorer%20badge.png" // Assuming this is the correct static path for the badge image
              alt="Explorer Veki Pass Image"
              width={300}
              height={300}
              className="rounded-xl border shadow-md"
            />
          ) : hasMintedBadge && badgeImages.length === 0 && !isMinting ? (
            <div className="text-gray-400 text-center border rounded-xl shadow-md w-[300px] h-[300px] flex items-center justify-center">
              Badge minted! Refreshing...
            </div>
          ) : !hasMintedBadge && !isMinting && !mintingError ? (
            <div className="text-gray-400 text-center border rounded-xl shadow-md w-[300px] h-[300px] flex items-center justify-center">
              No badge found.
            </div>
          ) : null}

          {!hasMintedBadge && (
            <button
              onClick={handleMintBadge}
              disabled={isMinting}
              className="mt-6 rounded-full bg-[#022a80] px-6 py-3 text-lg font-semibold text-white hover:bg-[#FFCC00] disabled:opacity-50"
            >
              {isMinting ? "Minting..." : "Mint Explorer Badge"}
            </button>
          )}
          {mintingError && (
            <p className="text-red-500 mt-4">{mintingError}</p>
          )}
        </div>

        <div className="text-white">
          <h2 className="text-2xl font-semibold mb-4">
            {hasMintedBadge
              ? "Welcome to the Veki Program!"
              : "Get Your Explorer Badge"}
          </h2>
          <p className="mb-6 text-gray-300">
            {hasMintedBadge
              ? "You've successfully collected your badge. Continue your journey by accessing our Charmverse workspace. There you can join governance simulations, contribute to proposals, and grow your reputation in the Celo Europe ecosystem."
              : "Mint your Explorer Badge to get started with the Veki Program and gain access to exclusive features and communities."}
          </p>
          {hasMintedBadge && (
            <Link
              href="https://app.charmverse.io/celo-europe"
              target="_blank"
              className="mb-6 rounded-full bg-[#022a80] px-6 py-2 text-sm font-semibold text-white hover:bg-[#FFCC00]"
            >
              Access Charmverse Workspace
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
