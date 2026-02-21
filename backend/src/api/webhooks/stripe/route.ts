import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * POST /webhooks/stripe
 *
 * Stripe webhook handler. Verifies signature and processes payment events.
 * Gracefully degrades if STRIPE_WEBHOOK_SECRET is not set.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve("logger")

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    logger.warn("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not set, skipping verification")
    return res.sendStatus(200)
  }

  // Verify Stripe signature
  let event: any
  try {
    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
      apiVersion: "2025-09-30.clover" as any,
    })

    const sig = req.headers["stripe-signature"] as string
    const rawBody = (req as any).rawBody || JSON.stringify(req.body)

    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err: any) {
    logger.error(`[Stripe Webhook] Signature verification failed: ${err.message}`)
    return res.status(400).json({ error: `Webhook signature verification failed` })
  }

  logger.info(`[Stripe Webhook] Event: ${event.type}`)

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object
        logger.info(`[Stripe] Payment succeeded: ${pi.id} (${pi.amount / 100} ${(pi.currency || "").toUpperCase()})`)
        break
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object
        const reason = pi.last_payment_error?.message || "unknown"
        logger.warn(`[Stripe] Payment failed: ${pi.id} — ${reason}`)
        break
      }

      case "charge.refunded": {
        const charge = event.data.object
        logger.info(`[Stripe] Charge refunded: ${charge.id} — ${charge.amount_refunded / 100} ${(charge.currency || "").toUpperCase()}`)
        break
      }

      default:
        logger.debug(`[Stripe Webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err: any) {
    logger.error(`[Stripe Webhook] Handler error for ${event.type}: ${err.message}`)
  }

  return res.sendStatus(200)
}
