import {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { sendOrderConfirmation } from "../lib/email"

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
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
