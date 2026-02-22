import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /store/ai-buddy/health
 * No auth required — used for "Test Connection" in AI Buddy Settings.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    // Count products
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "metadata"],
      filters: { status: "published" },
    })

    // Count by series
    const series: Record<string, number> = { S6: 0, S5: 0, S4: 0 }
    for (const p of products) {
      const s = (p.metadata as Record<string, string>)?.series
      if (s === "6") series.S6++
      else if (s === "5") series.S5++
      else if (s === "4") series.S4++
    }

    res.json({
      status: "ok",
      store: "BrightSign EU",
      medusa: "2.13.1",
      products: products.length,
      series,
      regions: ["CZ", "SK", "PL", "EU"],
      currencies: ["CZK", "EUR", "PLN"],
      customerGroups: ["retail", "b2b_standard", "b2b_volume", "b2b_partner"],
      features: {
        b2b: true,
        stripe: !!process.env.STRIPE_API_KEY,
        inventory: true,
        vies: true,
        s3Images: !!process.env.S3_ENDPOINT,
      },
      warehouse: "BrightSign CZ Warehouse",
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message })
  }
}
