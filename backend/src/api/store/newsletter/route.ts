import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { checkRateLimit } from "../../../lib/rate-limit"

/**
 * POST /store/newsletter
 *
 * Newsletter signup endpoint — stores email for marketing.
 * Resend audience integration can be added later.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as {
    email: string
    website?: string // honeypot
  }

  // Honeypot — if filled, silently return success (bot trap)
  if (body.website) {
    return res.status(201).json({ success: true })
  }

  // Rate limit: 3 requests per hour per IP
  const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown"
  if (!checkRateLimit(ip, 3, 3600000, "newsletter")) {
    return res.status(429).json({ error: "Too many requests. Please try again later." })
  }

  // Required field
  if (!body.email) {
    return res.status(400).json({ error: "Email is required" })
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return res.status(400).json({ error: "Invalid email format" })
  }

  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  // Add to Resend audience if configured
  try {
    const apiKey = process.env.RESEND_API_KEY
    const audienceId = process.env.RESEND_AUDIENCE_ID

    if (apiKey && audienceId) {
      const response = await fetch(
        `https://api.resend.com/audiences/${audienceId}/contacts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: body.email,
            unsubscribed: false,
          }),
        }
      )

      if (!response.ok) {
        const text = await response.text()
        logger.warn(`[Newsletter] Resend API error ${response.status}: ${text}`)
      } else {
        logger.info(`[Newsletter] Added ${body.email} to audience`)
      }
    } else {
      logger.info(`[Newsletter] Signup: ${body.email} (no RESEND_AUDIENCE_ID configured)`)
    }
  } catch (err: any) {
    logger.error(`[Newsletter] Failed: ${err.message}`)
  }

  return res.status(201).json({ success: true })
}
