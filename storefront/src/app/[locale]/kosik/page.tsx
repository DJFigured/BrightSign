import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { CartPageClient } from "./client"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("cart")
  return {
    title: `${t("title")} | BrightSign.cz`,
    robots: { index: false },
  }
}

export default function CartPage() {
  return <CartPageClient />
}
