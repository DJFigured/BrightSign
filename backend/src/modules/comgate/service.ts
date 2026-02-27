import { AbstractPaymentProvider, MedusaError } from "@medusajs/framework/utils"
import { BigNumber } from "@medusajs/framework/utils"
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

import {
  COMGATE_API,
  COMGATE_STATUS_MAP,
  type ComgateOptions,
  type ComgateCreatePaymentResponse,
  type ComgateStatusResponse,
  type ComgateSimpleResponse,
  type ComgatePaymentStatus,
  type ComgateSessionData,
  type ComgatePaymentData,
} from "./types"

// ---------------------------------------------------------------------------
// Comgate HTTP Client (internal)
// ---------------------------------------------------------------------------

/**
 * Low-level HTTP client for Comgate API.
 *
 * Comgate uses URL-encoded POST bodies and returns URL-encoded responses.
 * This is unusual for modern APIs, so we handle encoding/decoding here.
 *
 * All methods are static to keep the service class clean.
 */
class ComgateClient {
  /**
   * Send a POST request to a Comgate API endpoint.
   *
   * @param url - Full API URL
   * @param params - Key-value pairs for the POST body
   * @returns Parsed response as key-value object
   */
  static async post(
    url: string,
    params: Record<string, string | number | boolean | undefined>,
    logger?: Logger
  ): Promise<Record<string, string>> {
    // Filter out undefined values and convert all to strings
    const body = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        body.append(key, String(value))
      }
    }

    logger?.debug(`Comgate API request: ${url}`)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    })

    const text = await response.text()

    logger?.debug(`Comgate API response (${response.status}): ${text}`)

    // Parse URL-encoded response into key-value pairs
    return ComgateClient.parseResponse(text)
  }

  /**
   * Parse URL-encoded response string into an object.
   *
   * Example input: "code=0&message=OK&transId=AB12-CD34-EF56"
   * Example output: { code: "0", message: "OK", transId: "AB12-CD34-EF56" }
   */
  static parseResponse(text: string): Record<string, string> {
    const result: Record<string, string> = {}
    const params = new URLSearchParams(text.trim())
    params.forEach((value, key) => {
      result[key] = value
    })
    return result
  }
}

// ---------------------------------------------------------------------------
// Comgate Payment Provider Service
// ---------------------------------------------------------------------------

/**
 * Comgate Payment Provider for Medusa.js v2.
 *
 * Payment flow:
 * 1. initiatePayment() -> Creates payment at Comgate, returns redirect URL
 * 2. Storefront redirects customer to Comgate payment page
 * 3. Customer pays on Comgate page
 * 4. Comgate sends webhook to our callback URL
 * 5. getWebhookActionAndData() -> Verifies payment status, returns action
 * 6. Medusa handles the rest (authorize, capture, etc.)
 *
 * Configuration in medusa-config.ts:
 * ```ts
 * {
 *   resolve: "@medusajs/medusa/payment",
 *   options: {
 *     providers: [
 *       {
 *         resolve: "./src/modules/comgate",
 *         id: "comgate",
 *         options: {
 *           merchantId: process.env.COMGATE_MERCHANT_ID,
 *           secret: process.env.COMGATE_SECRET,
 *           test: process.env.COMGATE_TEST === "true",
 *         },
 *       },
 *     ],
 *   },
 * }
 * ```
 *
 * Environment variables:
 * - COMGATE_MERCHANT_ID: Your merchant ID from Comgate portal
 * - COMGATE_SECRET: Your API secret from Comgate portal
 * - COMGATE_TEST: "true" for sandbox, "false" for production
 *
 * Webhook URL to configure in Comgate portal:
 *   https://api.brightsign.cz/hooks/payment/comgate_comgate
 *
 * @see https://apidoc.comgate.cz/en/
 */
class ComgatePaymentService extends AbstractPaymentProvider<ComgateOptions> {
  static identifier = "comgate"

  protected logger_: Logger
  protected options_: ComgateOptions

