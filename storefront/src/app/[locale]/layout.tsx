import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { notFound } from "next/navigation"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { getMessages } from "next-intl/server"
import { routing } from "@/i18n/routing"
import { locales } from "@/i18n/config"
import { getTranslations } from "next-intl/server"
import { Header, type HeaderNavData } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import { CompareProvider } from "@/lib/compare-context"
import { getNavigationData } from "@/lib/categories"
import { GoogleTagManager, GoogleTagManagerNoScript } from "@/components/analytics/GoogleTagManager"
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics"
import { MetaPixel } from "@/components/analytics/MetaPixel"
import { ClientOverlays, ClientCookieConsent } from "@/components/layout/ClientOverlays"
import { AnalyticsPageMeta } from "@/components/analytics/AnalyticsPageMeta"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
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

  const [messages, navRaw, tc] = await Promise.all([
    getMessages(),
    getNavigationData(),
    getTranslations("common"),
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
        <AnalyticsPageMeta locale={locale} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-brand-primary focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
        >
          {tc("skipToContent")}
        </a>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <CartProvider>
              <CompareProvider>
                <div className="flex min-h-screen flex-col">
                  <Header navData={navData} />
                  <main id="main-content" className="flex-1">{children}</main>
                  <Footer navData={navData} />
                </div>
                <ClientOverlays />
              </CompareProvider>
            </CartProvider>
          </AuthProvider>
          <ClientCookieConsent />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
