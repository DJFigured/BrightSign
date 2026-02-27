import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { B2BRegistracePageClient } from "./client"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("b2b")
  const title = `${t("title")} | BrightSign.cz`
  const description = t("subtitle")
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  }
}

export default function B2BRegistracePage() {
  return <B2BRegistracePageClient />
}
