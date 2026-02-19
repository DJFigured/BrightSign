import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "BrightSign.cz - Digital Signage Solutions",
  description:
    "Profesionální digital signage řešení. Oficiální distributor BrightSign přehrávačů pro Českou republiku a střední Evropu.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
