import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { OrderDetailPageClient } from "./client"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout")
  return {
    title: `${t("orderDetail")} | BrightSign.cz`,
    robots: { index: false, follow: false },
  }
}

export default function OrderDetailPage() {
  return <OrderDetailPageClient />
}
