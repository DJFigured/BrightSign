import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { CheckoutPageClient } from "./client"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common")
  return {
    title: `${t("checkout")} | BrightSign.cz`,
    robots: { index: false },
  }
}

export default function CheckoutPage() {
  return <CheckoutPageClient />
}
