/**
 * VIES VAT Validation
 * REST API: https://ec.europa.eu/taxation_customs/vies/rest-api/
 *
 * VIES is often unavailable - all errors handled gracefully.
 */

const VIES_REST_URL =
  "https://ec.europa.eu/taxation_customs/vies/rest-api//check-vat-number"

export interface VIESResult {
  valid: boolean
  name: string
  address: string
  countryCode: string
  vatNumber: string
  requestDate: string
}

export interface VIESError {
  status: "unavailable" | "invalid_format" | "error"
  message: string
}

/**
 * Country code regex patterns for supported EU countries
 */
const VAT_PATTERNS: Record<string, RegExp> = {
  CZ: /^CZ\d{8,10}$/i,
  SK: /^SK\d{10}$/i,
  PL: /^PL\d{10}$/i,
  AT: /^ATU\d{8}$/i,
  DE: /^DE\d{9}$/i,
  HU: /^HU\d{8}$/i,
  RO: /^RO\d{2,10}$/i,
  EU: /^[A-Z]{2}.+$/i,
}

/**
 * Parse a raw VAT ID string into countryCode + vatNumber
 * Handles both "CZ27082440" and "27082440" (if countryCode passed separately)
 */
export function parseVatId(input: string): { countryCode: string; vatNumber: string } | null {
  const clean = input.trim().toUpperCase().replace(/\s/g, "")

  // Extract 2-letter country prefix
  const countryMatch = clean.match(/^([A-Z]{2})(.+)$/)
  if (!countryMatch) {
    return null
  }

  const countryCode = countryMatch[1]
  const vatNumber = countryMatch[2]

  // Validate format for known countries
  const pattern = VAT_PATTERNS[countryCode] || VAT_PATTERNS.EU
  if (!pattern.test(clean)) {
    return null
  }

  return { countryCode, vatNumber }
}

/**
 * Validate a VAT number via the VIES REST API.
 * Returns VIESResult on success, throws VIESError on failure.
 */
export async function validateVatNumber(
  countryCode: string,
  vatNumber: string
): Promise<VIESResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000) // 10s timeout

  try {
    const response = await fetch(VIES_REST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        countryCode: countryCode.toUpperCase(),
        vatNumber: vatNumber.replace(/^[A-Z]{2}/i, ""), // strip country prefix if present
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const err: VIESError = {
        status: "unavailable",
        message: `VIES HTTP ${response.status}`,
      }
      throw err
    }

    const data = await response.json()

    if (data.errorWrappers?.length) {
      // VIES service-level errors (e.g. MS_UNAVAILABLE)
      const code = data.errorWrappers[0]?.error || "SERVICE_UNAVAILABLE"
      const err: VIESError = {
        status: "unavailable",
        message: `VIES error: ${code}`,
      }
      throw err
    }

    return {
      valid: !!data.isValid,
      name: data.traderName || "",
      address: data.traderAddress || "",
      countryCode: countryCode.toUpperCase(),
      vatNumber: vatNumber,
      requestDate: new Date().toISOString(),
    }
  } catch (error: any) {
    clearTimeout(timeout)

    if (error.status) {
      // Already a VIESError
      throw error
    }

    if (error.name === "AbortError") {
      const err: VIESError = {
        status: "unavailable",
        message: "VIES timeout after 10s",
      }
      throw err
    }

    const err: VIESError = {
      status: "error",
      message: error.message || "Unknown VIES error",
    }
    throw err
  }
}

/**
 * High-level convenience: parse + validate full VAT ID string like "CZ27082440"
 */
export async function validateVatId(
  vatId: string
): Promise<VIESResult | null> {
  const parsed = parseVatId(vatId)
  if (!parsed) {
    return null
  }

  return validateVatNumber(parsed.countryCode, parsed.vatNumber)
}
