/**
 * Sliding window in-memory rate limiter for server-side AI requests.
 */

interface RateLimitRecord {
  timestamps: number[]
}

const store = new Map<string, RateLimitRecord>()

// Clean up stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of store.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 60000)
      if (record.timestamps.length === 0) {
        store.delete(key)
      }
    }
  }, 300000)
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetMs: number
}

export function checkRateLimit(
  identifier: string,
  limit = 20,
  windowMs = 60000,
): RateLimitResult {
  const now = Date.now()
  let record = store.get(identifier)

  if (!record) {
    record = { timestamps: [] }
    store.set(identifier, record)
  }

  // Filter timestamps within current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs)

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0]
    const resetMs = Math.max(0, windowMs - (now - oldest))
    return {
      allowed: false,
      remaining: 0,
      resetMs,
    }
  }

  record.timestamps.push(now)
  return {
    allowed: true,
    remaining: limit - record.timestamps.length,
    resetMs: windowMs,
  }
}
