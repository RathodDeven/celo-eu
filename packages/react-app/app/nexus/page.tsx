import Image from "next/image";

export default function NexusProgram() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-6">The Nexus Program</h1>
      <p className="text-center text-gray-700 mb-10">
        The Nexus Program is Celo Europe's community-powered membership system. By minting a Nexus Pass, you become a recognized contributor to the mission of building regenerative solutions in Europe using blockchain.
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
            The first level of our membership is the <strong>Explorer Pass</strong>. It's open to anyone and can be minted directly from our dashboard. As an Explorer, you gain access to:
          </p>
          <ul className="list-disc list-inside text-gray-700 mt-2">
            <li>Our Charmverse space for coordination</li>
            <li>Community discussions and feedback channels</li>
            <li>Early-bird access to local events and workshops</li>
          </ul>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">🎯 What's Next?</h2>
        <p className="text-gray-700">
          More membership levels will be introduced soon, each with specific roles and responsibilities in shaping the Celo Europe ecosystem. By participating in missions and events, your pass will evolve — unlocking new powers and access along the way.
        </p>
      </section>

      <section>
        <a
          href="/dashboard"
          className="inline-block bg-yellow-400 text-black px-6 py-3 rounded-md text-sm font-semibold hover:bg-yellow-300"
        >
          🚀 Mint your Nexus Pass
        </a>
      </section>
    </div>
  );
}
