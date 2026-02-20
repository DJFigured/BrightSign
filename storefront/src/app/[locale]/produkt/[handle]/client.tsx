"use client"

import { useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProductCard } from "@/components/product/ProductCard"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/medusa-helpers"
import { Minus, Plus, ShoppingCart } from "lucide-react"

interface ProductImage {
  id: string
  url: string
}

interface Props {
  product: Record<string, unknown>
  relatedProducts: Array<Record<string, unknown>>
}

export function ProductDetailClient({ product, relatedProducts }: Props) {
  const t = useTranslations("product")
  const tc = useTranslations("common")
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  const title = product.title as string
  const description = product.description as string | undefined
  const thumbnail = product.thumbnail as string | undefined
  const images = (product.images as ProductImage[] | undefined) ?? []
  const variants = product.variants as Array<{
    id: string
    title: string
    calculated_price?: {
      calculated_amount?: number
      currency_code?: string
    }
  }> | undefined
  const metadata = product.metadata as Record<string, string> | undefined

  const variant = variants?.[0]
  const price = variant?.calculated_price
  const priceAmount = price?.calculated_amount
  const currencyCode = price?.currency_code?.toUpperCase() ?? "CZK"

  const allImages = images.length > 0
    ? images
    : thumbnail
      ? [{ id: "thumb", url: thumbnail }]
      : []

  async function handleAddToCart() {
    if (!variant) return
    setAdding(true)
    try {
      await addItem(variant.id, quantity)
    } catch (err) {
      console.error("Failed to add to cart:", err)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Image gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-white">
            {allImages.length > 0 ? (
              <Image
                src={allImages[selectedImage]?.url ?? ""}
                alt={title}
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {allImages.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded border ${
                    idx === selectedImage ? "border-brand-accent" : "border-border"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    className="object-contain p-1"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>

          {metadata?.productNumber && (
            <p className="mt-1 text-sm text-muted-foreground">
              {t("sku")}: {metadata.productNumber}
            </p>
          )}

          {priceAmount != null && (
            <p className="mt-4 text-3xl font-bold text-brand-primary">
              {formatPrice(priceAmount, currencyCode)}
            </p>
          )}

          <Badge className="mt-2 bg-green-100 text-green-800">
            {tc("inStock")}
          </Badge>

          <Separator className="my-6" />

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-md border border-border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10 rounded-r-none"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="flex h-10 w-12 items-center justify-center text-sm font-medium">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="h-10 w-10 rounded-l-none"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={adding || !variant}
              className="flex-1 bg-brand-accent hover:bg-brand-accent-dark text-white"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {adding ? "Přidávám..." : tc("addToCart")}
            </Button>
          </div>

          <Separator className="my-6" />

          {/* Description */}
          {description && (
            <div>
              <h2 className="mb-3 text-lg font-semibold">{t("description")}</h2>
              <div
                className="prose prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>
          )}

          {/* Metadata / Specs */}
          {metadata && Object.keys(metadata).length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-semibold">{t("specifications")}</h2>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(metadata)
                  .filter(([key, value]) => !key.startsWith("_") && typeof value === "string")
                  .map(([key, value]) => (
                    <div key={key} className="contents">
                      <dt className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</dt>
                      <dd className="text-muted-foreground">{value}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-xl font-bold">{t("related")}</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id as string}
                product={p as Parameters<typeof ProductCard>[0]["product"]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
