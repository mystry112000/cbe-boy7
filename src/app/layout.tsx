import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import "./globals.css"

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "cbe_boy7 | Private AI for Unlimited Creative Freedom",
  description: "Access leading AI models with your privacy in mind. Generate text, images, video, code, and more.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
