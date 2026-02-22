import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { INVOICE_MODULE } from "../../../../../modules/invoice"

export const AUTHENTICATE = false

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params
  const logger = req.scope.resolve("logger") as any

  try {
    const invoiceModule = req.scope.resolve(INVOICE_MODULE) as any

    const invoices = await invoiceModule.listInvoices({
      order_id: id,
    })

    res.json({
      invoices: invoices.map((inv: any) => ({
        id: inv.id,
        type: inv.type,
        number: inv.number,
        status: inv.status,
        issued_at: inv.issued_at,
        due_at: inv.due_at,
        paid_at: inv.paid_at,
        currency_code: inv.currency_code,
        total: Number(inv.total),
        pdf_url: inv.pdf_url,
      })),
    })
  } catch (err: any) {
    logger.error(`[Invoices API] Failed to list invoices for order ${id}: ${err.message}`)
    res.status(500).json({ error: "Failed to list invoices" })
  }
}
