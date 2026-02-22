import { Inter, JetBrains_Mono } from "next/font/google"
import { notFound } from "next/navigation"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { getMessages } from "next-intl/server"
import { routing } from "@/i18n/routing"
import { Header, type HeaderNavData } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import { CompareProvider } from "@/lib/compare-context"
import { CompareBar } from "@/components/product/CompareBar"
import { getNavigationData } from "@/lib/categories"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
})

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const [messages, navRaw] = await Promise.all([
    getMessages(),
    getNavigationData(),
  ])

  // Transform to serializable HeaderNavData
  const navData: HeaderNavData = {
    series: navRaw.series.map(s => ({
      name: s.name,
      handle: s.handle,
      children: s.children.map(ch => ({ name: ch.name, handle: ch.handle })),
    })),
    lines: navRaw.lines.map(l => ({
      name: l.name,
      handle: l.handle,
      description: l.description ?? null,
    })),
    hasAccessories: !!navRaw.accessories,
  }

  return (
    <html lang={locale}>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <CartProvider>
              <CompareProvider>
                <div className="flex min-h-screen flex-col">
                  <Header navData={navData} />
                  <main className="flex-1">{children}</main>
                  <Footer navData={navData} />
                </div>
                <CompareBar />
              </CompareProvider>
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
