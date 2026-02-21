import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

const B2B_PRICE_LIST_NAMES = [
  "B2B Standard (-10%)",
  "B2B Volume (-15%)",
  "B2B Partner (-20%)",
]

/**
 * GET /admin/b2b/price-lists
 * List all B2B price lists with stats
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const pricingModuleService = req.scope.resolve(Modules.PRICING)

  // Fetch all price lists and filter by B2B names
  const allLists = await (pricingModuleService as any).listPriceLists(
    {},
    { relations: ["prices"] }
  )

  const b2bLists = (allLists as any[]).filter((pl) =>
    B2B_PRICE_LIST_NAMES.includes(pl.title ?? "")
  )

  return res.json({
    price_lists: b2bLists.map((pl: any) => ({
      id: pl.id,
      title: pl.title,
      description: pl.description,
      status: pl.status,
      type: pl.type,
      prices_count: pl.prices?.length ?? 0,
    })),
    count: b2bLists.length,
  })
}

/**
 * POST /admin/b2b/price-lists/regenerate
 * Regenerate all B2B price lists from current base prices
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve("logger")
  logger.info("[Admin] Triggering B2B price list regeneration...")

  const mod = await import("../../../../scripts/create-price-lists.js")
  const createPriceLists = mod.default as unknown as (container: any) => Promise<void>

  try {
    await createPriceLists(req.scope as any)
    return res.json({ success: true, message: "B2B price lists regenerated successfully" })
  } catch (error: any) {
    logger.error(`[Admin] Price list regeneration failed: ${error.message}`)
    return res.status(500).json({ error: error.message })
  }
}
