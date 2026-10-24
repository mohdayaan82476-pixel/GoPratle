import rateLimit from 'express-rate-limit'

// General rate limiter: 100 requests per 15 minutes per IP
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.',
  },
})

// Stricter rate limiter for POST /api/requirements: 5 requests per hour per IP
export const postRequirementLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  skipFailedRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requirements posted from this IP, please try again after 1 hour.',
  },
})

