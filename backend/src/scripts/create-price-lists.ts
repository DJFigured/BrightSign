/**
 * Script: create-price-lists
 *
 * Creates B2B price lists in Medusa for all 3 discount tiers.
 * Uses remote query to resolve variant → price_set_id mappings.
 *
 * Run with: npx medusa exec src/scripts/create-price-lists.ts
 */

import type { ExecArgs } from "@medusajs/framework/types"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

const TIERS = [
  { name: "B2B Standard (-10%)", groupName: "b2b_standard", multiplier: 0.90 },
  { name: "B2B Volume (-15%)", groupName: "b2b_volume", multiplier: 0.85 },
  { name: "B2B Partner (-20%)", groupName: "b2b_partner", multiplier: 0.80 },
]

export default async function createPriceLists({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const pricingModuleService = container.resolve(Modules.PRICING)
  const customerModuleService = container.resolve(Modules.CUSTOMER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("[Price Lists] Starting B2B price list creation...")

  // Use remote query to get variants with their price_set_ids and base prices
  const { data: variantData } = await query.graph({
    entity: "product_variant",
    fields: ["id", "prices.*"],
    filters: {
      product: { status: ["published"] },
    },
    pagination: { take: 500 },
  } as any)

  logger.info(`[Price Lists] Found ${(variantData as any[]).length} variants`)

  if (!(variantData as any[]).length) {
    logger.warn("[Price Lists] No variants found. Run sync-products first.")
    return
  }

  // Build variant → prices map
  const variantPriceMap = new Map<string, Array<{ price_set_id: string; amount: number; currency_code: string }>>()

  for (const variant of variantData as any[]) {
    const prices = (variant.prices || []).map((p: any) => ({
      price_set_id: p.price_set_id,
      amount: p.amount,
      currency_code: p.currency_code,
    }))
    if (prices.length > 0) {
      variantPriceMap.set(variant.id, prices)
    }
  }

  logger.info(`[Price Lists] Resolved ${variantPriceMap.size} variants with prices`)

  for (const tier of TIERS) {
    logger.info(`[Price Lists] Processing tier: ${tier.name}`)

    // Find customer group
    const groups = await customerModuleService.listCustomerGroups({ name: tier.groupName })

    if (!groups.length) {
      logger.warn(`[Price Lists] Customer group '${tier.groupName}' not found, skipping`)
      continue
    }

    const customerGroupId = groups[0].id

    // Delete existing price list with same title
    const allLists = await (pricingModuleService as any).listPriceLists({}, {})
    const existing = (allLists as any[]).filter((pl: any) => pl.title === tier.name)

    if (existing.length > 0) {
      await pricingModuleService.deletePriceLists(existing.map((pl: any) => pl.id))
      logger.info(`[Price Lists] Deleted ${existing.length} existing '${tier.name}' list(s)`)
    }

    // Build prices array using price_set_id
    const prices: Array<{ price_set_id: string; amount: number; currency_code: string }> = []

    for (const [, variantPrices] of variantPriceMap) {
      for (const basePrice of variantPrices) {
        if (!basePrice.price_set_id) continue

        prices.push({
          price_set_id: basePrice.price_set_id,
          amount: Math.round(basePrice.amount * tier.multiplier),
          currency_code: basePrice.currency_code,
        })
      }
    }

    if (prices.length === 0) {
      logger.warn(`[Price Lists] No prices to add for tier ${tier.name}`)
      continue
    }

    // Create price list with customer group rule
    await (pricingModuleService as any).createPriceLists([
      {
        title: tier.name,
        description: `Automatická sleva pro skupinu ${tier.groupName} (${Math.round((1 - tier.multiplier) * 100)}% off RRP)`,
        type: "sale",
        status: "active",
        rules: {
          customer_group_id: [customerGroupId],
        },
        prices,
      },
    ])

    logger.info(`[Price Lists] Created '${tier.name}': ${prices.length} prices, group: ${tier.groupName}`)
  }

  logger.info("[Price Lists] All B2B price lists created successfully!")
}
