import type { MetadataRoute } from "next"
import { sdk } from "@/lib/sdk"
import { locales } from "@/i18n/config"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://brightsign.cz"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // Static pages per locale
  const staticPages = [
    { path: "", changeFrequency: "daily" as const, priority: 1.0 },
    { path: "/kategorie", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/kontakt", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/b2b/registrace", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/obchodni-podminky", changeFrequency: "monthly" as const, priority: 0.3 },
    { path: "/ochrana-udaju", changeFrequency: "monthly" as const, priority: 0.3 },
    { path: "/reklamace", changeFrequency: "monthly" as const, priority: 0.3 },
  ]

  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${SITE_URL}/${locale}${page.path}`,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      })
    }
  }

  // Dynamic: categories
  try {
    const { product_categories } = (await sdk.store.category.list({
      fields: "handle",
      limit: 100,
    })) as { product_categories: Array<{ handle: string }> }

    for (const cat of product_categories) {
      for (const locale of locales) {
        entries.push({
          url: `${SITE_URL}/${locale}/kategorie/${cat.handle}`,
          changeFrequency: "weekly",
          priority: 0.7,
        })
      }
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
      for (const locale of locales) {
        entries.push({
          url: `${SITE_URL}/${locale}/produkt/${product.handle}`,
          changeFrequency: "weekly",
          priority: 0.8,
        })
      }
    }
  } catch {
    // Silently skip if API unavailable
  }

  return entries
}
