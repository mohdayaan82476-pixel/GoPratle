import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import crypto from 'crypto'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import { createApp } from '../src/app'
import { Requirement } from '../src/models/Requirement'
import { EmailVerification } from '../src/models/EmailVerification'

let mongod: MongoMemoryServer | null = null
let app: ReturnType<typeof createApp>

jest.setTimeout(30000)

async function createValidToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  await EmailVerification.create({
    email: email.toLowerCase().trim(),
    codeHash: 'dummy_hash',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    consumed: true,
    verifiedAt: new Date(),
    tokenHash,
    tokenExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
    tokenUsed: false,
  })
  return token
}

beforeAll(async () => {
  process.env.NODE_ENV = 'test'

  try {
    mongod = await MongoMemoryServer.create({
      instance: { dbName: 'gopratle_test_mem' },
    })
    process.env.MONGODB_URI = mongod.getUri()
  } catch {
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/gopratle_test_isolated'
  }

  await mongoose.connect(process.env.MONGODB_URI)
  app = createApp()
}, 60000)

afterAll(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase()
    }
  } catch {}
  await mongoose.disconnect()
  if (mongod) {
    await mongod.stop()
  }
})

beforeEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})

describe('GoPratle Requirements API', () => {
  // 1. Health check
  describe('GET /api/health', () => {
    it('returns status ok', async () => {
      const res = await request(app).get('/api/health')
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ status: 'ok' })
    })
  })

  // 2. POST valid planner payload (201)
  describe('POST /api/requirements - Planner', () => {
    it('creates a planner requirement and returns 201 with saved document and referenceId', async () => {
      const email = 'planner@example.com'
      const token = await createValidToken(email)

      const payload = {
        eventName: 'Annual Corporate Gala 2027',
        eventType: 'Corporate event',
        category: 'planner',
        startDate: '2027-11-20',
        endDate: '2027-11-22',
        location: {
          name: 'Hyderabad, Telangana, India',
          placeId: 'ChIJx9Lt_qSTyzsRzY48007_4q0',
          lat: 17.385044,
          lng: 78.486671,
        },
        venue: {
          name: 'Taj Krishna',
          address: 'Road No. 1, Banjara Hills, Hyderabad',
        },
        contactName: 'Priya Sharma',
        contactEmail: email,
        contactPhone: '9876543210',
        verificationToken: token,
        details: {
          plannerScope: 'full',
          plannerGuestCount: 300,
          plannerVenueStatus: 'confirmed',
          plannerServices: ['venue', 'decor', 'catering', 'av'],
          plannerBudget: '₹12,00,000',
          plannerTimeline: 'fixed',
          plannerExperience: '3-5',
          plannerThemes: ['luxury', 'corporate'],
        },
      }

      const res = await request(app)
        .post('/api/requirements')
        .send(payload)

      expect(res.status).toBe(201)
      expect(res.body.referenceId).toMatch(/^GPR-\d{4}-\d{5}$/)
      expect(res.body.id).toBe(res.body.referenceId)
      expect(res.body.eventName).toBe(payload.eventName)
      expect(res.body.category).toBe('planner')
      expect(res.body.details.plannerScope).toBe('full')
      expect(res.body.details.plannerGuestCount).toBe(300)
      // Check flattened access for frontend compatibility
      expect(res.body.plannerScope).toBe('full')

      // Verify persisted in DB
      const dbDoc = await Requirement.findOne({ referenceId: res.body.referenceId })
      expect(dbDoc).not.toBeNull()
      expect(dbDoc?.category).toBe('planner')
    })
  })

  // 3. POST valid performer payload (201)
  describe('POST /api/requirements - Performer', () => {
    it('creates a performer requirement and returns 201', async () => {
      const email = 'performer@example.com'
      const token = await createValidToken(email)

      const payload = {
        eventName: 'Sunset EDM Festival',
        eventType: 'Music festival',
        category: 'performer',
        startDate: '2027-12-05',
        location: {
          name: 'Goa, India',
        },
        venue: {
          name: 'Vagator Beach Arena',
        },
        contactName: 'Anil Kumar',
        contactEmail: email,
        verificationToken: token,
        details: {
          performerType: 'dj',
          performerDuration: 180,
          performerSound: 'yes',
          performerGenres: ['pop'],
          performerBudgetMin: 50000,
          performerBudgetMax: 100000,
          performerStageSetup: 'outdoor-stage',
          performerLanguage: 'English',
        },
      }

      const res = await request(app)
        .post('/api/requirements')
        .send(payload)

      expect(res.status).toBe(201)
      expect(res.body.referenceId).toMatch(/^GPR-\d{4}-\d{5}$/)
      expect(res.body.category).toBe('performer')
      expect(res.body.details.performerType).toBe('dj')
      expect(res.body.performerType).toBe('dj')
    })
  })

  // 4. POST valid crew payload (201)
  describe('POST /api/requirements - Crew', () => {
    it('creates a crew requirement and returns 201', async () => {
      const email = 'crew@example.com'
      const token = await createValidToken(email)

      const payload = {
        eventName: 'National Tech Expo',
        eventType: 'Exhibition',
        category: 'crew',
        startDate: '2027-10-15',
        endDate: '2027-10-16',
        location: {
          name: 'Bengaluru, Karnataka, India',
        },
        venue: {
          name: 'BIEC Ground',
        },
        contactName: 'Ramesh Patel',
        contactEmail: email,
        verificationToken: token,
        details: {
          crewShift: 'morning',
          crewRolesNeeded: ['usher', 'av-tech', 'security'],
          crewEquipmentNeeds: 'Walkie-talkies provided',
          crewHeadcount: 20,
          crewBudgetPerHead: '₹2,00,0',
          crewPaymentTerms: '50-50',
          crewExtras: ['meals', 'uniform'],
          crewNotes: 'Report at 7 AM sharp.',
        },
      }

      const res = await request(app)
        .post('/api/requirements')
        .send(payload)

      expect(res.status).toBe(201)
      expect(res.body.referenceId).toMatch(/^GPR-\d{4}-\d{5}$/)
      expect(res.body.category).toBe('crew')
      expect(res.body.details.crewHeadcount).toBe(20)
      expect(res.body.crewHeadcount).toBe(20)
    })
  })

  // 5. POST invalid category (422)
  describe('POST /api/requirements - Invalid category', () => {
    it('rejects invalid category with 422 and structured validation details', async () => {
      const payload = {
        eventName: 'Invalid Role Event',
        category: 'magician', // invalid category
        startDate: '2027-11-20',
        location: { name: 'Mumbai' },
        contactName: 'Test',
        contactEmail: 'test@example.com',
      }

      const res = await request(app)
        .post('/api/requirements')
        .send(payload)

      expect(res.status).toBe(422)
      expect(res.body.error).toBe('Validation failed')
      expect(Array.isArray(res.body.details)).toBe(true)
      const categoryError = res.body.details.find((d: any) => d.field === 'category')
      expect(categoryError).toBeDefined()
    })
  })

  // 6. POST end date before start date (422)
  describe('POST /api/requirements - Date validation', () => {
    it('rejects endDate before startDate with 422', async () => {
      const payload = {
        eventName: 'Date Glitch Event',
        category: 'planner',
        startDate: '2027-11-25',
        endDate: '2027-11-20', // before startDate!
        location: { name: 'Delhi' },
        contactName: 'Test User',
        contactEmail: 'test@example.com',
        details: {
          plannerScope: 'day-of',
          plannerGuestCount: 50,
          plannerVenueStatus: 'searching',
          plannerServices: ['venue'],
          plannerBudget: '₹2,00,000',
          plannerTimeline: 'flexible',
        },
      }

      const res = await request(app)
        .post('/api/requirements')
        .send(payload)

      expect(res.status).toBe(422)
      expect(res.body.error).toBe('Validation failed')
      const dateError = res.body.details.find((d: any) => d.field === 'endDate')
      expect(dateError).toBeDefined()
      expect(dateError.message).toBe('endDate must be on or after startDate')
    })
  })

  // 7. GET with a category filter returns only that category
  describe('GET /api/requirements?category=...', () => {
    it('returns only requirements matching the specified category filter', async () => {
      // Seed two requirements: one performer, one crew
      await Requirement.create([
        {
          referenceId: 'GPR-2027-11111',
          eventName: 'Performer Event A',
          category: 'performer',
          startDate: '2027-11-01',
          location: { name: 'Mumbai, India' },
          contactName: 'Performer Host',
          contactEmail: 'host1@example.com',
          status: 'open',
          details: {
            performerType: 'live-band',
            performerDuration: 120,
            performerSound: 'no',
            performerBudgetMin: 40000,
            performerBudgetMax: 80000,
          },
        },
        {
          referenceId: 'GPR-2027-22222',
          eventName: 'Crew Event B',
          category: 'crew',
          startDate: '2027-11-02',
          location: { name: 'Delhi, India' },
          contactName: 'Crew Host',
          contactEmail: 'host2@example.com',
          status: 'open',
          details: {
            crewShift: 'morning',
            crewRolesNeeded: ['usher'],
            crewHeadcount: 5,
            crewBudgetPerHead: '₹1,500',
          },
        },
      ])

      const res = await request(app)
        .get('/api/requirements?category=performer')

      expect(res.status).toBe(200)
      expect(res.body.count).toBe(1)
      expect(res.body.requirements.length).toBe(1)
      expect(res.body.requirements[0].category).toBe('performer')
      expect(res.body.requirements[0].referenceId).toBe('GPR-2027-11111')
    })
  })

  // 8. GET by id 404
  describe('GET /api/requirements/:id', () => {
    it('returns 404 with error message when requirement referenceId is not found', async () => {
      const res = await request(app).get('/api/requirements/GPR-2027-99999')
      expect(res.status).toBe(404)
      expect(res.body).toEqual({ error: 'Requirement not found' })
    })

    it('returns 200 with requirement when found', async () => {
      await Requirement.create({
        referenceId: 'GPR-2027-77777',
        eventName: 'Found Event',
        category: 'planner',
        startDate: '2027-12-01',
        location: { name: 'Kolkata, India' },
        contactName: 'Kolkata Host',
        contactEmail: 'kolkata@example.com',
        status: 'open',
        details: {
          plannerScope: 'partial',
          plannerGuestCount: 150,
          plannerVenueStatus: 'searching',
          plannerBudget: '₹4,00,000',
          plannerTimeline: 'fixed',
        },
      })

      const res = await request(app).get('/api/requirements/GPR-2027-77777')
      expect(res.status).toBe(200)
      expect(res.body.requirement).toBeDefined()
      expect(res.body.requirement.referenceId).toBe('GPR-2027-77777')
    })
  })

  // 9. Full payload shape frontend sends (null venue, optional phone, address in location, today's date)
  describe('POST /api/requirements - Frontend Payload Shape', () => {
    it('accepts full payload shape from frontend with null venue, location address, and empty phone', async () => {
      const email = 'frontend-shape@example.com'
      const token = await createValidToken(email)

      // Use today's date in Asia/Kolkata timezone
      const todayKolkata = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date())

      const payload = {
        eventName: 'Annual Leaders Summit',
        eventType: 'Conference',
        category: 'planner',
        startDate: todayKolkata,
        endDate: '',
        location: {
          name: 'Mumbai, Maharashtra, India',
          placeId: 'ChIJwe1EZjDG5zsRaYxkjY_oFow',
          address: 'Nariman Point, Mumbai',
          lat: 19.076,
          lng: 72.8777,
          unverified: false,
        },
        locationName: 'Mumbai, Maharashtra, India',
        venue: null,
        venueName: '',
        contactName: 'Ayaan Ahmed',
        contactEmail: email,
        contactPhone: '',
        verificationToken: token,
        plannerScope: 'full',
        plannerGuestCount: '250',
        plannerVenueStatus: 'searching',
        plannerServices: ['venue', 'decor'],
        plannerBudget: '₹8,00,000',
        plannerTimeline: 'flexible',
        plannerExperience: '',
        plannerThemes: ['corporate'],
      }

      const res = await request(app)
        .post('/api/requirements')
        .send(payload)

      expect(res.status).toBe(201)
      expect(res.body.referenceId).toMatch(/^GPR-\d{4}-\d{5}$/)
      expect(res.body.venue).toBeNull()
      expect(res.body.details.plannerGuestCount).toBe(250)
      expect(res.body.details.plannerScope).toBe('full')

      // Verify in DB
      const doc = await Requirement.findOne({ referenceId: res.body.referenceId })
      expect(doc).not.toBeNull()
      expect(doc?.venue == null).toBe(true)
      expect((doc?.details as any).plannerGuestCount).toBe(250)
    })

    it('accepts frontend payload with valid optional phone and formats it', async () => {
      const email = 'frontend-phone@example.com'
      const token = await createValidToken(email)

      const todayKolkata = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date())

      const payload = {
        eventName: 'Tech Meetup 2026',
        category: 'crew',
        startDate: todayKolkata,
        location: { name: 'Bengaluru, India' },
        venue: null,
        contactName: 'Priya Patel',
        contactEmail: email,
        contactPhone: '+91 98765 43210',
        verificationToken: token,
        crewShift: 'morning',
        crewRolesNeeded: ['usher', 'security'],
        crewHeadcount: '10',
        crewBudgetPerHead: '₹2,000',
      }

      const res = await request(app)
        .post('/api/requirements')
        .send(payload)

      expect(res.status).toBe(201)
      expect(res.body.referenceId).toMatch(/^GPR-\d{4}-\d{5}$/)
      expect(res.body.details.crewHeadcount).toBe(10)

      const doc = await Requirement.findOne({ referenceId: res.body.referenceId })
      expect(doc).not.toBeNull()
      expect(doc?.contactPhone).toBe('+919876543210')
    })
  })
})
