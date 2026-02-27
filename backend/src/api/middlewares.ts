import { defineMiddlewares } from "@medusajs/medusa"
import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { timingSafeEqual } from "crypto"

/**
 * AI Buddy bearer token auth middleware.
 * Checks Authorization header against AI_BUDDY_API_KEY env var.
 * Uses timing-safe comparison to prevent timing attacks.
 */
function aiBuddyAuth(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "")
  const valid = process.env.AI_BUDDY_API_KEY
  if (!valid || !token) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }
  const tokenBuf = Buffer.from(token)
  const validBuf = Buffer.from(valid)
  if (tokenBuf.length !== validBuf.length || !timingSafeEqual(tokenBuf, validBuf)) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }
  next()
}

export default defineMiddlewares({
  routes: [
    // AI Buddy endpoints — all require bearer auth EXCEPT health
    {
      matcher: "/store/ai-buddy/dashboard",
      middlewares: [aiBuddyAuth],
    },
    {
      matcher: "/store/ai-buddy/inventory",
      middlewares: [aiBuddyAuth],
    },
    {
      matcher: "/store/ai-buddy/orders",
      middlewares: [aiBuddyAuth],
    },
    {
      matcher: "/store/ai-buddy/revenue",
      middlewares: [aiBuddyAuth],
    },
    {
      matcher: "/store/ai-buddy/b2b",
      middlewares: [aiBuddyAuth],
    },
  ],
})
