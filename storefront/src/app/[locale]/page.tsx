import { getLocale } from "next-intl/server"
import { regionMap, type Locale } from "@/i18n/config"
import { getRegionId } from "@/lib/medusa-helpers"
import { sdk } from "@/lib/sdk"
import { HomepageClient } from "@/components/home/HomepageClient"

export default async function HomePage() {
  const locale = await getLocale() as Locale
  const regionCode = regionMap[locale]
  const regionId = getRegionId(regionCode)

  // Fetch featured products (Série 6 newest, then S5 bestsellers)
  let featuredProducts: Array<Record<string, unknown>> = []
  try {
    const { products } = await sdk.store.product.list({
      fields: "+variants.calculated_price,+metadata",
      region_id: regionId,
      limit: 8,
      order: "-created_at",
    }) as { products: Array<Record<string, unknown>> }
    featuredProducts = products
  } catch {
    // Silently fail — homepage still renders
  }

  return <HomepageClient featuredProducts={featuredProducts} />
}
