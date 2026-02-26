import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { ContactPageClient } from "./client"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contactPage")
  return {
    title: `${t("title")} | BrightSign.cz`,
    description: t("subtitle"),
  }
}

export default function ContactPage() {
  return <ContactPageClient />
}
