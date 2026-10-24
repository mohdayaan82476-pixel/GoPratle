export type ProRole = 'planner' | 'performer' | 'crew'

export interface PlaceLocation {
  name: string
  placeId?: string
  address?: string
  lat?: number
  lng?: number
  unverified?: boolean
}

export interface PlaceVenue {
  name: string
  placeId?: string
  address?: string
  lat?: number
  lng?: number
  unverified?: boolean
}

export interface Requirement {
  id: string
  eventName: string
  eventType?: string
  category: ProRole
  startDate: string
  endDate?: string
  location: string | PlaceLocation
  locationName?: string
  venue?: string | PlaceVenue
  venueName?: string
  createdAt: string
  status?: 'open' | 'matched' | 'closed'

  // Category specific fields (stored as submitted)
  plannerScope?: string
  plannerGuestCount?: string | number
  plannerVenueStatus?: string
  plannerServices?: string[]
  plannerBudget?: string
  plannerTimeline?: string
  plannerExperience?: string
  plannerThemes?: string[]

  performerType?: string
  performerDuration?: string | number
  performerSound?: string
  performerGenres?: string[]
  performerBudgetMin?: string | number
  performerBudgetMax?: string | number
  performerStageSetup?: string
  performerLanguage?: string

  crewShift?: string
  crewRolesNeeded?: string[]
  crewEquipmentNeeds?: string
  crewHeadcount?: string | number
  crewBudgetPerHead?: string
  crewPaymentTerms?: string
  crewExtras?: string[]
  crewNotes?: string

  [key: string]: unknown
}

export interface FormData {
  // Step 1 — Event basics
  eventName:    string
  eventType:    string
  category:     ProRole | ''
  startDate:    string
  endDate:      string
  location:     string
  locationData: PlaceLocation | null
  venue:        string
  venueData:    PlaceVenue | null

  // Step 2 — Planner details
  plannerScope:        string
  plannerGuestCount:   string
  plannerVenueStatus:  string
  plannerServices:     string[]

  // Step 2 — Performer details
  performerType:   string
  performerDuration: string
  performerSound:  string
  performerGenres: string[]

  // Step 2 — Crew details
  crewShift:          string
  crewRolesNeeded:    string[]
  crewEquipmentNeeds: string

  // Step 3 — Planner prefs
  plannerBudget:     string
  plannerTimeline:   string
  plannerExperience: string
  plannerThemes:     string[]

  // Step 3 — Performer prefs
  performerBudgetMin: string
  performerBudgetMax: string
  performerStageSetup: string
  performerLanguage:   string

  // Step 3 — Crew prefs
  crewHeadcount:    string
  crewBudgetPerHead: string
  crewPaymentTerms:  string
  crewExtras:        string[]
  crewNotes:         string
}

export const defaultFormData: FormData = {
  eventName:    '',
  eventType:    '',
  category:     '',
  startDate:    '',
  endDate:      '',
  location:     '',
  locationData: null,
  venue:        '',
  venueData:    null,

  plannerScope:       '',
  plannerGuestCount:  '',
  plannerVenueStatus: '',
  plannerServices:    [],

  performerType:     '',
  performerDuration: '',
  performerSound:    '',
  performerGenres:   [],

  crewShift:          '',
  crewRolesNeeded:    [],
  crewEquipmentNeeds: '',

  plannerBudget:     '',
  plannerTimeline:   '',
  plannerExperience: '',
  plannerThemes:     [],

  performerBudgetMin:  '',
  performerBudgetMax:  '',
  performerStageSetup: '',
  performerLanguage:   '',

  crewHeadcount:    '',
  crewBudgetPerHead: '',
  crewPaymentTerms:  '',
  crewExtras:        [],
  crewNotes:         '',
}
