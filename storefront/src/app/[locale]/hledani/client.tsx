"use client"

import { useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { ProductCard } from "@/components/product/ProductCard"
import { trackEvent, trackEcommerce, mapProductToItem, trackPixel } from "@/lib/analytics"
import { SearchX } from "lucide-react"

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
    trackEvent("search", { search_term: query, search_results_count: products.length })
    trackPixel("Search", { search_string: query })
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
        <div className="text-center py-16">
          <SearchX className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <p className="text-lg text-muted-foreground mb-6">{t("noResults", { query })}</p>
          <Link
            href="/kategorie/prehravace"
            className="inline-block bg-brand-accent text-white px-6 py-3 rounded-lg hover:bg-brand-accent-dark transition-colors font-medium"
          >
            {t("browseAll")}
          </Link>
        </div>
      )}

      {products.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, idx) => (
            <ProductCard key={product.id as string} product={product as Parameters<typeof ProductCard>[0]["product"]} listName="search_results" index={idx} />
          ))}
        </div>
      )}
    </div>
  )
}
