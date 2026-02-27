import { AbstractPaymentProvider, MedusaError } from "@medusajs/framework/utils"
import type {
  InitiatePaymentInput,
  InitiatePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  ProviderWebhookPayload,
  WebhookActionResult,
  Logger,
} from "@medusajs/framework/types"

import { P24_API, type Przelewy24Options } from "./types"

// ---------------------------------------------------------------------------
// Przelewy24 HTTP Client (skeleton)
// ---------------------------------------------------------------------------

/**
 * Low-level HTTP client for Przelewy24 REST API.
 *
 * P24 uses JSON over REST with Basic Auth (posId:apiKey).
 * All monetary amounts are in smallest currency units (grosze for PLN).
 *
 * API docs: https://developers.przelewy24.pl/
 *
 * TODO: Implement when PL market reaches 10+ orders/month.
 */
class P24Client {
  private baseUrl: string
  private authHeader: string

  constructor(options: Przelewy24Options) {
    this.baseUrl = options.sandbox !== false
      ? P24_API.SANDBOX
      : P24_API.PRODUCTION

    // Basic Auth: base64(posId:apiKey)
    const credentials = Buffer.from(
      `${options.posId}:${options.apiKey}`
    ).toString("base64")
    this.authHeader = `Basic ${credentials}`
  }

  /**
   * Make an authenticated request to P24 API.
   *
   * TODO: Implement
   */
  async request<T>(
    method: string,
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.authHeader,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`P24 API error (${response.status}): ${text}`)
    }

    return response.json() as Promise<T>
  }

  /**
   * Generate SHA-384 signature for P24 requests.
   *
   * P24 requires HMAC-SHA384 signatures on register and verify requests.
   * The signature is computed over specific fields concatenated with the CRC key.
   *
   * TODO: Implement using crypto module
   *
   * Example for register:
   * sign = SHA384(JSON.stringify({
   *   sessionId, merchantId, amount, currency, crc: crcKey
   * }))
   */
  static computeSign(
    _data: Record<string, unknown>,
    _crcKey: string
  ): string {
    // TODO: Implement SHA-384 signature
    // const crypto = require("crypto")
    // const payload = JSON.stringify(data)
    // return crypto.createHash("sha384").update(payload).digest("hex")
    throw new Error("P24 signature computation not yet implemented")
  }
}

// ---------------------------------------------------------------------------
// Przelewy24 Payment Provider Service (SKELETON)
// ---------------------------------------------------------------------------

/**
 * Przelewy24 Payment Provider for Medusa.js v2.
 *
 * STATUS: SKELETON — All methods throw "not implemented" errors.
 *
 * This module will be fully implemented when the Polish market generates
 * enough volume (10+ orders/month) to justify direct integration
 * over the current Stripe + P24 approach.
 *
 * Current PL payment handling: Stripe with Przelewy24 payment method
 * (stripe-przelewy24 in medusa-config.ts, 1.8% + 0.25 EUR per transaction).
 *
 * Direct P24 integration benefits:
 * - Lower fees: ~1.0-1.5% vs Stripe's 1.8% + 0.25 EUR
 * - More payment methods (BLIK, specific banks)
 * - Better UX for Polish customers
 * - PLN settlements without currency conversion
 *
 * Payment flow (when implemented):
 * 1. initiatePayment() -> Register transaction at P24, get token
 * 2. Storefront redirects to: {p24_base_url}/trnRequest/{token}
 * 3. Customer pays on P24 page
 * 4. P24 sends POST to urlStatus (our webhook)
 * 5. getWebhookActionAndData() -> Verify transaction, return action
 * 6. Medusa completes the order
 *
 * Configuration (when ready):
 * ```ts
 * {
 *   resolve: "./src/modules/przelewy24",
 *   id: "przelewy24",
 *   options: {
 *     merchantId: process.env.P24_MERCHANT_ID,
 *     posId: process.env.P24_POS_ID,
 *     apiKey: process.env.P24_API_KEY,
 *     crcKey: process.env.P24_CRC_KEY,
 *     sandbox: process.env.P24_SANDBOX === "true",
 *   },
 * }
 * ```
 *
 * Env variables:
 * - P24_MERCHANT_ID: Your merchant ID from P24 panel
 * - P24_POS_ID: Point-of-sale ID (usually same as merchantId)
 * - P24_API_KEY: REST API key from P24 panel
 * - P24_CRC_KEY: CRC key for signature verification
 * - P24_SANDBOX: "true" for sandbox environment
 *
 * Webhook URL: https://api.brightsign.cz/hooks/payment/przelewy24_przelewy24
 *
 * @see https://developers.przelewy24.pl/
 */
