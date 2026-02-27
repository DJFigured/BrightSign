"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import { formatPrice } from "@/lib/medusa-helpers"
import { useCart } from "@/lib/cart-context"
import { useCompare } from "@/lib/compare-context"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { trackEcommerce, mapProductToItem, trackPixel } from "@/lib/analytics"
import { GitCompareArrows } from "lucide-react"

interface ProductCardProps {
  product: {
    id: string
    title: string
    handle: string
    thumbnail?: string | null
    metadata?: Record<string, unknown> | null
    variants?: Array<{
      id: string
      calculated_price?: {
        calculated_amount?: number
        original_amount?: number
        currency_code?: string
      }
    }>
  }
  listName?: string
  index?: number
}

// Map familyCode prefix to segment label translation key
const SEGMENT_KEYS: Record<string, string> = {
  LS: "segmentBasic",
  AU: "segmentAudio",
  HD: "segmentEntry4K",
  XD: "segmentPerformance4K",
  XT: "segmentEnterprise",
  XC: "segmentVideoWall",
}

export function ProductCard({ product, listName, index }: ProductCardProps) {
  const t = useTranslations("common")
  const tp = useTranslations("product")
  const tc = useTranslations("compare")
  const [adding, setAdding] = useState(false)
  const { addItem } = useCart()
  const { toggleItem, isInCompare } = useCompare()
  const inCompare = isInCompare(product.id)

  const variant = product.variants?.[0]
  const price = variant?.calculated_price
  const priceAmount = price?.calculated_amount
  const currencyCode = price?.currency_code?.toUpperCase() ?? "CZK"

  // Metadata values
  const meta = product.metadata as Record<string, string> | undefined
  const series = meta?.series
  const lineCode = meta?.lineCode || meta?.familyName?.replace(/[0-9]/g, "")
  const isClearance = meta?.clearance === "true"
  const warranty = meta?.warranty
  const segmentKey = lineCode ? SEGMENT_KEYS[lineCode] : undefined

  // Price without VAT (Czech DPH 21%)
  const priceExVat = priceAmount != null ? Math.round(priceAmount / 1.21) : null

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (!variant) return
    setAdding(true)
    try {
      await addItem(variant.id)
      // Track add_to_cart
      const item = mapProductToItem(product as Record<string, unknown>)
      trackEcommerce("add_to_cart", [item], {
        value: priceAmount ?? undefined,
        currency: currencyCode,
      })
      trackPixel("AddToCart", {
        content_name: product.title,
        content_ids: [product.id],
        content_type: "product",
        value: priceAmount != null ? priceAmount / 100 : undefined,
        currency: currencyCode,
      })
    } catch (err) {
      console.error("Failed to add to cart:", err)
    } finally {
      setAdding(false)
    }
  }

  function handleSelectItem() {
    const item = mapProductToItem(product as Record<string, unknown>, { index, listName })
    trackEcommerce("select_item", [item], {
      listName,
    })
  }

  return (
    <Link href={`/produkt/${product.handle}`} onClick={handleSelectItem}>
      <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-white">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-contain p-4 transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              {tp("noImage")}
            </div>
          )}

          {/* Badges (decorative — product info is in the title) */}
          <div className="absolute left-2 top-2 flex flex-col gap-1" aria-hidden="true">
            {series && (
              <Badge
                variant="secondary"
                className={`text-[10px] ${
                  series === "6"
                    ? "bg-brand-accent text-white"
                    : series === "4"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-brand-primary/10 text-brand-primary"
                }`}
              >
                {tp("seriesN", { n: series })}
              </Badge>
            )}
            {isClearance && (
              <Badge variant="secondary" className="bg-orange-500 text-white text-[10px]">
                {tp("clearance")}
              </Badge>
            )}
            {segmentKey && (
              <Badge variant="outline" className="text-[10px] bg-white/80">
                {tp(segmentKey)}
              </Badge>
            )}
          </div>

          {/* Warranty badge */}
          {warranty && (
            <Badge
              variant="secondary"
              className="absolute right-2 top-2 bg-green-100 text-green-700 text-[10px]"
              aria-hidden="true"
            >
              {warranty}
            </Badge>
          )}

          {/* Compare toggle */}
          <button
            onClick={(e) => {
              e.preventDefault()
              toggleItem({
                id: product.id,
                handle: product.handle,
                title: product.title,
                thumbnail: product.thumbnail,
              })
            }}
            className={`absolute bottom-2 right-2 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium transition-colors ${
              inCompare
                ? "bg-brand-accent text-white"
                : "bg-white/80 text-muted-foreground hover:bg-white hover:text-foreground"
            }`}
            aria-label={`${tc("toggleCompare")}: ${product.title}`}
            aria-pressed={inCompare}
          >
            <GitCompareArrows className="h-3 w-3" />
            {inCompare ? tc("inCompare") : tc("addToCompare")}
          </button>
        </div>
        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-2 text-sm font-medium leading-tight">
            {product.title}
          </h3>
          <div className="flex items-end justify-between">
            <div>
              {priceAmount != null && (
                <>
                  <p className="text-lg font-bold text-brand-primary">
                    {formatPrice(priceAmount, currencyCode)}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      {tp("inclVat")}
                    </span>
                  </p>
                  {priceExVat != null && (
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(priceExVat, currencyCode)} {tp("exclVat")}
                    </p>
                  )}
                </>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddToCart}
              disabled={adding || !variant}
              className="shrink-0"
            >
              <ShoppingCart className="mr-1 h-4 w-4" />
              {adding ? "..." : t("addToCart")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
