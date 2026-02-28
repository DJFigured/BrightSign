import { getTranslations, getLocale } from "next-intl/server"
import type { Metadata } from "next"
import { Link } from "@/i18n/navigation"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://brightsign.cz"

const VERTICALS = [
  { slug: "retail", icon: "🏬" },
  { slug: "restaurace", icon: "🍽️" },
  { slug: "hotely", icon: "🏨" },
  { slug: "korporat", icon: "🏢" },
] as const

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("solutions")
  const title = `${t("indexTitle")} | BrightSign.cz`
  const description = t("indexMetaDescription")

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  }
}

export default async function SolutionsIndexPage() {
  const t = await getTranslations("solutions")
  const locale = await getLocale()

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "BrightSign.cz", item: `${SITE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: t("indexTitle"), item: `${SITE_URL}/${locale}/reseni` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold text-brand-primary-dark md:text-4xl">
            {t("indexTitle")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            {t("indexSubtitle")}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {VERTICALS.map(({ slug, icon }) => (
            <Link
              key={slug}
              href={`/reseni/${slug}`}
              className="group rounded-xl border border-border bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-brand-accent/30"
            >
              <span className="mb-4 inline-block text-4xl" role="img" aria-hidden="true">
                {icon}
              </span>
              <h2 className="mb-2 text-xl font-bold text-brand-primary-dark group-hover:text-brand-accent transition-colors">
                {t(`${slug}.title`)}
              </h2>
              <p className="mb-4 text-sm text-gray-600">
                {t(`${slug}.subtitle`)}
              </p>
              <span className="inline-flex items-center text-sm font-medium text-brand-accent">
                {t("learnMore")}
                <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
