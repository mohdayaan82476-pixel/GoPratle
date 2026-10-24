// Category field configuration — one place to add/modify categories
import type { ProRole } from './types'

export interface FieldConfig {
  name: string
  label: string
  type: 'text' | 'select' | 'number' | 'checkbox-group' | 'radio-group' | 'textarea'
  required?: boolean
  helper?: string
  options?: { value: string; label: string }[]
  placeholder?: string
  min?: number
  max?: number
}

export interface CategoryConfig {
  role: ProRole
  step2Label: string    // heading for step 2
  step3Label: string    // heading for step 3
  step2Fields: FieldConfig[]
  step3Fields: FieldConfig[]
}

export const CATEGORY_CONFIGS: Record<ProRole, CategoryConfig> = {
  planner: {
    role: 'planner',
    step2Label: 'Event Planner details',
    step3Label: 'Event Planner preferences',
    step2Fields: [
      {
        name: 'plannerScope',
        label: 'Planning scope',
        type: 'select',
        required: true,
        options: [
          { value: 'full', label: 'Full planning & production' },
          { value: 'day-of', label: 'Day-of coordination' },
          { value: 'partial', label: 'Partial planning (vendor sourcing)' },
          { value: 'logistics', label: 'Budget & logistics only' },
        ],
      },
      {
        name: 'plannerGuestCount',
        label: 'Expected guest count',
        type: 'number',
        required: true,
        placeholder: 'e.g. 150',
        min: 1,
        max: 10000,
      },
      {
        name: 'plannerVenueStatus',
        label: 'Venue status',
        type: 'select',
        required: true,
        options: [
          { value: 'confirmed', label: 'Venue already confirmed' },
          { value: 'searching', label: 'Still searching for venue' },
          { value: 'planner-find', label: 'Planner to source venue' },
        ],
      },
      {
        name: 'plannerServices',
        label: 'Services required',
        type: 'checkbox-group',
        helper: 'Select all that apply.',
        options: [
          { value: 'venue', label: 'Venue sourcing' },
          { value: 'decor', label: 'Décor & styling' },
          { value: 'catering', label: 'Catering & F&B' },
          { value: 'av', label: 'AV & tech' },
          { value: 'logistics', label: 'Logistics' },
          { value: 'photography', label: 'Photography' },
          { value: 'entertainment', label: 'Entertainment' },
          { value: 'invitations', label: 'Invitations' },
        ],
      },
    ],
    step3Fields: [
      {
        name: 'plannerBudget',
        label: 'Overall budget (INR)',
        type: 'text',
        required: true,
        placeholder: 'e.g. ₹5,00,000',
        helper: 'Include all vendor costs.',
      },
      {
        name: 'plannerTimeline',
        label: 'Planning timeline',
        type: 'select',
        required: true,
        options: [
          { value: 'fixed', label: 'Fixed dates — planner must commit' },
          { value: 'flexible', label: 'Dates are flexible' },
        ],
      },
      {
        name: 'plannerExperience',
        label: 'Preferred planner experience',
        type: 'select',
        options: [
          { value: '', label: 'No preference' },
          { value: '1-3', label: '1–3 years' },
          { value: '3-5', label: '3–5 years' },
          { value: '5+', label: '5+ years' },
        ],
      },
      {
        name: 'plannerThemes',
        label: 'Event theme / style',
        type: 'checkbox-group',
        helper: 'Select all that apply.',
        options: [
          { value: 'corporate', label: 'Corporate / formal' },
          { value: 'luxury', label: 'Luxury / black-tie' },
          { value: 'rustic', label: 'Rustic / outdoor' },
          { value: 'minimalist', label: 'Minimalist' },
          { value: 'festive', label: 'Festive / cultural' },
          { value: 'themed', label: 'Custom theme' },
        ],
      },
    ],
  },

  performer: {
    role: 'performer',
    step2Label: 'Performer details',
    step3Label: 'Performer preferences',
    step2Fields: [
      {
        name: 'performerType',
        label: 'Performer type',
        type: 'select',
        required: true,
        options: [
          { value: 'dj', label: 'DJ' },
          { value: 'live-band', label: 'Live band' },
          { value: 'solo-artist', label: 'Solo artist / singer' },
          { value: 'comedian', label: 'Comedian' },
          { value: 'dancer', label: 'Dancer / dance troupe' },
          { value: 'anchor', label: 'Anchor / emcee' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        name: 'performerDuration',
        label: 'Set duration (minutes)',
        type: 'number',
        required: true,
        placeholder: 'e.g. 120',
        min: 15,
        max: 480,
        helper: 'Total performance time in minutes.',
      },
      {
        name: 'performerSound',
        label: 'Equipment provided by performer?',
        type: 'radio-group',
        required: true,
        options: [
          { value: 'yes', label: 'Yes — performer brings own equipment' },
          { value: 'no',  label: 'No — host / venue provides AV' },
        ],
      },
      {
        name: 'performerGenres',
        label: 'Genres / styles',
        type: 'checkbox-group',
        helper: 'Select all that apply.',
        options: [
          { value: 'bollywood', label: 'Bollywood' },
          { value: 'pop', label: 'Pop / EDM' },
          { value: 'classical', label: 'Classical' },
          { value: 'jazz', label: 'Jazz / lounge' },
          { value: 'folk', label: 'Folk / regional' },
          { value: 'rock', label: 'Rock / metal' },
        ],
      },
    ],
    step3Fields: [
      {
        name: 'performerBudgetMin',
        label: 'Minimum fee budget (₹)',
        type: 'number',
        required: true,
        placeholder: 'e.g. 60000',
        min: 0,
      },
      {
        name: 'performerBudgetMax',
        label: 'Maximum fee budget (₹)',
        type: 'number',
        required: true,
        placeholder: 'e.g. 150000',
        min: 0,
      },
      {
        name: 'performerStageSetup',
        label: 'Venue / stage setup',
        type: 'select',
        options: [
          { value: '', label: 'Not specified' },
          { value: 'indoor-stage', label: 'Indoor stage' },
          { value: 'outdoor-stage', label: 'Outdoor stage' },
          { value: 'banquet', label: 'Indoor banquet hall' },
          { value: 'rooftop', label: 'Rooftop / terrace' },
          { value: 'club', label: 'Club / lounge' },
        ],
      },
      {
        name: 'performerLanguage',
        label: 'Language preference',
        type: 'text',
        placeholder: 'e.g. Hindi, English',
      },
    ],
  },

  crew: {
    role: 'crew',
    step2Label: 'Event crew details',
    step3Label: 'Crew preferences',
    step2Fields: [
      {
        name: 'crewShift',
        label: 'Shift hours',
        type: 'select',
        required: true,
        options: [
          { value: 'morning', label: 'Morning shift (6 AM – 2 PM)' },
          { value: 'afternoon', label: 'Afternoon shift (10 AM – 6 PM)' },
          { value: 'evening', label: 'Evening shift (2 PM – 10 PM)' },
          { value: 'night', label: 'Night shift (6 PM – 2 AM)' },
          { value: 'full-day', label: 'Full day (10 AM – 11 PM)' },
          { value: 'custom', label: 'Custom — specify in notes' },
        ],
      },
      {
        name: 'crewRolesNeeded',
        label: 'Crew roles needed',
        type: 'checkbox-group',
        required: true,
        helper: 'Select the roles you need. Specify headcount in step 3.',
        options: [
          { value: 'usher', label: 'Usher / front of house' },
          { value: 'av-tech', label: 'AV / stage tech' },
          { value: 'security', label: 'Security / crowd control' },
          { value: 'hospitality', label: 'Hospitality / F&B staff' },
          { value: 'valet', label: 'Valet / parking' },
          { value: 'cleanup', label: 'Setup & cleanup crew' },
        ],
      },
      {
        name: 'crewEquipmentNeeds',
        label: 'Equipment requirements',
        type: 'text',
        placeholder: 'e.g. Walkie-talkies, uniforms provided by host…',
        helper: 'Leave blank if none.',
      },
    ],
    step3Fields: [
      {
        name: 'crewHeadcount',
        label: 'Total staff needed',
        type: 'number',
        required: true,
        placeholder: 'e.g. 10',
        min: 1,
        max: 500,
      },
      {
        name: 'crewBudgetPerHead',
        label: 'Budget per staff per day (₹)',
        type: 'text',
        required: true,
        placeholder: 'e.g. ₹2,000',
      },
      {
        name: 'crewPaymentTerms',
        label: 'Payment terms',
        type: 'select',
        options: [
          { value: '100-advance', label: '100% in advance' },
          { value: '50-50', label: '50% advance, 50% on completion' },
          { value: 'on-completion', label: '100% on completion' },
        ],
      },
      {
        name: 'crewExtras',
        label: 'Extras provided by host',
        type: 'checkbox-group',
        options: [
          { value: 'meals', label: 'Meals / refreshments' },
          { value: 'transport', label: 'Transportation' },
          { value: 'uniform', label: 'Uniform / dress code' },
        ],
      },
      {
        name: 'crewNotes',
        label: 'Additional notes',
        type: 'textarea',
        placeholder: 'Any special instructions, dress code details, etc.',
      },
    ],
  },
}
