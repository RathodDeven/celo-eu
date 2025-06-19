"use client"

import "@rainbow-me/rainbowkit/styles.css"
import Layout from "../components/Layout"
import { ThemeProvider } from "../components/theme-provider"
import RainbowKitWrapper from "./RainbowKitWrapper"
import { AuthProvider } from "./AuthProvider"

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <RainbowKitWrapper>
        <AuthProvider>
          <Layout>{children}</Layout>
        </AuthProvider>
      </RainbowKitWrapper>
    </ThemeProvider>
  )
}
