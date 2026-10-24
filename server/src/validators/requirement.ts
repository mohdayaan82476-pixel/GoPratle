import { z } from 'zod'

export interface ValidationErrorDetail {
  field: string
  message: string
}

export class RequirementValidationError extends Error {
  public details: ValidationErrorDetail[]

  constructor(details: ValidationErrorDetail[]) {
    super('Validation failed')
    this.name = 'RequirementValidationError'
    this.details = details
  }
}

// 1. Category Enum
export const CategoryEnum = z.enum(['planner', 'performer', 'crew'], {
  errorMap: () => ({ message: "Category must be one of 'planner', 'performer', or 'crew'" }),
})

export type CategoryType = z.infer<typeof CategoryEnum>

// Known category field keys
export const PLANNER_FIELDS = new Set([
  'plannerScope',
  'plannerGuestCount',
  'plannerVenueStatus',
  'plannerServices',
  'plannerBudget',
  'plannerTimeline',
  'plannerExperience',
  'plannerThemes',
])

export const PERFORMER_FIELDS = new Set([
  'performerType',
  'performerDuration',
  'performerSound',
  'performerGenres',
  'performerBudgetMin',
  'performerBudgetMax',
  'performerStageSetup',
  'performerLanguage',
])

export const CREW_FIELDS = new Set([
  'crewShift',
  'crewRolesNeeded',
  'crewEquipmentNeeds',
  'crewHeadcount',
  'crewBudgetPerHead',
  'crewPaymentTerms',
  'crewExtras',
  'crewNotes',
])

// Location schema
export const LocationSchema = z
  .object({
    name: z
      .string({ required_error: 'location.name is required' })
      .trim()
      .min(1, 'location.name cannot be empty')
      .max(250, 'location.name cannot exceed 250 characters'),
    placeId: z.string().trim().max(200).optional().nullable(),
    address: z.string().trim().max(500).optional().nullable(),
    lat: z.number().optional().nullable(),
    lng: z.number().optional().nullable(),
    verified: z.boolean().optional().nullable(),
    unverified: z.boolean().optional().nullable(),
  })
  .strict()

// Venue schema
export const VenueSchema = z
  .object({
    name: z.string().trim().max(250).optional().nullable(),
    placeId: z.string().trim().max(200).optional().nullable(),
    address: z.string().trim().max(500).optional().nullable(),
    lat: z.number().optional().nullable(),
    lng: z.number().optional().nullable(),
    verified: z.boolean().optional().nullable(),
    unverified: z.boolean().optional().nullable(),
  })
  .strict()

// Planner Details Schema
export const PlannerDetailsSchema = z
  .object({
    plannerScope: z.enum(['full', 'day-of', 'partial', 'logistics'], {
      required_error: 'plannerScope is required',
      invalid_type_error: "plannerScope must be 'full', 'day-of', 'partial', or 'logistics'",
    }),
    plannerGuestCount: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z
        .number({ required_error: 'plannerGuestCount is required', invalid_type_error: 'plannerGuestCount must be a number' })
        .int('plannerGuestCount must be an integer')
        .min(1, 'plannerGuestCount must be at least 1')
        .max(10000, 'plannerGuestCount cannot exceed 10,000')
    ),
    plannerVenueStatus: z.enum(['confirmed', 'searching', 'planner-find'], {
      required_error: 'plannerVenueStatus is required',
      invalid_type_error: "plannerVenueStatus must be 'confirmed', 'searching', or 'planner-find'",
    }),
    plannerServices: z
      .array(
        z.enum([
          'venue',
          'decor',
          'catering',
          'av',
          'logistics',
          'photography',
          'entertainment',
          'invitations',
        ])
      )
      .optional()
      .default([]),
    plannerBudget: z
      .string({ required_error: 'plannerBudget is required' })
      .trim()
      .min(1, 'plannerBudget is required')
      .max(100, 'plannerBudget cannot exceed 100 characters'),
    plannerTimeline: z.enum(['fixed', 'flexible'], {
      required_error: 'plannerTimeline is required',
      invalid_type_error: "plannerTimeline must be 'fixed' or 'flexible'",
    }),
    plannerExperience: z.enum(['', '1-3', '3-5', '5+']).optional().default(''),
    plannerThemes: z
      .array(
        z.enum(['corporate', 'luxury', 'rustic', 'minimalist', 'festive', 'themed'])
      )
      .optional()
      .default([]),
  })
  .strict()

