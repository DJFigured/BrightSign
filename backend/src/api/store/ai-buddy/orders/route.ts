import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getSerieFromSku, deriveFulfillmentStatus } from "../../../../lib/ai-buddy-helpers"

/**
 * GET /store/ai-buddy/orders
 * Filtered and paginated order list.
 *
 * Query params:
 *   status: pending | processing | shipped | delivered | cancelled
 *   region: CZ | SK | PL | EU
 *   serie: S4 | S5 | S6
 *   b2b: true | false
 *   since: ISO date
 *   until: ISO date
 *   limit: number (default 25, max 100)
 *   page: number (default 1)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const params = req.query as Record<string, string>

    const limit = Math.min(parseInt(params.limit || "25", 10) || 25, 100)
    const page = parseInt(params.page || "1", 10) || 1

    // Build date filters
    const filters: Record<string, unknown> = {}
    if (params.since || params.until) {
      const dateFilter: Record<string, string> = {}
      if (params.since) dateFilter.$gte = new Date(params.since).toISOString()
      if (params.until) dateFilter.$lte = new Date(params.until).toISOString()
      filters.created_at = dateFilter
    }

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
        "customer.groups.*",
        "shipping_methods.*",
        "region.*",
      ],
      filters,
    })

    // Apply in-memory filters (Medusa query.graph doesn't support complex joins)
    let filtered = orders

    // Status filter
    if (params.status) {
      filtered = filtered.filter((o) => {
        const fs = deriveFulfillmentStatus(o.fulfillments as any[])
        const st = (o.status as string) || ""
        switch (params.status) {
          case "cancelled": return st === "canceled" || st === "cancelled"
          case "delivered": return fs === "delivered"
          case "shipped": return fs === "shipped" || fs === "partially_shipped"
          case "processing": return fs === "partially_fulfilled" || st === "completed"
          case "pending": return !["canceled", "cancelled"].includes(st) && !["delivered", "shipped", "partially_shipped", "partially_fulfilled"].includes(fs)
          default: return true
        }
      })
    }

    // Region filter
    if (params.region) {
      filtered = filtered.filter((o) => {
        const regionName = ((o.region as any)?.name as string) || ""
        return regionName.toUpperCase() === params.region!.toUpperCase()
      })
    }

    // B2B filter
    if (params.b2b !== undefined) {
      const wantB2B = params.b2b === "true"
      filtered = filtered.filter((o) => {
        const groups = ((o.customer as any)?.groups as any[]) || []
        const isB2B = groups.some((g: any) => g.name?.startsWith("b2b_") && g.name !== "b2b_pending")
        return wantB2B ? isB2B : !isB2B
      })
    }

    // Serie filter
    if (params.serie) {
      filtered = filtered.filter((o) => {
        const items = (o.items as any[]) || []
        return items.some((item: any) => {
          const sku = (item.variant_sku as string) || ""
          return getSerieFromSku(sku) === params.serie
        })
      })
    }

    // Sort by created_at desc
    filtered.sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime())

    // Paginate
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const paginated = filtered.slice((page - 1) * limit, page * limit)

    const mappedOrders = paginated.map((o) => {
      const customer = o.customer as any
      const items = (o.items as any[]) || []
      const groups = (customer?.groups as any[]) || []
      const b2bGroup = groups.find((g: any) => g.name?.startsWith("b2b_"))
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
        subtotal: o.subtotal,
        shippingTotal: o.shipping_total,
        currency: ((o.currency_code as string) || "czk").toUpperCase(),
        items: items.map((i: any) => ({
          title: i.title,
          sku: i.variant_sku || "",
          serie: getSerieFromSku(i.variant_sku || ""),
          quantity: i.quantity,
          unitPrice: i.unit_price,
          thumbnail: i.thumbnail || null,
        })),
        region: (o.region as any)?.name || null,
        shippingMethod: (o.shipping_methods as any[])?.[0]?.name || null,
      }
    })

    res.json({
      orders: mappedOrders,
      pagination: { total, page, pageSize: limit, totalPages },
      filters: {
        status: params.status || null,
        region: params.region || null,
        serie: params.serie || null,
        b2b: params.b2b || null,
        since: params.since || null,
        until: params.until || null,
      },
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
