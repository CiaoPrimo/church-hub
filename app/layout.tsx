import type { Metadata, Viewport } from "next"
import { Inter, Merriweather } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-merriweather",
})

export const metadata: Metadata = {
  title: "Church Hub - Parish Management System",
  description: "A comprehensive management system for parishes to manage staff, announcements, tasks, and events.",
}

export const viewport: Viewport = {
  themeColor: "#a16531",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
