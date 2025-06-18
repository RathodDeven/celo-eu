"use client"

import "@rainbow-me/rainbowkit/styles.css"
import Layout from "../components/Layout"
import { ThemeProvider } from "../components/theme-provider"
import RainbowKitWrapper from "./RainbowKitWrapper"
import { AuthProvider } from "./AuthProvider"
import WagmiWrapper from "./WagmiWrapper"

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiWrapper>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RainbowKitWrapper>
            <Layout>{children}</Layout>
          </RainbowKitWrapper>
        </ThemeProvider>
      </AuthProvider>
    </WagmiWrapper>
  )
}
