import { getLocale, getTranslations } from "next-intl/server"
import { getDomainConfigByLocale, type Locale } from "@/i18n/config"
import type { Metadata } from "next"
import { OrderDetailPageClient } from "./client"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale() as Locale
  const config = getDomainConfigByLocale(locale)
  const t = await getTranslations("checkout")
  return {
    title: `${t("orderDetail")} | ${config.storeName}`,
    robots: { index: false, follow: false },
  }
}

export default function OrderDetailPage() {
  return <OrderDetailPageClient />
}
