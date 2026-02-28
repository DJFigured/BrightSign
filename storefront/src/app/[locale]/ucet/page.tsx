import { getLocale, getTranslations } from "next-intl/server"
import { getDomainConfigByLocale, type Locale } from "@/i18n/config"
import type { Metadata } from "next"
import { AccountPageClient } from "./client"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale() as Locale
  const config = getDomainConfigByLocale(locale)
  const t = await getTranslations("account")
  return {
    title: `${t("title")} | ${config.storeName}`,
    robots: { index: false },
  }
}

export default function AccountPage() {
  return <AccountPageClient />
}