// Performer Details Schema
export const PerformerDetailsSchema = z
  .object({
    performerType: z.enum(
      ['dj', 'live-band', 'solo-artist', 'comedian', 'dancer', 'anchor', 'other'],
      {
        required_error: 'performerType is required',
        invalid_type_error:
          "performerType must be 'dj', 'live-band', 'solo-artist', 'comedian', 'dancer', 'anchor', or 'other'",
      }
    ),
    performerDuration: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z
        .number({ required_error: 'performerDuration is required', invalid_type_error: 'performerDuration must be a number' })
        .int('performerDuration must be an integer')
        .min(15, 'performerDuration must be at least 15 minutes')
        .max(480, 'performerDuration cannot exceed 480 minutes (8 hours)')
    ),
    performerSound: z.enum(['yes', 'no'], {
      required_error: 'performerSound is required',
      invalid_type_error: "performerSound must be 'yes' or 'no'",
    }),
    performerGenres: z
      .array(z.enum(['bollywood', 'pop', 'classical', 'jazz', 'folk', 'rock']))
      .optional()
      .default([]),
    performerBudgetMin: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z
        .number({ required_error: 'performerBudgetMin is required', invalid_type_error: 'performerBudgetMin must be a number' })
        .min(0, 'performerBudgetMin cannot be negative')
    ),
    performerBudgetMax: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z
        .number({ required_error: 'performerBudgetMax is required', invalid_type_error: 'performerBudgetMax must be a number' })
        .min(0, 'performerBudgetMax cannot be negative')
    ),
    performerStageSetup: z
      .enum(['', 'indoor-stage', 'outdoor-stage', 'banquet', 'rooftop', 'club'])
      .optional()
      .default(''),
    performerLanguage: z.string().trim().max(150).optional().default(''),
  })
  .strict()
  .refine(
    (data) => data.performerBudgetMax >= data.performerBudgetMin,
    {
      message: 'performerBudgetMax must be greater than or equal to performerBudgetMin',
      path: ['performerBudgetMax'],
    }
  )

// Crew Details Schema
export const CrewDetailsSchema = z
  .object({
    crewShift: z.enum(
      ['morning', 'afternoon', 'evening', 'night', 'full-day', 'custom'],
      {
        required_error: 'crewShift is required',
        invalid_type_error:
          "crewShift must be 'morning', 'afternoon', 'evening', 'night', 'full-day', or 'custom'",
      }
    ),
    crewRolesNeeded: z
      .array(
        z.enum(['usher', 'av-tech', 'security', 'hospitality', 'valet', 'cleanup'])
      )
      .min(1, 'At least one crew role must be selected in crewRolesNeeded'),
    crewEquipmentNeeds: z.string().trim().max(500).optional().nullable().default(''),
    crewHeadcount: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z
        .number({ required_error: 'crewHeadcount is required', invalid_type_error: 'crewHeadcount must be a number' })
        .int('crewHeadcount must be an integer')
        .min(1, 'crewHeadcount must be at least 1')
        .max(500, 'crewHeadcount cannot exceed 500')
    ),
    crewBudgetPerHead: z
      .string({ required_error: 'crewBudgetPerHead is required' })
      .trim()
      .min(1, 'crewBudgetPerHead is required')
      .max(100, 'crewBudgetPerHead cannot exceed 100 characters'),
    crewPaymentTerms: z.preprocess(
      (val) => (!val || val === '' ? 'on-completion' : val),
      z.enum(['100-advance', '50-50', 'on-completion']).optional().default('on-completion')
    ),
    crewExtras: z
      .array(z.enum(['meals', 'transport', 'uniform']))
      .optional()
      .default([]),
    crewNotes: z.string().trim().max(1000).optional().nullable().default(''),
  })
  .strict()

