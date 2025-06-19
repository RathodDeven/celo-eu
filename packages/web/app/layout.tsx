import "@/styles/globals.css"
import type { Metadata } from "next"

import { AppProvider } from "@/providers/AppProvider"

export const metadata: Metadata = {
  metadataBase: new URL("https://celo-eu.vercel.app"),
  title: {
    default: "Celo EU - Decentralized Europe Initiative",
    template: "%s | Celo EU",
  },
  description:
    "Join the Celo Europe community and earn exclusive NFT badges while building the future of decentralized finance in Europe.",
  keywords: [
    "Celo",
    "Europe",
    "Blockchain",
    "DeFi",
    "NFT",
    "Cryptocurrency",
    "Web3",
    "Decentralized",
    "Community",
    "Explorer Badge",
    "Contributor Badge",
  ],
  authors: [{ name: "Celo EU Team" }],
  creator: "Celo EU",
  publisher: "Celo EU",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo-celoeu.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://celo-eu.vercel.app",
    siteName: "Celo EU",
    title: "Celo EU - Decentralized Europe Initiative",
    description:
      "Join the Celo Europe community and earn exclusive NFT badges while building the future of decentralized finance in Europe.",
    images: [
      {
        url: "/logo-celoeu.png",
        width: 1200,
        height: 630,
        alt: "Celo EU - Decentralized Europe Initiative",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Celo EU - Decentralized Europe Initiative",
    description:
      "Join the Celo Europe community and earn exclusive NFT badges while building the future of decentralized finance in Europe.",
    images: ["/logo-celoeu.png"],
    creator: "@CeloEU",
  },
  alternates: {
    canonical: "https://celo-eu.vercel.app",
  },
  category: "technology",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
