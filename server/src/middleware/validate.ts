import { Request, Response, NextFunction } from 'express'
import {
  validateRequirementPayload,
  RequirementValidationError,
} from '../validators/requirement'

export function validateRequirement(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = validateRequirementPayload(req.body)
    req.body = validatedData
    next()
  } catch (err) {
    if (err instanceof RequirementValidationError) {
      res.status(422).json({
        error: 'Validation failed',
        details: err.details,
      })
      return
    }
    next(err)
  }
}
