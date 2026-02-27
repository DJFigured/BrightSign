/**
 * Comgate Payment Provider — TypeScript Types
 *
 * Based on Comgate API documentation: https://apidoc.comgate.cz/en/
 *
 * This file defines all types used by the Comgate payment provider module.
 * It serves as a TEMPLATE for other payment providers — each section is
 * documented with its purpose and Comgate-specific values.
 */

// ---------------------------------------------------------------------------
// Provider Configuration (from medusa-config.ts options)
// ---------------------------------------------------------------------------

/**
 * Options passed to the Comgate payment provider in medusa-config.ts.
 *
 * Example:
 * ```ts
 * {
 *   resolve: "./src/modules/comgate",
 *   id: "comgate",
 *   options: {
 *     merchantId: process.env.COMGATE_MERCHANT_ID,
 *     secret: process.env.COMGATE_SECRET,
 *     test: process.env.COMGATE_TEST === "true",
 *   },
 * }
 * ```
 */
export interface ComgateOptions {
  /** Comgate merchant ID (e-shop identifier in Comgate system) */
  merchantId: string
  /** Comgate API secret/password */
  secret: string
  /** Use Comgate test/sandbox environment (default: true) */
  test?: boolean
  /** Default payment label prefix (shown on payment page) */
  labelPrefix?: string
}

// ---------------------------------------------------------------------------
// API Request Types
// ---------------------------------------------------------------------------

/**
 * Parameters for POST /v1.0/create — Create a new payment.
 *
 * Comgate uses URL-encoded POST body (application/x-www-form-urlencoded),
 * NOT JSON. All monetary amounts are in the smallest currency unit
 * (e.g., 10000 = 100.00 CZK).
 *
 * Required fields: merchant, price, curr, label, refId, method, secret
 * Optional fields: prepareOnly, email, fullName, test, country, lang
 */
export interface ComgateCreatePaymentParams {
  /** Comgate merchant ID */
  merchant: string
  /** Amount in smallest currency unit (e.g., halere for CZK) */
  price: number
  /** ISO 4217 currency code (CZK, EUR, PLN, etc.) */
  curr: string
  /** Short payment description (visible to payer) */
  label: string
  /** Your unique reference/order ID */
  refId: string
  /** Payment method filter. "ALL" = all available methods */
  method: string
  /** API secret/password */
  secret: string
  /** If true, creates payment without immediate redirect */
  prepareOnly: boolean
  /** Payer email (for receipt) */
  email?: string
  /** Payer full name */
  fullName?: string
  /** Country code (CZ, SK, PL, etc.) */
  country?: string
  /** Language code (cs, sk, en, pl, de, etc.) */
  lang?: string
  /** Enable test mode for this specific payment */
  test?: boolean
}

/**
 * Parameters for POST /v1.0/status — Get payment status.
 */
export interface ComgateStatusParams {
  /** Comgate merchant ID */
  merchant: string
  /** Comgate transaction ID (received from create) */
  transId: string
  /** API secret */
  secret: string
}

/**
 * Parameters for POST /v1.0/cancel — Cancel a pending payment.
 */
export interface ComgateCancelParams {
  /** Comgate merchant ID */
  merchant: string
  /** Comgate transaction ID */
  transId: string
  /** API secret */
  secret: string
}

/**
 * Parameters for POST /v1.0/refund — Refund a paid payment.
 *
 * Supports both full and partial refunds.
 */
export interface ComgateRefundParams {
  /** Comgate merchant ID */
  merchant: string
  /** Comgate transaction ID */
  transId: string
  /** Amount to refund in smallest currency unit */
  amount: number
  /** API secret */
  secret: string
  /** Test mode flag */
  test?: boolean
}

// ---------------------------------------------------------------------------
// API Response Types
// ---------------------------------------------------------------------------

/**
 * Response from POST /v1.0/create.
 *
 * Format: URL-encoded string, e.g.:
 * "code=0&message=OK&transId=AB12-CD34-EF56&redirect=https://..."
 *
 * code=0 means success; any other code is an error.
 */
export interface ComgateCreatePaymentResponse {
  /** Response code. 0 = success */
  code: number
  /** Human-readable status message */
  message: string
  /** Comgate transaction ID (only on success) */
  transId?: string
  /** URL to redirect the payer to (only on success) */
  redirect?: string
}

