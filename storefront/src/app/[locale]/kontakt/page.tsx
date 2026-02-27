import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { ContactPageClient } from "./client"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contactPage")
  return {
    title: `${t("title")} | BrightSign.cz`,
    description: t("subtitle"),
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

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <ContactPageClient />
    </>
  )
}
