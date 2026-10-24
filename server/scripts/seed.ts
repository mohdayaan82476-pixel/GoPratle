import mongoose from 'mongoose'
import { Requirement } from '../src/models/Requirement'
import { env } from '../src/config/env'

const DEMO_REQUIREMENTS = [
  {
    referenceId: 'GPR-2026-10492',
    eventName: 'Sharma Family Sangeet & Grand Reception',
    eventType: 'Wedding',
    category: 'planner',
    startDate: '2026-11-28',
    endDate: '2026-11-30',
    location: {
      name: 'Hyderabad, Telangana, India',
      placeId: 'ChIJx9Lt_qSTyzsRzY48007_4q0',
      lat: 17.385044,
      lng: 78.486671,
      verified: false,
    },
    venue: {
      name: 'Taj Krishna, Banjara Hills',
      address: 'Road No. 1, Banjara Hills, Hyderabad, Telangana',
      lat: 17.4172,
      lng: 78.4485,
    },
    status: 'open',
    source: 'demo',
    details: {
      plannerScope: 'full',
      plannerGuestCount: 350,
      plannerVenueStatus: 'confirmed',
      plannerServices: ['venue', 'decor', 'catering', 'av', 'logistics', 'photography', 'entertainment'],
      plannerBudget: '₹15,00,000',
      plannerTimeline: 'fixed',
      plannerExperience: '3-5',
      plannerThemes: ['luxury', 'festive'],
    },
  },
  {
    referenceId: 'GPR-2026-21845',
    eventName: 'Bengaluru Tech Leaders Annual Gala',
    eventType: 'Corporate event',
    category: 'performer',
    startDate: '2026-12-05',
    location: {
      name: 'Bengaluru, Karnataka, India',
      placeId: 'ChIJbU60QssUrjsRHpSmifHabZw',
      lat: 12.9715987,
      lng: 77.5945627,
      verified: false,
    },
    venue: {
      name: 'The Leela Palace Bengaluru',
      address: 'Old Airport Road, Bengaluru, Karnataka',
      lat: 12.9606,
      lng: 77.6484,
    },
    status: 'open',
    source: 'demo',
    details: {
      performerType: 'live-band',
      performerDuration: 180,
      performerSound: 'no',
      performerGenres: ['bollywood', 'pop', 'rock'],
      performerBudgetMin: 75000,
      performerBudgetMax: 150000,
      performerStageSetup: 'indoor-stage',
      performerLanguage: 'Hindi, English',
    },
  },
  {
    referenceId: 'GPR-2026-34012',
    eventName: 'Sunburn Arena Live Music Showcase',
    eventType: 'Concert',
    category: 'crew',
    startDate: '2026-11-18',
    endDate: '2026-11-19',
    location: {
      name: 'Mumbai, Maharashtra, India',
      placeId: 'ChIJwe1EZjDG5zsRaSrkiIZ1gCT',
      lat: 19.0759837,
      lng: 72.8776559,
      verified: false,
    },
    venue: {
      name: 'Jio World Garden, BKC',
      address: 'Bandra Kurla Complex, Mumbai, Maharashtra',
      lat: 19.0663,
      lng: 72.8687,
    },
    status: 'open',
    source: 'demo',
    details: {
      crewShift: 'full-day',
      crewRolesNeeded: ['av-tech', 'usher', 'security', 'cleanup'],
      crewEquipmentNeeds: 'Walkie-talkies and branded crew safety vests provided by organizer',
      crewHeadcount: 25,
      crewBudgetPerHead: '₹2,500',
      crewPaymentTerms: '50-50',
      crewExtras: ['meals', 'transport', 'uniform'],
      crewNotes: 'Overnight setup crew required starting 6 PM on Nov 17 for stage truss and lighting calibration.',
    },
  },
  {
    referenceId: 'GPR-2026-48761',
    eventName: 'NextGen FinTech Product Launch Summit',
    eventType: 'Product launch',
    category: 'planner',
    startDate: '2026-12-12',
    location: {
      name: 'Hyderabad, Telangana, India',
      placeId: 'ChIJx9Lt_qSTyzsRzY48007_4q0',
      lat: 17.385044,
      lng: 78.486671,
      verified: false,
    },
    venue: {
      name: 'Novotel Hyderabad Convention Centre',
      address: 'Near Hitec City, Madhapur, Hyderabad',
      lat: 17.4728,
      lng: 78.3729,
    },
    status: 'open',
    source: 'demo',
    details: {
      plannerScope: 'day-of',
      plannerGuestCount: 200,
      plannerVenueStatus: 'confirmed',
      plannerServices: ['av', 'logistics', 'catering', 'invitations'],
      plannerBudget: '₹6,00,000',
      plannerTimeline: 'fixed',
      plannerExperience: '5+',
      plannerThemes: ['corporate', 'minimalist'],
    },
  },
  {
    referenceId: 'GPR-2026-51290',
    eventName: "Kavita's 30th Birthday Sunset Rooftop Bash",
    eventType: 'Birthday party',
    category: 'performer',
    startDate: '2026-11-22',
    location: {
      name: 'Delhi NCR, India',
      placeId: 'ChIJLbZ-NFv9DDkRzk0gTxbSqtI',
      lat: 28.6139391,
      lng: 77.2090212,
      verified: false,
    },
    venue: {
      name: 'Skyline Rooftop Lounge',
      address: 'Connaught Place, New Delhi',
    },
    status: 'open',
    source: 'demo',
    details: {
      performerType: 'dj',
      performerDuration: 240,
      performerSound: 'yes',
      performerGenres: ['pop', 'bollywood'],
      performerBudgetMin: 40000,
      performerBudgetMax: 80000,
      performerStageSetup: 'rooftop',
      performerLanguage: 'English, Hindi',
    },
  },
  {
    referenceId: 'GPR-2026-62044',
    eventName: 'Annual Cultural Festival & Star Night',
    eventType: 'College fest',
    category: 'crew',
    startDate: '2026-12-18',
    endDate: '2026-12-19',
    location: {
      name: 'Pune, Maharashtra, India',
      placeId: 'ChIJx_b38S3BwjsR2T_L6lI1rX0',
      lat: 18.5204303,
      lng: 73.8567437,
      verified: false,
    },
    venue: {
      name: 'University Amphitheatre',
      address: 'Shivajinagar, Pune, Maharashtra',
    },
    status: 'open',
    source: 'demo',
    details: {
      crewShift: 'evening',
      crewRolesNeeded: ['av-tech', 'security', 'usher', 'cleanup'],
      crewEquipmentNeeds: 'Heavy-duty stage cables and barricading crew',
      crewHeadcount: 18,
      crewBudgetPerHead: '₹1,800',
      crewPaymentTerms: 'on-completion',
      crewExtras: ['meals'],
      crewNotes: 'Requires energetic crew with prior concert crowd control experience.',
    },
  },
]

async function seed() {
  console.log('[Seed] Connecting to MongoDB...')
  await mongoose.connect(env.MONGODB_URI)
  console.log('[Seed] Connected.')

  console.log('[Seed] Upserting demo requirements marked with source: "demo"...')
  for (const item of DEMO_REQUIREMENTS) {
    await Requirement.findOneAndUpdate(
      { referenceId: item.referenceId },
      item,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    console.log(` - Upserted ${item.referenceId}: ${item.eventName} (${item.category})`)
  }

  console.log('[Seed] Seed completed successfully.')
  await mongoose.connection.close()
  process.exit(0)
}

seed().catch((err) => {
  console.error('[Seed] Error during seeding:', err)
  process.exit(1)
})
