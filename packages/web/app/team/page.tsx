"use client";

import Image from "next/image";
import Link from "next/link";

const teamMembers = [
  {
    name: "Andrea",
    image: "/andrea.png",
    linkedin: "https://www.linkedin.com/in/andrea/",
    refPage: "/referral/andrea",
  },
  {
    name: "Rica",
    image: "/rica.png",
    linkedin: "https://www.linkedin.com/in/rica/",
    refPage: "/referral/rica",
  },
  {
    name: "Joan",
    image: "/joan.png",
    linkedin: "https://www.linkedin.com/in/joan/",
    refPage: "/referral/joan",
  },
  // Add more members as needed
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
            <p className="text-sm text-blue-600 underline">View LinkedIn</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
