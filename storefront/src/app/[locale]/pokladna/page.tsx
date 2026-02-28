import { getLocale, getTranslations } from "next-intl/server"
import { getDomainConfigByLocale, type Locale } from "@/i18n/config"
import type { Metadata } from "next"
import { CheckoutPageClient } from "./client"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale() as Locale
  const config = getDomainConfigByLocale(locale)
  const t = await getTranslations("common")
  return {
    title: `${t("checkout")} | ${config.storeName}`,
    robots: { index: false },
  }
}

export default function CheckoutPage() {
  return <CheckoutPageClient />
}
