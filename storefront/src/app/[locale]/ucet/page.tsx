import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { AccountPageClient } from "./client"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account")
  return {
    title: `${t("title")} | BrightSign.cz`,
    robots: { index: false },
  }
}

export default function AccountPage() {
  return <AccountPageClient />
}
