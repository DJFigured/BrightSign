/**
 * InPost (Paczkomaty) Fulfillment Provider — TypeScript Types
 *
 * Based on InPost ShipX API v1 documentation:
 * https://api-shipx-pl.easypack24.net/
 * https://docs.inpost24.com/display/PL/ShipX+API
 *
 * InPost is the dominant parcel delivery service in Poland with 20,000+
 * Paczkomaty (automated parcel lockers). They also offer courier delivery.
 *
 * STATUS: SKELETON — Types defined, implementation pending.
 * Will be implemented alongside Packeta for PL market expansion.
 *
 * Env variables:
 * - INPOST_ORGANIZATION_ID: Your organization ID from InPost Manager
 * - INPOST_ACCESS_TOKEN: API access token from InPost Manager
 * - INPOST_SANDBOX: "true" for sandbox, "false" for production
 */

// ---------------------------------------------------------------------------
// Provider Configuration
// ---------------------------------------------------------------------------

/**
 * Options passed to the InPost fulfillment provider in medusa-config.ts.
 *
 * Get credentials from InPost Manager: https://manager.paczkomaty.pl/
 *
 * Example:
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
 */
export interface InPostOptions {
  /** InPost organization ID (from InPost Manager) */
  organizationId: string
  /** API access token (Bearer token) */
  accessToken: string
  /** Use sandbox environment (default: true) */
  sandbox?: boolean
  /** Default sender email for shipments */
  senderEmail?: string
  /** Default sender phone for shipments */
  senderPhone?: string
}

// ---------------------------------------------------------------------------
// API Endpoints
// ---------------------------------------------------------------------------

export const INPOST_API = {
  /** Production base URL */
  PRODUCTION: "https://api-shipx-pl.easypack24.net",
  /** Sandbox base URL */
  SANDBOX: "https://sandbox-api-shipx-pl.easypack24.net",

  /** API endpoints (relative to base URL) */
  ENDPOINTS: {
    /** Create a shipment */
    CREATE_SHIPMENT: "/v1/organizations/:organizationId/shipments",
    /** Get shipment details */
    GET_SHIPMENT: "/v1/shipments/:shipmentId",
    /** Get shipment label */
    GET_LABEL: "/v1/shipments/:shipmentId/label",
    /** Cancel a shipment */
    CANCEL_SHIPMENT: "/v1/shipments/:shipmentId",
    /** List shipments */
    LIST_SHIPMENTS: "/v1/organizations/:organizationId/shipments",
    /** Get Paczkomat point details */
    GET_POINT: "/v1/points/:pointName",
    /** Search Paczkomat points */
    SEARCH_POINTS: "/v1/points",
    /** Get tracking info */
    GET_TRACKING: "/v1/tracking/:shipmentId",
    /** Dispatch orders (batch send) */
    DISPATCH_ORDERS: "/v1/organizations/:organizationId/dispatch_orders",
    /** Create return shipment */
    CREATE_RETURN: "/v1/organizations/:organizationId/returns",
  },
} as const

// ---------------------------------------------------------------------------
// Shipment Types
// ---------------------------------------------------------------------------

/**
 * InPost shipment services.
 *
 * - inpost_locker_standard: Delivery to Paczkomat (most popular)
 * - inpost_locker_economy: Economy Paczkomat delivery
 * - inpost_courier_standard: Courier delivery to door
 * - inpost_courier_express_10: Express courier (by 10:00)
 * - inpost_courier_express_12: Express courier (by 12:00)
 * - inpost_courier_c2c: Consumer-to-consumer courier
 */
export type InPostService =
  | "inpost_locker_standard"
  | "inpost_locker_economy"
  | "inpost_courier_standard"
  | "inpost_courier_express_10"
  | "inpost_courier_express_12"
  | "inpost_courier_c2c"

/**
 * Shipment size categories for Paczkomat lockers.
 *
 * Dimensions (L x W x H):
 * - A: 8 x 38 x 64 cm (small electronics, accessories)
 * - B: 19 x 38 x 64 cm (standard BrightSign players)
 * - C: 41 x 38 x 64 cm (large players, bundles)
 */
export type InPostSize = "small" | "medium" | "large"

/**
 * Shipment status in InPost system.
 */
