"use client"

import { useEffect, useState, useMemo } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { useCompare } from "@/lib/compare-context"
import { sdk } from "@/lib/sdk"
import { formatPrice } from "@/lib/medusa-helpers"
import { Button } from "@/components/ui/button"
import { X, GitCompareArrows } from "lucide-react"

interface FullProduct {
  id: string
  title: string
  handle: string
  thumbnail?: string | null
  metadata?: Record<string, unknown> | null
  variants?: Array<{
    calculated_price?: {
      calculated_amount?: number
      currency_code?: string
    }
  }>
}

// Spec keys to display in comparison (ordered)
const SPEC_KEYS = [
  "series",
  "lineCode",
  "I/O package",
  "Neural processing unit (NPU)",
  "4K video decoding",
  "4K60p video decoding",
  "4K video rotation",
  "10-bit HDR support",
  "HTML5 performance",
  "Wi-Fi",
  "Supports 4K IP streaming",
  "Operating temperature range",
  "Dimensions (W x D x H)",
  "Player weight",
  "Shipping weight / Player weight",
] as const

// Map raw spec keys to i18n compare keys
const SPEC_I18N_MAP: Record<string, string> = {
  series: "specSeries",
  lineCode: "specLine",
  "I/O package": "specIO",
  "Neural processing unit (NPU)": "specNPU",
  "4K video decoding": "spec4K",
  "4K60p video decoding": "spec4K60p",
  "4K video rotation": "spec4KRotation",
  "10-bit HDR support": "specHDR",
  "HTML5 performance": "specHTML5",
  "Wi-Fi": "specWiFi",
  "Supports 4K IP streaming": "spec4KStream",
  "Operating temperature range": "specTemperature",
  "Dimensions (W x D x H)": "specDimensions",
  "Player weight": "specWeight",
  "Shipping weight / Player weight": "specWeight",
}

export function ComparePageClient({ regionId }: { regionId: string }) {
  const t = useTranslations("compare")
  const { items, removeItem, clear } = useCompare()
  const [products, setProducts] = useState<FullProduct[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch full product data for items in compare list
  useEffect(() => {
    if (items.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    async function fetchProducts() {
      try {
        const results: FullProduct[] = []
        // Fetch products by handle (one call with filters)
        const { products: fetched } = (await sdk.store.product.list({
          handle: items.map((i) => i.handle),
          fields: "+variants.calculated_price,+metadata",
          region_id: regionId,
          limit: 4,
        })) as { products: FullProduct[] }

        // Sort results to match items order
        for (const item of items) {
          const found = fetched.find((p) => p.handle === item.handle)
          if (found) results.push(found)
        }

        if (!cancelled) {
          setProducts(results)
          setLoading(false)
        }
      } catch (err) {
        console.error("Failed to fetch comparison products:", err)
        if (!cancelled) setLoading(false)
      }
    }

    fetchProducts()
    return () => {
      cancelled = true
    }
  }, [items, regionId])

  // Collect all spec rows that exist in at least one product
  const specRows = useMemo(() => {
    const rows: Array<{ key: string; label: string; values: (string | null)[] }> = []

    for (const key of SPEC_KEYS) {
      const values = products.map((p) => {
        const meta = p.metadata as Record<string, unknown> | undefined
        if (key === "series" || key === "lineCode") {
          return (meta?.[key] as string) ?? null
        }
        const specs = meta?.specs as Record<string, string> | undefined
        return specs?.[key] ?? (meta?.[key] as string) ?? null
      })
      // Only show row if at least one product has a value
      if (values.some((v) => v !== null)) {
        const i18nKey = SPEC_I18N_MAP[key]
        rows.push({
          key,
          label: i18nKey ? t(i18nKey) : key,
          values,
        })
      }
    }

    return rows
  }, [products])

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <GitCompareArrows className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold text-brand-primary-dark">
          {t("title")}
        </h1>
        <p className="mb-6 text-muted-foreground">{t("empty")}</p>
        <Button asChild>
          <Link href="/kategorie">{t("browseProducts")}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-primary-dark">
          {t("title")}
        </h1>
        <button
          onClick={clear}
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          {t("clearAll")}
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">{t("loading")}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Product header row */}
            <thead>
              <tr>
                <th className="sticky left-0 z-10 min-w-[140px] border-b border-gray-200 bg-gray-50 p-3 text-left text-sm font-medium text-muted-foreground">
                  {t("parameter")}
                </th>
                {products.map((product) => (
                  <th
                    key={product.id}
                    className="min-w-[180px] border-b border-gray-200 bg-gray-50 p-3 text-center"
                  >
                    <div className="relative">
                      <button
                        onClick={() => removeItem(product.id)}
                        className="absolute -right-1 -top-1 rounded-full bg-gray-200 p-0.5 text-muted-foreground hover:bg-gray-300 hover:text-foreground"
                        aria-label={`${t("remove")} ${product.title}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <Link href={`/produkt/${product.handle}`} className="block">
                        {product.thumbnail ? (
                          <Image
                            src={product.thumbnail}
                            alt={product.title}
                            width={80}
                            height={80}
                            className="mx-auto mb-2 h-20 w-20 object-contain"
                          />
                        ) : (
                          <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center bg-gray-100 text-xs text-muted-foreground">
                            N/A
                          </div>
                        )}
                        <span className="text-sm font-medium text-brand-primary-dark hover:text-brand-accent">
                          {product.title}
                        </span>
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Price row */}
              <tr className="bg-brand-primary/5">
                <td className="sticky left-0 z-10 border-b border-gray-200 bg-brand-primary/5 p-3 text-sm font-medium">
                  {t("price")}
                </td>
                {products.map((product) => {
                  const price = product.variants?.[0]?.calculated_price
                  const amount = price?.calculated_amount
                  const currency = price?.currency_code?.toUpperCase() ?? "CZK"
                  return (
                    <td
                      key={product.id}
                      className="border-b border-gray-200 p-3 text-center"
                    >
                      {amount != null ? (
                        <span className="text-lg font-bold text-brand-primary">
                          {formatPrice(amount, currency)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </td>
                  )
                })}
              </tr>

              {/* Spec rows */}
              {specRows.map((row, idx) => (
                <tr key={row.key} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="sticky left-0 z-10 border-b border-gray-100 p-3 text-sm font-medium text-muted-foreground"
                    style={{ backgroundColor: idx % 2 === 0 ? "white" : "rgb(249 250 251 / 0.5)" }}
                  >
                    {row.label}
                  </td>
                  {row.values.map((val, i) => {
                    // Highlight differences
                    const allSame = row.values.every((v) => v === row.values[0])
                    return (
                      <td
                        key={products[i]?.id ?? i}
                        className={`border-b border-gray-100 p-3 text-center text-sm ${
                          !allSame && val ? "font-medium text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {val ?? "–"}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
