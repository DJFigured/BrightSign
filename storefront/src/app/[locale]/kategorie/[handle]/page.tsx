import { sdk } from "@/lib/sdk"
import { getLocale } from "next-intl/server"
import { regionMap, type Locale } from "@/i18n/config"
import { getRegionId } from "@/lib/medusa-helpers"
import { CategoryPageClient } from "./client"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ handle: string; locale: string }>
  searchParams: Promise<Record<string, string | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  try {
    const { product_categories } = (await sdk.store.category.list({
      fields: "name,description",
      handle,
      limit: 1,
    })) as { product_categories: Array<{ name: string; description?: string }> }

    const cat = product_categories[0]
    if (cat) {
      return {
        title: `${cat.name} | BrightSign.cz`,
        description: cat.description || `${cat.name} — BrightSign digital signage`,
      }
    }
  } catch {
    // fallback
  }
  return { title: `${handle} | BrightSign.cz` }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { handle } = await params
  const sp = await searchParams
  const locale = await getLocale() as Locale
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

  return (
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
  )
}
