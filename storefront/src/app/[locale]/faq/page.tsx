import { getTranslations, getLocale } from "next-intl/server"
import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://brightsign.cz"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("faq")
  const title = `${t("title")} | BrightSign.cz`
  const description = t("metaDescription")
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  }
}

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"] as const

export default async function FaqPage() {
  const t = await getTranslations("faq")
  const locale = await getLocale()

  const faqItems = FAQ_KEYS.map((key) => ({
    question: t(`${key}.question`),
    answer: t(`${key}.answer`),
  }))

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "BrightSign.cz", item: `${SITE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: t("title"), item: `${SITE_URL}/${locale}/faq` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold text-brand-primary-dark">
          {t("title")}
        </h1>

        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <details
              key={i}
              className="group rounded-lg border border-border bg-white"
              open={i === 0}
            >
              <summary className="flex cursor-pointer items-center justify-between p-5 text-left font-medium text-brand-primary-dark hover:text-brand-accent transition-colors">
                {item.question}
                <span className="ml-4 shrink-0 text-muted-foreground group-open:rotate-180 transition-transform">
                  &#9662;
                </span>
              </summary>
              <div className="border-t border-border px-5 py-4 text-gray-700 leading-relaxed whitespace-pre-line">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </>
  )
}
