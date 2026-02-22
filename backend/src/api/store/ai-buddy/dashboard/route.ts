import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  getSerieFromSku,
  getFamilyFromSku,
  getStockThreshold,
  getStockStatus,
  deriveFulfillmentStatus,
  todayStart,
  weekStart,
  monthStart,
  yearStart,
} from "../../../../lib/ai-buddy-helpers"

/**
 * GET /store/ai-buddy/dashboard
 * Main aggregated endpoint — AI Buddy calls this every 5 minutes.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const now = new Date()
    const tToday = todayStart()
    const tWeek = weekStart()
    const tMonth = monthStart()
    const tYear = yearStart()

    // ── ORDERS (from year start for YTD) ──
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "created_at",
        "status",
        "fulfillments.*",
        "total",
        "subtotal",
        "shipping_total",
        "currency_code",
        "items.*",
        "customer.*",
        "shipping_methods.*",
        "region.*",
      ],
      filters: {
        created_at: { $gte: tYear.toISOString() },
      },
    })

    // ── Order counts by status ──
    const ordersByStatus = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 }
    for (const o of orders) {
      const fs = deriveFulfillmentStatus(o.fulfillments as any[])
      const st = (o.status as string) || ""
      if (st === "canceled" || st === "cancelled") ordersByStatus.cancelled++
      else if (fs === "delivered") ordersByStatus.delivered++
      else if (fs === "shipped" || fs === "partially_shipped") ordersByStatus.shipped++
      else if (fs === "partially_fulfilled" || st === "completed") ordersByStatus.processing++
      else ordersByStatus.pending++
    }

    // ── Order counts by period ──
    const todayOrders = orders.filter((o) => new Date(o.created_at as string) >= tToday)
    const weekOrders = orders.filter((o) => new Date(o.created_at as string) >= tWeek)
    const monthOrders = orders.filter((o) => new Date(o.created_at as string) >= tMonth)

    // ── Revenue by period and currency ──
    function revenueSum(list: typeof orders): Record<string, number> {
      const r: Record<string, number> = {}
      for (const o of list) {
        const cur = ((o.currency_code as string) || "czk").toUpperCase()
        r[cur] = (r[cur] || 0) + ((o.total as number) || 0)
      }
      return r
    }

    // ── PRODUCTS with inventory ──
    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "thumbnail",
        "metadata",
        "status",
        "variants.id",
        "variants.sku",
        "variants.inventory_items.inventory_item_id",
        "variants.inventory_items.inventory.location_levels.stocked_quantity",
        "variants.inventory_items.inventory.location_levels.reserved_quantity",
      ],
      filters: { status: "published" },
    })

    // ── Inventory summary ──
    let inStock = 0
    let outOfStock = 0
    const lowStockItems: Array<Record<string, unknown>> = []
    let clearanceCount = 0

    for (const p of products) {
      const variant = (p.variants as any[])?.[0]
      const sku = (variant?.sku as string) || ""
      const serie = getSerieFromSku(sku)
      const family = getFamilyFromSku(sku)
      const threshold = getStockThreshold(serie)
      const isClearance = (p.metadata as any)?.clearance === "true"
      if (isClearance) clearanceCount++

      const levels = variant?.inventory_items?.[0]?.inventory?.location_levels || []
      let stocked = 0
      let reserved = 0
      for (const lv of levels) {
        stocked += (lv.stocked_quantity as number) || 0
        reserved += (lv.reserved_quantity as number) || 0
      }
      const available = stocked - reserved

      if (available <= 0) {
        outOfStock++
      } else {
        inStock++
        if (available <= threshold) {
          lowStockItems.push({
            id: p.id,
            title: p.title,
            sku,
            serie,
            family,
            stock: available,
            threshold,
          })
        }
      }
    }

    // ── Recent orders (last 10) ──
    const sortedOrders = [...monthOrders].sort(
      (a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
    )
    const recentOrders = sortedOrders.slice(0, 10).map((o) => {
      const customer = o.customer as any
      const items = (o.items as any[]) || []
      const groups = customer?.groups as any[]
      const b2bGroup = groups?.find((g: any) => g.name?.startsWith("b2b_"))
      return {
        id: o.id,
        displayId: o.display_id,
        createdAt: o.created_at,
        status: o.status,
        fulfillmentStatus: deriveFulfillmentStatus(o.fulfillments as any[]),
        customer: {
          name: `${customer?.first_name || ""} ${customer?.last_name || ""}`.trim() || customer?.email,
          email: customer?.email,
          company: (customer?.metadata as any)?.company_name || null,
          country: (o.region as any)?.name || null,
          isB2B: !!b2bGroup,
          group: b2bGroup?.name || "retail",
        },
        total: o.total,
        currency: ((o.currency_code as string) || "czk").toUpperCase(),
        itemCount: items.reduce((s: number, i: any) => s + (i.quantity || 1), 0),
        items: items.map((i: any) => ({
          title: i.title,
          sku: i.variant_sku || i.product_title,
          quantity: i.quantity,
          unitPrice: i.unit_price,
        })),
        region: (o.region as any)?.name || null,
        shippingMethod: (o.shipping_methods as any[])?.[0]?.name || null,
      }
    })

    // ── Top products (this month) ──
    const productSales: Record<string, { sku: string; title: string; qty: number; revenue: Record<string, number>; thumbnail: string | null }> = {}
    for (const o of monthOrders) {
      const cur = ((o.currency_code as string) || "czk").toUpperCase()
      for (const item of (o.items as any[]) || []) {
        const sku = (item.variant_sku as string) || (item.product_title as string) || "unknown"
        if (!productSales[sku]) {
          productSales[sku] = { sku, title: item.title || item.product_title || sku, qty: 0, revenue: {}, thumbnail: null }
        }
        productSales[sku].qty += item.quantity || 1
        productSales[sku].revenue[cur] = (productSales[sku].revenue[cur] || 0) + ((item.unit_price || 0) * (item.quantity || 1))
      }
    }
    // Match thumbnails from products
    for (const p of products) {
      const sku = ((p.variants as any[])?.[0]?.sku as string) || ""
      if (productSales[sku]) {
        productSales[sku].thumbnail = (p.thumbnail as string) || null
      }
    }
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
      .map((ps) => ({
        sku: ps.sku,
        title: ps.title,
        serie: getSerieFromSku(ps.sku),
        family: getFamilyFromSku(ps.sku),
        soldThisMonth: ps.qty,
        revenueThisMonth: ps.revenue,
        thumbnail: ps.thumbnail,
      }))

    // ── B2B summary ──
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "metadata", "groups.*"],
    })
    const b2bCustomers = customers.filter((c) => {
      const groups = (c.groups as any[]) || []
      return groups.some((g: any) => g.name?.startsWith("b2b_") && g.name !== "b2b_pending")
    })
    const pendingApprovals = customers.filter((c) => {
      const groups = (c.groups as any[]) || []
      return groups.some((g: any) => g.name === "b2b_pending")
    })

    // ── By Region ──
    const byRegion: Record<string, { ordersThisMonth: number; revenueThisMonth: Record<string, number> }> = {}
    for (const o of monthOrders) {
      const region = (o.region as any)?.name || "Unknown"
      if (!byRegion[region]) byRegion[region] = { ordersThisMonth: 0, revenueThisMonth: {} }
      byRegion[region].ordersThisMonth++
      const cur = ((o.currency_code as string) || "czk").toUpperCase()
      byRegion[region].revenueThisMonth[cur] = (byRegion[region].revenueThisMonth[cur] || 0) + ((o.total as number) || 0)
    }

    // ── By Serie ──
    const bySerie: Record<string, number> = { S6: 0, S5: 0, S4: 0 }
    for (const o of monthOrders) {
      for (const item of (o.items as any[]) || []) {
        const sku = (item.variant_sku as string) || ""
        const serie = getSerieFromSku(sku)
        if (serie !== "unknown") bySerie[serie] = (bySerie[serie] || 0) + (item.quantity || 1)
      }
    }
    const totalSold = Object.values(bySerie).reduce((s, v) => s + v, 0)

    res.json({
      orders: {
        today: todayOrders.length,
        thisWeek: weekOrders.length,
        thisMonth: monthOrders.length,
        ...ordersByStatus,
      },
      revenue: {
        today: revenueSum(todayOrders),
        thisWeek: revenueSum(weekOrders),
        thisMonth: revenueSum(monthOrders),
        ytd: revenueSum(orders),
      },
      inventory: {
        totalProducts: products.length,
        inStock,
        lowStock: lowStockItems,
        outOfStock,
        clearanceCount,
      },
      recentOrders,
      topProducts,
      b2b: {
        totalCustomers: b2bCustomers.length,
        pendingApprovals: pendingApprovals.length,
        recentInquiries: [], // Inquiries not stored in DB — email only via Resend
      },
      byRegion,
      bySerie: Object.entries(bySerie).map(([serie, qty]) => ({
        serie,
        soldThisMonth: qty,
        percentage: totalSold > 0 ? Math.round((qty / totalSold) * 100) : 0,
      })),
      lastUpdated: now.toISOString(),
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
