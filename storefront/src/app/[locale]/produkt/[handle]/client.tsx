"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useTranslations, useLocale } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProductCard } from "@/components/product/ProductCard"
import { useCart } from "@/lib/cart-context"
import { formatPrice, getLocalizedDescription } from "@/lib/medusa-helpers"
import { Minus, Plus, ShoppingCart, ChevronRight, Shield, Truck, FileDown } from "lucide-react"
import { trackEcommerce, mapProductToItem } from "@/lib/analytics"

interface ProductImage {
  id: string
  url: string
}

interface BreadcrumbItem {
  name: string
  href: string
}

interface Props {
  product: Record<string, unknown>
  relatedProducts: Array<Record<string, unknown>>
  breadcrumbs?: BreadcrumbItem[]
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

// Map raw spec keys to Czech labels
const SPEC_LABELS: Record<string, string> = {
  "I/O package": "I/O balíček",
  "Neural processing unit (NPU)": "Neurální procesor (NPU)",
  "4K video decoding": "4K video dekódování",
  "4K60p video decoding": "4K60p video dekódování",
  "Full HD at 60p video decoding": "Full HD dekódování",
  "4K video rotation": "4K rotace videa",
  "4K full resolution images & graphics": "4K grafika",
  "HD images & graphics": "HD grafika",
  "HTML5 performance": "HTML5 výkon",
  "HTML resolution": "HTML rozlišení",
  "10-bit HDR support": "10-bit HDR podpora",
  "Supports 4K IP streaming": "4K IP streaming",
  "Operating temperature range": "Provozní teplota",
  "Dimensions (W x D x H)": "Rozměry (Š x H x V)",
  "Shipping weight / Player weight": "Hmotnost",
  "Player weight": "Hmotnost",
  "Locking power supply": "Napájení",
  "Wi-Fi": "Wi-Fi",
}

export function ProductDetailClient({ product, relatedProducts, breadcrumbs }: Props) {
  const t = useTranslations("product")
  const tc = useTranslations("common")
  const locale = useLocale()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  const title = product.title as string
  const description = getLocalizedDescription(
    { description: product.description as string | undefined, metadata: product.metadata as Record<string, unknown> | undefined },
    locale,
  )
  const thumbnail = product.thumbnail as string | undefined
  const images = (product.images as ProductImage[] | undefined) ?? []
  const variants = product.variants as Array<{
    id: string
    title: string
    calculated_price?: {
      calculated_amount?: number
      original_amount?: number
      currency_code?: string
    }
  }> | undefined
  const metadata = product.metadata as Record<string, unknown> | undefined

  const variant = variants?.[0]
  const price = variant?.calculated_price
  const priceAmount = price?.calculated_amount
  const currencyCode = price?.currency_code?.toUpperCase() ?? "CZK"
  const priceExVat = priceAmount != null ? Math.round(priceAmount / 1.21) : null

  // Metadata values
  const series = metadata?.series as string | undefined
  const lineCode = (metadata?.lineCode as string) || (metadata?.familyName as string)?.replace(/[0-9]/g, "")
  const isClearance = metadata?.clearance === "true"
  const warranty = (metadata?.warranty as string) || undefined
  const segment = lineCode ? SEGMENT_LABELS[lineCode] : undefined
  const productNumber = metadata?.productNumber as string | undefined
  const specs = metadata?.specs as Record<string, string> | undefined
  const datasheetUrl = metadata?.datasheetUrl as string | undefined

  const allImages = images.length > 0
    ? images
    : thumbnail
      ? [{ id: "thumb", url: thumbnail }]
      : []

  // Track view_item
  const trackedRef = useRef(false)
  useEffect(() => {
    if (trackedRef.current) return
    trackedRef.current = true
    const item = mapProductToItem(product)
    trackEcommerce("view_item", [item], {
      value: priceAmount ?? undefined,
      currency: currencyCode,
    })
  }, [product, priceAmount, currencyCode])

  async function handleAddToCart() {
    if (!variant) return
    setAdding(true)
    try {
      await addItem(variant.id, quantity)
      // Track add_to_cart
      const item = mapProductToItem(product, { quantity })
      trackEcommerce("add_to_cart", [item], {
        value: priceAmount != null ? priceAmount * quantity : undefined,
        currency: currencyCode,
      })
    } catch (err) {
      console.error("Failed to add to cart:", err)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, idx) => (
            <span key={crumb.href} className="flex items-center gap-1">
              {idx > 0 && <ChevronRight className="h-3 w-3" />}
              {idx === breadcrumbs.length - 1 ? (
                <span className="font-medium text-foreground">{crumb.name}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-brand-accent transition-colors">
                  {crumb.name}
                </Link>
              )}
            </span>
          ))}
        </nav>
      )}

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

            {/* Badges on image */}
            <div className="absolute left-3 top-3 flex flex-col gap-1">
              {series && (
                <Badge
                  className={`text-xs ${
                    series === "6"
                      ? "bg-brand-accent text-white"
                      : series === "4"
                        ? "bg-orange-500 text-white"
                        : "bg-brand-primary text-white"
                  }`}
                >
                  Série {series}
                </Badge>
              )}
              {isClearance && (
                <Badge className="bg-orange-500 text-white text-xs">Doprodej</Badge>
              )}
              {segment && (
                <Badge variant="outline" className="bg-white/90 text-xs">
                  {segment}
                </Badge>
              )}
            </div>
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

          {productNumber && (
            <p className="mt-1 text-sm text-muted-foreground">
              {t("sku")}: {productNumber}
            </p>
          )}

          {/* Price block */}
          {priceAmount != null && (
            <div className="mt-4">
              <p className="text-3xl font-bold text-brand-primary">
                {formatPrice(priceAmount, currencyCode)}
                <span className="ml-2 text-sm font-normal text-muted-foreground">s DPH</span>
              </p>
              {priceExVat != null && (
                <p className="text-sm text-muted-foreground">
                  {formatPrice(priceExVat, currencyCode)} bez DPH
                </p>
              )}
            </div>
          )}

          {/* Status badges */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge className="bg-green-100 text-green-800">
              {tc("inStock")}
            </Badge>
            {warranty && (
              <Badge variant="outline" className="gap-1">
                <Shield className="h-3 w-3" />
                Záruka {warranty}
              </Badge>
            )}
            <Badge variant="outline" className="gap-1">
              <Truck className="h-3 w-3" />
              Expedice do 48h
            </Badge>
          </div>

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

          {/* Structured specs table */}
          {specs && Object.keys(specs).length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-semibold">{t("specifications")}</h2>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(specs).map(([key, value], idx) => {
                      const label = SPEC_LABELS[key] || key
                      return (
                        <tr
                          key={key}
                          className={idx % 2 === 0 ? "bg-muted/30" : "bg-white"}
                        >
                          <td className="px-3 py-2 font-medium text-foreground w-1/2">
                            {label}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {value === "✔" ? (
                              <span className="text-green-600">Ano</span>
                            ) : value === "✘" ? (
                              <span className="text-red-500">Ne</span>
                            ) : (
                              value
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Datasheet download */}
          {datasheetUrl && (
            <div className="mt-6">
              <a
                href={datasheetUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="gap-2">
                  <FileDown className="h-4 w-4" />
                  Stáhnout datasheet (PDF)
                </Button>
              </a>
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
