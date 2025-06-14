import { FC, ReactNode } from "react"
import Footer from "./Footer"
import Header from "./Header"

interface Props {
  children: ReactNode
}
const Layout: FC<Props> = ({ children }) => {
  return (
    <div className="bg-background text-foreground flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 py-8 md:py-16 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        {children}
      </div>
      <Footer />
    </div>
  )
}

export default Layout
