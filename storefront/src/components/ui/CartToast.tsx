"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/medusa-helpers"
import { Check, X } from "lucide-react"

export function CartToast() {
  const t = useTranslations("cart")
  const { cart } = useCart()
  const [visible, setVisible] = useState(false)
  const [lastItem, setLastItem] = useState<{
    title: string
    thumbnail?: string | null
    price?: number
    currency?: string
  } | null>(null)
  const [prevItemCount, setPrevItemCount] = useState<number | null>(null)

  const items = cart?.items ?? []
  const currency = cart?.currency_code?.toUpperCase() ?? "CZK"
  const itemCount = items.length

  // Detect when a new item is added (item count increases)
  const dismiss = useCallback(() => setVisible(false), [])

  useEffect(() => {
    if (prevItemCount === null) {
      // Initial load — just set the baseline
      setPrevItemCount(itemCount)
      return
    }

    if (itemCount > prevItemCount) {
      // A new item was added — show the latest
      const newest = items[items.length - 1]
      if (newest) {
        setLastItem({
          title: newest.title,
          thumbnail: newest.thumbnail,
          price: newest.unit_price,
          currency,
        })
        setVisible(true)
      }
    }

    setPrevItemCount(itemCount)
  }, [itemCount, items, currency, prevItemCount])

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(dismiss, 4000)
    return () => clearTimeout(timer)
  }, [visible, dismiss])

  if (!visible || !lastItem) return null

  return (
    <div
      className="fixed bottom-20 right-4 z-[60] w-80 animate-in slide-in-from-right-5 fade-in duration-300 rounded-lg border border-border bg-white p-4 shadow-xl"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
          <Check className="h-4 w-4 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{t("addedToCart")}</p>
          <div className="mt-1 flex items-center gap-2">
            {lastItem.thumbnail && (
              <Image
                src={lastItem.thumbnail}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 shrink-0 rounded object-contain"
              />
            )}
            <span className="truncate text-xs text-muted-foreground">{lastItem.title}</span>
          </div>
          {lastItem.price != null && lastItem.currency && (
            <p className="mt-1 text-xs font-semibold text-brand-primary">
              {formatPrice(lastItem.price, lastItem.currency)}
            </p>
          )}
          <div className="mt-2 flex gap-2">
            <Link
              href="/kosik"
              className="text-xs font-medium text-brand-accent hover:underline"
              onClick={dismiss}
            >
              {t("viewCart")}
            </Link>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="shrink-0 text-muted-foreground hover:text-foreground"
          aria-label={t("dismiss")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
