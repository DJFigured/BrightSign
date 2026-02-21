import { defineMiddlewares } from "@medusajs/medusa"

/**
 * No custom middlewares needed.
 * File serving is handled via /uploads/[filename] route.
 */
export default defineMiddlewares({
  routes: [],
})
