import { sdk } from "@/lib/sdk"
import { getLocale } from "next-intl/server"
import { regionMap, type Locale } from "@/i18n/config"
import { getRegionId } from "@/lib/medusa-helpers"
import { notFound } from "next/navigation"
import { ProductDetailClient } from "./client"

interface Props {
  params: Promise<{ handle: string; locale: string }>
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params
  const locale = await getLocale() as Locale
  const regionCode = regionMap[locale]
  const regionId = getRegionId(regionCode)

  // Fetch product by handle (include categories for related products)
  const { products } = await sdk.store.product.list({
    handle,
    fields: "+variants.calculated_price,+metadata,+categories",
    region_id: regionId,
    limit: 1,
  }) as { products: Array<Record<string, unknown>> }

  const product = products?.[0]
  if (!product) notFound()

  // Fetch related products from same category
  const categories = (product as { categories?: Array<{ id: string }> }).categories
  const categoryId = categories?.[0]?.id
  let relatedProducts: Array<Record<string, unknown>> = []
  if (categoryId) {
    const { products: related } = await sdk.store.product.list({
      category_id: [categoryId],
      fields: "+variants.calculated_price",
      region_id: regionId,
      limit: 4,
    }) as { products: Array<Record<string, unknown>> }
    relatedProducts = related.filter((p: Record<string, unknown>) => p.id !== product.id).slice(0, 4)
  }

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />
}
