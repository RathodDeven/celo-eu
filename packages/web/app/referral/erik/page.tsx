"use client"

import Image from "next/image"
import Link from "next/link"
import {
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Twitter,
  MessageCircle,
} from "lucide-react"

export default function ContributorPageErik() {
  return (
    <div className="flex flex-col justify-center items-center px-4 py-12 max-w-3xl mx-auto text-center">
      <Image
        src="/ErikValle.jpg"
        alt="Erik Valle - Contributor"
        width={160}
        height={160}
        className="rounded-full mb-6 shadow-xl border-4 border-brand-primary"
      />

      <h1 className="text-4xl font-bold text-foreground mb-2">Erik Valle</h1>
      <p className="text-muted-foreground text-lg mb-6">
        Full-Stack Contributor • Solidity + Frontend • Celo, ZK, and Poaps
      </p>

      <div className="flex flex-wrap justify-center gap-5 mt-4">
        <Link
          href="https://github.com/moclas17"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:text-brand-primary transition"
        >
          <Github size={26} />
        </Link>

        <Link
          href="https://www.linkedin.com/in/erikvalle"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:text-brand-primary transition"
        >
          <Linkedin size={26} />
        </Link>

        <Link
          href="mailto:andrea@axmc.xyz"
          className="text-foreground hover:text-brand-primary transition"
        >
          <Mail size={26} />
        </Link>

        <Link
          href="https://collectors.poap.xyz/scan/erikvalle.eth"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:text-brand-primary transition"
        >
          <ExternalLink size={26} />
        </Link>

        <Link
          href="https://t.me/erikvalle"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:text-brand-primary transition"
        >
          <MessageCircle size={26} />
        </Link>

        <Link
          href="https://x.com/erikvalle_"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:text-brand-primary transition"
        >
          <Twitter size={26} />
        </Link>
      </div>
    </div>
  )
}
