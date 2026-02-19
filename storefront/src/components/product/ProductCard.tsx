"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
    variants?: Array<{
      id: string
      calculated_price?: {
        calculated_amount?: number
        currency_code?: string
      }
    }>
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations("common")
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)

  const variant = product.variants?.[0]
  const price = variant?.calculated_price
  const priceAmount = price?.calculated_amount
  const currencyCode = price?.currency_code?.toUpperCase() ?? "CZK"

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
        </div>
        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-2 text-sm font-medium leading-tight">
            {product.title}
          </h3>
          <div className="flex items-end justify-between">
            <div>
              {priceAmount != null && (
                <p className="text-lg font-bold text-brand-primary">
                  {formatPrice(priceAmount, currencyCode)}
                </p>
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
