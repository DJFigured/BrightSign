import { sdk } from "@/lib/sdk"
import { getLocale, getTranslations } from "next-intl/server"
import { regionMap, getDomainConfigByLocale, type Locale } from "@/i18n/config"
import { getRegionId } from "@/lib/medusa-helpers"
import { localizePath } from "@/lib/url-helpers"
import { CategoryPageClient } from "./client"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ handle: string; locale: string }>
  searchParams: Promise<Record<string, string | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const locale = await getLocale() as Locale
  const config = getDomainConfigByLocale(locale)
  try {
    const { product_categories } = (await sdk.store.category.list({
      fields: "name,description",
      handle,
      limit: 1,
    })) as { product_categories: Array<{ name: string; description?: string }> }

    const cat = product_categories[0]
    if (cat) {
      const title = `${cat.name} | ${config.storeName}`
      const description = cat.description || `${cat.name} — BrightSign digital signage`
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
  } catch {
    // fallback
  }
  return { title: `${handle} | ${config.storeName}` }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { handle } = await params
  const sp = await searchParams
  const locale = await getLocale() as Locale
  const config = getDomainConfigByLocale(locale)
  const siteUrl = config.siteUrl
  const regionCode = regionMap[locale]
  const regionId = getRegionId(regionCode)

  const limit = 100
  const offset = 0

  // Fetch categories (flat list - we build the tree from parent_category_id)
  const { product_categories } = await sdk.store.category.list({
    fields: "id,name,handle,parent_category_id",
    limit: 100,
  }) as { product_categories: Array<{ id: string; name: string; handle: string; parent_category_id: string | null }> }

  // Build children map from flat list
  const childrenMap = new Map<string, Array<{ id: string; name: string; handle: string }>>()
  for (const cat of product_categories) {
    if (cat.parent_category_id) {
      const siblings = childrenMap.get(cat.parent_category_id) ?? []
      siblings.push({ id: cat.id, name: cat.name, handle: cat.handle })
      childrenMap.set(cat.parent_category_id, siblings)
    }
  }

  // Attach children to categories for the sidebar
  const categoriesWithChildren = product_categories.map((cat) => ({
    ...cat,
    category_children: childrenMap.get(cat.id),
  }))

  // Find current category
  const category = categoriesWithChildren.find((c) => c.handle === handle)

  // Recursively gather ALL descendant category IDs for filtering
  function getAllDescendantIds(parentId: string): string[] {
    const ids: string[] = []
    const children = childrenMap.get(parentId) ?? []
    for (const child of children) {
      ids.push(child.id)
      ids.push(...getAllDescendantIds(child.id))
    }
    return ids
  }

  const categoryIds: string[] = []
  if (category) {
    categoryIds.push(category.id)
    categoryIds.push(...getAllDescendantIds(category.id))
  }

  // Fetch products with region_id for correct pricing
  const { products, count } = await sdk.store.product.list({
    category_id: categoryIds.length > 0 ? categoryIds : undefined,
    limit,
    offset,
    fields: "+variants.calculated_price",
    region_id: regionId,
  }) as {
    products: Array<Record<string, unknown>>
    count: number
  }

  // Build breadcrumb path for structured data
  const tc = await getTranslations("common")
  const breadcrumbItems: Array<{ name: string; url: string }> = [
    { name: config.storeName, url: siteUrl },
    { name: tc("products"), url: `${siteUrl}${localizePath("/kategorie", locale)}` },
  ]

  if (category) {
    // If has parent, add parent first
    if (category.parent_category_id) {
      const parent = product_categories.find((c) => c.id === category.parent_category_id)
      if (parent) {
        breadcrumbItems.push({
          name: parent.name,
          url: `${siteUrl}${localizePath(`/kategorie/${parent.handle}`, locale)}`,
        })
      }
    }
    breadcrumbItems.push({
      name: category.name,
      url: `${siteUrl}${localizePath(`/kategorie/${handle}`, locale)}`,
    })
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }

  // CollectionPage + ItemList schema for category product listing
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category?.name ?? handle,
    description: category ? `${category.name} — BrightSign digital signage` : undefined,
    url: `${siteUrl}${localizePath(`/kategorie/${handle}`, locale)}`,
    numberOfItems: count,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: count,
      itemListElement: products.slice(0, 10).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${siteUrl}${localizePath(`/produkt/${p.handle as string}`, locale)}`,
        name: p.title as string,
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <CategoryPageClient
        products={products}
        categories={categoriesWithChildren}
        currentCategory={category ?? null}
        totalProducts={count}
        handle={handle}
        initialFilters={{
          sort: sp.sort,
          series: sp.series,
          line: sp.line,
        }}
      />
    </>
  )
}
