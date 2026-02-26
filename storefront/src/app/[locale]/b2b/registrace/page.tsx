import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { B2BRegistracePageClient } from "./client"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("b2b")
  return {
    title: `${t("title")} | BrightSign.cz`,
    description: t("subtitle"),
  }
}

export default function B2BRegistracePage() {
  return <B2BRegistracePageClient />
}