// Common fields schema (without details)
export const CommonFieldsSchema = z
  .object({
    eventName: z
      .string({ required_error: 'eventName is required' })
      .trim()
      .min(1, 'eventName is required')
      .max(200, 'eventName cannot exceed 200 characters'),
    eventType: z.string().trim().max(100).optional().nullable(),
    category: CategoryEnum,
    startDate: z
      .string({ required_error: 'startDate is required' })
      .trim()
      .min(1, 'startDate is required'),
    endDate: z.string().trim().optional().nullable(),
    location: LocationSchema,
    venue: VenueSchema.optional().nullable(),
    contactName: z
      .string({ required_error: 'contactName is required' })
      .trim()
      .min(1, 'contactName is required')
      .max(150, 'contactName cannot exceed 150 characters'),
    contactEmail: z
      .string({ required_error: 'contactEmail is required' })
      .trim()
      .toLowerCase()
      .email('Invalid email address')
      .max(250, 'contactEmail cannot exceed 250 characters'),
    contactPhone: z
      .string()
      .trim()
      .optional()
      .nullable()
      .transform((val) => {
        if (!val || val.trim() === '') return undefined
        return val.replace(/[\s\-()]/g, '')
      })
      .refine(
        (val) => {
          if (!val) return true
          return /^(?:\+91)?[6-9]\d{9}$/.test(val)
        },
        {
          message:
            'Invalid Indian mobile number. Must be 10 digits starting with 6-9 (optional +91)',
        }
      )
      .transform((val) => {
        if (!val) return undefined
        const match = val.match(/^(?:\+91)?([6-9]\d{9})$/)
        if (match) {
          return `+91${match[1]}`
        }
        return val
      }),
    verificationToken: z.string().trim().optional(),
    emailVerified: z.boolean().optional(),
    emailStatus: z.enum(['pending', 'sent', 'failed']).optional().default('pending'),
    status: z.enum(['open', 'matched', 'closed']).optional().default('open'),
    source: z.enum(['user', 'demo']).optional().default('user'),
    locationName: z.string().optional().nullable(),
    venueName: z.string().optional().nullable(),
  })
  .strict()

/**
 * Format and compare dates by day in the Asia/Kolkata timezone so today's date is accepted.
 */
export function parseDateToKolkataDay(input: string | Date): string | null {
  if (input instanceof Date) {
    if (isNaN(input.getTime())) return null
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(input)
  }
  const trimmed = input.trim()
  const simpleMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (simpleMatch) {
    const [_, y, m, d] = simpleMatch
    const date = new Date(Number(y), Number(m) - 1, Number(d))
    if (isNaN(date.getTime())) return null
    return `${y}-${m}-${d}`
  }
  const parsed = new Date(trimmed)
  if (isNaN(parsed.getTime())) return null
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(parsed)
}

/**
 * Validate requirement payload following the 3-step sequence:
 * 1. Validate category enum first
 * 2. Validate common fields and date logic (endDate >= startDate, startDate not in past)
 * 3. Validate details against category schema
 * 4. Reject unknown fields
 */
