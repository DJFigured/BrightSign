import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  getSerieFromSku,
  getFamilyFromSku,
  getStockThreshold,
  getStockStatus,
} from "../../../../lib/ai-buddy-helpers"

/**
 * GET /store/ai-buddy/inventory
 * Full inventory overview with stock levels and alerts.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "thumbnail",
        "metadata",
        "variants.id",
        "variants.sku",
        "variants.prices.*",
        "variants.inventory_items.inventory_item_id",
        "variants.inventory_items.inventory.location_levels.stocked_quantity",
        "variants.inventory_items.inventory.location_levels.reserved_quantity",
      ],
      filters: { status: "published" },
    })

    const items: Array<Record<string, unknown>> = []
    const bySerie: Record<string, { count: number; inStock: number; totalStock: number }> = {
      S6: { count: 0, inStock: 0, totalStock: 0 },
      S5: { count: 0, inStock: 0, totalStock: 0 },
      S4: { count: 0, inStock: 0, totalStock: 0 },
    }
    let inStockCount = 0
    let lowStockCount = 0
    let outOfStockCount = 0
    let clearanceProducts = 0
    let totalStockValueCZK = 0

    for (const p of products) {
      const variant = (p.variants as any[])?.[0]
      const sku = (variant?.sku as string) || ""
      const serie = getSerieFromSku(sku)
      const family = getFamilyFromSku(sku)
      const threshold = getStockThreshold(serie)
      const isClearance = (p.metadata as any)?.clearance === "true"
      if (isClearance) clearanceProducts++

      // Inventory levels
      const levels = variant?.inventory_items?.[0]?.inventory?.location_levels || []
      let stocked = 0
      let reserved = 0
      for (const lv of levels) {
        stocked += (lv.stocked_quantity as number) || 0
        reserved += (lv.reserved_quantity as number) || 0
      }
      const available = stocked - reserved
      const status = getStockStatus(available, threshold)

      // Prices by currency
      const prices: Record<string, number> = {}
      for (const pr of (variant?.prices || []) as any[]) {
        const cur = (pr.currency_code as string)?.toUpperCase()
        if (cur) prices[cur] = pr.amount
      }

      // Stock value (CZK)
      if (prices.CZK) {
        totalStockValueCZK += prices.CZK * available
      }

      // Serie aggregation
      if (bySerie[serie]) {
        bySerie[serie].count++
        if (available > 0) bySerie[serie].inStock++
        bySerie[serie].totalStock += available
      }

      // Counts
      if (status === "out") outOfStockCount++
      else if (status === "low") lowStockCount++
      else inStockCount++

      items.push({
        id: p.id,
        title: p.title,
        sku,
        serie,
        family,
        stock: stocked,
        reserved,
        available,
        threshold,
        status,
        clearance: isClearance,
        prices,
        thumbnail: p.thumbnail || null,
        hasImage: !!p.thumbnail,
      })
    }

    // Sort: out of stock first, then low, then ok
    const statusOrder = { out: 0, low: 1, ok: 2 }
    items.sort((a, b) => (statusOrder[a.status as keyof typeof statusOrder] ?? 2) - (statusOrder[b.status as keyof typeof statusOrder] ?? 2))

    res.json({
      products: items,
      summary: {
        total: products.length,
        inStock: inStockCount,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        bySerie,
        clearanceProducts,
        totalStockValue: { CZK: totalStockValueCZK },
      },
      warehouse: "BrightSign CZ Warehouse",
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
