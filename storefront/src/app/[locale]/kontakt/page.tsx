import { getTranslations, getLocale } from "next-intl/server"
import { getDomainConfigByLocale, type Locale } from "@/i18n/config"
import { localizePath } from "@/lib/url-helpers"
import type { Metadata } from "next"
import { ContactPageClient } from "./client"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale() as Locale
  const config = getDomainConfigByLocale(locale)
  const t = await getTranslations("contactPage")
  const title = `${t("title")} | ${config.storeName}`
  const description = t("subtitle")
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  }
}

export default async function ContactPage() {
  const t = await getTranslations("contactPage")
  const locale = await getLocale() as Locale
  const config = getDomainConfigByLocale(locale)
  const siteUrl = config.siteUrl

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Make more s.r.o.",
    url: siteUrl,
    email: "info@brightsign.cz",
    taxID: "CZ21890161",
    address: {
      "@type": "PostalAddress",
      addressCountry: "CZ",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: config.storeName, item: siteUrl },
      { "@type": "ListItem", position: 2, name: t("title"), item: `${siteUrl}${localizePath("/kontakt", locale)}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ContactPageClient />
    </>
  )
}
