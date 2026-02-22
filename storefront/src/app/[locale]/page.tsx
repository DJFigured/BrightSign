import { getLocale, getTranslations } from "next-intl/server"
import { regionMap, type Locale } from "@/i18n/config"
import { getRegionId } from "@/lib/medusa-helpers"
import { sdk } from "@/lib/sdk"
import { HomepageClient } from "@/components/home/HomepageClient"
import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://brightsign.cz"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home")
  const title = `BrightSign.cz — ${t("hero.title")}`
  const description = t("hero.subtitle")

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: SITE_URL,
    },
  }
}

export default async function HomePage() {
  const locale = await getLocale() as Locale
  const regionCode = regionMap[locale]
  const regionId = getRegionId(regionCode)

  // Fetch featured products — prefer S6 → S5 → S4 (with images first)
  let featuredProducts: Array<Record<string, unknown>> = []
  try {
    const { products } = await sdk.store.product.list({
      fields: "+variants.calculated_price,+metadata",
      region_id: regionId,
      limit: 24,
    }) as { products: Array<Record<string, unknown>> }
    // Sort: S6 first, then S5, then S4; within each series prefer products with thumbnails
    featuredProducts = products.sort((a, b) => {
      const sa = Number((a.metadata as Record<string, string>)?.series || "0")
      const sb = Number((b.metadata as Record<string, string>)?.series || "0")
      if (sb !== sa) return sb - sa // Higher series first
      const ha = a.thumbnail ? 0 : 1
      const hb = b.thumbnail ? 0 : 1
      return ha - hb // With images first
    }).slice(0, 8)
  } catch {
    // Silently fail — homepage still renders
  }

  return <HomepageClient featuredProducts={featuredProducts} />
}
