import mongoose from 'mongoose'
import crypto from 'crypto'

const API_BASE = 'http://localhost:5000'
const MONGODB_URI = 'mongodb://127.0.0.1:27017/gopratle'
const OTP_SECRET = 'gopratle_dev_otp_secret_key_1234567890'

async function main() {
  console.log('--- Connecting to MongoDB to inspect live documents ---')
  await mongoose.connect(MONGODB_URI)
  const db = mongoose.connection.db

  const EmailVerification = db.collection('emailverifications')
  const Requirements = db.collection('requirements')

  // Helper function to extract 6-digit code by trying 100000..999999 against the HMAC
  function findCodeForHash(hash) {
    for (let c = 100000; c <= 999999; c++) {
      const codeStr = c.toString()
      const testHash = crypto.createHmac('sha256', OTP_SECRET).update(codeStr).digest('hex')
      if (testHash === hash) return codeStr
    }
    return null
  }

  // ─────────────────────────────────────────────────────────────
  // TEST CATEGORY 1: PLANNER
  // ─────────────────────────────────────────────────────────────
  console.log('\n======================================================')
  console.log('TEST 1: PLANNER CATEGORY - FULL OTP FLOW')
  console.log('======================================================')

  const plannerEmail = `planner_${Date.now()}@testgopratle.com`

  // 1. Send code
  console.log(`[1.1] Requesting code for: ${plannerEmail}`)
  const sendRes = await fetch(`${API_BASE}/api/verification/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: plannerEmail }),
  })
  const sendData = await sendRes.json()
  console.log('Send Code response status:', sendRes.status, sendData)
  if (sendRes.status !== 200) throw new Error('Send code failed')

  // 1.2 Test 60-second cooldown
  console.log('[1.2] Testing 60-second cooldown...')
  const cooldownRes = await fetch(`${API_BASE}/api/verification/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: plannerEmail }),
  })
  const cooldownData = await cooldownRes.json()
  console.log('Cooldown response status:', cooldownRes.status, cooldownData)
  if (cooldownRes.status !== 429) throw new Error('Expected 429 for cooldown')

  // Find saved code hash
  const record = await EmailVerification.findOne({ email: plannerEmail }, { sort: { createdAt: -1 } })
  const actualCode = findCodeForHash(record.codeHash)
  console.log(`[1.3] Found generated code: ${actualCode} (HMAC: ${record.codeHash.slice(0, 16)}...)`)

  // 1.4 Test wrong code
  console.log('[1.4] Testing wrong code "000000"...')
  const wrongRes = await fetch(`${API_BASE}/api/verification/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: plannerEmail, code: '000000' }),
  })
  const wrongData = await wrongRes.json()
  console.log('Wrong code response status:', wrongRes.status, wrongData)
  if (wrongRes.status !== 400 || wrongData.attemptsLeft !== 4) throw new Error('Expected 400 with 4 attempts left')

  // 1.5 Test correct code
  console.log(`[1.5] Verifying with correct code "${actualCode}"...`)
  const verifyRes = await fetch(`${API_BASE}/api/verification/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: plannerEmail, code: actualCode }),
  })
  const verifyData = await verifyRes.json()
  console.log('Verify response status:', verifyRes.status, verifyData)
  if (verifyRes.status !== 200 || !verifyData.verificationToken) throw new Error('Expected 200 with token')
  const verificationToken = verifyData.verificationToken

  // 1.6 Submit Planner Requirement
  console.log('[1.6] Submitting Planner requirement...')
  const plannerPayload = {
    eventName: 'Grand Heritage Wedding',
    eventType: 'Wedding',
    category: 'planner',
    startDate: '2027-11-15',
    endDate: '2027-11-18',
    location: { name: 'Jaipur, Rajasthan, India' },
    venue: { name: 'Rambagh Palace' },
    contactName: 'Maharaja Events',
    contactEmail: plannerEmail,
    contactPhone: '9876543210',
    verificationToken,
    details: {
      plannerScope: 'full',
      plannerGuestCount: 500,
      plannerVenueStatus: 'confirmed',
      plannerServices: ['venue', 'decor', 'catering', 'photography'],
      plannerBudget: '₹25,00,000',
      plannerTimeline: 'fixed',
      plannerExperience: '5+',
      plannerThemes: ['luxury', 'festive'],
    },
  }

  const postRes = await fetch(`${API_BASE}/api/requirements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plannerPayload),
  })
  const postData = await postRes.json()
  console.log('Post Requirement response status:', postRes.status, 'Reference ID:', postData.referenceId)
  if (postRes.status !== 201) throw new Error(`POST planner requirement failed: ${JSON.stringify(postData)}`)

  const plannerRefId = postData.referenceId

  // Allow async email delivery to settle
  await new Promise((r) => setTimeout(r, 200))
  const savedPlanner = await Requirements.findOne({ referenceId: plannerRefId })
  console.log('Saved document in MongoDB:', {
    referenceId: savedPlanner.referenceId,
    eventName: savedPlanner.eventName,
    category: savedPlanner.category,
    contactName: savedPlanner.contactName,
    contactEmail: savedPlanner.contactEmail,
    contactPhone: savedPlanner.contactPhone,
    emailVerified: savedPlanner.emailVerified,
    emailStatus: savedPlanner.emailStatus,
  })

  // 1.7 Test GET serializer privacy check
  console.log('[1.7] Testing GET privacy serialization...')
  const getRes = await fetch(`${API_BASE}/api/requirements/${plannerRefId}`)
  const getData = await getRes.json()
  console.log('GET /api/requirements/:id response fields:', Object.keys(getData.requirement))
  if (getData.requirement.contactEmail || getData.requirement.contactName || getData.requirement.contactPhone) {
    throw new Error('FAIL: GET returned contact details!')
  }
  console.log('✔ Privacy check passed: contact details stripped from GET response.')

  // ─────────────────────────────────────────────────────────────
  // TEST CATEGORY 2: PERFORMER
  // ─────────────────────────────────────────────────────────────
  console.log('\n======================================================')
  console.log('TEST 2: PERFORMER CATEGORY - FULL OTP FLOW')
  console.log('======================================================')

  const performerEmail = `performer_${Date.now()}@testgopratle.com`

  await fetch(`${API_BASE}/api/verification/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: performerEmail }),
  })
  const perfRec = await EmailVerification.findOne({ email: performerEmail }, { sort: { createdAt: -1 } })
  const perfCode = findCodeForHash(perfRec.codeHash)

  const perfVerifyRes = await fetch(`${API_BASE}/api/verification/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: performerEmail, code: perfCode }),
  })
  const perfVerifyData = await perfVerifyRes.json()

  const performerPayload = {
    eventName: 'Goa Electro Carnival',
    eventType: 'Music Festival',
    category: 'performer',
    startDate: '2027-12-25',
    location: { name: 'Anjuna, Goa, India' },
    venue: { name: 'Hilltop Arena' },
    contactName: 'Sunil Mehta',
    contactEmail: performerEmail,
    contactPhone: '+919988776655',
    verificationToken: perfVerifyData.verificationToken,
    details: {
      performerType: 'dj',
      performerDuration: 240,
      performerSound: 'yes',
      performerGenres: ['pop', 'rock'],
      performerBudgetMin: 75000,
      performerBudgetMax: 150000,
      performerStageSetup: 'outdoor-stage',
      performerLanguage: 'English',
    },
  }

  const perfPostRes = await fetch(`${API_BASE}/api/requirements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(performerPayload),
  })
  const perfPostData = await perfPostRes.json()
  console.log('Performer Post response status:', perfPostRes.status, 'Reference ID:', perfPostData.referenceId)
  if (perfPostRes.status !== 201) throw new Error('POST performer failed')

  // ─────────────────────────────────────────────────────────────
  // TEST CATEGORY 3: CREW
  // ─────────────────────────────────────────────────────────────
  console.log('\n======================================================')
  console.log('TEST 3: CREW CATEGORY - FULL OTP FLOW')
  console.log('======================================================')

  const crewEmail = `crew_${Date.now()}@testgopratle.com`

  await fetch(`${API_BASE}/api/verification/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: crewEmail }),
  })
  const crewRec = await EmailVerification.findOne({ email: crewEmail }, { sort: { createdAt: -1 } })
  const crewCode = findCodeForHash(crewRec.codeHash)

  const crewVerifyRes = await fetch(`${API_BASE}/api/verification/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: crewEmail, code: crewCode }),
  })
  const crewVerifyData = await crewVerifyRes.json()

  const crewPayload = {
    eventName: 'National Auto Expo 2027',
    eventType: 'Exhibition',
    category: 'crew',
    startDate: '2027-10-10',
    endDate: '2027-10-12',
    location: { name: 'Greater Noida, Uttar Pradesh, India' },
    venue: { name: 'India Expo Centre' },
    contactName: 'Vikram Singh',
    contactEmail: crewEmail,
    contactPhone: '7890123456',
    verificationToken: crewVerifyData.verificationToken,
    details: {
      crewShift: 'full-day',
      crewRolesNeeded: ['usher', 'av-tech', 'security', 'hospitality'],
      crewEquipmentNeeds: 'Uniforms & Radios provided',
      crewHeadcount: 40,
      crewBudgetPerHead: '₹2,500',
      crewPaymentTerms: '50-50',
      crewExtras: ['meals', 'uniform', 'transport'],
      crewNotes: 'Punctuality is essential.',
    },
  }

  const crewPostRes = await fetch(`${API_BASE}/api/requirements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(crewPayload),
  })
  const crewPostData = await crewPostRes.json()
  console.log('Crew Post response status:', crewPostRes.status, 'Reference ID:', crewPostData.referenceId)
  if (crewPostRes.status !== 201) throw new Error('POST crew failed')

  // Check saved crew document
  await new Promise((r) => setTimeout(r, 200))
  const savedCrew = await Requirements.findOne({ referenceId: crewPostData.referenceId })
  console.log('Saved crew document in MongoDB:', {
    referenceId: savedCrew.referenceId,
    category: savedCrew.category,
    contactName: savedCrew.contactName,
    contactEmail: savedCrew.contactEmail,
    contactPhone: savedCrew.contactPhone,
    emailVerified: savedCrew.emailVerified,
    emailStatus: savedCrew.emailStatus,
  })

  console.log('\n======================================================')
  console.log('🎉 ALL THREE CATEGORIES VERIFIED AND PERSISTED SUCCESSFULLY!')
  console.log('======================================================\n')

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error('Test failed with error:', err)
  process.exit(1)
})
