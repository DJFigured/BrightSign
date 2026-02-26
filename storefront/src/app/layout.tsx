import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "BrightSign.cz - Digital Signage Solutions",
  description:
    "Professional digital signage solutions. Authorized BrightSign distributor for Central Europe — CZ, SK, PL, AT, DE.",
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
