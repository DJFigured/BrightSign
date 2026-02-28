import { getLocale, getTranslations } from "next-intl/server"
import { getDomainConfigByLocale, type Locale } from "@/i18n/config"
import type { Metadata } from "next"
import { RegisterPageClient } from "./client"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale() as Locale
  const config = getDomainConfigByLocale(locale)
  const t = await getTranslations("auth")
  return {
    title: `${t("register")} | ${config.storeName}`,
    description: t("registerSubtitle"),
    robots: { index: false },
  }
}

export default function RegisterPage() {
  return <RegisterPageClient />
}
