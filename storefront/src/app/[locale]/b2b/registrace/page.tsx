import { getTranslations, getLocale } from "next-intl/server"
import type { Metadata } from "next"
import { B2BRegistracePageClient } from "./client"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://brightsign.cz"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("b2b")
  const title = `${t("title")} | BrightSign.cz`
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
  const locale = await getLocale()

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "BrightSign.cz", item: `${SITE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: t("title"), item: `${SITE_URL}/${locale}/b2b/registrace` },
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
