import { getLocale, getTranslations } from "next-intl/server"
import { getDomainConfigByLocale, type Locale } from "@/i18n/config"
import type { Metadata } from "next"
import { CartPageClient } from "./client"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale() as Locale
  const config = getDomainConfigByLocale(locale)
  const t = await getTranslations("cart")
  return {
    title: `${t("title")} | ${config.storeName}`,
    robots: { index: false },
  }
}

export default function CartPage() {
  return <CartPageClient />
}
