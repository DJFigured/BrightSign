import { getTranslations, getLocale } from "next-intl/server"
import type { Metadata } from "next"
import { ContactPageClient } from "./client"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://brightsign.cz"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contactPage")
  const title = `${t("title")} | BrightSign.cz`
  const description = t("subtitle")
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  }
}

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Make more s.r.o.",
  url: "https://brightsign.cz",
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

export default async function ContactPage() {
  const t = await getTranslations("contactPage")
  const locale = await getLocale()

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "BrightSign.cz", item: `${SITE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: t("title"), item: `${SITE_URL}/${locale}/kontakt` },
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
