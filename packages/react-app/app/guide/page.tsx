import React from "react";

export default function Guide() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Getting Started with Celo</h1>

      {/* Section 1: Celo for Starters */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-yellow-500 mb-4">
          📗 Celo for Starters
        </h2>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-2">1. What is a Wallet?</h3>
          <p className="text-gray-700 mb-4">
            A crypto wallet is your digital identity and access point to the blockchain. It allows you to send and receive crypto assets, sign messages, and interact with decentralized applications (dApps). Popular wallet providers include MetaMask, Valora, and Rainbow.
          </p>
          <p className="text-gray-700">
            We recommend <strong>Valora</strong> for mobile-first experiences and <strong>MetaMask</strong> for desktop users. Your wallet is yours alone &mdash; make sure to store your recovery phrase safely and never share it with anyone.
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-2">2. How to Add the Celo Network to Your Wallet</h3>
          <p className="text-gray-700 mb-4">
            If you&apos;re using MetaMask or a compatible wallet, you can manually add the Celo network or use the official helper:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>Open MetaMask and click on your current network at the top.</li>
            <li>Select &quot;Add network manually&quot; or &quot;Custom RPC&quot;.</li>
          </ul>
          <p className="text-gray-700 font-medium mb-2">Celo Mainnet Settings:</p>
          <div className="bg-gray-100 p-4 rounded-md text-sm font-mono">
            <p><strong>Network Name:</strong> Celo Mainnet</p>
            <p><strong>New RPC URL:</strong> https://forno.celo.org</p>
            <p><strong>Chain ID:</strong> 42220</p>
            <p><strong>Currency Symbol:</strong> CELO</p>
            <p><strong>Block Explorer:</strong> https://explorer.celo.org</p>
          </div>
          <p className="mt-4 text-gray-700">
            You can also add the Alfajores Testnet (great for testing before transacting real assets):
          </p>
          <div className="bg-gray-100 p-4 rounded-md text-sm font-mono">
            <p><strong>Network Name:</strong> Celo Alfajores Testnet</p>
            <p><strong>New RPC URL:</strong> https://alfajores-forno.celo-testnet.org</p>
            <p><strong>Chain ID:</strong> 44787</p>
            <p><strong>Currency Symbol:</strong> CELO</p>
            <p><strong>Block Explorer:</strong> https://alfajores.celoscan.io</p>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-2">3. Need Test Tokens?</h3>
          <p className="text-gray-700 mb-2">
            If you&apos;re working on Alfajores, you&rsquo;ll need test CELO or cUSD to interact with dApps. Use the official faucet:
          </p>
          <a
            href="https://faucet.celo.org/alfajores"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300"
          >
            🔗 Visit Alfajores Faucet
          </a>
        </div>
      </section>

      {/* Section 2: Nexus Program */}
      <section>
        <h2 className="text-2xl font-bold text-yellow-500 mb-4">
          🔠 Nexus Program
        </h2>
        <p className="text-gray-700 mb-4">
          The Nexus Program is Celo Europe&apos;s gateway to verified participation. Through this program, users can collect NFTs that act as credentials and open doors to new opportunities in the ecosystem.
        </p>

        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">🏇 Nexus Pass</h3>
          <p className="text-gray-700">
            This is the first credential in the program and can be minted by anyone. It symbolizes your connection to Celo Europe and gives you a starting role in the community.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">🔒 DAO SBT</h3>
          <p className="text-gray-700">
            A Soulbound Token for Celo Europe DAO members. This token is non-transferable and can only be claimed by whitelisted members. It grants you governance access and internal coordination privileges.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">✍️ Contributor NFT</h3>
          <p className="text-gray-700">
            Launching soon! This NFT is awarded to contributors who fill out a form and participate actively. Holding it grants you read access to the Celo EU Workspace and can serve as a credential in future grants or bounties.
          </p>
        </div>
      </section>
    </div>
  );
}
