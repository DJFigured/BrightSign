import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { INVOICE_MODULE } from "../../../modules/invoice"

/**
 * GET /admin/invoices — list all invoices with filtering
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const invoiceModule = req.scope.resolve(INVOICE_MODULE) as any
  const { status, type } = req.query as { status?: string; type?: string }

  const filters: Record<string, unknown> = {}
  if (status) filters.status = status
  if (type) filters.type = type

  const invoices = await invoiceModule.listInvoices(filters, {
    order: { created_at: "DESC" },
    take: 100,
  })

  res.json({
    invoices: invoices.map((inv: any) => ({
      id: inv.id,
      order_id: inv.order_id,
      type: inv.type,
      number: inv.number,
      status: inv.status,
      issued_at: inv.issued_at,
      due_at: inv.due_at,
      paid_at: inv.paid_at,
      currency_code: inv.currency_code,
      subtotal: Number(inv.subtotal),
      tax_total: Number(inv.tax_total),
      total: Number(inv.total),
      pdf_url: inv.pdf_url,
      metadata: inv.metadata,
      created_at: inv.created_at,
    })),
  })
}
