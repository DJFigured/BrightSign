import {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"

export default async function orderPaymentCapturedHandler({
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
    `[Order] Payment captured for #${order.display_id} — ${totalFormatted}`
  )

  // Fulfillment trigger point:
  // 1. Admin places order with COMM-TEC manually
  // 2. Admin marks order as fulfilled in Medusa /app
  // 3. Customer receives shipping notification

  // TODO: Notify admin (obchod@brightsign.cz) of new order to fulfill
  // TODO: Send payment confirmed email to customer
}

export const config: SubscriberConfig = {
  event: "order.payment_captured",
}
