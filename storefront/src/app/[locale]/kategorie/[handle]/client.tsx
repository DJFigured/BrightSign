"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { ProductCard } from "@/components/product/ProductCard"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Category {
  id: string
  name: string
  handle: string
  parent_category_id: string | null
  category_children?: Array<{ id: string; name: string; handle: string }>
}

interface Props {
  products: Array<Record<string, unknown>>
  categories: Category[]
  currentCategory: Category | null
  currentPage: number
  totalPages: number
  totalProducts: number
  handle: string
}

export function CategoryPageClient({
  products,
  categories,
  currentCategory,
  currentPage,
  totalPages,
  totalProducts,
  handle,
}: Props) {
  const t = useTranslations("product")

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
                {/* Show children if this is the active parent */}
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              {currentCategory?.name ?? "Produkty"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {totalProducts} {totalProducts === 1 ? "produkt" : totalProducts < 5 ? "produkty" : "produktů"}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="rounded-lg border border-border bg-white p-12 text-center">
              <p className="text-muted-foreground">V této kategorii nejsou žádné produkty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product: Record<string, unknown>) => (
                <ProductCard
                  key={product.id as string}
                  product={product as Parameters<typeof ProductCard>[0]["product"]}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                asChild={currentPage > 1}
              >
                {currentPage > 1 ? (
                  <Link href={`/kategorie/${handle}?page=${currentPage - 1}`}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Předchozí
                  </Link>
                ) : (
                  <span>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Předchozí
                  </span>
                )}
              </Button>

              <span className="px-3 text-sm text-muted-foreground">
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
                    Další
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                ) : (
                  <span>
                    Další
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
