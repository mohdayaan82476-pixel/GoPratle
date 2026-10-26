import dotenv from 'dotenv'
import path from 'path'
import { z } from 'zod'

// Load .env from server directory if it exists
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 65535, {
      message: 'PORT must be a valid port number (1-65535)',
    }),
  MONGODB_URI: z
    .string()
    .default(() => (process.env.NODE_ENV === 'test' ? 'mongodb://127.0.0.1:27017/test' : ''))
    .refine((val) => val.length > 0, {
      message: 'MONGODB_URI is required',
    }),
  CLIENT_ORIGIN: z
    .string()
    .default('http://localhost:3000')
    .transform((val) =>
      val
        .split(',')
        .map((origin) => origin.trim().replace(/\/$/, ''))
        .filter(Boolean)
    ),
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z
    .string()
    .default('587')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 65535, {
      message: 'SMTP_PORT must be a valid port number (1-65535)',
    }),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  MAIL_FROM: z.string().default('"GoPratle" <no-reply@gopratle.com>'),
  OTP_SECRET: z.string().default('gopratle_dev_otp_secret_key_1234567890'),
  ADMIN_SECRET: z.string().default('gopratle2026'),
})

export type EnvConfig = {
  NODE_ENV: 'development' | 'production' | 'test'
  PORT: number
  MONGODB_URI: string
  CLIENT_ORIGIN: string[]
  SMTP_HOST: string
  SMTP_PORT: number
  SMTP_USER: string
  SMTP_PASS: string
  MAIL_FROM: string
  OTP_SECRET: string
  ADMIN_SECRET: string
}

export function loadEnv(): EnvConfig {
  const isProduction = process.env.NODE_ENV === 'production'

  // In production, strictly enforce presence of all SMTP and OTP variables
  if (isProduction) {
    const requiredProdVars = [
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_USER',
      'SMTP_PASS',
      'MAIL_FROM',
      'OTP_SECRET',
    ]
    const missing = requiredProdVars.filter(
      (v) => !process.env[v] || process.env[v]!.trim() === ''
    )
    if (missing.length > 0) {
      throw new Error(
        `FATAL: Missing required production environment variables: ${missing.join(', ')}`
      )
    }
  }

  const result = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    MAIL_FROM: process.env.MAIL_FROM,
    OTP_SECRET: process.env.OTP_SECRET,
  })

  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => ` - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')
    throw new Error(`Environment validation failed:\n${errorDetails}`)
  }

  return result.data
}

export const env = loadEnv()
