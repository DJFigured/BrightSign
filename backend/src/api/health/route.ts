import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /health
 * Public healthcheck endpoint for UptimeRobot / monitoring.
 * Pings PostgreSQL via a lightweight query.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    await query.graph({ entity: "product", fields: ["id"], pagination: { take: 1 } })

    res.status(200).json({
      status: "ok",
      version: "2.13.1",
      timestamp: new Date().toISOString(),
    })
  } catch {
    res.status(503).json({
      status: "error",
      timestamp: new Date().toISOString(),
    })
  }
}
