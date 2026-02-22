import { AbstractPaymentProvider } from "@medusajs/framework/utils"
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
  WebhookActionResult,
} from "@medusajs/framework/types"

type BankTransferOptions = Record<string, unknown>

/**
 * Bank transfer payment provider.
 * Payment is authorized as "pending" — captured manually or via IMAP bank matching.
 */
class BankTransferPaymentService extends AbstractPaymentProvider<BankTransferOptions> {
  static identifier = "bank-transfer"

  constructor(container: Record<string, unknown>, options: BankTransferOptions) {
    super(container, options)
  }

  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const { amount, currency_code } = input

    // Determine bank account based on currency
    const isCZK = currency_code?.toUpperCase() === "CZK"
    const accountNumber = isCZK
      ? (process.env.INVOICE_ACCOUNT_CZK || "335584589/0300")
      : (process.env.INVOICE_ACCOUNT_EUR || "335645089/0300")
    const iban = isCZK
      ? (process.env.INVOICE_IBAN_CZK || "")
      : (process.env.INVOICE_IBAN_EUR || "")

    return {
      id: `bt_${Date.now()}`,
      data: {
        bank_transfer: true,
        amount,
        currency_code,
        account_number: accountNumber,
        iban,
        bank_name: "ČSOB",
        bic: "CEKOCZPP",
        status: "pending",
      },
    }
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    return {
      data: {
        ...((input.data as Record<string, unknown>) || {}),
        status: "pending",
      },
      status: "pending",
    }
  }

  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    return {
      data: {
        ...((input.data as Record<string, unknown>) || {}),
        status: "captured",
        captured_at: new Date().toISOString(),
      },
    }
  }

  async refundPayment(
    input: RefundPaymentInput
  ): Promise<RefundPaymentOutput> {
    return {
      data: {
        ...((input.data as Record<string, unknown>) || {}),
        status: "refunded",
        refunded_at: new Date().toISOString(),
      },
    }
  }

  async cancelPayment(
    input: CancelPaymentInput
  ): Promise<CancelPaymentOutput> {
    return {
      data: {
        ...((input.data as Record<string, unknown>) || {}),
        status: "canceled",
      },
    }
  }

  async deletePayment(
    input: DeletePaymentInput
  ): Promise<DeletePaymentOutput> {
    return {
      data: (input.data as Record<string, unknown>) || {},
    }
  }

  async updatePayment(
    input: UpdatePaymentInput
  ): Promise<UpdatePaymentOutput> {
    return {
      data: {
        ...((input.data as Record<string, unknown>) || {}),
        amount: input.amount,
        currency_code: input.currency_code,
      },
    }
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    return {
      data: (input.data as Record<string, unknown>) || {},
    }
  }

  async getPaymentStatus(
    input: RetrievePaymentInput
  ): Promise<ReturnType<AbstractPaymentProvider["getPaymentStatus"]> extends Promise<infer R> ? R : never> {
    const data = (input.data as Record<string, unknown>) || {}
    return { status: (data.status as string) || "pending" } as any
  }

  async getWebhookActionAndData(
    payload: {
      data: Record<string, unknown>
      rawData: string | Buffer
      headers: Record<string, unknown>
    }
  ): Promise<WebhookActionResult> {
    return {
      action: "not_supported" as any,
    }
  }
}

export default BankTransferPaymentService
