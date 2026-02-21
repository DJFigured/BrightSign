import { MedusaContainer } from "@medusajs/framework/types"
import { validateVatNumber } from "../lib/vies"
import { sendB2BValidated } from "../lib/email"

/**
 * Scheduled job: vies-retry
 *
 * Runs every 6 hours. Retries VIES validation for b2b_pending customers
 * that have vat_status === 'pending'. Updates group to b2b_standard if valid.
 */
export default async function viesRetryJob(container: MedusaContainer) {
  const logger = container.resolve("logger")
  const customerModuleService = container.resolve("customer")

  logger.info("[VIES Retry] Starting scheduled VIES retry job")

  // Find pending B2B customers
  const pendingGroups = await customerModuleService.listCustomerGroups({
    name: "b2b_pending",
  })

  if (!pendingGroups.length) {
    logger.info("[VIES Retry] No b2b_pending group found, skipping")
    return
  }

  const pendingGroupId = pendingGroups[0].id

  const customers = await customerModuleService.listCustomers({
    groups: { id: pendingGroupId },
  })

  const toRetry = customers.filter(
    (c) => c.metadata?.vat_status === "pending" && c.metadata?.vat_id
  )

  logger.info(`[VIES Retry] Found ${toRetry.length} customers to retry`)

  for (const customer of toRetry) {
    const vatId = customer.metadata!.vat_id as string
    const countryCode = customer.metadata!.vat_country as string
    const vatNumber = customer.metadata!.vat_number as string

    try {
      const result = await validateVatNumber(countryCode, vatNumber)

      if (result.valid) {
        // Move to b2b_standard
        const standardGroups = await customerModuleService.listCustomerGroups({
          name: "b2b_standard",
        })

        if (standardGroups.length > 0) {
          await customerModuleService.removeCustomerFromGroup({
            customer_id: customer.id,
            customer_group_id: pendingGroupId,
          })
          await customerModuleService.addCustomerToGroup({
            customer_id: customer.id,
            customer_group_id: standardGroups[0].id,
          })
        }

        await customerModuleService.updateCustomers(customer.id, {
          metadata: {
            ...customer.metadata,
            vat_status: "valid",
            vat_company_name: result.name,
            vat_company_address: result.address,
            vat_validated_at: new Date().toISOString(),
          },
        })

        logger.info(
          `[VIES Retry] Validated ${customer.email} (${vatId}) → b2b_standard`
        )

        await sendB2BValidated({
          email: customer.email,
          first_name: customer.first_name ?? "",
          company_name: customer.metadata?.company_name as string | undefined,
        }).catch((err: any) => logger.error(`[VIES Email] Validation email failed: ${err.message}`))
      } else {
        // Explicitly invalid → mark as invalid, keep in pending
        await customerModuleService.updateCustomers(customer.id, {
          metadata: {
            ...customer.metadata,
            vat_status: "invalid",
            vat_checked_at: new Date().toISOString(),
          },
        })
        logger.warn(
          `[VIES Retry] Invalid VAT for ${customer.email} (${vatId})`
        )
      }
    } catch (err: any) {
      // Still unavailable, try again next run
      logger.warn(
        `[VIES Retry] Still unavailable for ${customer.email}: ${err.message}`
      )
    }

    // Small delay between API calls to avoid hammering VIES
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  logger.info("[VIES Retry] Job complete")
}

export const config = {
  name: "vies-retry",
  schedule: "0 */6 * * *", // every 6 hours
}
