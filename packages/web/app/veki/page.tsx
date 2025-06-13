"use client";

import { useWeb3 } from "@/contexts/useWeb3";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { celo } from "viem/chains";
import emailjs from "@emailjs/browser";
import {
  nexusExplorerAbi,
  nexusExplorerAddress,
} from "@/lib/abi/NexusExplorerBadge";

export default function VekiProgram() {
  const { address, getUserAddress } = useWeb3();
  const [hasNFT, setHasNFT] = useState<boolean | null>(null);
  const [minting, setMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [formData, setFormData] = useState({ name: "", username: "", email: "" });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showVerifyMsg, setShowVerifyMsg] = useState(false);
  const router = useRouter();

  const formatAddress = (addr: string) =>
    addr.toLowerCase().startsWith("0x") ? (addr as `0x${string}`) : (`0x${addr}` as `0x${string}`);

  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: celo,
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
        const tokenIds = (await publicClient.readContract({
          address: nexusExplorerAddress,
          abi: nexusExplorerAbi,
          functionName: "getNFTsByAddress",
          args: [formatAddress(address)],
        })) as bigint[];
        setHasNFT(tokenIds.length > 0);
      } catch (err) {
        console.error("❌ Error checking NFT ownership:", err);
      }
    };
    checkOwnership();

    if (address) {
      const alreadySubmitted = localStorage.getItem(`celo-eu-form-${address}`);
      if (alreadySubmitted) setEmailSent(true);
    }
  }, [address, publicClient]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingEmail(true);
    try {
      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID!,
        process.env.EMAILJS_TEMPLATE_ID!,
        formData,
        process.env.EMAILJS_PUBLIC_KEY!
      );
      localStorage.setItem(`celo-eu-form-${address}`, "true");
      setEmailSent(true);
      setShowVerifyMsg(true);
    } catch (err: any) {
      console.error("❌ Email failed:", err?.text || err?.message || err);
      setEmailSent(false);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleMint = useCallback(async () => {
    setMintError(null);
    if (!address || typeof window === "undefined" || !window.ethereum) {
      setMintError("Wallet not found or not connected.");
      return;
    }

    const provider =
      (window.ethereum.providers?.find((p: any) => p.isMetaMask) ?? window.ethereum) as any;

    const walletClient = createWalletClient({
      chain: celo,
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
      <h1 className="text-4xl font-bold text-center mb-6">The Veki Program</h1>
      <p className="text-center text-gray-700 mb-6">
        Veki is Celo Europe&apos;s community-powered badge system. By collecting a Veki badge, you join the movement to shape decentralized regenerative solutions across Europe.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <div className="p-6 border rounded bg-yellow-50 text-center">
          <h2 className="text-2xl font-semibold mb-2">Explorer Badge</h2>
          <p className="text-gray-700 text-sm">
            The first level of our membership is the Explorer Pass. It`&apos;s open to anyone and can be minted directly from our dashboard. As an Explorer, you gain access to our Charmverse space for coordination, community discussions and feedback channels, early-bird access to local events and workshops
          </p>
        </div>
        <div className="p-6 border rounded bg-purple-50 text-center">
          <h2 className="text-2xl font-semibold mb-2">Contributor Badge</h2>
          <p className="text-gray-700 text-sm">
            Awarded during IRL events and quests. Unlocks governance missions, Charmverse workspace, and project collaborations.
          </p>
        </div>
      </div>

      {!emailSent ? (
        <form onSubmit={handleSendEmail} className="flex flex-col gap-4 mt-6 w-full max-w-md mx-auto">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border rounded px-4 py-2"
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="border rounded px-4 py-2"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="border rounded px-4 py-2"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={sendingEmail}
          >
            {sendingEmail ? "Sending..." : "Submit"}
          </button>
        </form>
      ) : (
        <section className="mt-6 text-center">
          {showVerifyMsg && (
            <p className="text-green-600 text-sm mb-4">
              Please verify your email address and collect your pass.
            </p>
          )}
          {hasNFT === null ? (
            <p className="text-sm text-gray-500">Checking membership status...</p>
          ) : address ? (
            hasNFT ? (
              <Link href="/dashboard">
                <button className="mb-6 rounded-full bg-[#022a80] px-6 py-2 text-sm font-semibold text-white hover:bg-[#FFCC00]">
                  Go to Your Dashboard
                </button>
              </Link>
            ) : (
              <button
                onClick={handleMint}
                className="inline-block bg-yellow-400 text-black px-6 py-3 rounded-md text-sm font-semibold hover:bg-yellow-300 disabled:opacity-50"
                disabled={minting}
              >
                {minting ? "Minting..." : "Mint Explorer Badge"}
              </button>
            )
          ) : (
            <p className="text-red-600">Please connect your wallet first.</p>
          )}
          {mintError && <p className="text-red-600 mt-4 text-sm">{mintError}</p>}
        </section>
      )}
    </div>
  );
}
