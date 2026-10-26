import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config/env'
import requirementsRouter from './routes/requirements'
import verificationRouter from './routes/verification'
import adminRouter from './routes/admin'
import {
  generalLimiter,
  notFound,
  errorHandler,
} from './middleware'

export function createApp(): Express {
  const app = express()

  // Security headers with Helmet
  app.use(helmet())

  // CORS restricted to CLIENT_ORIGIN (supports comma-separated origins)
  const corsMiddleware = cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true)

      const isAllowed = env.CLIENT_ORIGIN.some((allowed) => {
        if (allowed === '*') return true
        return origin === allowed || origin.startsWith(allowed)
      })

      if (isAllowed) {
        callback(null, true)
      } else {
        callback(null, false)
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-admin-key'],
    optionsSuccessStatus: 200,
  })
  app.use(corsMiddleware)
  app.options('*', corsMiddleware)

  // Body parser with 100kb limit
  app.use(express.json({ limit: '100kb' }))
  app.use(express.urlencoded({ extended: true, limit: '100kb' }))

  // General rate limiter for all API requests
  app.use('/api', generalLimiter)

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  // Mount API routes
  app.use('/api/verification', verificationRouter)
  app.use('/api/requirements', requirementsRouter)
  app.use('/api/admin', adminRouter)

  // 404 Handler
  app.use(notFound)

  // Central Error Handler
  app.use(errorHandler)

  return app
}
