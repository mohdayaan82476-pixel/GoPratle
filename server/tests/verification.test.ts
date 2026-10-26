import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { createApp } from '../src/app'
import { Requirement } from '../src/models/Requirement'
import { EmailVerification } from '../src/models/EmailVerification'
import * as mailerService from '../src/services/mailer'

// Mock mailer
jest.mock('../src/services/mailer', () => {
  const original = jest.requireActual('../src/services/mailer')
  return {
    ...original,
    sendVerificationCode: jest.fn().mockResolvedValue(undefined),
    sendRequirementConfirmation: jest.fn().mockResolvedValue(undefined),
  }
})

let mongod: MongoMemoryServer | null = null
let app: ReturnType<typeof createApp>

beforeAll(async () => {
  process.env.NODE_ENV = 'test'

  try {
    mongod = await MongoMemoryServer.create({
      instance: { dbName: 'gopratle_test_mem_verif' },
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
  jest.clearAllMocks()
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})

const validPlannerPayload = {
  eventName: 'Tech Launch Gala 2027',
  eventType: 'Corporate event',
  category: 'planner',
  startDate: '2027-11-20',
  endDate: '2027-11-22',
  location: {
    name: 'Hyderabad, Telangana, India',
  },
  contactName: 'Rohit Sharma',
  contactEmail: 'rohit@example.com',
  contactPhone: '9876543210',
  details: {
    plannerScope: 'full',
    plannerGuestCount: 300,
    plannerVenueStatus: 'confirmed',
    plannerServices: ['venue', 'decor'],
    plannerBudget: '₹10,00,000',
    plannerTimeline: 'fixed',
  },
}

describe('Email Verification & Requirement Confirmation Flow', () => {
  describe('POST /api/verification/send', () => {
    it('sends code and returns 200; a second send within 60 seconds returns 429', async () => {
      const email = 'testuser@example.com'

      // First send -> 200
      const res1 = await request(app)
        .post('/api/verification/send')
        .send({ email })

      expect(res1.status).toBe(200)
      expect(res1.body).toEqual({
        message: 'Code sent',
        expiresInSeconds: 600,
      })
      expect(mailerService.sendVerificationCode).toHaveBeenCalledTimes(1)
      expect(mailerService.sendVerificationCode).toHaveBeenCalledWith(
        email,
        expect.stringMatching(/^\d{6}$/)
      )

      // Second send within 60s -> 429 with retryAfter
      const res2 = await request(app)
        .post('/api/verification/send')
        .send({ email })

      expect(res2.status).toBe(429)
      expect(res2.body.error).toMatch(/Please wait/i)
      expect(res2.body.retryAfter).toBeGreaterThan(0)
    })
  })

  describe('POST /api/verification/verify', () => {
    it('verifies correct code and returns a token; wrong code decrements attempts and 5 wrong attempts lock code; expired code rejected', async () => {
      const email = 'verifyuser@example.com'

      // 1. Request code
      await request(app).post('/api/verification/send').send({ email })
      const sentCode = (mailerService.sendVerificationCode as jest.Mock).mock.calls[0][1]

      // 2. Wrong code -> 400 with attempts left
      const wrongRes = await request(app)
        .post('/api/verification/verify')
        .send({ email, code: '000000' === sentCode ? '111111' : '000000' })

      expect(wrongRes.status).toBe(400)
      expect(wrongRes.body.error).toMatch(/Invalid verification code/i)
      expect(wrongRes.body.attemptsLeft).toBe(4)

      // 3. 4 more wrong tries -> locks code on 5th
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/verification/verify')
          .send({ email, code: '111111' === sentCode ? '222222' : '111111' })
      }
      const fifthWrong = await request(app)
        .post('/api/verification/verify')
        .send({ email, code: '111111' === sentCode ? '222222' : '111111' })

      expect(fifthWrong.status).toBe(400)
      expect(fifthWrong.body.locked).toBe(true)
      expect(fifthWrong.body.attemptsLeft).toBe(0)

      // Now trying with the correct code is rejected because code is locked
      const tryCorrectAfterLock = await request(app)
        .post('/api/verification/verify')
        .send({ email, code: sentCode })
      expect(tryCorrectAfterLock.status).toBe(400)
      expect(tryCorrectAfterLock.body.locked).toBe(true)

      // 4. Expired code test
      const expiredEmail = 'expired@example.com'
      await request(app).post('/api/verification/send').send({ email: expiredEmail })
      const expiredCode = (mailerService.sendVerificationCode as jest.Mock).mock.calls[1][1]

      // Set expiration in past
      await EmailVerification.updateOne(
        { email: expiredEmail },
        { expiresAt: new Date(Date.now() - 5000) }
      )

      const expiredRes = await request(app)
        .post('/api/verification/verify')
        .send({ email: expiredEmail, code: expiredCode })

      expect(expiredRes.status).toBe(400)
      expect(expiredRes.body.expired).toBe(true)

      // 5. Correct code verifies and returns a token
      const freshEmail = 'fresh@example.com'
      await request(app).post('/api/verification/send').send({ email: freshEmail })
      const freshCode = (mailerService.sendVerificationCode as jest.Mock).mock.calls[2][1]

      const successRes = await request(app)
        .post('/api/verification/verify')
        .send({ email: freshEmail, code: freshCode })

      expect(successRes.status).toBe(200)
      expect(successRes.body.verified).toBe(true)
      expect(typeof successRes.body.verificationToken).toBe('string')
      expect(successRes.body.verificationToken.length).toBeGreaterThan(20)
    })
  })

  describe('POST /api/requirements token verification', () => {
    it('rejects POST without a token with 403', async () => {
      const res = await request(app)
        .post('/api/requirements')
        .send({
          ...validPlannerPayload,
        })

      expect(res.status).toBe(403)
      expect(res.body.error).toBe('Email not verified')
    })

    it('rejects POST with a token for a different email with 403', async () => {
      // Create verified token for 'alice@example.com'
      const emailAlice = 'alice@example.com'
      await request(app).post('/api/verification/send').send({ email: emailAlice })
      const code = (mailerService.sendVerificationCode as jest.Mock).mock.calls[0][1]
      const verifyRes = await request(app)
        .post('/api/verification/verify')
        .send({ email: emailAlice, code })
      const token = verifyRes.body.verificationToken

      // Try to submit with 'bob@example.com'
      const res = await request(app)
        .post('/api/requirements')
        .send({
          ...validPlannerPayload,
          contactEmail: 'bob@example.com',
          verificationToken: token,
        })

      expect(res.status).toBe(403)
      expect(res.body.error).toBe('Email not verified')
    })

    it('prevents verification token reuse', async () => {
      const email = 'reusable@example.com'
      await request(app).post('/api/verification/send').send({ email })
      const code = (mailerService.sendVerificationCode as jest.Mock).mock.calls[0][1]
      const verifyRes = await request(app)
        .post('/api/verification/verify')
        .send({ email, code })
      const token = verifyRes.body.verificationToken

      // First submission -> 201
      const res1 = await request(app)
        .post('/api/requirements')
        .send({
          ...validPlannerPayload,
          contactEmail: email,
          verificationToken: token,
        })

      expect(res1.status).toBe(201)

      // Second submission with same token -> 403
      const res2 = await request(app)
        .post('/api/requirements')
        .send({
          ...validPlannerPayload,
          contactEmail: email,
          verificationToken: token,
        })

      expect(res2.status).toBe(403)
      expect(res2.body.error).toBe('Email not verified')
    })
  })

  describe('Confirmation email & status tracking', () => {
    it('sends exactly one confirmation email on valid save', async () => {
      const email = 'confirm@example.com'
      await request(app).post('/api/verification/send').send({ email })
      const code = (mailerService.sendVerificationCode as jest.Mock).mock.calls[0][1]
      const verifyRes = await request(app)
        .post('/api/verification/verify')
        .send({ email, code })
      const token = verifyRes.body.verificationToken

      const res = await request(app)
        .post('/api/requirements')
        .send({
          ...validPlannerPayload,
          contactEmail: email,
          verificationToken: token,
        })

      expect(res.status).toBe(201)
      expect(mailerService.sendRequirementConfirmation).toHaveBeenCalledTimes(1)
      expect(mailerService.sendRequirementConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({
          referenceId: res.body.referenceId,
          eventName: validPlannerPayload.eventName,
          contactEmail: email,
        })
      )

      // Allow background async promise to complete
      await new Promise((r) => setTimeout(r, 60))
      const savedDoc = await Requirement.findOne({ referenceId: res.body.referenceId })
      expect(savedDoc?.emailStatus).toBe('sent')
      expect(savedDoc?.emailVerified).toBe(true)
    })

    it('returns 201 even if mailer throws, and updates emailStatus to failed', async () => {
      const email = 'mailererror@example.com'
      ;(mailerService.sendRequirementConfirmation as jest.Mock).mockRejectedValueOnce(
        new Error('SMTP service down')
      )

      await request(app).post('/api/verification/send').send({ email })
      const code = (mailerService.sendVerificationCode as jest.Mock).mock.calls[0][1]
      const verifyRes = await request(app)
        .post('/api/verification/verify')
        .send({ email, code })
      const token = verifyRes.body.verificationToken

      const res = await request(app)
        .post('/api/requirements')
        .send({
          ...validPlannerPayload,
          contactEmail: email,
          verificationToken: token,
        })

      // Must respond 201 immediately
      expect(res.status).toBe(201)

      // Allow background catch handler to execute
      await new Promise((r) => setTimeout(r, 60))
      const savedDoc = await Requirement.findOne({ referenceId: res.body.referenceId })
      expect(savedDoc).not.toBeNull()
      expect(savedDoc?.emailStatus).toBe('failed')
    })
  })

  describe('Validation & Data Privacy', () => {
    it('returns 422 for invalid email or phone', async () => {
      // Invalid email
      const resBadEmail = await request(app)
        .post('/api/requirements')
        .send({
          ...validPlannerPayload,
          contactEmail: 'not-an-email',
          verificationToken: 'dummytoken',
        })
      expect(resBadEmail.status).toBe(422)

      // Invalid Indian phone (less than 10 digits or not starting with 6-9)
      const resBadPhone = await request(app)
        .post('/api/requirements')
        .send({
          ...validPlannerPayload,
          contactPhone: '12345',
          verificationToken: 'dummytoken',
        })
      expect(resBadPhone.status).toBe(422)
    })

    it('GET responses never include contactName, contactEmail, contactPhone, or verification data', async () => {
      const email = 'privacy@example.com'
      await request(app).post('/api/verification/send').send({ email })
      const code = (mailerService.sendVerificationCode as jest.Mock).mock.calls[0][1]
      const verifyRes = await request(app)
        .post('/api/verification/verify')
        .send({ email, code })
      const token = verifyRes.body.verificationToken

      const postRes = await request(app)
        .post('/api/requirements')
        .send({
          ...validPlannerPayload,
          contactEmail: email,
          contactPhone: '+919876543210',
          contactName: 'Private Host',
          verificationToken: token,
        })
      expect(postRes.status).toBe(201)
      const refId = postRes.body.referenceId

      // 1. GET /api/requirements
      const listRes = await request(app).get('/api/requirements')
      expect(listRes.status).toBe(200)
      expect(listRes.body.requirements.length).toBeGreaterThan(0)
      const item = listRes.body.requirements[0]
      expect(item.contactName).toBeUndefined()
      expect(item.contactEmail).toBeUndefined()
      expect(item.contactPhone).toBeUndefined()
      expect(item.emailVerified).toBeUndefined()
      expect(item.emailStatus).toBeUndefined()
      expect(item.verificationToken).toBeUndefined()

      // 2. GET /api/requirements/:id
      const detailRes = await request(app).get(`/api/requirements/${refId}`)
      expect(detailRes.status).toBe(200)
      const single = detailRes.body.requirement
      expect(single.contactName).toBeUndefined()
      expect(single.contactEmail).toBeUndefined()
      expect(single.contactPhone).toBeUndefined()
      expect(single.emailVerified).toBeUndefined()
      expect(single.emailStatus).toBeUndefined()
      expect(single.verificationToken).toBeUndefined()
    })
  })
})
