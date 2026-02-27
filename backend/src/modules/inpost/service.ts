import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import type {
  CalculatedShippingOptionPrice,
  CalculateShippingOptionPriceContext,
  CreateFulfillmentResult,
  CreateShippingOptionDTO,
  FulfillmentDTO,
  FulfillmentItemDTO,
  FulfillmentOption,
  FulfillmentOrderDTO,
  ValidateFulfillmentDataContext,
} from "@medusajs/framework/types"

import {
  INPOST_API,
  type InPostOptions,
  type InPostCreateShipmentParams,
  type InPostShipmentResponse,
  type InPostTrackingResponse,
  type InPostLabelResponse,
  type InPostLabelFormat,
  type InPostFulfillmentData,
  type InPostSize,
  type InPostApiError,
  type InPostPoint,
  type InPostPaginatedResponse,
} from "./types"

// ---------------------------------------------------------------------------
// InPost ShipX API Client
// ---------------------------------------------------------------------------

/**
 * Low-level HTTP client for InPost ShipX API.
 *
 * InPost uses REST API with JSON bodies and Bearer token auth.
 * All monetary amounts are in PLN (or EUR for cross-border).
 *
 * API docs: https://docs.inpost24.com/display/PL/ShipX+API
 *
 * STATUS: SKELETON — Methods implemented but not tested against live API.
 * Will be fully tested when INPOST_ACCESS_TOKEN is provided.
 */
class InPostClient {
  private baseUrl: string
  private accessToken: string
  private organizationId: string

  constructor(options: InPostOptions) {
    this.baseUrl = options.sandbox !== false
      ? INPOST_API.SANDBOX
      : INPOST_API.PRODUCTION
    this.accessToken = options.accessToken
    this.organizationId = options.organizationId
  }

  /**
   * Make an authenticated request to InPost ShipX API.
   */
  async request<T>(
    method: string,
    endpoint: string,
    body?: Record<string, unknown>,
    params?: Record<string, string>
  ): Promise<T> {
    // Replace path params
    let url = `${this.baseUrl}${endpoint}`
    url = url.replace(":organizationId", this.organizationId)
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url = url.replace(`:${key}`, value)
      }
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.accessToken}`,
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      let errorData: InPostApiError
      try {
        errorData = await response.json() as InPostApiError
      } catch {
        const text = await response.text()
        throw new Error(
          `InPost API error (${response.status}): ${text.substring(0, 500)}`
        )
      }
      throw new Error(
        `InPost API error (${response.status}): ${errorData.message || errorData.error || "Unknown error"}`
      )
    }

    return response.json() as Promise<T>
  }

  /**
   * Fetch binary content (for labels).
   */
  async requestBinary(
    endpoint: string,
    params?: Record<string, string>,
    format: InPostLabelFormat = "pdf"
  ): Promise<InPostLabelResponse> {
    let url = `${this.baseUrl}${endpoint}`
    url = url.replace(":organizationId", this.organizationId)
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url = url.replace(`:${key}`, value)
      }
    }
    url += `?format=${format}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: format === "pdf" ? "application/pdf" : "text/plain",
      },
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`InPost label error (${response.status}): ${text.substring(0, 500)}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return {
      content: Buffer.from(arrayBuffer),
      contentType: response.headers.get("content-type") || "application/pdf",
    }
  }

  // --- Shipment Methods ---

  /**
   * Create a new shipment.
   */
  async createShipment(
    data: InPostCreateShipmentParams
  ): Promise<InPostShipmentResponse> {
    return this.request<InPostShipmentResponse>(
      "POST",
      INPOST_API.ENDPOINTS.CREATE_SHIPMENT,
      data as unknown as Record<string, unknown>
    )
  }

  /**
   * Get shipment details by ID.
   */
  async getShipment(shipmentId: string): Promise<InPostShipmentResponse> {
    return this.request<InPostShipmentResponse>(
      "GET",
      INPOST_API.ENDPOINTS.GET_SHIPMENT,
      undefined,
      { shipmentId }
    )
  }

  /**
   * Cancel a shipment.
   */
  async cancelShipment(shipmentId: string): Promise<void> {
    await this.request<void>(
      "DELETE",
      INPOST_API.ENDPOINTS.CANCEL_SHIPMENT,
      undefined,
      { shipmentId }
    )
  }

  /**
   * Get shipping label.
   */
  async getLabel(
    shipmentId: string,
    format: InPostLabelFormat = "pdf"
  ): Promise<InPostLabelResponse> {
    return this.requestBinary(
      INPOST_API.ENDPOINTS.GET_LABEL,
      { shipmentId },
      format
    )
  }

  /**
   * Get tracking info for a shipment.
   */
  async getTracking(shipmentId: string): Promise<InPostTrackingResponse> {
    return this.request<InPostTrackingResponse>(
      "GET",
      INPOST_API.ENDPOINTS.GET_TRACKING,
      undefined,
      { shipmentId }
    )
  }

  /**
   * Search for Paczkomat points near coordinates or by city.
   */
  async searchPoints(query: {
    city?: string
    post_code?: string
    latitude?: number
    longitude?: number
    /** Max distance in meters (for geo search) */
    max_distance?: number
    /** Number of results per page */
    per_page?: number
    /** Page number */
    page?: number
  }): Promise<InPostPaginatedResponse<InPostPoint>> {
    const params = new URLSearchParams()
    if (query.city) params.append("city", query.city)
    if (query.post_code) params.append("post_code", query.post_code)
    if (query.latitude) params.append("relative_point", `${query.latitude},${query.longitude}`)
    if (query.max_distance) params.append("max_distance", String(query.max_distance))
    if (query.per_page) params.append("per_page", String(query.per_page))
    if (query.page) params.append("page", String(query.page))

    const url = `${this.baseUrl}${INPOST_API.ENDPOINTS.SEARCH_POINTS}?${params.toString()}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`InPost points search error (${response.status}): ${text.substring(0, 500)}`)
    }

    return response.json() as Promise<InPostPaginatedResponse<InPostPoint>>
  }
}

