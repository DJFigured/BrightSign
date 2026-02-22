/**
 * AI Buddy shared helpers — SKU parsing, date ranges, etc.
 */

export function getSerieFromSku(sku: string): "S4" | "S5" | "S6" | "unknown" {
  const digits = sku.replace(/\D/g, "")
  const lastDigit = digits.slice(-1)
  if (lastDigit === "6") return "S6"
  if (lastDigit === "4") return "S4"
  if (lastDigit === "5") return "S5"
  return "unknown"
}

export function getFamilyFromSku(sku: string): string {
  return sku.replace(/[0-9]/g, "")
}

export function getStockThreshold(serie: string): number {
  return serie === "S4" ? 3 : 10
}

export function getStockStatus(available: number, threshold: number): "ok" | "low" | "out" {
  if (available <= 0) return "out"
  if (available <= threshold) return "low"
  return "ok"
}

export function todayStart(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function weekStart(): Date {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function monthStart(): Date {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function yearStart(): Date {
  return new Date(new Date().getFullYear(), 0, 1)
}

/**
 * Derive a fulfillment status string from the fulfillments array.
 * Medusa v2 Order doesn't have a flat `fulfillment_status` field.
 */
export function deriveFulfillmentStatus(fulfillments: any[] | undefined | null): string {
  if (!fulfillments || fulfillments.length === 0) return "not_fulfilled"
  const statuses = fulfillments.map((f: any) => (f.status as string) || "")
  if (statuses.every((s) => s === "delivered")) return "delivered"
  if (statuses.some((s) => s === "delivered")) return "partially_delivered"
  if (statuses.every((s) => s === "shipped")) return "shipped"
  if (statuses.some((s) => s === "shipped")) return "partially_shipped"
  if (statuses.some((s) => s === "canceled" || s === "cancelled")) return "canceled"
  if (statuses.length > 0) return "partially_fulfilled"
  return "not_fulfilled"
}
