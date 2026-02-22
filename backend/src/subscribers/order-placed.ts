import {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { sendOrderConfirmation } from "../lib/email"
import { createProformaForOrder, createInvoiceForOrder } from "../lib/invoice-service"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  const orderModuleService = container.resolve("order")

  const order = await orderModuleService.retrieveOrder(data.id, {
    relations: ["items", "shipping_address"],
  })

  // order.total is BigNumber in Medusa v2
  const totalAmount = Number(order.total) / 100
  const currency = order.currency_code?.toUpperCase() ?? ""
  const totalFormatted = `${totalAmount.toFixed(2)} ${currency}`

  logger.info(
    `[Order] #${order.display_id} placed by ${order.email} — ${totalFormatted} — ${order.items?.length ?? 0} item(s)`
  )

  // Send order confirmation email
  if (order.email) {
    await sendOrderConfirmation({
      id: order.id,
      display_id: order.display_id ?? 0,
      email: order.email,
      total: Number(order.total),
      currency_code: order.currency_code ?? "CZK",
      items: (order.items ?? []).map((item: any) => ({
        title: item.title || item.product_title || "Produkt",
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
      })),
    }).catch((err: any) => logger.error(`[Order Email] Failed to send confirmation: ${err.message}`))
  }

  // Generate invoice/proforma based on payment method
  try {
    const paymentModule = container.resolve("payment") as any
    let isBankTransfer = false

    try {
      // Try to detect bank transfer via payment collections
      // Use order.id to find related payment collections
      const paymentCollections = await paymentModule.listPaymentCollections(
        {},
        { relations: ["payment_sessions"] }
      )
      // Find the most recent collection that matches
      for (const collection of paymentCollections || []) {
        const sessions = collection?.payment_sessions || []
        if (sessions.some((s: any) => s.provider_id === "pp_bank-transfer_bank-transfer")) {
          isBankTransfer = true
          break
        }
      }
    } catch {
      logger.info("[Invoice] Could not determine payment method, generating final invoice")
    }

    const orderData = {
      id: order.id,
      display_id: order.display_id ?? null,
      email: order.email || "",
      currency_code: order.currency_code || "CZK",
      subtotal: order.subtotal,
      tax_total: order.tax_total,
      total: order.total,
      items: (order.items ?? []) as any[],
      shipping_address: order.shipping_address as any,
      metadata: (order.metadata as Record<string, unknown>) || null,
    }

    if (isBankTransfer) {
      const result = await createProformaForOrder(container, orderData)
      logger.info(`[Invoice] Proforma ${result.number} created for order #${order.display_id}`)
    } else {
      const result = await createInvoiceForOrder(container, orderData)
      logger.info(`[Invoice] Invoice ${result.number} created for order #${order.display_id}`)
    }
  } catch (err: any) {
    logger.error(`[Invoice] Failed to generate invoice for order #${order.display_id}: ${err.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
