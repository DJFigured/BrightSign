import { getTranslations, getLocale } from "next-intl/server"
import { getDomainConfigByLocale, type Locale } from "@/i18n/config"
import { localizePath } from "@/lib/url-helpers"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale() as Locale
  const config = getDomainConfigByLocale(locale)
  const t = await getTranslations("legal.privacy")
  const title = `${t("title")} | ${config.storeName}`
  const description = t("metaDescription")
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  }
}

export default async function PrivacyPage() {
  const t = await getTranslations("legal.privacy")
  const locale = await getLocale() as Locale
  const config = getDomainConfigByLocale(locale)
  const siteUrl = config.siteUrl

  const sections = [
    "s1", "s2", "s3", "s4", "s5", "s6", "s7",
  ] as const

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: config.storeName, item: siteUrl },
      { "@type": "ListItem", position: 2, name: t("title"), item: `${siteUrl}${localizePath("/ochrana-udaju", locale)}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold text-brand-primary-dark">
          {t("title")}
        </h1>
        <p className="mb-8 text-sm text-gray-500">{t("lastUpdated")}</p>

        <div className="space-y-8">
          {sections.map((key) => (
            <section key={key}>
              <h2 className="mb-3 text-xl font-semibold text-brand-primary-dark">
                {t(`${key}title`)}
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-gray-700">
                {t(`${key}content`)}
              </p>
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
