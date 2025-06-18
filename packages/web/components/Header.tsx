import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { Bars3Icon } from "@heroicons/react/24/outline"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { ModeToggle } from "./ModeToggle"
import { NAV_URLS, SOCIAL_URLS } from "@/lib/config"
import { useAccount, useReadContract } from "wagmi"
import { useAuth } from "@/providers/AuthProvider"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { Wallet } from "lucide-react"
import {
  nexusExplorerAbi,
  nexusExplorerAddress,
} from "@/lib/abi/NexusExplorerBadge"

// Reuse footer navigation for drawer
const socialNavigation = [
  {
    name: "X",
    href: SOCIAL_URLS.TWITTER,
    icon: (props: any) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    ),
  },
  {
    name: "GitHub",
    href: SOCIAL_URLS.GITHUB,
    icon: (props: any) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
]

// Helper function to determine if a URL is external
const isExternalLink = (url: string) => url.startsWith("http")

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const pathname = usePathname()
  // Using wagmi's useAccount hook to check if wallet is connected
  const { address, isConnected } = useAccount() // Using our custom auth context
  const { isSignedIn, isLoading, signIn, error, clearError } = useAuth()
  // Using RainbowKit connect modal
  const { openConnectModal } = useConnectModal()
  // Check if user has minted the Explorer Badge
  const { data: hasMinted } = useReadContract({
    address: nexusExplorerAddress,
    abi: nexusExplorerAbi,
    functionName: "hasMinted",
    args: [address],
    query: {
      enabled: !!address && isConnected,
    },
  }) as { data: boolean | undefined }

  // Helper function to check if a link is active
  const isActive = (path: string) => pathname === path

  // Render either Next.js Link or anchor tag based on URL type
  const NavLink = ({
    href,
    className,
    children,
    onClick,
  }: {
    href: string
    className: string
    children: React.ReactNode
    onClick?: () => void
  }) => {
    if (isExternalLink(href)) {
      return (
        <a
          href={href}
          className={className}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
        >
          {children}
        </a>
      )
    }
    return (
      <Link href={href} className={className} onClick={onClick}>
        {children}
      </Link>
    )
  }

  return (
    <nav className="bg-background text-foreground border-b border-border">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 justify-between">
          {/* Mobile layout */}
          <div className="flex items-center sm:hidden">
            {/* Mobile menu button and logo side by side */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
            </button>

            <div className="flex ml-2 items-center">
              <Image
                className="block h-8 w-auto"
                src="/logo-celoeu.png"
                width={32}
                height={32}
                alt="Celo Europe Logo"
              />
            </div>
          </div>
          {/* Mobile right side controls */}
          <div className="flex items-center gap-2 sm:hidden">
            {/* Mobile Theme toggle */}
            <ModeToggle />

            {/* Mobile Custom Connect Button (when not connected) */}
            {!isConnected && (
              <button
                onClick={openConnectModal}
                className="inline-flex items-center justify-center rounded-full bg-primary p-2 text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                title="Connect Wallet"
              >
                <Wallet size={16} />
              </button>
            )}

            {/* Mobile Sign In Button (icon only) */}
            {isConnected && !isSignedIn && (
              <button
                onClick={() => {
                  clearError()
                  signIn()
                }}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground p-2 shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Sign In"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Wallet size={16} />
                )}
              </button>
            )}

            {/* Mobile Connect Button (only when signed in) */}
            {isConnected && isSignedIn && (
              <ConnectButton
                showBalance={false}
                accountStatus="avatar"
                chainStatus="none"
              />
            )}
          </div>
          {/* Desktop layout */}
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
              <Image
                className="block h-8 w-auto"
                src="/logo-celoeu.png"
                width={32}
                height={32}
                alt="Celo Europe Logo"
              />
            </div>
            <div className="sm:ml-6 sm:flex sm:space-x-8">
              <NavLink
                href={NAV_URLS.HOME}
                className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                  isActive(NAV_URLS.HOME)
                    ? "border-brand-secondary text-foreground"
                    : "border-transparent text-foreground/70 hover:border-brand-secondary/70 hover:text-foreground"
                }`}
              >
                Home
              </NavLink>
              <NavLink
                href={NAV_URLS.GUIDE}
                className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                  isActive(NAV_URLS.GUIDE)
                    ? "border-brand-secondary text-foreground"
                    : "border-transparent text-foreground/70 hover:border-brand-secondary/70 hover:text-foreground"
                }`}
              >
                Guide
              </NavLink>
              <NavLink
                href={NAV_URLS.TEAM}
                className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                  isActive(NAV_URLS.TEAM)
                    ? "border-brand-secondary text-foreground"
                    : "border-transparent text-foreground/70 hover:border-brand-secondary/70 hover:text-foreground"
                }`}
              >
                Team
              </NavLink>{" "}
              {isConnected && isSignedIn && (
                <NavLink
                  href={NAV_URLS.RESOURCES}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                    isExternalLink(NAV_URLS.RESOURCES)
                      ? "border-transparent text-foreground/70 hover:border-brand-secondary/70 hover:text-foreground"
                      : isActive(NAV_URLS.RESOURCES)
                      ? "border-brand-secondary text-foreground"
                      : "border-transparent text-foreground/70 hover:border-brand-secondary/70 hover:text-foreground"
                  }`}
                >
                  Resources
                </NavLink>
              )}
              {isConnected && isSignedIn && (
                <NavLink
                  href={NAV_URLS.EVENTS}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                    isExternalLink(NAV_URLS.EVENTS)
                      ? "border-transparent text-foreground/70 hover:border-brand-secondary/70 hover:text-foreground"
                      : isActive(NAV_URLS.EVENTS)
                      ? "border-brand-secondary text-foreground"
                      : "border-transparent text-foreground/70 hover:border-brand-secondary/70 hover:text-foreground"
                  }`}
                >
                  Events
                </NavLink>
              )}
              {isConnected && isSignedIn && (
                <NavLink
                  href={NAV_URLS.VEKI}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                    isActive(NAV_URLS.VEKI)
                      ? "border-brand-secondary text-foreground"
                      : "border-transparent text-foreground/70 hover:border-brand-secondary/70 hover:text-foreground"
                  }`}
                >
                  Veki Program
                </NavLink>
              )}
              {isConnected && isSignedIn && hasMinted && (
                <NavLink
                  href={NAV_URLS.DASHBOARD}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                    isActive(NAV_URLS.DASHBOARD)
                      ? "border-brand-secondary text-foreground"
                      : "border-transparent text-foreground/70 hover:border-brand-secondary/70 hover:text-foreground"
                  }`}
                >
                  Dashboard
                </NavLink>
              )}
            </div>
          </div>
          <div className="hidden sm:flex items-center  sm:static sm:ml-6">
            {/* Theme toggle button - only on desktop */}
            <div className="mr-3 hidden sm:block">
              <ModeToggle />
            </div>
            {/* Custom Connect Button - desktop only (when not connected) */}
            {!isConnected && (
              <button
                onClick={openConnectModal}
                className="mr-3 hidden sm:inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <Wallet size={16} />
                Connect Wallet
              </button>
            )}{" "}
            {/* Sign In Button - desktop only (when connected but not signed in) */}
            {isConnected && !isSignedIn && (
              <div className="mr-3 relative hidden sm:block">
                <button
                  onClick={() => {
                    clearError()
                    signIn()
                  }}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Signing...
                    </>
                  ) : (
                    <>
                      <Wallet size={16} />
                      Sign In
                    </>
                  )}
                </button>

                {/* Error tooltip for desktop */}
                {error && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-destructive/10 text-destructive text-xs p-2 rounded shadow-lg z-50 border border-destructive/20">
                    {error}
                  </div>
                )}
              </div>
            )}
            {/* Desktop Connect Button (only when signed in) */}
            {isConnected && isSignedIn && (
              <div className="hidden sm:block mr-3">
                <ConnectButton
                  showBalance={{
                    smallScreen: false,
                    largeScreen: true,
                  }}
                  accountStatus={{
                    smallScreen: "avatar",
                    largeScreen: "full",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer using shadcn pattern */}
      <Drawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        direction="left"
      >
        <DrawerContent className="h-full max-h-full w-[85vw] no-handle">
          <div className="bg-background text-foreground h-full w-[85vw] max-w-md flex flex-col">
            <div className="p-4 border-b border-border flex items-center">
              <Image
                src="/logo-celoeu.png"
                width={32}
                height={32}
                alt="Celo Europe Logo"
              />
              <span className="ml-3 text-lg font-medium">Celo Europe</span>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col p-4 space-y-2 flex-1">
              <NavLink
                href={NAV_URLS.HOME}
                className={`py-3 px-4 rounded-md font-medium transition-colors duration-200 ${
                  isActive(NAV_URLS.HOME)
                    ? "bg-muted text-foreground border-l-4 border-brand-secondary"
                    : "text-foreground/70 hover:bg-muted/50 hover:text-foreground hover:border-l-4 hover:border-brand-secondary/70"
                }`}
                onClick={() => setIsDrawerOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                href={NAV_URLS.GUIDE}
                className={`py-3 px-4 rounded-md font-medium transition-colors duration-200 ${
                  isActive(NAV_URLS.GUIDE)
                    ? "bg-muted text-foreground border-l-4 border-brand-secondary"
                    : "text-foreground/70 hover:bg-muted/50 hover:text-foreground hover:border-l-4 hover:border-brand-secondary/70"
                }`}
                onClick={() => setIsDrawerOpen(false)}
              >
                Guide
              </NavLink>
              <NavLink
                href={NAV_URLS.TEAM}
                className={`py-3 px-4 rounded-md font-medium transition-colors duration-200 ${
                  isActive(NAV_URLS.TEAM)
                    ? "bg-muted text-foreground border-l-4 border-brand-secondary"
                    : "text-foreground/70 hover:bg-muted/50 hover:text-foreground hover:border-l-4 hover:border-brand-secondary/70"
                }`}
                onClick={() => setIsDrawerOpen(false)}
              >
                Team{" "}
              </NavLink>

              {/* Only show these links when signed in */}
              {isConnected && isSignedIn && (
                <>
                  <NavLink
                    href={NAV_URLS.RESOURCES}
                    className={`py-3 px-4 rounded-md font-medium transition-colors duration-200 ${
                      isExternalLink(NAV_URLS.RESOURCES)
                        ? "text-foreground/70 hover:bg-muted/50 hover:text-foreground hover:border-l-4 hover:border-brand-secondary/70"
                        : isActive(NAV_URLS.RESOURCES)
                        ? "bg-muted text-foreground border-l-4 border-brand-secondary"
                        : "text-foreground/70 hover:bg-muted/50 hover:text-foreground hover:border-l-4 hover:border-brand-secondary/70"
                    }`}
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    Resources
                  </NavLink>
                  <NavLink
                    href={NAV_URLS.EVENTS}
                    className={`py-3 px-4 rounded-md font-medium transition-colors duration-200 ${
                      isExternalLink(NAV_URLS.EVENTS)
                        ? "text-foreground/70 hover:bg-muted/50 hover:text-foreground hover:border-l-4 hover:border-brand-secondary/70"
                        : isActive(NAV_URLS.EVENTS)
                        ? "bg-muted text-foreground border-l-4 border-brand-secondary"
                        : "text-foreground/70 hover:bg-muted/50 hover:text-foreground hover:border-l-4 hover:border-brand-secondary/70"
                    }`}
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    Events
                  </NavLink>
                  <NavLink
                    href={NAV_URLS.VEKI}
                    className={`py-3 px-4 rounded-md font-medium transition-colors duration-200 ${
                      isActive(NAV_URLS.VEKI)
                        ? "bg-muted text-foreground border-l-4 border-brand-secondary"
                        : "text-foreground/70 hover:bg-muted/50 hover:text-foreground hover:border-l-4 hover:border-brand-secondary/70"
                    }`}
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    Veki Program{" "}
                  </NavLink>
                  {hasMinted && (
                    <NavLink
                      href={NAV_URLS.DASHBOARD}
                      className={`py-3 px-4 rounded-md font-medium transition-colors duration-200 ${
                        isActive(NAV_URLS.DASHBOARD)
                          ? "bg-muted text-foreground border-l-4 border-brand-secondary"
                          : "text-foreground/70 hover:bg-muted/50 hover:text-foreground hover:border-l-4 hover:border-brand-secondary/70"
                      }`}
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      Dashboard
                    </NavLink>
                  )}
                </>
              )}

              {/* Show basic links for non-signed in users */}
              {(!isConnected || !isSignedIn) && (
                <NavLink
                  href={NAV_URLS.VEKI}
                  className={`py-3 px-4 rounded-md font-medium transition-colors duration-200 ${
                    isActive(NAV_URLS.VEKI)
                      ? "bg-muted text-foreground border-l-4 border-brand-secondary"
                      : "text-foreground/70 hover:bg-muted/50 hover:text-foreground hover:border-l-4 hover:border-brand-secondary/70"
                  }`}
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Veki Program
                </NavLink>
              )}

              {/* Custom Connect Button for Mobile */}
              {!isConnected && (
                <div className="mx-4 mt-4">
                  <button
                    onClick={openConnectModal}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-3 text-sm font-medium shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <Wallet size={16} />
                    Connect Wallet
                  </button>
                </div>
              )}

              {/* Sign In Button for Mobile */}
              {isConnected && !isSignedIn && (
                <div className="mx-4 mt-4">
                  {" "}
                  <button
                    onClick={() => {
                      clearError()
                      signIn()
                    }}
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-3 text-sm font-medium shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Signing...
                      </>
                    ) : (
                      <>
                        <Wallet size={16} />
                        Sign In
                      </>
                    )}
                  </button>
                  {/* Error display for mobile */}
                  {error && (
                    <div className="mt-2 text-sm bg-destructive/10 text-destructive p-2 rounded border border-destructive/20">
                      {error}
                    </div>
                  )}
                </div>
              )}

              {/* Sign Out Button for Mobile - Removed since sign-out is handled automatically */}
            </div>

            {/* Footer Content */}
            <div className="border-t border-border p-4">
              {/* Social Links */}
              <div className="flex space-x-4 mb-4 justify-center">
                {socialNavigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-foreground hover:text-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="sr-only">{item.name}</span>
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                  </a>
                ))}
              </div>

              {/* Copyright */}
              <p className="text-sm text-foreground text-center">
                &copy; {new Date().getFullYear()} Build for Celo Europe by AXMC.
              </p>

              {/* Policies */}
              <div className="flex justify-center space-x-4 mt-2">
                <a
                  href={NAV_URLS.PRIVACY}
                  className="text-xs text-foreground hover:text-primary"
                >
                  Privacy Policy
                </a>
                <a
                  href={NAV_URLS.COOKIE}
                  className="text-xs text-foreground hover:text-primary"
                >
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </nav>
  )
}