  /**
   * Validate provider options at startup.
   * This runs when Medusa loads the module — fail fast if config is wrong.
   */
  static validateOptions(options: Record<string, unknown>): void {
    if (!options.merchantId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Comgate: merchantId is required. Set COMGATE_MERCHANT_ID environment variable."
      )
    }
    if (!options.secret) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Comgate: secret is required. Set COMGATE_SECRET environment variable."
      )
    }
  }

  constructor(
    container: Record<string, unknown>,
    options: ComgateOptions
  ) {
    super(container, options)
    this.logger_ = (container.logger as Logger) || console
    this.options_ = options
  }

  // -------------------------------------------------------------------------
  // Core Payment Methods
  // -------------------------------------------------------------------------

  /**
   * Create a payment session at Comgate.
   *
   * This is called when the customer selects Comgate as their payment method
   * during checkout. We create a payment at Comgate and store the redirect URL
   * in the session data so the storefront can redirect the customer.
   *
   * The `data` returned here is accessible to the storefront via
   * `cart.payment_session.data` — so the frontend can read `redirectUrl`
   * and redirect the customer.
   */
  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const { amount, currency_code, context } = input

    // Generate a unique reference ID for this payment
    const refId = `bs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    // Determine the label (payment description shown to customer)
    const label = this.options_.labelPrefix
      ? `${this.options_.labelPrefix} ${refId}`
      : `BrightSign order ${refId}`

    // Extract customer info if available
    const email = context?.customer?.email
    const fullName = context?.customer?.first_name && context?.customer?.last_name
      ? `${context.customer.first_name} ${context.customer.last_name}`
      : undefined

    try {
      const response = await ComgateClient.post(
        COMGATE_API.CREATE,
        {
          merchant: this.options_.merchantId,
          price: Number(amount),
          curr: currency_code.toUpperCase(),
          label,
          refId,
          method: "ALL",
          secret: this.options_.secret,
          prepareOnly: true,
          test: this.options_.test ?? true,
          email,
          fullName,
        },
        this.logger_
      )

      const parsed = this.parseCreateResponse(response)

      if (parsed.code !== 0 || !parsed.transId || !parsed.redirect) {
        this.logger_.error(
          `Comgate create payment failed: code=${parsed.code}, message=${parsed.message}`
        )
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Comgate payment creation failed: ${parsed.message || "Unknown error"}`
        )
      }

      const sessionData: ComgateSessionData = {
        provider: "comgate",
        transId: parsed.transId,
        redirectUrl: parsed.redirect,
        refId,
        amount: Number(amount),
        currencyCode: currency_code.toUpperCase(),
        status: "CREATED",
      }

      return {
        id: parsed.transId,
        data: sessionData as unknown as Record<string, unknown>,
      }
    } catch (error) {
      if (error instanceof MedusaError) throw error

      this.logger_.error(`Comgate API error: ${(error as Error).message}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Comgate API error: ${(error as Error).message}`
      )
    }
  }

  /**
   * Authorize the payment.
   *
   * For Comgate, authorization happens externally (customer pays on Comgate page).
   * By the time this method is called, we should already have received a webhook
   * confirming the payment status.
   *
   * We verify the payment status with Comgate API to be safe.
   */
  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    const data = input.data as unknown as ComgateSessionData | undefined

    if (!data?.transId) {
      // No Comgate transaction — return pending (customer hasn't paid yet)
      return {
        data: { ...(input.data || {}), status: "PENDING" },
        status: "pending",
      }
    }

    try {
      // Verify the payment status with Comgate
      const status = await this.fetchPaymentStatus(data.transId)

      const paymentData: ComgatePaymentData = {
        ...data,
        status,
        authorizedAt:
          status === "PAID" || status === "AUTHORIZED"
            ? new Date().toISOString()
            : undefined,
      }

      const medusaStatus = COMGATE_STATUS_MAP[status] || "pending"

      return {
        data: paymentData as unknown as Record<string, unknown>,
        status: medusaStatus as "authorized" | "pending" | "canceled",
      }
    } catch (error) {
      this.logger_.error(`Comgate authorize error: ${(error as Error).message}`)
      return {
        data: { ...(input.data || {}), status: "PENDING" },
        status: "pending",
      }
    }
  }

  /**
   * Capture the payment.
   *
   * Comgate auto-captures card payments (PAID status), so this is mostly
   * a no-op. We just verify the status and update our records.
   *
   * For AUTHORIZED (pre-auth) payments, Comgate handles capture on their side.
   */
  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    const data = input.data as unknown as ComgatePaymentData | undefined

    if (!data?.transId) {
      return {
        data: {
          ...(input.data || {}),
          status: "PAID",
          capturedAt: new Date().toISOString(),
        },
      }
    }

    try {
      // Verify payment is actually paid at Comgate
      const status = await this.fetchPaymentStatus(data.transId)

      if (status !== "PAID") {
        this.logger_.warn(
          `Comgate capture: payment ${data.transId} status is ${status}, expected PAID`
        )
      }

      return {
        data: {
          ...data,
          status: status,
          capturedAt: new Date().toISOString(),
        } as unknown as Record<string, unknown>,
      }
    } catch (error) {
      this.logger_.error(`Comgate capture error: ${(error as Error).message}`)
      // Don't fail capture — the payment might still be valid
      return {
        data: {
          ...data,
          status: "PAID",
          capturedAt: new Date().toISOString(),
        } as unknown as Record<string, unknown>,
      }
    }
  }

  /**
   * Refund a payment via Comgate API.
   *
   * Supports partial refunds. Comgate endpoint: POST /v1.0/refund
   * Payment must be in PAID status to refund.
   */
  async refundPayment(
    input: RefundPaymentInput
  ): Promise<RefundPaymentOutput> {
    const data = input.data as unknown as ComgatePaymentData | undefined

    if (!data?.transId) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Comgate refund: missing transaction ID"
      )
    }

    try {
      const response = await ComgateClient.post(
        COMGATE_API.REFUND,
        {
          merchant: this.options_.merchantId,
          transId: data.transId,
          amount: Number(input.amount),
          secret: this.options_.secret,
          test: this.options_.test ?? true,
        },
        this.logger_
      )

      const code = parseInt(response.code || "1", 10)

      if (code !== 0) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Comgate refund failed: ${response.message || "Unknown error"}`
        )
      }

      const previousRefunded = data.totalRefunded || 0

      return {
        data: {
          ...data,
          refundedAt: new Date().toISOString(),
          totalRefunded: previousRefunded + Number(input.amount),
        } as unknown as Record<string, unknown>,
      }
    } catch (error) {
      if (error instanceof MedusaError) throw error

      this.logger_.error(`Comgate refund error: ${(error as Error).message}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Comgate refund API error: ${(error as Error).message}`
      )
    }
  }

  /**
   * Cancel a pending payment via Comgate API.
   *
   * Only works for payments in PENDING status (not yet paid).
   * Comgate endpoint: POST /v1.0/cancel
   */
  async cancelPayment(
    input: CancelPaymentInput
  ): Promise<CancelPaymentOutput> {
    const data = input.data as unknown as ComgatePaymentData | undefined

    if (!data?.transId) {
      return {
        data: { ...(input.data || {}), status: "CANCELLED" },
      }
    }

    try {
      const response = await ComgateClient.post(
        COMGATE_API.CANCEL,
        {
          merchant: this.options_.merchantId,
          transId: data.transId,
          secret: this.options_.secret,
        },
        this.logger_
      )

      const code = parseInt(response.code || "1", 10)

      // Code 0 = success, but also accept if payment is already cancelled
      if (code !== 0) {
        this.logger_.warn(
          `Comgate cancel response: code=${code}, message=${response.message}`
        )
      }

      return {
        data: {
          ...data,
          status: "CANCELLED",
        } as unknown as Record<string, unknown>,
      }
    } catch (error) {
      this.logger_.error(`Comgate cancel error: ${(error as Error).message}`)
      // Don't throw on cancel errors — the payment session should still be deletable
      return {
        data: {
          ...data,
          status: "CANCELLED",
        } as unknown as Record<string, unknown>,
      }
    }
  }

  /**
   * Delete a payment session.
   *
   * Called when the customer changes payment method. We cancel the Comgate
   * payment if it exists.
   */
  async deletePayment(
    input: DeletePaymentInput
  ): Promise<DeletePaymentOutput> {
    const data = input.data as unknown as ComgateSessionData | undefined

    // Try to cancel at Comgate if we have a transaction ID
    if (data?.transId) {
      try {
        await ComgateClient.post(
          COMGATE_API.CANCEL,
          {
            merchant: this.options_.merchantId,
            transId: data.transId,
            secret: this.options_.secret,
          },
          this.logger_
        )
      } catch {
        // Ignore cancel errors on delete — the payment might already be expired
        this.logger_.debug(
          `Comgate: could not cancel payment ${data.transId} during delete (may be expired)`
        )
      }
    }

    return {
      data: input.data || {},
    }
  }

  /**
   * Update a payment session (e.g., amount change).
   *
   * For Comgate, we need to cancel the existing payment and create a new one
   * because Comgate doesn't support updating payment amounts.
   */
  async updatePayment(
    input: UpdatePaymentInput
  ): Promise<UpdatePaymentOutput> {
    const data = input.data as unknown as ComgateSessionData | undefined

    // Cancel existing payment at Comgate if exists
    if (data?.transId) {
      try {
        await ComgateClient.post(
          COMGATE_API.CANCEL,
          {
            merchant: this.options_.merchantId,
            transId: data.transId,
            secret: this.options_.secret,
          },
          this.logger_
        )
      } catch {
        // Ignore — payment might already be expired
      }
    }

    // Create a new payment with updated amount
    const result = await this.initiatePayment({
      amount: input.amount,
      currency_code: input.currency_code,
      context: input.context,
      data: input.data,
    })

    return {
      data: result.data,
    }
  }

  /**
   * Retrieve payment data.
   *
   * Fetches the latest status from Comgate API and returns merged data.
   */
  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    const data = input.data as unknown as ComgateSessionData | undefined

    if (!data?.transId) {
      return { data: input.data || {} }
    }

    try {
      const status = await this.fetchPaymentStatus(data.transId)
      return {
        data: { ...data, status } as unknown as Record<string, unknown>,
      }
    } catch {
      return { data: input.data || {} }
    }
  }

  /**
   * Get payment session status by querying Comgate API.
   */
  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const data = input.data as unknown as ComgateSessionData | undefined

    if (!data?.transId) {
      return { status: "pending" }
    }

    try {
      const comgateStatus = await this.fetchPaymentStatus(data.transId)
      const medusaStatus = COMGATE_STATUS_MAP[comgateStatus] || "pending"
      return {
        status: medusaStatus as "authorized" | "pending" | "canceled",
      }
    } catch {
      return { status: "pending" }
    }
  }

  // -------------------------------------------------------------------------
  // Webhook Handler
  // -------------------------------------------------------------------------

  /**
   * Handle incoming Comgate webhook.
   *
   * Comgate sends POST to /hooks/payment/comgate_comgate with URL-encoded body.
   *
   * IMPORTANT: Per Comgate docs, webhook data is NOT reliable on its own.
   * We ALWAYS verify the payment status via the /status API endpoint.
   *
   * Webhook flow:
   * 1. Parse webhook body (URL-encoded: transId, status, refId, etc.)
   * 2. Verify payment status via Comgate /status endpoint
   * 3. Return appropriate action for Medusa to handle
   *
   * Actions:
   * - "authorized" → Medusa completes the cart and creates an order
   * - "captured" → Medusa captures the payment
   * - "failed" → Medusa marks the payment as failed
   * - "not_supported" → Medusa ignores the webhook
   */
  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    const { data, rawData, headers } = payload

    try {
      // Parse the webhook body
      // Comgate sends URL-encoded body, which Medusa may parse into `data`
      // or provide as rawData string
      let transId: string | undefined
      let refId: string | undefined
      let webhookStatus: string | undefined

      if (data && typeof data === "object") {
        transId = data.transId as string
        refId = data.refId as string
        webhookStatus = data.status as string
      } else if (rawData) {
        const bodyStr = typeof rawData === "string" ? rawData : rawData.toString()
        const parsed = ComgateClient.parseResponse(bodyStr)
        transId = parsed.transId
        refId = parsed.refId
        webhookStatus = parsed.status
      }

      if (!transId) {
        this.logger_.warn("Comgate webhook: missing transId")
        return { action: "not_supported" }
      }

      this.logger_.info(
        `Comgate webhook received: transId=${transId}, status=${webhookStatus}, refId=${refId}`
      )

      // ALWAYS verify with Comgate API — webhook data is not reliable
      const verifiedStatus = await this.fetchPaymentStatus(transId)

      this.logger_.info(
        `Comgate webhook verified: transId=${transId}, verified_status=${verifiedStatus}`
      )

      switch (verifiedStatus) {
        case "PAID":
          // Payment is complete — authorize in Medusa (Comgate auto-captures)
          return {
            action: "authorized",
            data: {
              session_id: transId,
              amount: new BigNumber(
                (data as Record<string, unknown>)?.price
                  ? Number((data as Record<string, unknown>).price)
                  : 0
              ),
            },
          }

        case "AUTHORIZED":
          // Card pre-authorized — authorize in Medusa
          return {
            action: "authorized",
            data: {
              session_id: transId,
              amount: new BigNumber(
                (data as Record<string, unknown>)?.price
                  ? Number((data as Record<string, unknown>).price)
                  : 0
              ),
            },
          }

        case "CANCELLED":
          return {
            action: "canceled",
            data: {
              session_id: transId,
              amount: new BigNumber(0),
            },
          }

        case "PENDING":
          return {
            action: "pending",
            data: {
              session_id: transId,
              amount: new BigNumber(0),
            },
          }

        default:
          this.logger_.warn(
            `Comgate webhook: unknown status ${verifiedStatus} for transId=${transId}`
          )
          return { action: "not_supported" }
      }
    } catch (error) {
      this.logger_.error(
        `Comgate webhook error: ${(error as Error).message}`
      )
      return {
        action: "failed",
        data: {
          session_id: (data as Record<string, unknown>)?.transId as string || "",
          amount: new BigNumber(0),
        },
      }
    }
  }

  // -------------------------------------------------------------------------
  // Private Helpers
  // -------------------------------------------------------------------------

  /**
   * Fetch payment status from Comgate /status API.
   *
   * This is the single source of truth for payment status.
   * Called from authorize, capture, webhook, and getPaymentStatus.
   */
  private async fetchPaymentStatus(
    transId: string
  ): Promise<ComgatePaymentStatus> {
    const response = await ComgateClient.post(
      COMGATE_API.STATUS,
      {
        merchant: this.options_.merchantId,
        transId,
        secret: this.options_.secret,
      },
      this.logger_
    )

    const code = parseInt(response.code || "1", 10)

    if (code !== 0) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Comgate status check failed: ${response.message || "Unknown error"}`
      )
    }

    return (response.status as ComgatePaymentStatus) || "PENDING"
  }

  /**
   * Parse the create payment response.
   */
  private parseCreateResponse(
    response: Record<string, string>
  ): ComgateCreatePaymentResponse {
    return {
      code: parseInt(response.code || "1", 10),
      message: response.message || "",
      transId: response.transId,
      redirect: response.redirect,
    }
  }
}

export default ComgatePaymentService