// ---------------------------------------------------------------------------
// InPost Fulfillment Provider Service
// ---------------------------------------------------------------------------

/**
 * InPost (Paczkomaty) Fulfillment Provider for Medusa.js v2.
 *
 * STATUS: SKELETON — All core IFulfillmentProvider methods implemented,
 * plus custom methods for tracking and labels. Not yet tested against
 * live InPost API — requires INPOST_ACCESS_TOKEN and INPOST_ORGANIZATION_ID.
 *
 * Supports:
 *   - Paczkomat locker delivery (inpost_locker_standard) — most popular in PL
 *   - Courier delivery (inpost_courier_standard) — door-to-door
 *   - Shipment creation, label generation, tracking
 *   - Return shipment creation
 *
 * Fulfillment flow:
 * 1. Customer selects InPost at checkout (Paczkomat or courier)
 * 2. For Paczkomat: storefront shows InPost widget → customer picks locker
 * 3. Admin fulfills order → createFulfillment() creates shipment at InPost
 * 4. Admin prints label via getLabel()
 * 5. Tracking available via trackShipment()
 *
 * Registration in medusa-config.ts:
 * ```ts
 * {
 *   resolve: "@medusajs/medusa/fulfillment",
 *   options: {
 *     providers: [{
 *       resolve: "./src/modules/inpost",
 *       id: "inpost",
 *       options: {
 *         organizationId: process.env.INPOST_ORGANIZATION_ID,
 *         accessToken: process.env.INPOST_ACCESS_TOKEN,
 *         sandbox: process.env.INPOST_SANDBOX === "true",
 *       },
 *     }],
 *   },
 * }
 * ```
 *
 * Storefront integration:
 * - InPost GeoWidget v5 for Paczkomat selection
 * - Script: https://geowidget.inpost.pl/inpost-geowidget.js
 * - Store selected point name in order metadata: metadata.inpost_point_name
 *
 * @see https://docs.inpost24.com/display/PL/ShipX+API
 * @see https://docs.inpost24.com/display/PL/GeoWidget+v5
 */
class InPostFulfillmentService extends AbstractFulfillmentProviderService {
  static identifier = "inpost"

  protected client: InPostClient
  protected options_: InPostOptions

