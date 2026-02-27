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
import { PacketaClient } from "../../lib/packeta-client"

/**
 * Packeta (Zasilkovna) fulfillment provider for Medusa v2.
 *
 * Supports:
 *   - Pickup point delivery (addressId from storefront widget)
 *   - Home delivery (carrier-based)
 *   - Shipment creation, label generation, tracking
 *
 * Registration in medusa-config.ts:
 *   {
 *     resolve: "@medusajs/medusa/fulfillment",
 *     options: {
 *       providers: [{
 *         resolve: "./src/modules/packeta",
 *         id: "packeta",
 *         options: {
 *           api_password: process.env.PACKETA_API_PASSWORD,
 *           sender_id: process.env.PACKETA_SENDER_ID,
 *           api_key: process.env.PACKETA_API_KEY,
 *         },
 *       }],
 *     },
 *   }
 */
class PacketaFulfillmentService extends AbstractFulfillmentProviderService {
  static identifier = "packeta"

  protected client: PacketaClient

  constructor() {
    super()
    this.client = new PacketaClient(
      process.env.PACKETA_API_PASSWORD,
      process.env.PACKETA_SENDER_ID
    )
  }

  /**
   * Return available fulfillment options (pickup + home delivery).
   */
  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    return [
      { id: "packeta-pickup", name: "Packeta Pickup Point", is_return: false },
      { id: "packeta-home", name: "Packeta Home Delivery", is_return: false },
    ]
  }

  /**
   * Validate shipping method data. Accept as-is.
   */
  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    _context: ValidateFulfillmentDataContext
  ): Promise<Record<string, unknown>> {
    return { ...data, ...optionData }
  }

  /**
   * Validate shipping option configuration.
   */
  async validateOption(
    _data: Record<string, unknown>
  ): Promise<boolean> {
    return true
  }

  /**
   * We use flat rates set in Medusa admin, so no dynamic calculation.
   */
  async canCalculate(
    _data: CreateShippingOptionDTO
  ): Promise<boolean> {
    return false
  }

  /**
   * Calculate price -- not used since canCalculate returns false.
   */
  async calculatePrice(
    _optionData: Record<string, unknown>,
    _data: Record<string, unknown>,
    _context: CalculateShippingOptionPriceContext
  ): Promise<CalculatedShippingOptionPrice> {
    return {
      calculated_amount: 0,
      is_calculated_price_tax_inclusive: true,
    }
  }

  /**
   * Create a fulfillment (shipment) in Packeta.
   * Called when an order is fulfilled from the admin.
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
        data: { provider: "packeta", status: "pending", message: "No shipping address" },
        labels: [],
      }
    }

    // Calculate total weight (default 0.5kg per item)
    const totalWeight = items.reduce((sum, item) => {
      const qty = (item.quantity as number) || 1
      return sum + qty * 0.5
    }, 0)

    // Calculate total value for insurance (from item metadata or order total)
    const totalValue = items.reduce((sum, item) => {
      const qty = (item.quantity as number) || 1
      const price = ((item as Record<string, unknown>).unit_price as number) || 0
      return sum + (qty * price) / 100
    }, 0)

    const displayId = String(
      (order as Record<string, unknown>)?.display_id || fulfillment?.id || Date.now()
    )

    const packetaPointId = metadata?.packeta_point_id as number | undefined

    const result = await this.client.createPacket({
      number: displayId,
      name: (shippingAddress.first_name as string) || "",
      surname: (shippingAddress.last_name as string) || "",
      email: email || "",
      phone: (shippingAddress.phone as string) || "",
      addressId: packetaPointId,
      street: !packetaPointId ? (shippingAddress.address_1 as string) || "" : undefined,
      city: !packetaPointId ? (shippingAddress.city as string) || "" : undefined,
      zip: !packetaPointId ? (shippingAddress.postal_code as string) || "" : undefined,
      country: (shippingAddress.country_code as string) || "cz",
      cod: 0,
      value: totalValue,
      weight: Math.max(totalWeight, 0.1),
    })

    if (result.success) {
      const trackingUrl = `https://tracking.packeta.com/cs/?id=${result.packetId}`
      return {
        data: {
          provider: "packeta",
          status: "created",
          packet_id: result.packetId,
          barcode: result.barcode,
          tracking_url: trackingUrl,
        },
        labels: [
          {
            tracking_number: result.barcode || result.packetId || displayId,
            tracking_url: trackingUrl,
            label_url: "", // Labels are fetched on-demand via getLabel()
          },
        ],
      }
    }

    // Don't block fulfillment on API failure -- admin can create manually
    return {
      data: {
        provider: "packeta",
        status: "error",
        error: result.error,
      },
      labels: [],
    }
  }

  /**
   * Cancel a fulfillment.
   */
  async cancelFulfillment(
    fulfillment: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return {
      ...fulfillment,
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    }
  }

  /**
   * Create a return fulfillment.
   * Packeta returns are handled manually.
   */
  async createReturnFulfillment(
    _fulfillment: Record<string, unknown>
  ): Promise<CreateFulfillmentResult> {
    return {
      data: { provider: "packeta", status: "manual_return" },
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
    // No-op
  }

  // --- Custom methods (not part of IFulfillmentProvider) ---

  /**
   * Retrieve label PDF for a Packeta shipment.
   * Use via custom API route.
   */
  async getLabel(packetId: string): Promise<Buffer | null> {
    return this.client.getLabel(packetId)
  }

  /**
   * Get tracking info for a Packeta shipment.
   * Use via custom API route.
   */
  async getTracking(packetId: string) {
    return this.client.getTracking(packetId)
  }
}

export default PacketaFulfillmentService
