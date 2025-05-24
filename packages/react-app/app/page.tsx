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
import emailjs from "@emailjs/browser";

export default function Home() {
  const { address, getUserAddress } = useWeb3();
  const [minting, setMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [hasNFT, setHasNFT] = useState<boolean>(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [formData, setFormData] = useState({ name: "", username: "", email: "" });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
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
    const init = async () => {
      await getUserAddress();
      setCheckingConnection(false);
    };
    init();
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

    if (address) {
      const alreadySubmitted = localStorage.getItem(`celo-eu-form-${address}`);
      if (alreadySubmitted) setEmailSent(true);
    }
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
  }, [address, router]);

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
    } catch (err: any) {
      console.error("❌ Email failed:", err?.text || err?.message || err);
      setEmailSent(false);
    } finally {
      setSendingEmail(false);
    }
  };

  if (checkingConnection) {
    return <div className="text-center py-20">🔄 Checking wallet connection...</div>;
  }

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
      <h1 className="text-3xl font-bold text-center mb-4">Accelerating Celo in Europe</h1>
      <p className="text-center text-gray-600 max-w-xl mb-2">
        #CeloEU supports mission-driven entrepreneurs and creators to build lasting solutions that leverage the Celo Ecosystem.
      </p>
      <a
        href="https://app.charmverse.io/celo-europe/activities-celoeu-1919356630697271?viewId=e835c64b-5f4f-48c6-a911-337d8b42b07b"
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
          The Nexus Pass is your verifiable membership credential — it gives you access to exclusive events, governance participation, and funding rounds. Mint yours and join the movement.
        </p>
        <Link
          href="/nexus"
          className="text-blue-600 font-semibold underline hover:text-blue-800"
        >
          Learn more about the Nexus Program
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
          {!address ? (
            <p className="text-red-600 font-semibold mt-6">Please connect your wallet to mint.</p>
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
        </div>
      )}
    </div>
  );
}
