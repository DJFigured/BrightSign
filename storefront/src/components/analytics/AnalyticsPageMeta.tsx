"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

function getPageType(pathname: string): string {
  // Strip locale prefix (e.g. /cs/produkt/... → /produkt/...)
  const path = pathname.replace(/^\/(cs|sk|pl|en|de)/, "") || "/"

  if (path === "/") return "home"
  if (path.startsWith("/produkt/")) return "product"
  if (path.startsWith("/kategorie/")) return "category"
  if (path.startsWith("/pokladna")) return "checkout"
  if (path.startsWith("/kosik")) return "cart"
  if (path.startsWith("/ucet")) return "account"
  if (path.startsWith("/hledani")) return "search"
  if (path.startsWith("/b2b")) return "b2b"
  if (path.startsWith("/kontakt")) return "contact"
  if (path.startsWith("/faq")) return "faq"
  if (path.startsWith("/prihlaseni") || path.startsWith("/registrace")) return "auth"
  return "other"
}

export function AnalyticsPageMeta({ locale }: { locale: string }) {
  const pathname = usePathname()

  useEffect(() => {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: "page_meta",
      locale,
      page_type: getPageType(pathname),
    })
  }, [pathname, locale])

  return null
}
