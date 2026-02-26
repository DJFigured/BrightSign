import { sdk } from "@/lib/sdk"
import { getLocale, getTranslations } from "next-intl/server"
import { regionMap, type Locale } from "@/i18n/config"
import { getRegionId, getLocalizedDescription } from "@/lib/medusa-helpers"
import { notFound } from "next/navigation"
import { ProductDetailClient } from "./client"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ handle: string; locale: string }>
}

async function getProduct(handle: string, regionId: string) {
  const { products } = await sdk.store.product.list({
    handle,
    fields: "+variants.calculated_price,+metadata,+categories,+images",
    region_id: regionId,
    limit: 1,
  }) as { products: Array<Record<string, unknown>> }
  return products?.[0]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const locale = await getLocale() as Locale
  const regionCode = regionMap[locale]
  const regionId = getRegionId(regionCode)

  const product = await getProduct(handle, regionId)
  if (!product) return { title: "Produkt nenalezen" }

  const meta = product.metadata as Record<string, unknown> | undefined
  const seo = meta?.seo as { title?: string; description?: string } | undefined

  // Use localized description for SEO meta tags
  const localizedDesc = getLocalizedDescription(
    { description: product.description as string | undefined, metadata: meta },
    locale,
  )
  // Strip HTML tags for meta description
  const plainDesc = localizedDesc?.replace(/<[^>]*>/g, "").slice(0, 160)

  // SEO description override is Czech-only — skip for other locales
  const seoDesc = locale === "cs" ? seo?.description : undefined
  const desc = seoDesc || plainDesc || (product.subtitle as string) || undefined

  return {
    title: seo?.title || (product.title as string),
    description: desc,
    openGraph: {
      title: seo?.title || (product.title as string),
      description: desc,
      images: product.thumbnail ? [{ url: product.thumbnail as string }] : undefined,
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params
  const locale = await getLocale() as Locale
  const regionCode = regionMap[locale]
  const regionId = getRegionId(regionCode)

  const product = await getProduct(handle, regionId)
  if (!product) notFound()

  // Fetch related products from same category
  const categories = (product as { categories?: Array<{ id: string; name: string; handle: string }> }).categories
  const categoryId = categories?.[0]?.id
  let relatedProducts: Array<Record<string, unknown>> = []
  if (categoryId) {
    const { products: related } = await sdk.store.product.list({
      category_id: [categoryId],
      fields: "+variants.calculated_price,+metadata",
      region_id: regionId,
      limit: 5,
    }) as { products: Array<Record<string, unknown>> }
    relatedProducts = related.filter((p: Record<string, unknown>) => p.id !== product.id).slice(0, 4)
  }

  // Build breadcrumbs
  const meta = product.metadata as Record<string, unknown> | undefined
  const tHeader = await getTranslations("header")
  const breadcrumbs = [
    { name: tHeader("players"), href: "/kategorie/prehravace" },
  ]
  if (categories && categories.length > 0) {
    // Add first category (series family)
    const cat = categories[0]
    breadcrumbs.push({ name: cat.name, href: `/kategorie/${cat.handle}` })
  }
  breadcrumbs.push({ name: product.title as string, href: `/produkt/${handle}` })

  // JSON-LD structured data
  const variant = (product.variants as Array<{ calculated_price?: { calculated_amount?: number; currency_code?: string } }> | undefined)?.[0]
  const priceAmount = variant?.calculated_price?.calculated_amount
  const currencyCode = variant?.calculated_price?.currency_code?.toUpperCase() ?? "CZK"
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: (product.subtitle as string) || undefined,
    image: product.thumbnail || undefined,
    sku: (meta?.productNumber as string) || undefined,
    brand: {
      "@type": "Brand",
      name: "BrightSign",
    },
    offers: priceAmount != null ? {
      "@type": "Offer",
      price: (priceAmount / 100).toFixed(2),
      priceCurrency: currencyCode,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Make more s.r.o.",
      },
    } : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
        breadcrumbs={breadcrumbs}
      />
    </>
  )
}