class Przelewy24PaymentService extends AbstractPaymentProvider<Przelewy24Options> {
  static identifier = "przelewy24"

  protected logger_: Logger
  protected options_: Przelewy24Options
  protected client_: P24Client

  static validateOptions(options: Record<string, unknown>): void {
    if (!options.merchantId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Przelewy24: merchantId is required. Set P24_MERCHANT_ID environment variable."
      )
    }
    if (!options.apiKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Przelewy24: apiKey is required. Set P24_API_KEY environment variable."
      )
    }
    if (!options.crcKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Przelewy24: crcKey is required. Set P24_CRC_KEY environment variable."
      )
    }
  }

  constructor(
    container: Record<string, unknown>,
    options: Przelewy24Options
  ) {
    super(container, options)
    this.logger_ = (container.logger as Logger) || console
    this.options_ = options
    this.client_ = new P24Client(options)
  }

  // -------------------------------------------------------------------------
  // Core Payment Methods — ALL PLACEHOLDER
  // -------------------------------------------------------------------------

  /**
   * TODO: Implement — Register transaction at P24, return redirect URL.
   *
   * Steps:
   * 1. Generate sessionId (unique reference)
   * 2. Compute SHA-384 signature
   * 3. POST to /api/v1/transaction/register
   * 4. Return { id: token, data: { redirectUrl, sessionId, token } }
   */
  async initiatePayment(
    _input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Przelewy24 direct integration is not yet implemented. Use Stripe + P24 for now."
    )
  }

  /**
   * TODO: Implement — Verify transaction after payment notification.
   *
   * Steps:
   * 1. Read transactionId from data
   * 2. POST to /api/v1/transaction/verify
   * 3. Return { status: "authorized", data: { ... } }
   */
  async authorizePayment(
    _input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Przelewy24 direct integration is not yet implemented."
    )
  }

  /**
   * TODO: Implement — P24 auto-captures, so this is mostly a status check.
   */
  async capturePayment(
    _input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Przelewy24 direct integration is not yet implemented."
    )
  }

  /**
   * TODO: Implement — POST to /api/v1/transaction/refund.
   *
   * Steps:
   * 1. Read orderId from data
   * 2. Generate requestId
   * 3. POST refund request
   * 4. Return updated data
   */
  async refundPayment(
    _input: RefundPaymentInput
  ): Promise<RefundPaymentOutput> {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Przelewy24 direct integration is not yet implemented."
    )
  }

  /**
   * TODO: Implement — No P24 cancel API exists for completed payments.
   * For pending payments, they expire automatically.
   */
  async cancelPayment(
    input: CancelPaymentInput
  ): Promise<CancelPaymentOutput> {
    return {
      data: { ...(input.data || {}), status: "cancelled" },
    }
  }

  async deletePayment(
    input: DeletePaymentInput
  ): Promise<DeletePaymentOutput> {
    return { data: input.data || {} }
  }

  /**
   * TODO: Implement — Cancel existing + register new transaction.
   */
  async updatePayment(
    _input: UpdatePaymentInput
  ): Promise<UpdatePaymentOutput> {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Przelewy24 direct integration is not yet implemented."
    )
  }

  /**
   * TODO: Implement — GET /api/v1/transaction/by/sessionId/{sessionId}
   */
  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    return { data: input.data || {} }
  }

  async getPaymentStatus(
    _input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    return { status: "pending" }
  }

  /**
   * TODO: Implement — Handle P24 transaction status notification.
   *
   * Steps:
   * 1. Parse POST body (JSON with merchantId, posId, sessionId, amount, orderId, sign)
   * 2. Verify SHA-384 signature using CRC key
   * 3. POST to /api/v1/transaction/verify to confirm payment
   * 4. Return { action: "authorized", data: { session_id, amount } }
   */
  async getWebhookActionAndData(
    _payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    this.logger_.warn("Przelewy24 webhook received but not yet implemented")
    return { action: "not_supported" }
  }
}

export default Przelewy24PaymentService
