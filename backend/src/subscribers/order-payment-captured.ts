import {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { sendEmail } from "../lib/email"

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

  // Notify admin about new order to fulfill
  const adminUrl = process.env.BACKEND_URL || "http://localhost:9000"
  await sendEmail({
    to: process.env.ADMIN_EMAIL || "obchod@brightsign.cz",
    subject: `Nová objednávka k vyřízení #${order.display_id || order.id}`,
    html: `<p>Objednávka <strong>#${order.display_id || order.id}</strong> byla zaplacena.</p>
<p>Celkem: ${totalFormatted}</p>
<p>Zákazník: ${order.email || "neznámý"}</p>
<p><a href="${adminUrl}/app/orders/${order.id}">Otevřít v Admin panelu</a></p>`,
  }).catch((err: any) => logger.error(`[Admin Email] Failed: ${err.message}`))
}

export const config: SubscriberConfig = {
  event: "order.payment_captured",
}
