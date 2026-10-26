import { Router, Request, Response, NextFunction } from 'express'
import { Requirement } from '../models/Requirement'
import { env } from '../config/env'

const router = Router()

// Middleware to verify admin key
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const adminKey =
    req.headers['x-admin-key'] ||
    req.headers['authorization']?.replace(/^Bearer\s+/i, '') ||
    req.query.key

  const expectedKey = env.ADMIN_SECRET || 'gopratle2026'

  if (!adminKey || adminKey !== expectedKey) {
    res.status(401).json({ error: 'Unauthorized: Invalid or missing admin key' })
    return
  }
  next()
}

// GET /api/admin/requirements - returns unmasked requirements
router.get('/requirements', requireAdminAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, status, search } = req.query

    const filter: Record<string, unknown> = {}

    if (category && typeof category === 'string' && category !== 'all') {
      filter.category = category
    }

    if (status && typeof status === 'string' && status !== 'all') {
      filter.status = status
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim()
      filter.$or = [
        { referenceId: { $regex: q, $options: 'i' } },
        { eventName: { $regex: q, $options: 'i' } },
        { contactName: { $regex: q, $options: 'i' } },
        { contactEmail: { $regex: q, $options: 'i' } },
        { contactPhone: { $regex: q, $options: 'i' } },
        { 'location.name': { $regex: q, $options: 'i' } },
      ]
    }

    const items = await Requirement.find(filter).sort({ createdAt: -1 }).lean()

    const formatted = items.map((doc: any) => ({
      ...doc,
      id: doc.referenceId,
      locationName: doc.location?.name || '',
      venueName: doc.venue?.name || '',
    }))

    res.json({
      requirements: formatted,
      totalCount: formatted.length,
    })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/admin/requirements/:id/status - update lead status
router.patch(
  '/requirements/:id/status',
  requireAdminAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idParam = req.params.id
      const id = Array.isArray(idParam) ? idParam[0] : String(idParam || '')
      const { status } = req.body

      if (!['open', 'matched', 'closed'].includes(status)) {
        res.status(400).json({ error: 'Status must be open, matched, or closed' })
        return
      }

      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id)
      const query = isObjectId ? { $or: [{ referenceId: id }, { _id: id }] } : { referenceId: id }

      const updated = await Requirement.findOneAndUpdate(
        query,
        { $set: { status } },
        { new: true }
      ).lean()

      if (!updated) {
        res.status(404).json({ error: 'Requirement not found' })
        return
      }

      res.json({
        success: true,
        requirement: {
          ...updated,
          id: (updated as any).referenceId,
        },
      })
    } catch (err) {
      next(err)
    }
  }
)

// GET /api/admin/stats - returns counts for dashboard KPI cards
router.get('/stats', requireAdminAuth, async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [total, open, matched, closed, planners, performers, crew] = await Promise.all([
      Requirement.countDocuments(),
      Requirement.countDocuments({ status: 'open' }),
      Requirement.countDocuments({ status: 'matched' }),
      Requirement.countDocuments({ status: 'closed' }),
      Requirement.countDocuments({ category: 'planner' }),
      Requirement.countDocuments({ category: 'performer' }),
      Requirement.countDocuments({ category: 'crew' }),
    ])

    res.json({
      total,
      open,
      matched,
      closed,
      byCategory: {
        planner: planners,
        performer: performers,
        crew,
      },
    })
  } catch (err) {
    next(err)
  }
})

export default router
