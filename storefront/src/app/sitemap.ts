import type { MetadataRoute } from "next"
import { headers } from "next/headers"
import { sdk } from "@/lib/sdk"
import { getDomainConfig, type Locale } from "@/i18n/config"
import { localizePath } from "@/lib/url-helpers"

// Generate at runtime (not build time) — backend unavailable during Docker build
export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers()
  const hostname =
    headersList.get("x-forwarded-host") || headersList.get("host") || ""
  const config = getDomainConfig(hostname)
  const locale = config.locale as Locale
  const baseUrl = config.siteUrl

  function url(internalPath: string): string {
    const localized = localizePath(internalPath, locale)
    return `${baseUrl}${localized}`
  }

  const entries: MetadataRoute.Sitemap = []

  // Static pages (internal Czech paths — localized automatically)
  const staticPages = [
    { path: "/", changeFrequency: "daily" as const, priority: 1.0 },
    { path: "/kategorie", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/kontakt", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/b2b/registrace", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/obchodni-podminky", changeFrequency: "monthly" as const, priority: 0.3 },
    { path: "/ochrana-udaju", changeFrequency: "monthly" as const, priority: 0.3 },
    { path: "/reklamace", changeFrequency: "monthly" as const, priority: 0.3 },
    { path: "/faq", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/reseni", changeFrequency: "weekly" as const, priority: 0.7 },
    { path: "/reseni/retail", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/reseni/restaurace", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/reseni/hotely", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/reseni/korporat", changeFrequency: "monthly" as const, priority: 0.6 },
  ]

  for (const page of staticPages) {
    entries.push({
      url: url(page.path),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })
  }

  // Dynamic: categories
  try {
    const { product_categories } = (await sdk.store.category.list({
      fields: "handle",
      limit: 100,
    })) as { product_categories: Array<{ handle: string }> }

    for (const cat of product_categories) {
      entries.push({
        url: url(`/kategorie/${cat.handle}`),
        changeFrequency: "weekly",
        priority: 0.7,
      })
    }
  } catch {
    // Silently skip if API unavailable
  }

  // Dynamic: products
  try {
    const { products } = (await sdk.store.product.list({
      fields: "handle",
      limit: 200,
    })) as { products: Array<{ handle: string }> }

    for (const product of products) {
      entries.push({
        url: url(`/produkt/${product.handle}`),
        changeFrequency: "weekly",
        priority: 0.8,
      })
    }
  } catch {
    // Silently skip if API unavailable
  }

  return entries
}
