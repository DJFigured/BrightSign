"use client"

import { useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { ProductCard } from "@/components/product/ProductCard"
import { trackEvent, trackEcommerce, mapProductToItem } from "@/lib/analytics"

interface SearchResultsClientProps {
  products: Array<Record<string, unknown>>
  query: string
}

export function SearchResultsClient({ products, query }: SearchResultsClientProps) {
  const t = useTranslations("search")

  // Track search + view_item_list
  const trackedRef = useRef("")
  useEffect(() => {
    if (!query || trackedRef.current === query) return
    trackedRef.current = query
    trackEvent("search", { search_term: query })
    if (products.length > 0) {
      const items = products.map((p, i) => mapProductToItem(p, { index: i, listName: "search_results" }))
      trackEcommerce("view_item_list", items, { listName: "search_results" })
    }
  }, [query, products])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-primary-dark">
        {query ? t("resultsFor", { query }) : t("title")}
      </h1>

      {query && products.length === 0 && (
        <p className="text-muted-foreground">{t("noResults", { query })}</p>
      )}

      {products.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id as string} product={product as Parameters<typeof ProductCard>[0]["product"]} />
          ))}
        </div>
      )}
    </div>
  )
}