  constructor() {
    super()
    this.options_ = {
      organizationId: process.env.INPOST_ORGANIZATION_ID || "",
      accessToken: process.env.INPOST_ACCESS_TOKEN || "",
      sandbox: process.env.INPOST_SANDBOX !== "false",
      senderEmail: process.env.INPOST_SENDER_EMAIL,
      senderPhone: process.env.INPOST_SENDER_PHONE,
    }
    this.client = new InPostClient(this.options_)
  }

  // -------------------------------------------------------------------------
  // IFulfillmentProvider — Required Methods
  // -------------------------------------------------------------------------

  /**
   * Return available fulfillment options.
   *
   * InPost offers two main delivery methods:
   * - Paczkomat (locker): Customer picks up from automated locker
   * - Courier: Standard door-to-door delivery
   */
  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    return [
      {
        id: "inpost-paczkomat",
        name: "InPost Paczkomat",
        is_return: false,
      },
      {
        id: "inpost-courier",
        name: "InPost Kurier",
        is_return: false,
      },
    ]
  }

  /**
   * Validate shipping method data from the storefront.
   *
   * For Paczkomat: Expects `inpost_point_name` in data.
   * For Courier: Expects standard address fields.
   */
  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    _context: ValidateFulfillmentDataContext
  ): Promise<Record<string, unknown>> {
    const merged = { ...data, ...optionData }

    // For Paczkomat delivery, ensure a point was selected
    if (
      optionData.id === "inpost-paczkomat" &&
      !merged.inpost_point_name &&
      !merged.target_point
    ) {
      console.warn(
        "[InPost] Paczkomat delivery selected but no point name provided. " +
        "Customer must select a Paczkomat via the InPost GeoWidget."
      )
    }

    return merged
  }

  /**
   * Validate shipping option configuration from admin.
   */
  async validateOption(
    _data: Record<string, unknown>
  ): Promise<boolean> {
    return true
  }

  /**
   * Whether this provider can dynamically calculate shipping price.
   *
   * InPost offers API-based pricing through their offers system.
   * For now, we use flat rates configured in Medusa admin.
   *
   * TODO: Enable dynamic pricing via InPost offers API when needed.
   */
  async canCalculate(
    _data: CreateShippingOptionDTO
  ): Promise<boolean> {
    return false
  }

  /**
   * Calculate shipping price dynamically.
   *
   * Currently returns 0 because canCalculate returns false (using flat rates).
   *
   * When enabled, this would:
   * 1. Estimate parcel size from items
   * 2. Call InPost offers API
   * 3. Return gross price from the offer
   */
  async calculatePrice(
    _optionData: Record<string, unknown>,
    _data: Record<string, unknown>,
    _context: CalculateShippingOptionPriceContext
  ): Promise<CalculatedShippingOptionPrice> {
    // TODO: Implement dynamic pricing via InPost offers API
    // const parcelSize = this.estimateParcelSize(context.items)
    // const offer = await this.client.getOffer(parcelSize, service)
    // return { calculated_amount: parseFloat(offer.rate.gross) * 100, is_calculated_price_tax_inclusive: true }
    return {
      calculated_amount: 0,
      is_calculated_price_tax_inclusive: true,
    }
  }

  /**
   * Create a fulfillment (shipment) in InPost.
   *
   * Called when admin fulfills an order. Creates a shipment via ShipX API.
   *
   * Flow:
   * 1. Extract receiver info from order shipping address
   * 2. Determine service (Paczkomat vs courier) from fulfillment data
   * 3. Estimate parcel size from items
   * 4. Create shipment at InPost
   * 5. Return tracking number and label info
   */
  async createFulfillment(
    data: Record<string, unknown>,
    items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
    order: Partial<FulfillmentOrderDTO> | undefined,
    fulfillment: Partial<Omit<FulfillmentDTO, "provider_id" | "data" | "items">>
  ): Promise<CreateFulfillmentResult> {
    const shippingAddress = order?.shipping_address as Record<string, unknown> | undefined
    const metadata = (order as Record<string, unknown>)?.metadata as Record<string, unknown> | undefined
    const email = (order as Record<string, unknown>)?.email as string | undefined

    if (!shippingAddress) {
      return {
        data: { provider: "inpost", status: "pending", message: "No shipping address" },
        labels: [],
      }
    }

    if (!this.options_.accessToken) {
      console.warn("[InPost] Access token not configured — skipping shipment creation")
      return {
        data: { provider: "inpost", status: "not_configured", message: "INPOST_ACCESS_TOKEN not set" },
        labels: [],
      }
    }

    // Determine if this is Paczkomat or courier delivery
    const isPaczkomat = data.id === "inpost-paczkomat" || !!metadata?.inpost_point_name
    const targetPoint = (metadata?.inpost_point_name || data.target_point || data.inpost_point_name) as string | undefined

    // Calculate total weight (default 0.5kg per BrightSign player)
    const totalWeight = items.reduce((sum, item) => {
      const qty = (item.quantity as number) || 1
      return sum + qty * 0.5
    }, 0)

    // Calculate total value for insurance
    const totalValue = items.reduce((sum, item) => {
      const qty = (item.quantity as number) || 1
      const price = ((item as Record<string, unknown>).unit_price as number) || 0
      return sum + (qty * price) / 100
    }, 0)

    // Estimate parcel size based on items
    const parcelSize = this.estimateParcelSize(items)

    const displayId = String(
      (order as Record<string, unknown>)?.display_id || fulfillment?.id || Date.now()
    )

    try {
      const shipmentParams: InPostCreateShipmentParams = {
        receiver: {
          name: `${(shippingAddress.first_name as string) || ""} ${(shippingAddress.last_name as string) || ""}`.trim(),
          first_name: (shippingAddress.first_name as string) || undefined,
          last_name: (shippingAddress.last_name as string) || undefined,
          email: email || "",
          phone: (shippingAddress.phone as string) || "",
          address: !isPaczkomat ? {
            street: (shippingAddress.address_1 as string) || "",
            building_number: "",
            city: (shippingAddress.city as string) || "",
            post_code: (shippingAddress.postal_code as string) || "",
            country_code: ((shippingAddress.country_code as string) || "PL").toUpperCase(),
          } : undefined,
        },
        parcels: [
          {
            template: parcelSize,
            weight: {
              amount: Math.max(totalWeight, 0.1),
              unit: "kg",
            },
          },
        ],
        service: isPaczkomat ? "inpost_locker_standard" : "inpost_courier_standard",
        custom_attributes: isPaczkomat && targetPoint ? {
          target_point: targetPoint,
          sending_method: "dispatch_order",
        } : undefined,
        insurance: totalValue > 0 ? {
          amount: totalValue,
          currency: "PLN",
        } : undefined,
        reference: `BS-${displayId}`,
      }

      const result = await this.client.createShipment(shipmentParams)

      const trackingUrl = `https://inpost.pl/sledzenie-przesylek?number=${result.tracking_number}`
      const fulfillmentData: InPostFulfillmentData = {
        provider: "inpost",
        shipment_id: result.id,
        tracking_number: result.tracking_number,
        status: result.status,
        service: result.service,
        target_point: result.custom_attributes?.target_point,
        tracking_url: trackingUrl,
        created_at: result.created_at,
      }

      return {
        data: fulfillmentData as unknown as Record<string, unknown>,
        labels: [
          {
            tracking_number: result.tracking_number,
            tracking_url: trackingUrl,
            label_url: "", // Labels fetched on-demand via getLabel()
          },
        ],
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error("[InPost] createShipment failed:", message)

      // Don't block fulfillment on API failure — admin can create manually
      return {
        data: {
          provider: "inpost",
          status: "error",
          error: message,
        },
        labels: [],
      }
    }
  }

  /**
   * Cancel a fulfillment.
   *
   * Attempts to cancel the shipment at InPost via DELETE endpoint.
   * Only works for shipments in "created" or "confirmed" status.
   */
  async cancelFulfillment(
    fulfillment: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const shipmentId = fulfillment.shipment_id as number | undefined

    if (shipmentId && this.options_.accessToken) {
      try {
        await this.client.cancelShipment(String(shipmentId))
      } catch (error) {
        console.error(
          "[InPost] cancelShipment failed:",
          error instanceof Error ? error.message : error
        )
        // Don't throw — allow Medusa to proceed with cancellation
      }
    }

    return {
      ...fulfillment,
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    }
  }

  /**
   * Create a return fulfillment.
   *
   * InPost supports return shipments where the customer sends
   * the package back via Paczkomat or courier.
   *
   * TODO: Implement via /v1/organizations/:id/returns endpoint.
   * For now, returns are handled manually.
   */
  async createReturnFulfillment(
    _fulfillment: Record<string, unknown>
  ): Promise<CreateFulfillmentResult> {
    // TODO: Implement InPost return shipment
    // const originalShipmentId = fulfillment.shipment_id
    // const result = await this.client.createReturn({ shipment_id: originalShipmentId })
    return {
      data: { provider: "inpost", status: "manual_return" },
      labels: [],
    }
  }

  /**
   * Retrieve fulfillment documents.
   */
  async getFulfillmentDocuments(
    _data: Record<string, unknown>
  ): Promise<never[]> {
    return []
  }

  /**
   * Retrieve return documents.
   */
  async getReturnDocuments(
    _data: Record<string, unknown>
  ): Promise<never[]> {
    return []
  }

  /**
   * Retrieve shipment documents.
   */
  async getShipmentDocuments(
    _data: Record<string, unknown>
  ): Promise<never[]> {
    return []
  }

  /**
   * Retrieve documents by type.
   */
  async retrieveDocuments(
    _fulfillmentData: Record<string, unknown>,
    _documentType: string
  ): Promise<void> {
    // No-op — labels are fetched via custom getLabel() method
  }

  // -------------------------------------------------------------------------
  // Custom Methods (not part of IFulfillmentProvider)
  // -------------------------------------------------------------------------

  /**
   * Get tracking info for an InPost shipment.
   *
   * Use via custom API route: GET /store/shipping/inpost/tracking/:shipmentId
   */
  async trackShipment(shipmentId: string): Promise<InPostTrackingResponse | null> {
    if (!this.options_.accessToken) {
      console.warn("[InPost] Access token not configured — cannot track shipment")
      return null
    }

    try {
      return await this.client.getTracking(shipmentId)
    } catch (error) {
      console.error(
        "[InPost] getTracking failed:",
        error instanceof Error ? error.message : error
      )
      return null
    }
  }

  /**
   * Get shipping label PDF for an InPost shipment.
   *
   * Use via custom API route: GET /admin/shipping/inpost/label/:shipmentId
   */
  async getLabel(
    shipmentId: string,
    format: InPostLabelFormat = "pdf"
  ): Promise<Buffer | null> {
    if (!this.options_.accessToken) {
      console.warn("[InPost] Access token not configured — cannot get label")
      return null
    }

    try {
      const result = await this.client.getLabel(shipmentId, format)
      return result.content
    } catch (error) {
      console.error(
        "[InPost] getLabel failed:",
        error instanceof Error ? error.message : error
      )
      return null
    }
  }

  /**
   * Search for nearby Paczkomat points.
   *
   * Used by storefront InPost GeoWidget or custom point selector.
   * Use via API route: GET /store/shipping/inpost/points?city=Warszawa
   */
  async searchPoints(query: {
    city?: string
    post_code?: string
    latitude?: number
    longitude?: number
    max_distance?: number
    per_page?: number
    page?: number
  }): Promise<InPostPaginatedResponse<InPostPoint> | null> {
    if (!this.options_.accessToken) {
      console.warn("[InPost] Access token not configured — cannot search points")
      return null
    }

    try {
      return await this.client.searchPoints(query)
    } catch (error) {
      console.error(
        "[InPost] searchPoints failed:",
        error instanceof Error ? error.message : error
      )
      return null
    }
  }

  // -------------------------------------------------------------------------
  // Private Helpers
  // -------------------------------------------------------------------------

  /**
   * Estimate InPost parcel size based on items.
   *
   * BrightSign player dimensions (approximate):
   * - HD series: Small (fits in Paczkomat A)
   * - XD series: Medium (fits in Paczkomat B)
   * - XT/XC series: Medium-Large (fits in Paczkomat B/C)
   *
   * Multiple items → upgrade to next size category.
   */
  private estimateParcelSize(
    items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[]
  ): InPostSize {
    const totalQty = items.reduce((sum, item) => {
      return sum + ((item.quantity as number) || 1)
    }, 0)

    if (totalQty <= 1) return "small"
    if (totalQty <= 3) return "medium"
    return "large"
  }
}

export default InPostFulfillmentService
