import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /store/ai-buddy/b2b
 * B2B customer overview — groups, recent customers, discount tiers.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    // Fetch all customers with groups
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: [
        "id",
        "first_name",
        "last_name",
        "email",
        "created_at",
        "metadata",
        "groups.*",
      ],
    })

    // Fetch orders per customer for spend calculation
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "total", "currency_code", "customer.id"],
    })

    // Build customer order stats
    const customerOrderStats: Record<string, { count: number; spent: Record<string, number> }> = {}
    for (const o of orders) {
      const cid = (o.customer as any)?.id
      if (!cid) continue
      if (!customerOrderStats[cid]) customerOrderStats[cid] = { count: 0, spent: {} }
      customerOrderStats[cid].count++
      const cur = ((o.currency_code as string) || "czk").toUpperCase()
      customerOrderStats[cid].spent[cur] = (customerOrderStats[cid].spent[cur] || 0) + ((o.total as number) || 0)
    }

    // Group counts
    const byGroup: Record<string, number> = {
      b2b_pending: 0,
      b2b_standard: 0,
      b2b_volume: 0,
      b2b_partner: 0,
    }

    const b2bCustomerList: Array<Record<string, unknown>> = []

    for (const c of customers) {
      const groups = (c.groups as any[]) || []
      const b2bGroup = groups.find((g: any) => g.name?.startsWith("b2b_"))
      if (!b2bGroup) continue

      const groupName = b2bGroup.name as string
      byGroup[groupName] = (byGroup[groupName] || 0) + 1

      const meta = c.metadata as Record<string, string> | undefined
      const stats = customerOrderStats[c.id as string]

      b2bCustomerList.push({
        name: `${c.first_name || ""} ${c.last_name || ""}`.trim() || c.email,
        email: c.email,
        company: meta?.company_name || null,
        country: meta?.country || null,
        vatId: meta?.vat_id || null,
        group: groupName,
        discount: groupName === "b2b_partner" ? "20%" : groupName === "b2b_volume" ? "15%" : groupName === "b2b_standard" ? "10%" : "0%",
        createdAt: c.created_at,
        ordersCount: stats?.count || 0,
        totalSpent: stats?.spent || {},
      })
    }

    // Sort by created_at desc
    b2bCustomerList.sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime())

    res.json({
      customers: {
        total: b2bCustomerList.length,
        byGroup,
        recent: b2bCustomerList.slice(0, 20),
      },
      inquiries: {
        note: "B2B inquiries are sent via email (Resend) and not stored in the database. To track inquiries, a DB model would need to be added.",
        pending: 0,
        total: 0,
        items: [],
      },
      discountTiers: {
        b2b_standard: "10%",
        b2b_volume: "15%",
        b2b_partner: "20%",
      },
      viesCountries: ["CZ", "SK", "PL", "AT", "DE", "HU", "RO"],
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
