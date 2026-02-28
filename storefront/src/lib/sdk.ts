import Medusa from "@medusajs/js-sdk"

// Server-side (SSR): use MEDUSA_BACKEND_URL (runtime, Docker internal)
// Client-side (browser): use NEXT_PUBLIC_MEDUSA_BACKEND_URL (baked at build)
let MEDUSA_BACKEND_URL = "http://localhost:9000"

if (typeof window === "undefined" && process.env.MEDUSA_BACKEND_URL) {
  MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL
} else if (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
  MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
}

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
