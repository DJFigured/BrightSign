import { sdk } from "./sdk"

// Hardcoded region IDs from seed data to avoid async fetching on every request
const REGION_MAP: Record<string, string> = {
  CZ: "reg_01KHTQMR6HD7AEMP006EH8JFSC",
  SK: "reg_01KHTQMR6H8P4KV67VRK9WDPZK",
  PL: "reg_01KHTQMR6HQTCVCYFR0VX0PC70",
  EU: "reg_01KHTQMR6HSRZAKZ0SA0SESARC",
}

export function getRegionId(regionCode: string): string {
  return REGION_MAP[regionCode] ?? REGION_MAP.CZ
}

// Sales channel ID for the BrightSign Webshop
export const SALES_CHANNEL_ID = "sc_01KHTQMR52ZWPKQND5NRQT3MH3"

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
