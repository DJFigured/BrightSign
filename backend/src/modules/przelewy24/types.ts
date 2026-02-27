/**
 * Przelewy24 Payment Provider — TypeScript Types
 *
 * Based on Przelewy24 REST API documentation: https://developers.przelewy24.pl/
 *
 * STATUS: SKELETON — Types defined, implementation pending.
 * This will be implemented when PL market reaches 10+ orders/month
 * and direct integration becomes cost-effective vs Stripe P24.
 */

// ---------------------------------------------------------------------------
// Provider Configuration
// ---------------------------------------------------------------------------

/**
 * Options passed to the Przelewy24 payment provider in medusa-config.ts.
 *
 * Get these from the Przelewy24 panel:
 * My Account -> My Data -> API Data and Configuration
 *
 * Example:
 * ```ts
 * {
 *   resolve: "./src/modules/przelewy24",
 *   id: "przelewy24",
 *   options: {
 *     merchantId: process.env.P24_MERCHANT_ID,    // = posId in most cases
 *     posId: process.env.P24_POS_ID,
 *     apiKey: process.env.P24_API_KEY,
 *     crcKey: process.env.P24_CRC_KEY,
 *     sandbox: process.env.P24_SANDBOX === "true",
 *   },
 * }
 * ```
 */
export interface Przelewy24Options {
  /** Merchant ID (P24 panel) */
  merchantId: string
  /** Point of sale ID (usually same as merchantId) */
  posId: string
  /** REST API key (for Authorization header) */
  apiKey: string
  /** CRC key (for signature verification) */
  crcKey: string
  /** Use sandbox environment (default: true) */
  sandbox?: boolean
}

// ---------------------------------------------------------------------------
// API Endpoints
// ---------------------------------------------------------------------------

export const P24_API = {
  /** Production base URL */
  PRODUCTION: "https://secure.przelewy24.pl",
  /** Sandbox base URL */
  SANDBOX: "https://sandbox.przelewy24.pl",

  /** API endpoints (relative to base URL) */
  ENDPOINTS: {
    /** Test connection */
    TEST_ACCESS: "/api/v1/testAccess",
    /** Register a new transaction */
    REGISTER: "/api/v1/transaction/register",
    /** Verify a transaction after payment */
    VERIFY: "/api/v1/transaction/verify",
    /** Get transaction info */
    TRANSACTION_BY_SESSION: "/api/v1/transaction/by/sessionId/",
    /** Refund */
    REFUND: "/api/v1/transaction/refund",
  },
} as const

// ---------------------------------------------------------------------------
// API Request Types
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/transaction/register — Register a new transaction.
 *
 * This creates a payment session at P24. After registration, redirect
 * the customer to: {baseUrl}/trnRequest/{token}
 */
export interface P24RegisterTransactionParams {
  /** Merchant ID */
  merchantId: number
  /** POS ID */
  posId: number
  /** Session ID (your unique reference) */
  sessionId: string
  /** Amount in smallest currency unit (grosze for PLN) */
  amount: number
  /** Currency code (PLN, EUR, etc.) */
  currency: string
  /** Transaction description */
  description: string
  /** Customer email */
  email: string
  /** Country code */
  country: string
  /** Language code (pl, en, de, etc.) */
  language: string
  /** URL to redirect customer after payment */
  urlReturn: string
  /** URL for P24 to send transaction status notifications */
  urlStatus: string
  /** SHA-384 signature */
  sign: string
  /** Time limit for payment in minutes (0 = no limit) */
  timeLimit?: number
  /** Customer name */
  client?: string
  /** Customer phone */
  phone?: string
  /** Encoding (default: UTF-8) */
  encoding?: string
  /** Specific payment method ID (optional) */
  method?: number
}

/**
 * POST /api/v1/transaction/verify — Verify transaction after payment.
 */
export interface P24VerifyTransactionParams {
  /** Merchant ID */
  merchantId: number
  /** POS ID */
  posId: number
  /** Session ID (your unique reference) */
  sessionId: string
  /** Amount in smallest currency unit */
  amount: number
  /** Currency code */
  currency: string
  /** P24 order ID (received in notification) */
  orderId: number
  /** SHA-384 signature */
  sign: string
}

/**
 * POST /api/v1/transaction/refund — Refund transaction.
 */
export interface P24RefundParams {
  /** Request ID (your unique reference for this refund) */
  requestId: string
  /** Array of refunds */
  refunds: Array<{
    /** P24 order ID */
    orderId: number
    /** Session ID */
    sessionId: string
    /** Amount to refund */
    amount: number
    /** Description */
    description: string
  }>
  /** Callback URL for refund status notifications */
  refundsUuid: string
  /** Callback URL */
  urlStatus: string
}

// ---------------------------------------------------------------------------
// API Response Types
// ---------------------------------------------------------------------------

export interface P24RegisterTransactionResponse {
  data: {
    token: string
  }
  responseCode: number
}

export interface P24VerifyTransactionResponse {
  data: {
    status: string
  }
  responseCode: number
}

export interface P24TransactionInfoResponse {
  data: {
    amount: number
    currency: string
    description: string
    email: string
    orderId: number
    sessionId: string
    status: number
    dateCreated: string
    dateCompleted?: string
    statement: string
  }
  responseCode: number
}

// ---------------------------------------------------------------------------
// Webhook Types
// ---------------------------------------------------------------------------

/**
 * P24 sends POST to your urlStatus with transaction notification.
 */
export interface P24WebhookPayload {
  /** Merchant ID */
  merchantId: number
  /** POS ID */
  posId: number
  /** Session ID */
  sessionId: string
  /** Amount */
  amount: number
  /** Original amount */
  originAmount: number
  /** Currency */
  currency: string
  /** P24 order ID */
  orderId: number
  /** P24 method ID used */
  methodId: number
  /** Statement */
  statement: string
  /** Signature for verification */
  sign: string
}

// ---------------------------------------------------------------------------
// Enums / Constants
// ---------------------------------------------------------------------------

/**
 * P24 transaction statuses.
 */
export type P24TransactionStatus =
  | 0   // New
  | 1   // Created (waiting)
  | 2   // Received (payment notification received)
  | 3   // Completed (payment confirmed)
  | 4   // Error (payment error)

/**
 * P24 payment method IDs (most common for Poland).
 */
export const P24_METHODS = {
  BLIK: 150,
  MBANK_TRANSFER: 25,
  ING_BANK: 21,
  PKO_BP: 27,
  INTELIGO: 26,
  SANTANDER: 20,
  BNP_PARIBAS: 83,
  CREDIT_AGRICOLE: 87,
  BANK_PEKAO: 36,
  /** All methods — let customer choose */
  ALL: undefined,
} as const
