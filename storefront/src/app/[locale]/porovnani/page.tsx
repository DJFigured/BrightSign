import { getTranslations, getLocale } from "next-intl/server"
import type { Metadata } from "next"
import { ComparePageClient } from "./client"
import { regionMap } from "@/i18n/config"
import { getRegionId } from "@/lib/medusa-helpers"
import type { Locale } from "@/i18n/config"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("compare")
  return {
    title: t("title"),
    robots: { index: false },
  }
}

export default async function ComparePage() {
  const locale = await getLocale() as Locale
  const regionCode = regionMap[locale]
  const regionId = getRegionId(regionCode)
  return <ComparePageClient regionId={regionId} />
}
