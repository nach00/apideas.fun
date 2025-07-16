import { NextApiRequest, NextApiResponse } from 'next'

interface RateLimitOptions {
  windowMs: number
  maxRequests: number
  message?: string
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting (for production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>()

export function createRateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, message = 'Too many requests' } = options

  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    // Get client identifier (IP address)
    const clientId = 
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.socket.remoteAddress ||
      'unknown'

    const now = Date.now()
    const key = `${clientId}:${req.url}`
    
    // Clean up expired entries
    rateLimitStore.forEach((entry, storeKey) => {
      if (now > entry.resetTime) {
        rateLimitStore.delete(storeKey)
      }
    })

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key)
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + windowMs
      }
    }

    entry.count++
    rateLimitStore.set(key, entry)

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      })
      return
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count))
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000))

    next()
  }
}

// Predefined rate limiters
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later'
})

export const apiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
  message: 'Too many API requests, please slow down'
})

export const cardGenerationRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 card generations per minute
  message: 'Too many card generation requests, please wait before generating more cards'
})