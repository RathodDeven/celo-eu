"use client"

import Image from "next/image"
import Link from "next/link"
import { Github, Linkedin, Mail } from "lucide-react"

export default function ContributorPageAndrea() {
  return (
    <div className="flex flex-col justify-center items-center px-4 py-12 max-w-3xl mx-auto text-center">
      <Image
        src="/andrea.png"
        alt="Andrea - Ecosystem Builder"
        width={160}
        height={160}
        className="rounded-full mb-6 shadow-xl border-4 border-brand-primary"
      />

      <h1 className="text-4xl font-bold text-foreground mb-2">Andrea</h1>
      <p className="text-muted-foreground text-lg mb-6">
        Co-Founder @ AXMC • Ecosystem Builder • Web3 Infra & Community
      </p>

      <div className="flex gap-6 mt-4">
        <Link
          href="https://github.com/the-axmc"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:text-brand-primary transition"
        >
          <Github size={28} />
        </Link>

        <Link
          href="https://www.linkedin.com/in/andrea-lopez-de-vicuña/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:text-brand-primary transition"
        >
          <Linkedin size={28} />
        </Link>

                <Link
          href="https://t.me/andlopvic"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:text-brand-primary transition"
        >
          <MessageCircle size={26} />
        </Link>

        <Link
          href="mailto:andrea@axmc.xyz"
          className="text-foreground hover:text-brand-primary transition"
        >
          <Mail size={28} />
        </Link>
      </div>
    </div>
  )
}
