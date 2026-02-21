"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import { formatPrice } from "@/lib/medusa-helpers"
import { useCart } from "@/lib/cart-context"
import { useTranslations } from "next-intl"
import { useState } from "react"

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
}

// Map familyCode prefix to segment label
const SEGMENT_LABELS: Record<string, string> = {
  LS: "Basic",
  AU: "Audio",
  HD: "Entry 4K",
  XD: "Performance 4K",
  XT: "Enterprise",
  XC: "Video Wall",
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations("common")
  const [adding, setAdding] = useState(false)
  const { addItem } = useCart()

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
  const segment = lineCode ? SEGMENT_LABELS[lineCode] : undefined

  // Price without VAT (Czech DPH 21%)
  const priceExVat = priceAmount != null ? Math.round(priceAmount / 1.21) : null

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (!variant) return
    setAdding(true)
    try {
      await addItem(variant.id)
    } catch (err) {
      console.error("Failed to add to cart:", err)
    } finally {
      setAdding(false)
    }
  }

  return (
    <Link href={`/produkt/${product.handle}`}>
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
              No image
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
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
                Série {series}
              </Badge>
            )}
            {isClearance && (
              <Badge variant="secondary" className="bg-orange-500 text-white text-[10px]">
                Doprodej
              </Badge>
            )}
            {segment && (
              <Badge variant="outline" className="text-[10px] bg-white/80">
                {segment}
              </Badge>
            )}
          </div>

          {/* Warranty badge */}
          {warranty && (
            <Badge
              variant="secondary"
              className="absolute right-2 top-2 bg-green-100 text-green-700 text-[10px]"
            >
              {warranty}
            </Badge>
          )}
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
                      s DPH
                    </span>
                  </p>
                  {priceExVat != null && (
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(priceExVat, currencyCode)} bez DPH
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
