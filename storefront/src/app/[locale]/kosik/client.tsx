"use client"

import { useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/medusa-helpers"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { trackEcommerce, mapCartItemToGA4 } from "@/lib/analytics"

export function CartPageClient() {
  const t = useTranslations("common")
  const tc = useTranslations("cart")
  const { cart, loading, updateItem, removeItem } = useCart()

  const items = cart?.items ?? []
  const currencyCode = cart?.currency_code
  const currency = currencyCode?.toUpperCase() ?? "CZK"

  // Track view_cart
  const trackedCartRef = useRef(false)
  useEffect(() => {
    if (trackedCartRef.current || items.length === 0) return
    trackedCartRef.current = true
    const ga4Items = items.map((item) => mapCartItemToGA4(item as unknown as Record<string, unknown>))
    const total = (cart?.total as number | undefined) ?? (cart?.subtotal as number | undefined)
    trackEcommerce("view_cart", ga4Items, { value: total ?? undefined, currency })
  }, [items, cart, currency])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-muted-foreground">{tc("loading")}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">{tc("title")}</h1>
        <p className="mb-6 text-muted-foreground">{tc("empty")}</p>
        <Button asChild className="bg-brand-accent hover:bg-brand-accent-dark text-white">
          <Link href="/kategorie/prehravace">{tc("continueShopping")}</Link>
        </Button>
      </div>
    )
  }

  const subtotal = cart?.subtotal as number | undefined
  const shippingTotal = cart?.shipping_total as number | undefined
  const taxTotal = cart?.tax_total as number | undefined
  const total = cart?.total as number | undefined

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{tc("title")}</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-border bg-white">
            {items.map((item, index) => (
              <div key={item.id}>
                {index > 0 && <Separator />}
                <div className="flex gap-4 p-4">
                  {/* Thumbnail */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded border border-border bg-white">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-contain p-1"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        —
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{item.title}</h3>
                    {item.variant_title && item.variant_title !== "Default" && (
                      <p className="text-xs text-muted-foreground">{item.variant_title}</p>
                    )}
                    <p className="mt-1 font-semibold text-brand-primary">
                      {formatPrice(item.unit_price, currency)}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-md border border-border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-r-none"
                        onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                        aria-label={tc("decreaseQuantity")}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="flex h-8 w-8 items-center justify-center text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-l-none"
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        aria-label={tc("increaseQuantity")}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => {
                        const ga4Item = mapCartItemToGA4(item as unknown as Record<string, unknown>)
                        trackEcommerce("remove_from_cart", [ga4Item], {
                          value: item.unit_price * item.quantity,
                          currency,
                        })
                        removeItem(item.id)
                      }}
                      aria-label={tc("remove")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div>
          <div className="rounded-lg border border-border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">{tc("summary")}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tc("subtotal")}</span>
                <span>{formatPrice(subtotal ?? 0, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tc("shipping")}</span>
                <span>{shippingTotal ? formatPrice(shippingTotal, currency) : tc("shippingCalculated")}</span>
              </div>
              {taxTotal != null && taxTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tc("vat")}</span>
                  <span>{formatPrice(taxTotal, currency)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>{tc("total")}</span>
                <span className="text-brand-primary">{formatPrice(total ?? subtotal ?? 0, currency)}</span>
              </div>
            </div>
            <Button
              asChild
              className="mt-6 w-full bg-brand-accent hover:bg-brand-accent-dark text-white"
              size="lg"
            >
              <Link href="/pokladna">
                {t("checkout")}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="mt-2 w-full"
              size="sm"
            >
              <Link href="/kategorie/prehravace">
                {tc("continueShopping")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