export type InPostShipmentStatus =
  | "created"
  | "offers_prepared"
  | "offer_selected"
  | "confirmed"
  | "dispatched_by_sender"
  | "collected_from_sender"
  | "taken_by_courier"
  | "adopted_at_source_branch"
  | "sent_from_source_branch"
  | "ready_to_pickup"
  | "out_for_delivery"
  | "delivered"
  | "avizo"
  | "claimed"
  | "returned_to_sender"
  | "canceled"
  | "other"

// ---------------------------------------------------------------------------
// API Request Types
// ---------------------------------------------------------------------------

/**
 * Receiver info for shipment creation.
 */
export interface InPostReceiver {
  /** Recipient full name or company name */
  name: string
  /** Company name (optional, for B2B) */
  company_name?: string
  /** First name */
  first_name?: string
  /** Last name */
  last_name?: string
  /** Email address */
  email: string
  /** Phone number (Polish format: 9 digits or +48XXXXXXXXX) */
  phone: string
  /** Street address (for courier delivery) */
  address?: InPostAddress
}

/**
 * Sender info for shipment creation.
 */
export interface InPostSender {
  /** Sender full name or company name */
  name: string
  /** Company name */
  company_name?: string
  /** Email address */
  email: string
  /** Phone number */
  phone: string
  /** Sender address */
  address?: InPostAddress
}

/**
 * Address structure for InPost API.
 */
export interface InPostAddress {
  /** Street name with house/apartment number */
  street: string
  /** Building number */
  building_number: string
  /** City */
  city: string
  /** Postal code (format: XX-XXX for Poland) */
  post_code: string
  /** ISO 3166-1 alpha-2 country code */
  country_code: string
}

/**
 * Parcel dimensions and weight.
 */
export interface InPostParcel {
  /** Parcel ID (optional, for existing parcels) */
  id?: string
  /** Template/size: "small" (A), "medium" (B), "large" (C) */
  template?: InPostSize
  /** Dimensions in mm (alternative to template) */
  dimensions?: {
    length: number
    width: number
    height: number
    unit: "mm"
  }
  /** Weight in grams */
  weight: {
    amount: number
    unit: "kg"
  }
  /** Is this a non-standard parcel */
  is_non_standard?: boolean
}

/**
 * POST body for creating a new shipment.
 */
export interface InPostCreateShipmentParams {
  /** Receiver details */
  receiver: InPostReceiver
  /** Sender details (optional — uses organization defaults) */
  sender?: InPostSender
  /** Parcel details */
  parcels: InPostParcel[]
  /** Delivery service */
  service: InPostService
  /** Target Paczkomat point name (for locker delivery) */
  custom_attributes?: {
    /** Paczkomat name, e.g., "KRA012" */
    target_point?: string
    /** Dropoff point for sender (optional) */
    dropoff_point?: string
    /** Sending method */
    sending_method?: "dispatch_order" | "pop" | "parcel_locker"
  }
  /** Cash on delivery amount in PLN (optional) */
  cod?: {
    amount: number
    currency: "PLN"
  }
  /** Insurance value in PLN (optional) */
  insurance?: {
    amount: number
    currency: "PLN"
  }
  /** Your reference number (e.g., order ID) */
  reference?: string
  /** Additional comments for courier */
  comments?: string
  /** External customer ID (for tracking) */
  external_customer_id?: string
}

/**
 * POST body for creating a return shipment.
 */
export interface InPostCreateReturnParams {
  /** Original shipment ID */
  shipment_id: number
  /** Return reason */
  reason?: string
  /** Return Paczkomat point name */
  return_point?: string
}

// ---------------------------------------------------------------------------
// API Response Types
// ---------------------------------------------------------------------------

/**
 * Response from POST /v1/organizations/:id/shipments.
 */
export interface InPostShipmentResponse {
  /** Shipment ID */
  id: number
  /** Shipment status */
  status: InPostShipmentStatus
  /** Tracking number */
  tracking_number: string
  /** Delivery service used */
  service: InPostService
  /** Receiver details */
  receiver: InPostReceiver
  /** Sender details */
  sender: InPostSender
  /** Parcels */
  parcels: Array<InPostParcel & {
    tracking_number?: string
  }>
  /** Custom attributes (target point, etc.) */
  custom_attributes?: {
    target_point?: string
    dropoff_point?: string
    sending_method?: string
  }
  /** COD details */
  cod?: {
    amount: number
    currency: string
  }
  /** Insurance details */
  insurance?: {
    amount: number
    currency: string
  }
  /** Your reference */
  reference?: string
  /** Created timestamp */
  created_at: string
  /** Updated timestamp */
  updated_at: string
  /** Offer details (pricing) */
  offers?: InPostOffer[]
  /** Selected offer */
  selected_offer?: InPostOffer
}

