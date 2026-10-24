import { Router, Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import {
  Requirement,
  generateReferenceId,
  ProCategory,
  serializePublicRequirement,
} from '../models/Requirement'
import { EmailVerification } from '../models/EmailVerification'
import { sendRequirementConfirmation } from '../services/mailer'
import { validateRequirement } from '../middleware/validate'
import { postRequirementLimiter } from '../middleware/rateLimiter'

const router = Router()

function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

// POST /api/requirements
router.post(
  '/',
  postRequirementLimiter,
  validateRequirement,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = req.body

      const contactEmail =
        typeof payload.contactEmail === 'string'
          ? payload.contactEmail.toLowerCase().trim()
          : ''

      // 1. Rate-limit per contactEmail (max 5 per hour)
      if (contactEmail) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        const emailPostCount = await Requirement.countDocuments({
          contactEmail,
          createdAt: { $gte: oneHourAgo },
        })

        if (emailPostCount >= 5) {
          res.status(429).json({
            error:
              'Too many requirements posted for this email address. Please try again after 1 hour.',
            retryAfter: 3600,
          })
          return
        }
      }

      // 2. Require and verify verificationToken
      const verificationToken = payload.verificationToken
      if (
        !verificationToken ||
        typeof verificationToken !== 'string' ||
        !verificationToken.trim()
      ) {
        res.status(403).json({ error: 'Email not verified' })
        return
      }

      // Hash the provided token and match against unexpired, unused token for contactEmail
      const tokenHash = crypto
        .createHash('sha256')
        .update(verificationToken.trim())
        .digest('hex')

      const verification = await EmailVerification.findOne({
        email: contactEmail,
        tokenHash,
        tokenUsed: false,
        tokenExpiresAt: { $gt: new Date() },
      })

      if (!verification) {
        res.status(403).json({ error: 'Email not verified' })
        return
      }

      // 3. Mark token as used so it cannot be reused
      verification.tokenUsed = true
      await verification.save()

      // 4. Ensure referenceId is unique
      let referenceId = generateReferenceId()
      let exists = await Requirement.exists({ referenceId })
      while (exists) {
        referenceId = generateReferenceId()
        exists = await Requirement.exists({ referenceId })
      }

      // Strip verificationToken from the document payload
      const { verificationToken: _token, ...requirementData } = payload

      const requirement = new Requirement({
        ...requirementData,
        emailVerified: true,
        emailStatus: 'pending',
        referenceId,
      })

      const saved = await requirement.save()

      // 5. Respond 201 immediately with existing response shape
      res.status(201).json(saved.toJSON())

      // 6. Asynchronously send confirmation email without awaiting in request path
      sendRequirementConfirmation(saved.toObject())
        .then(async () => {
          await Requirement.updateOne(
            { _id: saved._id },
            { emailStatus: 'sent' }
          )
        })
        .catch(async (mailErr) => {
          console.error('[Requirements] Confirmation email failed:', mailErr)
          await Requirement.updateOne(
            { _id: saved._id },
            { emailStatus: 'failed' }
          )
        })
    } catch (err) {
      next(err)
    }
  }
)

// GET /api/requirements
// Query params: category, location, from, to, sort (newest | eventDate), page, limit
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        category,
        location,
        from,
        to,
        sort = 'newest',
        page: pageQuery,
        limit: limitQuery,
      } = req.query

      const filter: Record<string, unknown> = {}

      // Category filter (supports ?category=planner, ?category=planner&category=crew, or comma-separated)
      if (category) {
        const categories: ProCategory[] = []
        const rawCategories = Array.isArray(category) ? category : [category]
        rawCategories.forEach((catItem) => {
          if (typeof catItem === 'string') {
            catItem.split(',').forEach((c) => {
              const trimmed = c.trim() as ProCategory
              if (
                ['planner', 'performer', 'crew'].includes(trimmed) &&
                !categories.includes(trimmed)
              ) {
                categories.push(trimmed)
              }
            })
          }
        })

        if (categories.length === 1) {
          filter.category = categories[0]
        } else if (categories.length > 1) {
          filter.category = { $in: categories }
        }
      }

      // Location filter (escaped regex, case-insensitive partial match on location.name, venue.name, venue.address)
      if (typeof location === 'string' && location.trim()) {
        const escaped = escapeRegex(location.trim())
        const locRegex = new RegExp(escaped, 'i')
        filter.$or = [
          { 'location.name': locRegex },
          { 'venue.name': locRegex },
          { 'venue.address': locRegex },
        ]
      }

      // Date range filter on startDate
      if (typeof from === 'string' && from.trim()) {
        filter.startDate = {
          ...((filter.startDate as object) || {}),
          $gte: from.trim(),
        }
      }
      if (typeof to === 'string' && to.trim()) {
        filter.startDate = {
          ...((filter.startDate as object) || {}),
          $lte: to.trim(),
        }
      }

      // Sorting
      let sortOption: Record<string, 1 | -1> = { createdAt: -1 }
      if (sort === 'eventDate') {
        sortOption = { startDate: 1 }
      }

      // Pagination
      const pageNum = Math.max(1, parseInt(pageQuery as string, 10) || 1)
      const limitRaw = parseInt(limitQuery as string, 10) || 20
      const limitNum = Math.min(50, Math.max(1, limitRaw))
      const skip = (pageNum - 1) * limitNum

      const [docs, totalCount] = await Promise.all([
        Requirement.find(filter)
          .sort(sortOption)
          .skip(skip)
          .limit(limitNum)
          .exec(),
        Requirement.countDocuments(filter),
      ])

      const totalPages = Math.ceil(totalCount / limitNum) || 1

      res.json({
        requirements: docs.map((doc) => serializePublicRequirement(doc)),
        count: totalCount,
        page: pageNum,
        totalPages,
      })
    } catch (err) {
      next(err)
    }
  }
)

// GET /api/requirements/:id
// Accepts referenceId (e.g. GPR-2026-10492)
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idParam = req.params.id
      const id = Array.isArray(idParam) ? idParam[0] : idParam

      // Search by referenceId first
      let requirement = await Requirement.findOne({ referenceId: id }).exec()

      // If not found and id is valid ObjectId format, try finding by _id
      if (
        !requirement &&
        id &&
        id.length === 24 &&
        /^[0-9a-fA-F]{24}$/.test(id)
      ) {
        requirement = await Requirement.findById(id).exec()
      }

      if (!requirement) {
        res.status(404).json({ error: 'Requirement not found' })
        return
      }

      res.json({ requirement: serializePublicRequirement(requirement) })
    } catch (err) {
      next(err)
    }
  }
)

export default router
