/**
 * Packeta (Zásilkovna) REST API client.
 *
 * Uses the XML-based REST API (same as SOAP, but over HTTP POST).
 * Docs: https://docs.packeta.com/
 *
 * Required env vars:
 *   PACKETA_API_KEY      – Widget API key (for storefront pickup selector)
 *   PACKETA_API_PASSWORD – REST API password (for backend operations)
 *   PACKETA_SENDER_ID    – E-shop ID (eshop) assigned by Packeta
 */

const PACKETA_REST_URL = "https://www.zasilkovna.cz/api/rest"

interface PacketaConfig {
  apiPassword: string
  senderId: string
}

export interface PacketAttributes {
  /** Order display ID (reference number) */
  number: string
  /** Recipient first name */
  name: string
  /** Recipient last name */
  surname: string
  /** Recipient email */
  email: string
  /** Recipient phone (international format preferred) */
  phone?: string
  /** Packeta pickup point ID (for pickup delivery) */
  addressId?: number
  /** Street address (for home delivery) */
  street?: string
  /** City (for home delivery) */
  city?: string
  /** Postal code (for home delivery) */
  zip?: string
  /** ISO country code (cz, sk, pl, hu, ro) */
  country: string
  /** Cash on delivery amount (0 = no COD) */
  cod: number
  /** Declared value for insurance (in local currency) */
  value: number
  /** Weight in kg */
  weight: number
  /** E-shop ID */
  eshop: string
  /** Carrier ID for home delivery (e.g., 106 = CZ home delivery) */
  carrierPickupPoint?: string
}

export interface PacketaCreateResult {
  success: boolean
  packetId?: string
  barcode?: string
  error?: string
}

export interface PacketaTrackingResult {
  packetId: string
  status: string
  statusText: string
  lastUpdate?: string
}

function buildCreatePacketXml(config: PacketaConfig, attrs: PacketAttributes): string {
  const escape = (s: string | number | undefined) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")

  return `<?xml version="1.0" encoding="utf-8"?>
<createPacket>
  <apiPassword>${escape(config.apiPassword)}</apiPassword>
  <packetAttributes>
    <number>${escape(attrs.number)}</number>
    <name>${escape(attrs.name)}</name>
    <surname>${escape(attrs.surname)}</surname>
    <email>${escape(attrs.email)}</email>
    ${attrs.phone ? `<phone>${escape(attrs.phone)}</phone>` : ""}
    ${attrs.addressId ? `<addressId>${escape(attrs.addressId)}</addressId>` : ""}
    ${attrs.street ? `<street>${escape(attrs.street)}</street>` : ""}
    ${attrs.city ? `<city>${escape(attrs.city)}</city>` : ""}
    ${attrs.zip ? `<zip>${escape(attrs.zip)}</zip>` : ""}
    <country>${escape(attrs.country)}</country>
    <cod>${escape(attrs.cod)}</cod>
    <value>${escape(attrs.value)}</value>
    <weight>${escape(attrs.weight)}</weight>
    <eshop>${escape(attrs.eshop)}</eshop>
    ${attrs.carrierPickupPoint ? `<carrierPickupPoint>${escape(attrs.carrierPickupPoint)}</carrierPickupPoint>` : ""}
  </packetAttributes>
</createPacket>`
}

function buildPacketStatusXml(apiPassword: string, packetId: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<packetStatus>
  <apiPassword>${apiPassword}</apiPassword>
  <packetId>${packetId}</packetId>
</packetStatus>`
}

function buildPacketLabelXml(apiPassword: string, packetId: string, format: "pdf" | "zpl" = "pdf"): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<packetLabelPdf>
  <apiPassword>${apiPassword}</apiPassword>
  <packetId>${packetId}</packetId>
  <format>${format}</format>
</packetLabelPdf>`
}

/**
 * Packeta REST API client.
 * All methods throw on network errors but return structured results for API errors.
 */
export class PacketaClient {
  private config: PacketaConfig

  constructor(apiPassword?: string, senderId?: string) {
    this.config = {
      apiPassword: apiPassword || process.env.PACKETA_API_PASSWORD || "",
      senderId: senderId || process.env.PACKETA_SENDER_ID || "",
    }
  }

  /**
   * Create a new shipment in Packeta.
   */
  async createPacket(attrs: Omit<PacketAttributes, "eshop">): Promise<PacketaCreateResult> {
    if (!this.config.apiPassword) {
      console.warn("[Packeta] API password not configured — skipping createPacket")
      return {
        success: false,
        error: "PACKETA_API_PASSWORD not configured",
      }
    }

    const fullAttrs: PacketAttributes = {
      ...attrs,
      eshop: this.config.senderId,
    }

    const xml = buildCreatePacketXml(this.config, fullAttrs)

    try {
      const res = await fetch(PACKETA_REST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/xml" },
        body: xml,
      })

      const text = await res.text()

      // Parse response — look for <id> or <fault>
      const idMatch = text.match(/<id>(\d+)<\/id>/)
      const barcodeMatch = text.match(/<barcode>([^<]+)<\/barcode>/)
      const faultMatch = text.match(/<fault>([^<]+)<\/fault>/)
      const detailMatch = text.match(/<detail>([^<]+)<\/detail>/)

      if (idMatch) {
        return {
          success: true,
          packetId: idMatch[1],
          barcode: barcodeMatch?.[1],
        }
      }

      return {
        success: false,
        error: faultMatch?.[1] || detailMatch?.[1] || `Unexpected response: ${text.substring(0, 200)}`,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error("[Packeta] createPacket failed:", message)
      return { success: false, error: message }
    }
  }

  /**
   * Get tracking status for a shipment.
   */
  async getTracking(packetId: string): Promise<PacketaTrackingResult> {
    if (!this.config.apiPassword) {
      return {
        packetId,
        status: "unknown",
        statusText: "API not configured",
      }
    }

    const xml = buildPacketStatusXml(this.config.apiPassword, packetId)

    try {
      const res = await fetch(PACKETA_REST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/xml" },
        body: xml,
      })

      const text = await res.text()
      const codeMatch = text.match(/<codeText>([^<]+)<\/codeText>/)
      const statusMatch = text.match(/<statusCode>(\d+)<\/statusCode>/)
      const dateMatch = text.match(/<dateTime>([^<]+)<\/dateTime>/)

      return {
        packetId,
        status: statusMatch?.[1] || "unknown",
        statusText: codeMatch?.[1] || "Unknown",
        lastUpdate: dateMatch?.[1],
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error("[Packeta] getTracking failed:", message)
      return { packetId, status: "error", statusText: message }
    }
  }

  /**
   * Get shipping label PDF for a packet.
   */
  async getLabel(packetId: string): Promise<Buffer | null> {
    if (!this.config.apiPassword) {
      console.warn("[Packeta] API password not configured — cannot generate label")
      return null
    }

    const xml = buildPacketLabelXml(this.config.apiPassword, packetId)

    try {
      const res = await fetch(PACKETA_REST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/xml" },
        body: xml,
      })

      if (res.headers.get("content-type")?.includes("application/pdf")) {
        const arrayBuffer = await res.arrayBuffer()
        return Buffer.from(arrayBuffer)
      }

      // If not PDF, it's an error response
      const text = await res.text()
      console.error("[Packeta] getLabel error:", text.substring(0, 200))
      return null
    } catch (err) {
      console.error("[Packeta] getLabel failed:", err instanceof Error ? err.message : err)
      return null
    }
  }
}

/** Default singleton — initialized from env vars */
export const packetaClient = new PacketaClient()
