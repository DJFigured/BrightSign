import { sdk } from "@/lib/sdk"
import { getLocale, getTranslations } from "next-intl/server"
import { regionMap, getDomainConfigByLocale, type Locale } from "@/i18n/config"
import { getRegionId } from "@/lib/medusa-helpers"
import { localizePath } from "@/lib/url-helpers"
import { CategoryPageClient } from "./[handle]/client"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale() as Locale
  const config = getDomainConfigByLocale(locale)
  const t = await getTranslations("category")
  const title = `${t("allProducts")} | ${config.storeName}`
  const description = t("allProductsDescription")
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

interface Props {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function AllProductsPage({ searchParams }: Props) {
  const sp = await searchParams
  const locale = await getLocale() as Locale
  const config = getDomainConfigByLocale(locale)
  const siteUrl = config.siteUrl
  const tc = await getTranslations("category")
  const regionCode = regionMap[locale]
  const regionId = getRegionId(regionCode)

  const { product_categories } = await sdk.store.category.list({
    fields: "id,name,handle,parent_category_id",
    limit: 100,
  }) as { product_categories: Array<{ id: string; name: string; handle: string; parent_category_id: string | null }> }

  // Build children map from flat list for sidebar
  const childrenMap = new Map<string, Array<{ id: string; name: string; handle: string }>>()
  for (const cat of product_categories) {
    if (cat.parent_category_id) {
      const siblings = childrenMap.get(cat.parent_category_id) ?? []
      siblings.push({ id: cat.id, name: cat.name, handle: cat.handle })
      childrenMap.set(cat.parent_category_id, siblings)
    }
  }
  const categoriesWithChildren = product_categories.map((cat) => ({
    ...cat,
    category_children: childrenMap.get(cat.id),
  }))

  const { products, count } = await sdk.store.product.list({
    limit: 100,
    offset: 0,
    fields: "+variants.calculated_price",
    region_id: regionId,
  }) as { products: Array<Record<string, unknown>>; count: number }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: config.storeName, item: siteUrl },
      { "@type": "ListItem", position: 2, name: tc("allProducts"), item: `${siteUrl}${localizePath("/kategorie", locale)}` },
    ],
  }

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
    />
    <CategoryPageClient
      products={products}
      categories={categoriesWithChildren}
      currentCategory={null}
      totalProducts={count}
      handle=""
      initialFilters={{
        sort: sp.sort,
        series: sp.series,
        line: sp.line,
      }}
    />
    </>
  )
}
