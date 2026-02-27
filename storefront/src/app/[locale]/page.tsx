import { getLocale, getTranslations } from "next-intl/server"
import { regionMap, type Locale } from "@/i18n/config"
import { getRegionId } from "@/lib/medusa-helpers"
import { sdk } from "@/lib/sdk"
import { HomepageClient } from "@/components/home/HomepageClient"
import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://brightsign.cz"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home")
  const title = `BrightSign.cz — ${t("hero.title")}`
  const description = t("hero.subtitle")

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: SITE_URL,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

export default async function HomePage() {
  const locale = await getLocale() as Locale
  const regionCode = regionMap[locale]
  const regionId = getRegionId(regionCode)

  // Fetch featured products — prefer S6 → S5 → S4 (with images first)
  let featuredProducts: Array<Record<string, unknown>> = []
  try {
    const { products } = await sdk.store.product.list({
      fields: "+variants.calculated_price,+metadata",
      region_id: regionId,
      limit: 24,
    }) as { products: Array<Record<string, unknown>> }
    // Sort: S6 first, then S5, then S4; within each series prefer products with thumbnails
    featuredProducts = products.sort((a, b) => {
      const sa = Number((a.metadata as Record<string, string>)?.series || "0")
      const sb = Number((b.metadata as Record<string, string>)?.series || "0")
      if (sb !== sa) return sb - sa // Higher series first
      const ha = a.thumbnail ? 0 : 1
      const hb = b.thumbnail ? 0 : 1
      return ha - hb // With images first
    }).slice(0, 8)
  } catch {
    // Silently fail — homepage still renders
  }

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BrightSign.cz",
    legalName: "Make more s.r.o.",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    image: `${SITE_URL}/logo.svg`,
    taxID: "CZ21890161",
    address: {
      "@type": "PostalAddress",
      addressCountry: "CZ",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: "info@brightsign.cz",
      contactType: "customer service",
      availableLanguage: ["Czech", "Slovak", "English", "German", "Polish"],
    },
  }

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BrightSign.cz",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/${locale}/hledani?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HomepageClient featuredProducts={featuredProducts} />
    </>
  )
}
