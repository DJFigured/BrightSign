import { getLocale, getTranslations } from "next-intl/server"
import { regionMap, getDomainConfigByLocale, type Locale } from "@/i18n/config"
import { getRegionId } from "@/lib/medusa-helpers"
import { sdk } from "@/lib/sdk"
import { SearchResultsClient } from "./client"
import type { Metadata } from "next"

interface Props {
  searchParams: Promise<Record<string, string | undefined>>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams
  const locale = await getLocale() as Locale
  const config = getDomainConfigByLocale(locale)
  const t = await getTranslations("search")
  const query = sp.q || ""
  const ts = await getTranslations("common")
  return {
    title: query ? `${t("resultsFor", { query })} | ${config.storeName}` : `${t("title")} | ${config.storeName}`,
    description: ts("search"),
    robots: { index: false },
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams
  const query = sp.q || ""
  const locale = (await getLocale()) as Locale
  const regionCode = regionMap[locale]
  const regionId = getRegionId(regionCode)

  let products: Array<Record<string, unknown>> = []

  if (query.trim()) {
    try {
      const result = (await sdk.store.product.list({
        q: query,
        region_id: regionId,
        fields: "+variants.calculated_price,+metadata",
        limit: 20,
      })) as { products: Array<Record<string, unknown>> }
      products = result.products
    } catch {
      // Silently fail
    }
  }

  return <SearchResultsClient products={products} query={query} />
}
