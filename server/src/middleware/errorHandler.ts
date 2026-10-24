import { Request, Response, NextFunction } from 'express'
import { RequirementValidationError } from '../validators/requirement'

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (res.headersSent) {
    return _next(err)
  }

  // Handle RequirementValidationError (422)
  if (err instanceof RequirementValidationError) {
    res.status(422).json({
      error: 'Validation failed',
      details: err.details,
    })
    return
  }

  // Handle Mongoose schema validation error
  if (err.name === 'ValidationError') {
    const details = Object.keys(err.errors || {}).map((key) => ({
      field: key,
      message: err.errors[key].message,
    }))
    res.status(422).json({
      error: 'Validation failed',
      details,
    })
    return
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError') {
    res.status(400).json({
      error: `Invalid value for ${err.path}: ${err.value}`,
    })
    return
  }

  // Handle JSON parse error (e.g. malformed body)
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    res.status(400).json({
      error: 'Invalid JSON payload',
    })
    return
  }

  // Handle payload too large (100kb limit)
  if (err.type === 'entity.too.large') {
    res.status(413).json({
      error: 'Payload too large. Maximum size is 100kb',
    })
    return
  }

  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500
  const isProduction = process.env.NODE_ENV === 'production'

  const responsePayload: { error: string; details?: unknown } = {
    error: statusCode === 500 && isProduction ? 'Internal server error' : (err.message || 'Internal server error'),
  }

  if (!isProduction && err.stack) {
    responsePayload.details = err.stack
  }

  res.status(statusCode).json(responsePayload)
}
