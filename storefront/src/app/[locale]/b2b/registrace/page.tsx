import { getTranslations, getLocale } from "next-intl/server"
import { getDomainConfigByLocale, type Locale } from "@/i18n/config"
import { localizePath } from "@/lib/url-helpers"
import type { Metadata } from "next"
import { B2BRegistracePageClient } from "./client"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale() as Locale
  const config = getDomainConfigByLocale(locale)
  const t = await getTranslations("b2b")
  const title = `${t("title")} | ${config.storeName}`
  const description = t("subtitle")
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  }
}

export default async function B2BRegistracePage() {
  const t = await getTranslations("b2b")
  const locale = await getLocale() as Locale
  const config = getDomainConfigByLocale(locale)
  const siteUrl = config.siteUrl

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: config.storeName, item: siteUrl },
      { "@type": "ListItem", position: 2, name: t("title"), item: `${siteUrl}${localizePath("/b2b/registrace", locale)}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <B2BRegistracePageClient />
    </>
  )
}
