import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { RegisterPageClient } from "./client"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth")
  return {
    title: `${t("register")} | BrightSign.cz`,
    description: t("registerSubtitle"),
  }
}

export default function RegisterPage() {
  return <RegisterPageClient />
}
