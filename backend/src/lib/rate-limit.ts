/**
 * Simple in-memory rate limiter.
 * Map<IP, { count, resetAt }> with periodic cleanup.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup expired entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key)
    }
  }
}, 10 * 60 * 1000).unref()

/**
 * Check if IP is within rate limit.
 * Returns true if request is ALLOWED, false if rate limited.
 */
export function checkRateLimit(
  ip: string,
  maxRequests = 5,
  windowMs = 3600000
): boolean {
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || entry.resetAt <= now) {
    store.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  entry.count++
  if (entry.count > maxRequests) {
    return false
  }

  return true
}
