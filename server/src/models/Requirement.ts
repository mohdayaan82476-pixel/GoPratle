import mongoose, { Document, Model, Schema } from 'mongoose'

export type ProCategory = 'planner' | 'performer' | 'crew'

export interface ILocation {
  name: string
  placeId?: string
  lat?: number
  lng?: number
  verified?: boolean
}

export interface IVenue {
  name?: string
  placeId?: string
  address?: string
  lat?: number
  lng?: number
}

// Planner details interface
export interface IPlannerDetails {
  plannerScope: 'full' | 'day-of' | 'partial' | 'logistics'
  plannerGuestCount: number
  plannerVenueStatus: 'confirmed' | 'searching' | 'planner-find'
  plannerServices?: string[]
  plannerBudget: string
  plannerTimeline: 'fixed' | 'flexible'
  plannerExperience?: string
  plannerThemes?: string[]
}

// Performer details interface
export interface IPerformerDetails {
  performerType: 'dj' | 'live-band' | 'solo-artist' | 'comedian' | 'dancer' | 'anchor' | 'other'
  performerDuration: number
  performerSound: 'yes' | 'no'
  performerGenres?: string[]
  performerBudgetMin: number
  performerBudgetMax: number
  performerStageSetup?: string
  performerLanguage?: string
}

// Crew details interface
export interface ICrewDetails {
  crewShift: 'morning' | 'afternoon' | 'evening' | 'night' | 'full-day' | 'custom'
  crewRolesNeeded: string[]
  crewEquipmentNeeds?: string
  crewHeadcount: number
  crewBudgetPerHead: string
  crewPaymentTerms?: string
  crewExtras?: string[]
  crewNotes?: string
}

export type ICategoryDetails = IPlannerDetails | IPerformerDetails | ICrewDetails

export interface IRequirementDoc extends Document {
  referenceId: string
  eventName: string
  eventType?: string
  category: ProCategory
  startDate: string
  endDate?: string
  location: ILocation
  venue?: IVenue
  contactName: string
  contactEmail: string
  contactPhone?: string
  emailVerified: boolean
  emailStatus: 'pending' | 'sent' | 'failed'
  status: 'open' | 'matched' | 'closed'
  source?: 'user' | 'demo'
  details: ICategoryDetails
  createdAt: Date
  updatedAt: Date
}

const locationSchema = new Schema<ILocation>(
  {
    name: { type: String, required: true, trim: true, maxlength: 250 },
    placeId: { type: String, trim: true, maxlength: 200 },
    lat: { type: Number },
    lng: { type: Number },
    verified: { type: Boolean, default: false },
  },
  { _id: false }
)

const venueSchema = new Schema<IVenue>(
  {
    name: { type: String, trim: true, maxlength: 250 },
    placeId: { type: String, trim: true, maxlength: 200 },
    address: { type: String, trim: true, maxlength: 500 },
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false }
)

const requirementSchema = new Schema<IRequirementDoc>(
  {
    referenceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      match: /^GPR-\d{4}-\d{5}$/,
    },
    eventName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    eventType: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      required: true,
      enum: ['planner', 'performer', 'crew'],
      index: true,
    },
    startDate: {
      type: String,
      required: true,
      trim: true,
    },
    endDate: {
      type: String,
      trim: true,
    },
    location: {
      type: locationSchema,
      required: true,
    },
    venue: {
      type: venueSchema,
      default: undefined,
    },
    contactName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 250,
      index: true,
    },
    contactPhone: {
      type: String,
      trim: true,
      default: undefined,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: ['open', 'matched', 'closed'],
      default: 'open',
    },
    source: {
      type: String,
      enum: ['user', 'demo'],
      default: 'user',
    },
    details: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for category list and sorting
requirementSchema.index({ category: 1, createdAt: -1 })
// Location index for text/location queries
requirementSchema.index({ 'location.name': 1 })
// Rate limiting index for contact email queries
requirementSchema.index({ contactEmail: 1, createdAt: -1 })

// Helper to generate reference ID in format GPR-<year>-<5 digits>
export function generateReferenceId(): string {
  const year = new Date().getFullYear()
  const random5 = Math.floor(10000 + Math.random() * 90000)
  return `GPR-${year}-${random5}`
}

// Transform output for frontend compatibility
requirementSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret.referenceId
    if (ret.details && typeof ret.details === 'object') {
      Object.assign(ret, ret.details)
    }
    if (ret.location && typeof ret.location === 'object') {
      ret.locationName = ret.location.name
    }
    if (ret.venue && typeof ret.venue === 'object') {
      ret.venueName = ret.venue.name
    }
    delete ret._id
    delete ret.__v
    return ret
  },
})

requirementSchema.set('toObject', {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret.referenceId
    if (ret.details && typeof ret.details === 'object') {
      Object.assign(ret, ret.details)
    }
    if (ret.location && typeof ret.location === 'object') {
      ret.locationName = ret.location.name
    }
    if (ret.venue && typeof ret.venue === 'object') {
      ret.venueName = ret.venue.name
    }
    delete ret._id
    delete ret.__v
    return ret
  },
})

export const Requirement: Model<IRequirementDoc> =
  mongoose.models.Requirement ||
  mongoose.model<IRequirementDoc>('Requirement', requirementSchema)

/**
 * Strips contactName, contactEmail, contactPhone, and verification data from requirement documents
 * for public GET responses.
 */
export function serializePublicRequirement(doc: any): Record<string, unknown> {
  const obj = typeof doc.toJSON === 'function' ? doc.toJSON() : { ...doc }
  delete obj.contactName
  delete obj.contactEmail
  delete obj.contactPhone
  delete obj.emailVerified
  delete obj.emailStatus
  delete obj.verificationToken
  delete obj.tokenHash
  delete obj.codeHash
  return obj
}
