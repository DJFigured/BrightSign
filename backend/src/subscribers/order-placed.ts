import {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"

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

  // TODO: Send order confirmation email when RESEND_API_KEY is set
  // import { sendOrderConfirmation } from "../lib/email.js"
  // await sendOrderConfirmation(order)
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
