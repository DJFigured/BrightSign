
// Hardcoded region IDs from seed data to avoid async fetching on every request
const REGION_MAP: Record<string, string> = {
  CZ: "reg_01KJ0945H6KXKT9DKJ2Q9Z00NZ",
  SK: "reg_01KJ0945H7SR9N97MA3JNP7A5B",
  PL: "reg_01KJ0945H7M4A7V4P095CQ18V4",
  EU: "reg_01KJ0945H8MT8HPKVV1EA96AP9",
}

export function getRegionId(regionCode: string): string {
  return REGION_MAP[regionCode] ?? REGION_MAP.CZ
}

// Sales channel ID for the BrightSign Webshop
export const SALES_CHANNEL_ID = "sc_01KJ0945DKEPX1P4KAHV82GZ0M"

export function formatPrice(amount: number | undefined | null, currencyCode: string): string {
  if (amount == null) return ""
  // Medusa stores prices in smallest unit (cents/haléře)
  const value = amount / 100
  const locale = currencyCode === "CZK" ? "cs-CZ" : currencyCode === "PLN" ? "pl-PL" : "de-DE"
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: currencyCode === "CZK" ? 0 : 2,
    maximumFractionDigits: currencyCode === "CZK" ? 0 : 2,
  }).format(value)
}

export const currencyMap: Record<string, string> = {
  CZ: "czk",
  SK: "eur",
  PL: "pln",
  EU: "eur",
}

/**
 * VAT rates by currency code.
 * Used to calculate ex-VAT prices from gross prices.
 */
const VAT_RATES: Record<string, number> = {
  CZK: 0.21,  // Czech Republic 21%
  EUR: 0.20,  // Slovakia / Austria 20% (default for EUR zone)
  PLN: 0.23,  // Poland 23%
  GBP: 0.20,  // United Kingdom 20%
  HUF: 0.27,  // Hungary 27%
  RON: 0.19,  // Romania 19%
}

/**
 * Get VAT rate for a currency code. Defaults to 21% (CZ).
 */
export function getVatRate(currencyCode: string): number {
  return VAT_RATES[currencyCode.toUpperCase()] ?? 0.21
}

/**
 * Calculate price excluding VAT based on currency code.
 * Returns rounded amount in smallest currency unit.
 */
export function calcExVat(amount: number, currencyCode: string): number {
  const rate = getVatRate(currencyCode)
  return Math.round(amount / (1 + rate))
}

/**
 * Returns localized product description from metadata translations.
 * Main product.description is always Czech (cs).
 * Other locales fall back to Czech if translation is missing.
 */
export function getLocalizedDescription(
  product: { description?: string | null; metadata?: Record<string, unknown> | null },
  locale: string,
): string | undefined {
  const description = product.description ?? undefined

  // Czech is the primary language stored in product.description
  if (locale === "cs") return description

  // Try to get translation from metadata
  const translations = product.metadata?.translations as
    | Record<string, { description?: string }> | undefined
  const translated = translations?.[locale]?.description
  if (translated) return translated

  // Fallback to Czech
  return description
}
