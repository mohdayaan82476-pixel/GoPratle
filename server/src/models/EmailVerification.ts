import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IEmailVerificationDoc extends Document {
  email: string
  codeHash: string
  expiresAt: Date
  attempts: number
  consumed: boolean
  verifiedAt?: Date
  tokenHash?: string
  tokenExpiresAt?: Date
  tokenUsed: boolean
  createdAt: Date
}

const emailVerificationSchema = new Schema<IEmailVerificationDoc>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    consumed: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
    tokenHash: {
      type: String,
      index: true,
    },
    tokenExpiresAt: {
      type: Date,
    },
    tokenUsed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
)

// Compound index for querying the latest verification for an email
emailVerificationSchema.index({ email: 1, createdAt: -1 })

// Compound index for finding valid tokens by hash
emailVerificationSchema.index({ tokenHash: 1, email: 1 })

// TTL index: delete documents 1 day (86400 seconds) after expiresAt
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 })

export const EmailVerification: Model<IEmailVerificationDoc> =
  mongoose.models.EmailVerification ||
  mongoose.model<IEmailVerificationDoc>('EmailVerification', emailVerificationSchema)
