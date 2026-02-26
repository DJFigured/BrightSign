import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { LoginPageClient } from "./client"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth")
  return {
    title: `${t("login")} | BrightSign.cz`,
    robots: { index: false },
  }
}

export default function LoginPage() {
  return <LoginPageClient />
}
