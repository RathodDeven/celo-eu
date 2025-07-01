"use client";

import Image from "next/image";
import Link from "next/link";

const teamMembers = [
  {
    name: "Andrea",
    image: "/andrea.png",
    linkedin: "https://www.linkedin.com/in/andrea-lopez-de-vicuña/",
    refPage: "/referral/andrea",
  },
  {
    name: "Bertrand",
    image: "/bertrand.png",
    linkedin: "https://www.linkedin.com/in/bertrand-juglas/",
    refPage: "/referral/bertrand",
  },
  {
    name: "Meet the Builders",
    image: "/ErikValle.jpg",
    refPage: "https://celoeu.org",
  },
];

export default function TeamPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-10">Meet the Team</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map((member, idx) => (
          <Link
            key={idx}
            href={member.refPage}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center text-center border border-gray-200 hover:shadow-xl transition-shadow duration-200"
          >
            <Image
              src={member.image}
              alt={`${member.name}'s photo`}
              width={160}
              height={160}
              className="rounded-full mb-4 object-cover"
            />
            <h2 className="text-xl font-semibold mb-2">{member.name}</h2>
            <p className="text-sm text-blue-600 underline">View Profile</p>
          </Link>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center">
        <h3 className="text-2xl font-semibold mb-4">Ready to join the movement?</h3>
        <Link
          href="/veki"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Join via Veki
        </Link>
      </div>
    </div>
  );
}
