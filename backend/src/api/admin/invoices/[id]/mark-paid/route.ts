import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { INVOICE_MODULE } from "../../../../../modules/invoice"
import { createInvoiceForOrder } from "../../../../../lib/invoice-service"

/**
 * POST /admin/invoices/:id/mark-paid — manually mark a proforma as paid.
 * Triggers creation of final invoice.
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params
  const logger = req.scope.resolve("logger") as any
  const invoiceModule = req.scope.resolve(INVOICE_MODULE) as any
  const orderModule = req.scope.resolve("order") as any

  try {
    // Get the proforma
    const invoice = await invoiceModule.retrieveInvoice(id)
    if (!invoice) {
      res.status(404).json({ error: "Invoice not found" })
      return
    }

    if (invoice.status === "paid") {
      res.status(400).json({ error: "Invoice is already paid" })
      return
    }

    // Mark proforma as paid
    const paidAt = new Date()
    await invoiceModule.updateInvoices(id, {
      status: "paid",
      paid_at: paidAt,
    })

    logger.info(`[Invoice] Manually marked ${invoice.number} as paid`)

    // Generate final invoice if this was a proforma
    if (invoice.type === "proforma") {
      try {
        const order = await orderModule.retrieveOrder(invoice.order_id, {
          relations: ["items", "shipping_address"],
        })
        const result = await createInvoiceForOrder(req.scope, {
          id: order.id,
          display_id: order.display_id ?? null,
          email: order.email || "",
          currency_code: order.currency_code || "CZK",
          subtotal: order.subtotal,
          tax_total: order.tax_total,
          total: order.total,
          items: order.items,
          shipping_address: order.shipping_address,
          metadata: order.metadata,
        })
        logger.info(`[Invoice] Final invoice ${result.number} created after manual payment confirmation`)
      } catch (err: any) {
        logger.error(`[Invoice] Failed to create final invoice: ${err.message}`)
      }
    }

    res.json({ success: true, paid_at: paidAt.toISOString() })
  } catch (err: any) {
    logger.error(`[Invoice Mark Paid] Failed: ${err.message}`)
    res.status(500).json({ error: "Failed to mark as paid" })
  }
}
