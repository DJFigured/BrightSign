import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { notFound } from "next/navigation"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { getMessages } from "next-intl/server"
import { routing } from "@/i18n/routing"
import { locales } from "@/i18n/config"
import { Header, type HeaderNavData } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import { CompareProvider } from "@/lib/compare-context"
import { CompareBar } from "@/components/product/CompareBar"
import { getNavigationData } from "@/lib/categories"
import { GoogleTagManager, GoogleTagManagerNoScript } from "@/components/analytics/GoogleTagManager"
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics"
import { MetaPixel } from "@/components/analytics/MetaPixel"
import { CookieConsent } from "@/components/analytics/CookieConsent"
import { BackToTop } from "@/components/ui/BackToTop"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://brightsign.cz"

const hreflangMap: Record<string, string> = {
  cs: "cs-CZ",
  sk: "sk-SK",
  pl: "pl-PL",
  en: "en",
  de: "de-DE",
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  const languages: Record<string, string> = {}
  for (const loc of locales) {
    languages[hreflangMap[loc] || loc] = `${SITE_URL}/${loc}`
  }
  languages["x-default"] = `${SITE_URL}/cs`

  return {
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages,
    },
    openGraph: {
      siteName: "BrightSign.cz",
      type: "website",
      locale: hreflangMap[locale] || locale,
    },
    other: {
      "theme-color": "#1a2b4a",
    },
  }
}

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
      <head>
        <GoogleTagManager />
        <GoogleAnalytics />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <GoogleTagManagerNoScript />
        <MetaPixel />
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
                <BackToTop />
              </CompareProvider>
            </CartProvider>
          </AuthProvider>
          <CookieConsent />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
