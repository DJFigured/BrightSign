import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getSerieFromSku } from "../../../../lib/ai-buddy-helpers"

/**
 * GET /store/ai-buddy/revenue
 * Revenue breakdown with timeline, by region, product, serie, customer type.
 *
 * Query params:
 *   from: ISO date (default: 30 days ago)
 *   to: ISO date (default: now)
 *   granularity: daily | weekly | monthly (default: daily)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const params = req.query as Record<string, string>

    const to = params.to ? new Date(params.to) : new Date()
    const from = params.from ? new Date(params.from) : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000)
    const granularity = params.granularity || "daily"

    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "created_at",
        "status",
        "total",
        "currency_code",
        "items.*",
        "customer.groups.*",
        "region.name",
      ],
      filters: {
        created_at: { $gte: from.toISOString(), $lte: to.toISOString() },
      },
    })

    // Exclude cancelled
    const active = orders.filter((o) => {
      const st = (o.status as string) || ""
      return st !== "canceled" && st !== "cancelled"
    })

    // ── Timeline ──
    function dateKey(d: Date): string {
      if (granularity === "monthly") return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      if (granularity === "weekly") {
        // ISO week start (Monday)
        const t = new Date(d)
        t.setDate(t.getDate() - ((t.getDay() + 6) % 7))
        return t.toISOString().slice(0, 10)
      }
      return d.toISOString().slice(0, 10)
    }

    const timelineMap: Record<string, { orders: number } & Record<string, number>> = {}
    for (const o of active) {
      const key = dateKey(new Date(o.created_at as string))
      if (!timelineMap[key]) timelineMap[key] = { orders: 0 }
      timelineMap[key].orders++
      const cur = ((o.currency_code as string) || "czk").toUpperCase()
      timelineMap[key][cur] = (timelineMap[key][cur] || 0) + ((o.total as number) || 0)
    }
    const timeline = Object.entries(timelineMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data }))

    // ── By Region ──
    const regionMap: Record<string, { orders: number } & Record<string, number>> = {}
    for (const o of active) {
      const region = ((o.region as any)?.name as string) || "Unknown"
      if (!regionMap[region]) regionMap[region] = { orders: 0 }
      regionMap[region].orders++
      const cur = ((o.currency_code as string) || "czk").toUpperCase()
      regionMap[region][cur] = (regionMap[region][cur] || 0) + ((o.total as number) || 0)
    }
    const totalOrders = active.length
    const byRegion = Object.entries(regionMap).map(([region, data]) => ({
      region,
      ...data,
      share: totalOrders > 0 ? Math.round((data.orders / totalOrders) * 100) : 0,
    }))

    // ── By Product ──
    const productMap: Record<string, { sku: string; title: string; serie: string; quantity: number; revenue: Record<string, number> }> = {}
    for (const o of active) {
      const cur = ((o.currency_code as string) || "czk").toUpperCase()
      for (const item of (o.items as any[]) || []) {
        const sku = (item.variant_sku as string) || "unknown"
        if (!productMap[sku]) {
          productMap[sku] = { sku, title: item.title || sku, serie: getSerieFromSku(sku), quantity: 0, revenue: {} }
        }
        productMap[sku].quantity += (item.quantity as number) || 1
        productMap[sku].revenue[cur] = (productMap[sku].revenue[cur] || 0) + ((item.unit_price || 0) * (item.quantity || 1))
      }
    }
    const byProduct = Object.values(productMap).sort((a, b) => b.quantity - a.quantity)

    // ── By Serie ──
    const serieMap: Record<string, number> = {}
    for (const p of byProduct) {
      serieMap[p.serie] = (serieMap[p.serie] || 0) + p.quantity
    }
    const totalQty = Object.values(serieMap).reduce((s, v) => s + v, 0)
    const bySerie = Object.entries(serieMap).map(([serie, quantity]) => ({
      serie,
      quantity,
      share: totalQty > 0 ? Math.round((quantity / totalQty) * 100) : 0,
    }))

    // ── By Customer Type ──
    const byCustomerType: Record<string, { orders: number; revenue: Record<string, number> }> = {
      retail: { orders: 0, revenue: {} },
      b2b: { orders: 0, revenue: {} },
    }
    for (const o of active) {
      const groups = ((o.customer as any)?.groups as any[]) || []
      const isB2B = groups.some((g: any) => g.name?.startsWith("b2b_") && g.name !== "b2b_pending")
      const type = isB2B ? "b2b" : "retail"
      byCustomerType[type].orders++
      const cur = ((o.currency_code as string) || "czk").toUpperCase()
      byCustomerType[type].revenue[cur] = (byCustomerType[type].revenue[cur] || 0) + ((o.total as number) || 0)
    }

    // ── Totals ──
    const totals: Record<string, number> = { orders: active.length }
    for (const o of active) {
      const cur = ((o.currency_code as string) || "czk").toUpperCase()
      totals[cur] = (totals[cur] || 0) + ((o.total as number) || 0)
    }

    res.json({
      timeline,
      byRegion,
      byProduct,
      bySerie,
      byCustomerType,
      totals,
      period: { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10), granularity },
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