/**
 * Pricing offer from InPost.
 */
export interface InPostOffer {
  /** Offer ID */
  id: number
  /** Service type */
  service: InPostService
  /** Carrier (always "inpost") */
  carrier: string
  /** Status */
  status: string
  /** Expiration date */
  expires_at: string
  /** Rate details */
  rate: {
    /** Net price in PLN */
    net: string
    /** Gross price in PLN */
    gross: string
    /** VAT amount */
    vat: string
    /** Currency */
    currency: "PLN"
  }
}

/**
 * Paczkomat point details.
 */
export interface InPostPoint {
  /** Point name/ID (e.g., "KRA012") */
  name: string
  /** Point type */
  type: Array<"parcel_locker" | "pop" | "parcel_locker_superpop">
  /** Status */
  status: "Operating" | "NonOperating" | "Disabled"
  /** Location */
  location: {
    longitude: number
    latitude: number
  }
  /** Description/location hint */
  location_description: string
  /** Full address */
  address: {
    line1: string
    line2: string
  }
  /** Detailed address */
  address_details: {
    city: string
    province: string
    post_code: string
    street: string
    building_number: string
    flat_number?: string
  }
  /** Operating hours */
  operating_hours?: string
  /** Photo URL */
  image_url?: string
  /** Easy access zone available */
  easy_access_zone?: boolean
  /** Air conditioning */
  air_conditioning?: boolean
  /** Payment available at point */
  payment_available?: boolean
  /** Partner ID */
  partner_id?: number
  /** Payment type */
  payment_type?: string[]
}

/**
 * Tracking event.
 */
export interface InPostTrackingEvent {
  /** Event status */
  status: InPostShipmentStatus
  /** Origin status (from) */
  origin_status?: string
  /** Event timestamp */
  datetime: string
  /** Agency/branch info */
  agency?: {
    name: string
    city: string
  }
}

/**
 * Tracking response.
 */
export interface InPostTrackingResponse {
  /** Tracking number */
  tracking_number: string
  /** Current status */
  status: InPostShipmentStatus
  /** Tracking events (newest first) */
  tracking_details: InPostTrackingEvent[]
  /** Expected delivery date */
  expected_delivery_date?: string
  /** Created timestamp */
  created_at: string
  /** Updated timestamp */
  updated_at: string
  /** Custom attributes */
  custom_attributes?: {
    target_point?: string
  }
}

/**
 * Label format options.
 */
export type InPostLabelFormat = "pdf" | "zpl" | "epl2"

/**
 * Label response (binary data with content-type).
 */
export interface InPostLabelResponse {
  /** Label binary content */
  content: Buffer
  /** Content type (application/pdf, etc.) */
  contentType: string
}

/**
 * Paginated list response from InPost API.
 */
export interface InPostPaginatedResponse<T> {
  /** Items */
  items: T[]
  /** Total count */
  count: number
  /** Current page */
  page: number
  /** Items per page */
  per_page: number
  /** Total pages */
  total_pages: number
}

// ---------------------------------------------------------------------------
// Internal Types (stored in Fulfillment.data)
// ---------------------------------------------------------------------------

/**
 * Data stored in Fulfillment.data after createFulfillment.
 */
export interface InPostFulfillmentData {
  /** Provider identifier */
  provider: "inpost"
  /** InPost shipment ID */
  shipment_id: number
  /** Tracking number */
  tracking_number: string
  /** Current status */
  status: InPostShipmentStatus
  /** Service used */
  service: InPostService
  /** Target Paczkomat point (for locker delivery) */
  target_point?: string
  /** Tracking URL */
  tracking_url: string
  /** Created timestamp */
  created_at: string
}

// ---------------------------------------------------------------------------
// Error Types
// ---------------------------------------------------------------------------

/**
 * InPost API error response structure.
 */
export interface InPostApiError {
  /** HTTP status code */
  status: number
  /** Error key */
  error: string
  /** Human-readable message */
  message: string
  /** Field-level validation errors */
  details?: Record<string, string[]>
}
