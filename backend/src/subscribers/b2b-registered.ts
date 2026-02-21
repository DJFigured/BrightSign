import {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { sendB2BWelcome } from "../lib/email"

/**
 * Subscriber: customer.created
 *
 * Handles B2B registration events — logs and sends welcome email.
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

  const vatStatus = (customer.metadata.vat_status as string) || "pending"
  const vatId = customer.metadata.vat_id

  logger.info(
    `[B2B] New B2B customer: ${customer.email} | VAT: ${vatId} | Status: ${vatStatus}`
  )

  await sendB2BWelcome(
    {
      email: customer.email,
      first_name: customer.first_name ?? "",
      company_name: customer.metadata.company_name as string | undefined,
    },
    vatStatus as "valid" | "invalid" | "pending"
  ).catch((err: any) => logger.error(`[B2B Email] Welcome failed: ${err.message}`))
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
