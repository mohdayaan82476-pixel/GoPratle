import { Router, Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { z } from 'zod'
import rateLimit from 'express-rate-limit'
import { env } from '../config/env'
import { EmailVerification } from '../models/EmailVerification'
import { sendVerificationCode } from '../services/mailer'

const router = Router()

// Rate limiter per IP for send route: max 10 requests per hour
export const sendIpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many verification requests from this IP. Please try again after an hour.',
  },
})

// Rate limiter per IP for verify route: max 30 requests per hour
export const verifyIpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many verification attempts from this IP. Please try again after an hour.',
  },
})

export function hashOtp(code: string): string {
  return crypto.createHmac('sha256', env.OTP_SECRET).update(code).digest('hex')
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

const sendSchema = z.object({
  email: z
    .string({ required_error: 'email is required' })
    .trim()
    .toLowerCase()
    .email('Invalid email address'),
})

const verifySchema = z.object({
  email: z
    .string({ required_error: 'email is required' })
    .trim()
    .toLowerCase()
    .email('Invalid email address'),
  code: z
    .string({ required_error: 'code is required' })
    .trim()
    .regex(/^\d{6}$/, 'Code must be a 6-digit number'),
})

/**
 * POST /api/verification/send
 * Body: { email }
 */
router.post(
  '/send',
  sendIpLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = sendSchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(422).json({
          error: 'Validation failed',
          details: parsed.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        })
        return
      }

      const { email } = parsed.data
      const now = Date.now()

      // 1. Check 60-second cooldown per email
      const latest = await EmailVerification.findOne({ email }).sort({ createdAt: -1 })
      if (latest) {
        const elapsedMs = now - latest.createdAt.getTime()
        if (elapsedMs < 60000) {
          const retryAfter = Math.ceil((60000 - elapsedMs) / 1000)
          res.setHeader('Retry-After', retryAfter.toString())
          res.status(429).json({
            error: `Please wait ${retryAfter} seconds before requesting another code`,
            retryAfter,
          })
          return
        }
      }

      // 2. Max 5 codes per email per hour
      const oneHourAgo = new Date(now - 60 * 60 * 1000)
      const countLastHour = await EmailVerification.countDocuments({
        email,
        createdAt: { $gte: oneHourAgo },
      })

      if (countLastHour >= 5) {
        res.status(429).json({
          error: 'Too many verification attempts for this email. Please try again after 1 hour.',
          retryAfter: 3600,
        })
        return
      }

      // 3. Generate 6-digit code (100000 - 999999)
      const codeNumber = crypto.randomInt(100000, 1000000)
      const code = codeNumber.toString()

      // 4. HMAC-SHA256 hash using OTP_SECRET
      const codeHash = hashOtp(code)
      const expiresAt = new Date(now + 10 * 60 * 1000) // 10 minutes

      const record = new EmailVerification({
        email,
        codeHash,
        expiresAt,
        attempts: 0,
        consumed: false,
        createdAt: new Date(now),
      })

      await record.save()

      // 5. Send email (do not expose failure or code)
      try {
        await sendVerificationCode(email, code)
      } catch (mailErr) {
        console.error('[Verification] Error sending code to mailer:', mailErr)
      }

      // 6. Return standard 200 response
      res.status(200).json({
        message: 'Code sent',
        expiresInSeconds: 600,
      })
    } catch (err) {
      next(err)
    }
  }
)

/**
 * POST /api/verification/verify
 * Body: { email, code }
 */
router.post(
  '/verify',
  verifyIpLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = verifySchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(422).json({
          error: 'Validation failed',
          details: parsed.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        })
        return
      }

      const { email, code } = parsed.data

      // Find latest unconsumed record for this email
      const record = await EmailVerification.findOne({
        email,
        consumed: false,
      }).sort({ createdAt: -1 })

      if (!record) {
        res.status(400).json({
          error: 'No active verification code found for this email. Please request a new code.',
        })
        return
      }

      // Check if locked
      if (record.attempts >= 5) {
        res.status(400).json({
          error: 'This verification code is locked due to too many failed attempts. Please request a new code.',
          locked: true,
          attemptsLeft: 0,
        })
        return
      }

      // Check if expired
      if (record.expiresAt.getTime() < Date.now()) {
        res.status(400).json({
          error: 'This verification code has expired. Please request a new code.',
          expired: true,
        })
        return
      }

      // Compare hashes with crypto.timingSafeEqual
      const inputHash = hashOtp(code)
      const storedBuf = Buffer.from(record.codeHash, 'hex')
      const inputBuf = Buffer.from(inputHash, 'hex')

      const isMatch =
        storedBuf.length === inputBuf.length &&
        crypto.timingSafeEqual(storedBuf, inputBuf)

      if (!isMatch) {
        record.attempts += 1
        await record.save()

        const attemptsLeft = Math.max(0, 5 - record.attempts)

        if (record.attempts >= 5) {
          res.status(400).json({
            error: 'Invalid verification code. Code locked after 5 failed attempts.',
            attemptsLeft: 0,
            locked: true,
          })
          return
        }

        res.status(400).json({
          error: 'Invalid verification code',
          attemptsLeft,
        })
        return
      }

      // Success
      record.consumed = true
      record.verifiedAt = new Date()

      // Generate random 32-byte verification token (64 hex characters)
      const verificationToken = crypto.randomBytes(32).toString('hex')
      record.tokenHash = hashToken(verificationToken)
      record.tokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      record.tokenUsed = false

      await record.save()

      res.status(200).json({
        verified: true,
        verificationToken,
      })
    } catch (err) {
      next(err)
    }
  }
)

export default router
