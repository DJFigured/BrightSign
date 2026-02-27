"use client"

import { useTranslations } from "next-intl"
import { Link, useRouter, usePathname } from "@/i18n/navigation"
import { ProductCard } from "@/components/product/ProductCard"
import { ProductFilters, type FilterState } from "@/components/product/ProductFilters"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMemo, useCallback, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { trackEcommerce, mapProductToItem } from "@/lib/analytics"

interface Category {
  id: string
  name: string
  handle: string
  parent_category_id: string | null
  category_children?: Array<{ id: string; name: string; handle: string }>
}

type Product = Record<string, unknown> & {
  id: string
  title: string
  handle: string
  metadata?: Record<string, string> | null
  variants?: Array<{
    calculated_price?: {
      calculated_amount?: number
    }
  }>
}

interface Props {
  products: Array<Record<string, unknown>>
  categories: Category[]
  currentCategory: Category | null
  totalProducts: number
  handle: string
  initialFilters: {
    sort?: string
    series?: string
    line?: string
  }
}

const PRODUCTS_PER_PAGE = 12

function getPrice(p: Product): number {
  return p.variants?.[0]?.calculated_price?.calculated_amount ?? 0
}

export function CategoryPageClient({
  products: rawProducts,
  categories,
  currentCategory,
  handle,
  initialFilters,
}: Props) {
  const t = useTranslations("product")
  const tf = useTranslations("filters")
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const products = rawProducts as Product[]

  // Read filters from URL
  const filters: FilterState = useMemo(() => ({
    sort: searchParams.get("sort") ?? initialFilters.sort ?? "default",
    series: (searchParams.get("series") ?? initialFilters.series ?? "").split(",").filter(Boolean),
    lines: (searchParams.get("line") ?? initialFilters.line ?? "").split(",").filter(Boolean),
  }), [searchParams, initialFilters])

  const currentPage = parseInt(searchParams.get("page") ?? "1", 10)

  // Compute available filter options from actual products
  const { availableSeries, availableLines } = useMemo(() => {
    const seriesSet = new Set<string>()
    const lineSet = new Set<string>()
    for (const p of products) {
      const meta = p.metadata
      if (meta?.series) seriesSet.add(meta.series)
      const lineCode = meta?.lineCode || meta?.familyName?.replace(/[0-9]/g, "")
      if (lineCode) lineSet.add(lineCode)
    }
    return {
      availableSeries: Array.from(seriesSet),
      availableLines: Array.from(lineSet),
    }
  }, [products])

  // Apply filters
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Filter by series
    if (filters.series.length > 0) {
      result = result.filter((p) => {
        const s = p.metadata?.series
        return s && filters.series.includes(s)
      })
    }

    // Filter by line
    if (filters.lines.length > 0) {
      result = result.filter((p) => {
        const meta = p.metadata
        const lineCode = meta?.lineCode || meta?.familyName?.replace(/[0-9]/g, "")
        return lineCode && filters.lines.includes(lineCode)
      })
    }

    // Sort
    switch (filters.sort) {
      case "price-asc":
        result.sort((a, b) => getPrice(a) - getPrice(b))
        break
      case "price-desc":
        result.sort((a, b) => getPrice(b) - getPrice(a))
        break
      case "name-asc":
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    return result
  }, [products, filters])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  )

  // Track view_item_list
  const trackedListRef = useRef("")
  useEffect(() => {
    const key = `${handle}-${currentPage}`
    if (trackedListRef.current === key || paginatedProducts.length === 0) return
    trackedListRef.current = key
    const items = paginatedProducts.map((p, i) =>
      mapProductToItem(p as Record<string, unknown>, { index: i, listName: currentCategory?.name ?? handle })
    )
    trackEcommerce("view_item_list", items, { listName: currentCategory?.name ?? handle })
  }, [paginatedProducts, handle, currentPage, currentCategory?.name])

  // Update URL when filters change
  const handleFilterChange = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams()
      if (newFilters.sort !== "default") params.set("sort", newFilters.sort)
      if (newFilters.series.length > 0) params.set("series", newFilters.series.join(","))
      if (newFilters.lines.length > 0) params.set("line", newFilters.lines.join(","))
      // Reset to page 1 when filters change
      const qs = params.toString()
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false })
    },
    [router, pathname]
  )

  // Build category tree (top-level categories)
  const topCategories = categories.filter((c) => !c.parent_category_id)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 md:block">
          <h2 className="mb-4 text-lg font-semibold">{t("category")}</h2>
          <nav className="flex flex-col gap-1">
            {topCategories.map((cat) => (
              <div key={cat.id}>
                <Link
                  href={`/kategorie/${cat.handle}`}
                  className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    cat.handle === handle
                      ? "bg-brand-primary text-white"
                      : "hover:bg-muted"
                  }`}
                >
                  {cat.name}
                </Link>
                {cat.category_children && (cat.handle === handle || cat.category_children.some(ch => ch.handle === handle)) && (
                  <div className="ml-3 mt-1 flex flex-col gap-1">
                    {cat.category_children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/kategorie/${child.handle}`}
                        className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                          child.handle === handle
                            ? "bg-brand-accent/10 font-medium text-brand-accent"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">
              {currentCategory?.name ?? "Produkty"}
            </h1>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <ProductFilters
              filters={filters}
              onChange={handleFilterChange}
              availableSeries={availableSeries}
              availableLines={availableLines}
              resultCount={filteredProducts.length}
            />
          </div>

          {paginatedProducts.length === 0 ? (
            <div className="rounded-lg border border-border bg-white p-12 text-center">
              <p className="text-muted-foreground">{tf("noResults")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedProducts.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product as Parameters<typeof ProductCard>[0]["product"]}
                  listName="category"
                  index={idx}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label={tf("pagination")} className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                asChild={currentPage > 1}
              >
                {currentPage > 1 ? (
                  <Link href={`/kategorie/${handle}?page=${currentPage - 1}`}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    {tf("prev")}
                  </Link>
                ) : (
                  <span>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    {tf("prev")}
                  </span>
                )}
              </Button>

              <span className="px-3 text-sm text-muted-foreground" aria-current="page">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                asChild={currentPage < totalPages}
              >
                {currentPage < totalPages ? (
                  <Link href={`/kategorie/${handle}?page=${currentPage + 1}`}>
                    {tf("next")}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                ) : (
                  <span>
                    {tf("next")}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </span>
                )}
              </Button>
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}
