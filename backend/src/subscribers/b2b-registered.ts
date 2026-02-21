import {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"

/**
 * Subscriber: customer.created
 *
 * Logs B2B registration events. Email sending will be added
 * once RESEND_API_KEY is configured.
 */
export default async function b2bRegisteredHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  const customerModuleService = container.resolve("customer")

  const customer = await customerModuleService.retrieveCustomer(data.id, {
    relations: ["groups"],
  })

  // Only handle B2B registrations (have vat_id in metadata)
  if (!customer.metadata?.vat_id) {
    return
  }

  const vatStatus = customer.metadata.vat_status || "unknown"
  const vatId = customer.metadata.vat_id

  logger.info(
    `[B2B] New B2B customer: ${customer.email} | VAT: ${vatId} | Status: ${vatStatus}`
  )

  // TODO: Send welcome email when RESEND_API_KEY is set
  // import { sendB2BWelcome } from "../lib/email"
  // await sendB2BWelcome(customer, vatStatus)
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
