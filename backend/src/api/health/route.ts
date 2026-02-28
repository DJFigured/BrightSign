import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /health
 * Public healthcheck endpoint for UptimeRobot / monitoring.
 * Pings PostgreSQL and Redis, returns status.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const checks: Record<string, "ok" | "error"> = {
    database: "error",
    redis: "error",
  }

  // Check PostgreSQL
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    await query.graph({ entity: "product", fields: ["id"], pagination: { take: 1 } })
    checks.database = "ok"
  } catch {
    // database unreachable
  }

  // Check Redis
  try {
    const redis = req.scope.resolve("redis") as any
    if (redis?.ping) {
      await redis.ping()
      checks.redis = "ok"
    } else if (redis?.status === "ready") {
      checks.redis = "ok"
    }
  } catch {
    // redis unreachable
  }

  const healthy = checks.database === "ok" && checks.redis === "ok"

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    checks,
    version: "2.13.1",
    timestamp: new Date().toISOString(),
  })
}
