"use client";

import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useConnect, useDisconnect, usePublicClient, useWalletClient } from 'wagmi';
import { celoAlfajores } from 'wagmi/chains';
import { http } from 'viem';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import emailjs from '@emailjs/browser';
import {
  nexusExplorerAbi,
  nexusExplorerAddress,
} from '@/lib/abi/NexusExplorerBadge';

export default function ReferralPageAndrea() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient({ chainId: celoAlfajores.id });

  const [minting, setMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [hasNFT, setHasNFT] = useState<boolean>(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [formData, setFormData] = useState({ name: "", username: "", email: "" });
  const [sendingEmail, setSendingEmail] = useState(false);

  const formatAddress = (addr: string) =>
    addr.toLowerCase().startsWith("0x") ? (addr as `0x${string}`) : (`0x${addr}` as `0x${string}`);

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
    if (!walletClient || !address) {
      setMintError("Wallet not connected.");
      return;
    }

    try {
      setMinting(true);
      const hash = await walletClient.writeContract({
        address: nexusExplorerAddress,
        abi: nexusExplorerAbi,
        functionName: "mintExplorerBadge",
        account: formatAddress(address),
      });
      setTxHash(hash);
      router.push("/success");
    } catch (err) {
      console.error("❌ Minting failed:", err);
      setMintError("Minting failed. Please check your wallet and try again.");
    } finally {
      setMinting(false);
    }
  }, [walletClient, address, router]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingEmail(true);
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        formData,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );
      setEmailSent(true);
    } catch (err: any) {
      console.error("❌ Email failed:", err?.text || err?.message || err);
      setEmailSent(false);
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center px-4 py-8 max-w-4xl mx-auto">
      <Image
        src="/andrea.png"
        alt="Andrea - Ecosystem Builder"
        width={160}
        height={160}
        className="rounded-full mx-auto mb-4 shadow-lg"
      />
      <h1 className="text-4xl font-extrabold mb-2">Andrea</h1>
      <p className="text-gray-600 mb-2 text-lg">Co-Founder @ AXMC | Regenerative Infra Builder</p>
      <div className="flex gap-4 mb-4 text-sm">
        <Link
          href="https://www.linkedin.com/in/andrea-l%C3%B3pez-de-vicu%C3%B1a-de-jorge/"
          className="text-blue-600 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </Link>
        <Link
          href="https://t.me/celoeu"
          className="text-blue-600 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Telegram (Celo Europe)
        </Link>
      </div>

      {!emailSent ? (
        <form onSubmit={handleSendEmail} className="flex flex-col gap-4 mt-6 w-full max-w-md">
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
            {sendingEmail ? "Sending..." : "Send"}
          </button>
        </form>
      ) : (
        <div className="mt-8 text-center">
          {!isConnected ? (
            <button
              onClick={() => open()}
              className="rounded bg-blue-600 text-white font-semibold px-6 py-2 hover:bg-blue-700"
            >
              Connect Wallet
            </button>
          ) : hasNFT ? (
            <p className="text-green-600 font-semibold mt-6">You already own the Explorer Badge</p>
          ) : (
            <button
              onClick={handleMint}
              disabled={minting}
              className="rounded bg-green-600 text-white font-semibold px-6 py-2 hover:bg-green-700 disabled:opacity-50"
            >
              {minting ? "Minting..." : "Mint Explorer Badge"}
            </button>
          )}
          {txHash && (
            <p className="text-sm text-green-600 mt-4 break-all">
              ✅ Transaction sent: <a href={`https://alfajores.celoscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline">{txHash}</a>
            </p>
          )}
          {mintError && <p className="text-sm text-red-600 mt-4">{mintError}</p>}

          <Link href="/dashboard" className="text-sm text-blue-600 underline hover:text-blue-800 mt-4 block">
            🔍 View your dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
