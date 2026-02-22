import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { sendContactAdmin } from "../../../lib/email"
import { checkRateLimit } from "../../../lib/rate-limit"

/**
 * POST /store/contact
 *
 * Contact form endpoint — sends admin notification email.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as {
    name: string
    email: string
    subject?: string
    message: string
    website?: string // honeypot
  }

  // Honeypot — if filled, silently return success (bot trap)
  if (body.website) {
    return res.status(201).json({ success: true })
  }

  // Rate limit: 5 requests per hour per IP
  const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown"
  if (!checkRateLimit(ip, 5, 3600000)) {
    return res.status(429).json({ error: "Too many requests. Please try again later." })
  }

  // Required fields
  if (!body.name || !body.email || !body.message) {
    return res.status(400).json({
      error: "Missing required fields: name, email, message",
    })
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return res.status(400).json({ error: "Invalid email format", field: "email" })
  }

  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  // Send admin notification
  try {
    await sendContactAdmin({
      name: body.name,
      email: body.email,
      subject: body.subject || undefined,
      message: body.message,
    })
    logger.info(`[Contact] Email sent from ${body.name} (${body.email})`)
  } catch (err: any) {
    logger.error(`[Contact] Email send failed: ${err.message}`)
  }

  return res.status(201).json({ success: true })
}
