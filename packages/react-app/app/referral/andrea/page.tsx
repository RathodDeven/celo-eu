'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function AndreaReferralPage() {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-gradient-to-br from-yellow-100 via-white to-green-100 text-center">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4">Welcome to Celo Europe!</h1>
        <p className="mb-6 text-lg">
          You were invited by <strong>Andrea</strong> to join the Celo Europe community.
        </p>

        <div className="mb-6">
          <ConnectButton showBalance={false} />
        </div>

        {isConnected ? (
          <div className="text-green-700 font-medium mb-4">
            ✅ Wallet connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
        ) : (
          <p className="text-gray-600 mb-4">Please connect your wallet to proceed.</p>
        )}

        <div className="flex flex-col items-center space-y-2">
          <a
            href="https://www.linkedin.com/in/andrea-lópez-de-vicuña-de-jorge/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Andrea
          </a>
          <a
            href="https://t.me/celoeu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 underline"
          >
            Join Celo Europe on Telegram
          </a>
        </div>
      </div>
    </div>
  );
}