/**
 * Response from POST /v1.0/status.
 *
 * Returns full payment details including current status.
 */
export interface ComgateStatusResponse {
  /** Response code. 0 = success */
  code: number
  /** Human-readable status message */
  message: string
  /** Comgate merchant ID */
  merchant?: string
  /** Whether this is a test payment */
  test?: boolean
  /** Amount in smallest currency unit */
  price?: number
  /** Currency code */
  curr?: string
  /** Payment description */
  label?: string
  /** Your reference ID */
  refId?: string
  /** Payment method used */
  method?: string
  /** Payer email */
  email?: string
  /** Transaction ID */
  transId?: string
  /** Payment status: PAID, CANCELLED, AUTHORIZED, PENDING */
  status?: ComgatePaymentStatus
}

/**
 * Response from POST /v1.0/cancel and /v1.0/refund.
 */
export interface ComgateSimpleResponse {
  /** Response code. 0 = success */
  code: number
  /** Human-readable status message */
  message: string
}

// ---------------------------------------------------------------------------
// Enums / Constants
// ---------------------------------------------------------------------------

/**
 * Comgate payment statuses.
 *
 * IMPORTANT: Only PAID means the payment is complete.
 * AUTHORIZED means card pre-auth — you still need to capture.
 */
export type ComgatePaymentStatus =
  | "PAID"
  | "CANCELLED"
  | "AUTHORIZED"
  | "PENDING"

/**
 * Map Comgate statuses to Medusa PaymentSessionStatus values.
 */
export const COMGATE_STATUS_MAP: Record<ComgatePaymentStatus, string> = {
  PAID: "authorized",       // Comgate auto-captures, so PAID = authorized in Medusa flow
  CANCELLED: "canceled",
  AUTHORIZED: "authorized", // Card pre-auth
  PENDING: "pending",
}

/**
 * Comgate API endpoints.
 */
export const COMGATE_API = {
  /** Create a new payment */
  CREATE: "https://payments.comgate.cz/v1.0/create",
  /** Get payment status */
  STATUS: "https://payments.comgate.cz/v1.0/status",
  /** Cancel a pending payment */
  CANCEL: "https://payments.comgate.cz/v1.0/cancel",
  /** Refund a completed payment */
  REFUND: "https://payments.comgate.cz/v1.0/refund",
} as const

// ---------------------------------------------------------------------------
// Internal Types (stored in PaymentSession.data / Payment.data)
// ---------------------------------------------------------------------------

/**
 * Data stored in PaymentSession.data after initiatePayment.
 * This is accessible to the storefront (via cart.payment_sessions),
 * so do NOT store secrets here.
 */
export interface ComgateSessionData {
  /** Provider identifier */
  provider: "comgate"
  /** Comgate transaction ID */
  transId: string
  /** Redirect URL for the payer */
  redirectUrl: string
  /** Our internal reference ID */
  refId: string
  /** Amount in smallest currency unit */
  amount: number
  /** Currency code */
  currencyCode: string
  /** Current status */
  status: ComgatePaymentStatus | "CREATED"
}

/**
 * Data stored in Payment.data after authorizePayment.
 */
export interface ComgatePaymentData extends ComgateSessionData {
  /** Timestamp when payment was authorized */
  authorizedAt?: string
  /** Timestamp when payment was captured */
  capturedAt?: string
  /** Timestamp when payment was refunded */
  refundedAt?: string
  /** Total amount refunded (for partial refunds) */
  totalRefunded?: number
}

// ---------------------------------------------------------------------------
// Webhook Types
// ---------------------------------------------------------------------------

/**
 * Comgate webhook (push notification) payload.
 *
 * Comgate sends POST to your callback URL with URL-encoded body:
 * merchant=xxx&test=false&price=10000&curr=CZK&label=...&refId=...
 * &method=CARD_WORLD&email=...&transId=AB12-CD34-EF56&secret=...&status=PAID
 *
 * IMPORTANT: Always verify the payment status via the /status API endpoint.
 * Webhook data alone is NOT reliable per Comgate docs.
 */
export interface ComgateWebhookPayload {
  merchant: string
  test: string
  price: string
  curr: string
  label: string
  refId: string
  method: string
  email: string
  transId: string
  secret: string
  status: ComgatePaymentStatus
}
