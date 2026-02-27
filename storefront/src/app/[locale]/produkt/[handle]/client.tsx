"use client"

import { useState, useEffect, useRef } from "react"
import DOMPurify from "isomorphic-dompurify"
import Image from "next/image"
import { useTranslations, useLocale, useMessages } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProductCard } from "@/components/product/ProductCard"
import { useCart } from "@/lib/cart-context"
import { formatPrice, getLocalizedDescription } from "@/lib/medusa-helpers"
import { Minus, Plus, ShoppingCart, ChevronRight, Shield, Truck, FileDown } from "lucide-react"
import { trackEcommerce, mapProductToItem, trackPixel } from "@/lib/analytics"
import { addRecentlyViewed, getRecentlyViewed, type RecentlyViewedItem } from "@/lib/recently-viewed"

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


export function ProductDetailClient({ product, relatedProducts, breadcrumbs }: Props) {
  const t = useTranslations("product")
  const tc = useTranslations("common")
  const locale = useLocale()
  const messages = useMessages()
  const specLabels = (messages.specs ?? {}) as Record<string, string>
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([])

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
    trackPixel("ViewContent", {
      content_name: product.title as string,
      content_ids: [product.id as string],
      content_type: "product",
      value: priceAmount != null ? priceAmount / 100 : undefined,
      currency: currencyCode,
    })
  }, [product, priceAmount, currencyCode])

  // Track recently viewed + load list
  useEffect(() => {
    const handle = product.handle as string
    addRecentlyViewed({
      id: product.id as string,
      handle,
      title,
      thumbnail: thumbnail ?? null,
    })
    // Load recently viewed (excluding current product)
    const viewed = getRecentlyViewed().filter((i) => i.id !== product.id)
    setRecentlyViewed(viewed)
  }, [product, title, thumbnail])

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
      trackPixel("AddToCart", {
        content_name: product.title as string,
        content_ids: [product.id as string],
        content_type: "product",
        value: priceAmount != null ? (priceAmount * quantity) / 100 : undefined,
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
          <div
            className="relative aspect-square overflow-hidden rounded-lg border border-border bg-white cursor-zoom-in"
            onClick={() => allImages.length > 0 && setLightboxOpen(true)}
            role="button"
            tabIndex={0}
            aria-label={t("zoomImage")}
            onKeyDown={(e) => e.key === "Enter" && allImages.length > 0 && setLightboxOpen(true)}
          >
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
                {t("noImage")}
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
                  {t("seriesN", { n: series })}
                </Badge>
              )}
              {isClearance && (
                <Badge className="bg-orange-500 text-white text-xs">{t("clearance")}</Badge>
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
                    alt={`${title} — ${idx + 1}`}
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
                <span className="ml-2 text-sm font-normal text-muted-foreground">{t("inclVat")}</span>
              </p>
              {priceExVat != null && (
                <p className="text-sm text-muted-foreground">
                  {formatPrice(priceExVat, currencyCode)} {t("exclVat")}
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
                {t("warranty", { period: warranty })}
              </Badge>
            )}
            <Badge variant="outline" className="gap-1">
              <Truck className="h-3 w-3" />
              {t("shippingBadge")}
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
                aria-label={t("decreaseQuantity")}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="flex h-10 w-12 items-center justify-center text-sm font-medium" aria-live="polite">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="h-10 w-10 rounded-l-none"
                aria-label={t("increaseQuantity")}
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
              {adding ? t("adding") : tc("addToCart")}
            </Button>
          </div>

          <Separator className="my-6" />

          {/* Description */}
          {description && (
            <div>
              <h2 className="mb-3 text-lg font-semibold">{t("description")}</h2>
              <div
                className="prose prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }}
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
                      const label = specLabels[key] || key
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
                              <span className="text-green-600">{t("specYes")}</span>
                            ) : value === "✘" ? (
                              <span className="text-red-500">{t("specNo")}</span>
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
                  {t("downloadDatasheet")}
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
            {relatedProducts.map((p, idx) => (
              <ProductCard
                key={p.id as string}
                product={p as Parameters<typeof ProductCard>[0]["product"]}
                listName="related_products"
                index={idx}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recently viewed */}
      {recentlyViewed.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-bold">{t("recentlyViewed")}</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentlyViewed.slice(0, 6).map((item) => (
              <Link
                key={item.id}
                href={`/produkt/${item.handle}`}
                className="group flex w-28 shrink-0 flex-col items-center rounded-lg border p-2 transition-colors hover:border-brand-accent"
              >
                {item.thumbnail ? (
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    width={80}
                    height={80}
                    className="h-20 w-20 object-contain"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center text-xs text-muted-foreground">
                    {t("noImage")}
                  </div>
                )}
                <span className="mt-1 line-clamp-2 text-center text-xs font-medium group-hover:text-brand-accent">
                  {item.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox modal */}
      {lightboxOpen && allImages.length > 0 && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
            aria-label={tc("close")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length)
                }}
                className="absolute left-4 rounded-full bg-white/20 p-3 text-white hover:bg-white/30 transition-colors"
                aria-label={t("previousImage")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage((prev) => (prev + 1) % allImages.length)
                }}
                className="absolute right-4 rounded-full bg-white/20 p-3 text-white hover:bg-white/30 transition-colors"
                aria-label={t("nextImage")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div
            className="relative h-[80vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allImages[selectedImage]?.url ?? ""}
              alt={title}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  )
}
