import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * POST /webhooks/stripe
 *
 * Backup Stripe webhook logger. The PRIMARY webhook handler is Medusa's
 * built-in endpoint at /hooks/payment/stripe_stripe — configure that URL
 * in your Stripe Dashboard:
 *
 *   https://api.brightsign.cz/hooks/payment/stripe_stripe
 *
 * This custom endpoint only logs events for debugging/monitoring.
 * It does NOT process payments — Medusa's built-in handler does that.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve("logger")

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    logger.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not set — rejecting unverified webhook")
    return res.sendStatus(500)
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

  // Log only — payment processing is handled by /hooks/payment/stripe_stripe
  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object
      logger.info(`[Stripe Backup] Payment succeeded: ${pi.id} (${pi.amount / 100} ${(pi.currency || "").toUpperCase()})`)
      break
    }
    case "payment_intent.payment_failed": {
      const pi = event.data.object
      const reason = pi.last_payment_error?.message || "unknown"
      logger.warn(`[Stripe Backup] Payment failed: ${pi.id} — ${reason}`)
      break
    }
    case "charge.refunded": {
      const charge = event.data.object
      logger.info(`[Stripe Backup] Refund: ${charge.id} — ${charge.amount_refunded / 100} ${(charge.currency || "").toUpperCase()}`)
      break
    }
    default:
      logger.debug(`[Stripe Backup] Unhandled event: ${event.type}`)
  }

  return res.sendStatus(200)
}
