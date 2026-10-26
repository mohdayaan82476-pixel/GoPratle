import dns from 'dns'
import mongoose from 'mongoose'
import { createApp } from './app'
import { env } from './config/env'
import verificationRouter from './routes/verification'

// Fix Node.js Windows SRV resolution for MongoDB Atlas (+srv://)
if (dns && typeof dns.setServers === 'function') {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
  } catch {}
}

export { createApp, verificationRouter }

let memoryServer: any = null

async function bootstrap() {
  console.log(`[GoPratle Server] Starting in ${env.NODE_ENV} mode...`)

  if (!env.MONGODB_URI) {
    console.error('FATAL: MONGODB_URI environment variable is missing!')
    process.exit(1)
  }

  try {
    console.log(`[GoPratle Server] Connecting to MongoDB at ${env.MONGODB_URI}...`)
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log('[GoPratle Server] Connected to MongoDB successfully.')
  } catch (err: any) {
    if (env.NODE_ENV === 'development') {
      console.warn(
        `[GoPratle Server] Local MongoDB at ${env.MONGODB_URI} not reachable (${err.message}).`
      )
      console.log('[GoPratle Server] Starting embedded MongoMemoryServer for local development...')
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server')
        try {
          memoryServer = await MongoMemoryServer.create({
            instance: { port: 27017, dbName: 'gopratle' },
          })
        } catch {
          // If port 27017 is busy, let it choose an available dynamic port
          memoryServer = await MongoMemoryServer.create({
            instance: { dbName: 'gopratle' },
          })
        }
        const memUri = memoryServer.getUri().replace(/\/$/, '') + '/gopratle'
        await mongoose.connect(memUri)
        console.log(`[GoPratle Server] Connected to embedded MongoDB successfully at ${memUri}`)
      } catch (memErr: any) {
        console.error('FATAL: Could not start embedded MongoDB:', memErr.message || memErr)
        process.exit(1)
      }
    } else {
      console.error('FATAL: Could not connect to MongoDB:', err.message || err)
      process.exit(1)
    }
  }

  const app = createApp()
  const server = app.listen(env.PORT, () => {
    console.log(`[GoPratle Server] API listening at http://localhost:${env.PORT}`)
    console.log(`[GoPratle Server] Allowed client origins: ${env.CLIENT_ORIGIN.join(', ')}`)
  })

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n[GoPratle Server] Received ${signal}. Gracefully shutting down...`)
    server.close(async () => {
      console.log('[GoPratle Server] HTTP server closed.')
      try {
        await mongoose.connection.close(false)
        console.log('[GoPratle Server] MongoDB connection closed.')
        if (memoryServer) {
          await memoryServer.stop()
          console.log('[GoPratle Server] Embedded MongoDB stopped.')
        }
        process.exit(0)
      } catch (err) {
        console.error('[GoPratle Server] Error closing MongoDB connection:', err)
        process.exit(1)
      }
    })

    // Force shutdown after 10s timeout
    setTimeout(() => {
      console.error('[GoPratle Server] Forced shutdown after timeout.')
      process.exit(1)
    }, 10000).unref()
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

bootstrap().catch((err) => {
  console.error('FATAL: Unhandled bootstrap error:', err)
  process.exit(1)
})
