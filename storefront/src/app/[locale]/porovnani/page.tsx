import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { ComparePageClient } from "./client"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("compare")
  return { title: t("title") }
}

export default async function ComparePage() {
  return <ComparePageClient />
}
