/**
 * Analytics utilities — dataLayer push for GTM / GA4 / Meta Pixel
 *
 * All tracking goes through window.dataLayer.push().
 * GTM then routes events to GA4, Meta, Google Ads, Sklik, etc.
 * If GTM is not configured, events are silently dropped (graceful degradation).
 *
 * Every event automatically includes `locale` (extracted from URL path).
 * Meta Pixel events are fired alongside GA4 events where applicable.
 */

// ──── Types ────

interface GA4Item {
  item_id: string
  item_name: string
  item_category?: string
  item_variant?: string
  price?: number
  quantity?: number
  item_list_name?: string
  index?: number
}

interface EcommerceEvent {
  event: string
  locale: string
  ecommerce: {
    transaction_id?: string
    value?: number
    currency?: string
    items: GA4Item[]
    shipping_tier?: string
    payment_type?: string
    item_list_name?: string
    search_term?: string
  }
}

interface CustomEvent {
  event: string
  locale: string
  [key: string]: unknown
}

// Extend window with dataLayer + fbq
declare global {
  interface Window {
    dataLayer?: Array<EcommerceEvent | CustomEvent | Record<string, unknown>>
    fbq?: (...args: unknown[]) => void
  }
}

// ──── Helpers ────

/** Extract locale from URL path (first segment, e.g. /sk/produkt → "sk") */
function getLocale(): string {
  if (typeof window === "undefined") return "unknown"
  const segment = window.location.pathname.split("/")[1]
  return segment && /^(cs|sk|pl|en|de)$/.test(segment) ? segment : "cs"
}

function push(data: EcommerceEvent | CustomEvent | Record<string, unknown>) {
  if (typeof window === "undefined") return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(data)
}

/**
 * Fire a Meta Pixel standard event.
 * Only fires if fbq is loaded (graceful degradation).
 */
export function trackPixel(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", event, params)
  }
}

/**
 * Map a Medusa product (or cart item) to a GA4 items[] object.
 */
export function mapProductToItem(
  product: Record<string, unknown>,
  opts?: { index?: number; listName?: string; quantity?: number }
): GA4Item {
  const variants = product.variants as Array<{
    calculated_price?: { calculated_amount?: number; currency_code?: string }
  }> | undefined
  const price = variants?.[0]?.calculated_price?.calculated_amount
  const metadata = product.metadata as Record<string, string> | undefined

  return {
    item_id: (product.id as string) || (product.product_id as string) || "",
    item_name: (product.title as string) || "",
    item_category: metadata?.familyName || metadata?.series ? `Series ${metadata.series}` : undefined,
    item_variant: metadata?.productNumber || undefined,
    price: price != null ? price / 100 : (product.unit_price as number | undefined) != null ? (product.unit_price as number) / 100 : undefined,
    quantity: opts?.quantity ?? (product.quantity as number | undefined) ?? 1,
    item_list_name: opts?.listName,
    index: opts?.index,
  }
}

/**
 * Map a cart line item to GA4 item.
 */
export function mapCartItemToGA4(item: Record<string, unknown>): GA4Item {
  return {
    item_id: (item.product_id as string) || (item.id as string) || "",
    item_name: (item.title as string) || "",
    price: (item.unit_price as number) != null ? (item.unit_price as number) / 100 : undefined,
    quantity: (item.quantity as number) || 1,
  }
}

// ──── Event Tracking ────

/**
 * Push a custom event to dataLayer. Locale is injected automatically.
 */
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  push({ event: eventName, locale: getLocale(), ...params })
}

/**
 * Push an ecommerce event (GA4 enhanced e-commerce format).
 * Clears previous ecommerce data before pushing. Locale is injected automatically.
 */
export function trackEcommerce(
  eventName: string,
  items: GA4Item[],
  opts?: {
    value?: number
    currency?: string
    transactionId?: string
    shippingTier?: string
    paymentType?: string
    listName?: string
    searchTerm?: string
  }
) {
  // GA4 best practice: clear ecommerce object before new event
  push({ ecommerce: null })

  const ecommerce: EcommerceEvent["ecommerce"] = { items }

  if (opts?.value != null) ecommerce.value = opts.value / 100 // Medusa stores in cents
  if (opts?.currency) ecommerce.currency = opts.currency.toUpperCase()
  if (opts?.transactionId) ecommerce.transaction_id = opts.transactionId
  if (opts?.shippingTier) ecommerce.shipping_tier = opts.shippingTier
  if (opts?.paymentType) ecommerce.payment_type = opts.paymentType
  if (opts?.listName) ecommerce.item_list_name = opts.listName
  if (opts?.searchTerm) ecommerce.search_term = opts.searchTerm

  push({ event: eventName, locale: getLocale(), ecommerce })
}

/**
 * Track a lead generation event (B2B inquiry, contact form).
 */
export function trackLead(formType: string, data?: Record<string, unknown>) {
  push({
    event: "generate_lead",
    locale: getLocale(),
    form_type: formType,
    ...data,
  })
}
