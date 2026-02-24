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
 * @param namespace - Optional prefix to separate rate limit counters per endpoint
 */
export function checkRateLimit(
  ip: string,
  maxRequests = 5,
  windowMs = 3600000,
  namespace = "default"
): boolean {
  const key = `${namespace}:${ip}`
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  entry.count++
  if (entry.count > maxRequests) {
    return false
  }

  return true
}
