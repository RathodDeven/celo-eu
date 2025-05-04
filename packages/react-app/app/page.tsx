"use client";

import { useWeb3 } from "@/contexts/useWeb3";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  const { address, getUserAddress } = useWeb3();

  useEffect(() => {
    getUserAddress();
  }, [getUserAddress]);

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
        Celo Europe is a regional initiative supporting builders, educators, and ecosystem leaders to drive real-world adoption of regenerative technologies on Celo.
      </p>

      <a
        href="https://app.charmverse.io/celo-eu-notebook-defiant-smartcontract-minnow/activities-celoeu-1919356630697271?viewId=e835c64b-5f4f-48c6-a911-337d8b42b07b"
        target="_blank"
        rel="noopener noreferrer"
        className="mb-6 rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        🔗 Access Celo EU Workspace
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

      {!address && (
        <div className="h1 text-red-600 font-semibold mt-10">
          Please install Metamask and connect.
        </div>
      )}

      {address && (
        <div className="h2 text-center mt-10">
          Connected Wallet: <span className="font-bold text-sm">{address}</span>
        </div>
      )}
    </div>
  );
}
