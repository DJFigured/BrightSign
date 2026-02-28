import { getTranslations, getLocale } from "next-intl/server"
import { getDomainConfigByLocale, type Locale } from "@/i18n/config"
import { localizePath } from "@/lib/url-helpers"
import type { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { notFound } from "next/navigation"

const VERTICALS = ["retail", "restaurace", "hotely", "korporat"] as const
type Vertical = (typeof VERTICALS)[number]

const VERTICAL_ICONS: Record<Vertical, string> = {
  retail: "🏬",
  restaurace: "🍽️",
  hotely: "🏨",
  korporat: "🏢",
}

const VERTICAL_PRODUCTS: Record<Vertical, Array<{ model: string; line: string; useCase: string }>> = {
  retail: [
    { model: "HD226", line: "HD", useCase: "POS / promo" },
    { model: "XD236", line: "XD", useCase: "4K / interactive" },
  ],
  restaurace: [
    { model: "HD226", line: "HD", useCase: "menu boards" },
    { model: "HD1026", line: "HD", useCase: "multi-zone" },
  ],
  hotely: [
    { model: "XD236", line: "XD", useCase: "lobby / kiosk" },
    { model: "XD1036", line: "XD", useCase: "4K / interactive" },
  ],
  korporat: [
    { model: "XT245", line: "XT", useCase: "meeting rooms" },
    { model: "XT1145", line: "XT", useCase: "dual 4K / 8K" },
  ],
}

function isVertical(slug: string): slug is Vertical {
  return VERTICALS.includes(slug as Vertical)
}

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return VERTICALS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (!isVertical(slug)) return {}

  const locale = await getLocale() as Locale
  const config = getDomainConfigByLocale(locale)
  const t = await getTranslations("solutions")
  const title = `${t(`${slug}.title`)} | ${config.storeName}`
  const description = t(`${slug}.metaDescription`)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${config.siteUrl}${localizePath(`/reseni/${slug}`, locale)}`,
    },
    twitter: { card: "summary", title, description },
  }
}

export default async function SolutionPage({ params }: PageProps) {
  const { slug } = await params
  if (!isVertical(slug)) notFound()

  const t = await getTranslations("solutions")
  const tCommon = await getTranslations("common")
  const locale = await getLocale() as Locale
  const config = getDomainConfigByLocale(locale)
  const siteUrl = config.siteUrl

  const products = VERTICAL_PRODUCTS[slug]

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: config.storeName, item: siteUrl },
      { "@type": "ListItem", position: 2, name: t("indexTitle"), item: `${siteUrl}${localizePath("/reseni", locale)}` },
      { "@type": "ListItem", position: 3, name: t(`${slug}.title`), item: `${siteUrl}${localizePath(`/reseni/${slug}`, locale)}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-primary-dark to-brand-primary py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <span className="mb-4 inline-block text-5xl" role="img" aria-hidden="true">
            {VERTICAL_ICONS[slug]}
          </span>
          <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {t(`${slug}.title`)}
          </h1>
          <p className="text-lg text-white/80 md:text-xl">
            {t(`${slug}.subtitle`)}
          </p>
        </div>
      </section>

      {/* Description */}
      <section className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <p className="text-lg leading-relaxed text-gray-700">
          {t(`${slug}.description`)}
        </p>
      </section>

      {/* Recommended Products */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-8 text-2xl font-bold text-brand-primary-dark">
            {t("recommendedProducts")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {products.map((product) => (
              <div
                key={product.model}
                className="rounded-xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-2 inline-block rounded-full bg-brand-accent/10 px-3 py-1 text-xs font-semibold text-brand-accent">
                  {product.line}
                </div>
                <h3 className="mb-1 text-xl font-bold text-brand-primary-dark">
                  BrightSign {product.model}
                </h3>
                <p className="mb-4 text-sm text-gray-500">{product.useCase}</p>
                <Link
                  href="/kategorie"
                  className="inline-flex items-center text-sm font-medium text-brand-accent hover:text-brand-primary transition-colors"
                  aria-label={`${t("viewProducts")} — ${product.model}`}
                >
                  {t("viewProducts")}
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-12 md:py-16 text-center">
        <Link
          href="/kategorie"
          className="inline-block rounded-lg bg-brand-accent px-8 py-4 text-lg font-semibold text-white shadow-md transition-colors hover:bg-brand-accent/90"
        >
          {t("viewAllProducts")}
        </Link>
        <p className="mt-4 text-sm text-gray-500">
          {tCommon("freeShipping", { threshold: "2 000 Kč" })}
        </p>
      </section>

      {/* Back to solutions index */}
      <div className="mx-auto max-w-4xl px-4 pb-12">
        <Link
          href="/reseni"
          className="inline-flex items-center text-sm text-gray-500 hover:text-brand-primary transition-colors"
        >
          <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t("indexTitle")}
        </Link>
      </div>
    </>
  )
}