export function validateRequirementPayload(input: unknown) {
  const errors: ValidationErrorDetail[] = []

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new RequirementValidationError([
      { field: 'body', message: 'Request body must be a valid JSON object' },
    ])
  }

  const raw = { ...(input as Record<string, unknown>) }

  // Step 1: Validate category enum first
  const categoryResult = CategoryEnum.safeParse(raw.category)
  if (!categoryResult.success) {
    categoryResult.error.issues.forEach((issue) => {
      errors.push({
        field: 'category',
        message: issue.message,
      })
    })
    // Category is critical for details selection, return immediately if invalid
    throw new RequirementValidationError(errors)
  }

  const category = categoryResult.data

  // Normalize location if string was passed
  if (typeof raw.location === 'string') {
    raw.location = { name: raw.location.trim() }
  }

  // Normalize venue: if string was passed, convert; if empty string or empty object, convert to null
  if (typeof raw.venue === 'string') {
    raw.venue = raw.venue.trim() ? { name: raw.venue.trim() } : null
  } else if (raw.venue === '' || raw.venue === null || raw.venue === undefined) {
    raw.venue = null
  } else if (typeof raw.venue === 'object') {
    const v = raw.venue as Record<string, unknown>
    const hasValue = Object.values(v).some(
      (val) => val !== undefined && val !== null && val !== ''
    )
    if (!hasValue) {
      raw.venue = null
    }
  }

  // Normalize optional string fields (convert empty strings to undefined or null)
  if (raw.endDate === '' || raw.endDate === null) {
    raw.endDate = undefined
  }
  if (raw.contactPhone === '' || raw.contactPhone === null) {
    raw.contactPhone = undefined
  }
  if (raw.eventType === '' || raw.eventType === null) {
    raw.eventType = undefined
  }
  if (raw.venueName === '' || raw.venueName === null) {
    raw.venueName = undefined
  }
  if (raw.locationName === '' || raw.locationName === null) {
    raw.locationName = undefined
  }

  // Extract or assemble details
  let detailsObj: Record<string, unknown> = {}
  if (raw.details && typeof raw.details === 'object' && !Array.isArray(raw.details)) {
    detailsObj = { ...(raw.details as Record<string, unknown>) }
  } else {
    // If details subdocument wasn't provided, extract category fields from top level
    const fieldSet =
      category === 'planner'
        ? PLANNER_FIELDS
        : category === 'performer'
        ? PERFORMER_FIELDS
        : CREW_FIELDS

    for (const key of Object.keys(raw)) {
      if (fieldSet.has(key)) {
        detailsObj[key] = raw[key]
        delete raw[key]
      }
    }
  }

  // Remove top-level details key for common fields validation
  delete raw.details

  // Check for unknown category-specific fields belonging to the OTHER categories
  const otherCategoryFields = new Set<string>()
  if (category !== 'planner') PLANNER_FIELDS.forEach((f) => otherCategoryFields.add(f))
  if (category !== 'performer') PERFORMER_FIELDS.forEach((f) => otherCategoryFields.add(f))
  if (category !== 'crew') CREW_FIELDS.forEach((f) => otherCategoryFields.add(f))

  for (const key of Object.keys(raw)) {
    if (otherCategoryFields.has(key)) {
      errors.push({
        field: key,
        message: `Field '${key}' does not belong to category '${category}'`,
      })
      delete raw[key]
    }
  }

  // Step 2: Validate common fields
  const commonResult = CommonFieldsSchema.safeParse(raw)
  if (!commonResult.success) {
    commonResult.error.issues.forEach((issue) => {
      errors.push({
        field: issue.path.join('.') || 'common',
        message: issue.message,
      })
    })
  }

  // Date Logic: startDate may not be in the past; endDate must be on or after startDate
  // Compare dates by day in the Asia/Kolkata timezone so today's date is accepted
  if (typeof raw.startDate === 'string' && raw.startDate) {
    const startDay = parseDateToKolkataDay(raw.startDate)
    if (!startDay) {
      errors.push({ field: 'startDate', message: 'startDate must be a valid date' })
    } else {
      const todayDay = parseDateToKolkataDay(new Date())!
      if (startDay < todayDay) {
        errors.push({
          field: 'startDate',
          message: 'startDate may not be in the past',
        })
      }

      if (raw.endDate && typeof raw.endDate === 'string') {
        const endDay = parseDateToKolkataDay(raw.endDate)
        if (!endDay) {
          errors.push({ field: 'endDate', message: 'endDate must be a valid date' })
        } else if (endDay < startDay) {
          errors.push({
            field: 'endDate',
            message: 'endDate must be on or after startDate',
          })
        }
      }
    }
  }

  // Step 3: Validate details against category schema
  let parsedDetails: unknown = detailsObj
  if (category === 'planner') {
    const detailsResult = PlannerDetailsSchema.safeParse(detailsObj)
    if (!detailsResult.success) {
      detailsResult.error.issues.forEach((issue) => {
        errors.push({
          field: `details.${issue.path.join('.')}`,
          message: issue.message,
        })
      })
    } else {
      parsedDetails = detailsResult.data
    }
  } else if (category === 'performer') {
    const detailsResult = PerformerDetailsSchema.safeParse(detailsObj)
    if (!detailsResult.success) {
      detailsResult.error.issues.forEach((issue) => {
        errors.push({
          field: `details.${issue.path.join('.')}`,
          message: issue.message,
        })
      })
    } else {
      parsedDetails = detailsResult.data
    }
  } else if (category === 'crew') {
    const detailsResult = CrewDetailsSchema.safeParse(detailsObj)
    if (!detailsResult.success) {
      detailsResult.error.issues.forEach((issue) => {
        errors.push({
          field: `details.${issue.path.join('.')}`,
          message: issue.message,
        })
      })
    } else {
      parsedDetails = detailsResult.data
    }
  }

  if (errors.length > 0) {
    throw new RequirementValidationError(errors)
  }

  const commonData = commonResult.success ? commonResult.data : raw
  return {
    ...commonData,
    details: parsedDetails,
  }
}
