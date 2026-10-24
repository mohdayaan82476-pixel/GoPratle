import mongoose from 'mongoose'
import crypto from 'crypto'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gopratle'
const OTP_SECRET = process.env.OTP_SECRET || 'gopratle_dev_otp_secret_key_1234567890'

async function reproduce() {
  const testEmail = `reproduce${Date.now()}@example.com`

  console.log('1. Sending OTP to:', testEmail)
  await fetch('http://127.0.0.1:5000/api/verification/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail }),
  })

  await mongoose.connect(MONGODB_URI)
  const rec = await mongoose.connection.db
    .collection('emailverifications')
    .findOne({ email: testEmail }, { sort: { createdAt: -1 } })

  let realCode = null
  for (let c = 100000; c <= 999999; c++) {
    const s = c.toString()
    if (crypto.createHmac('sha256', OTP_SECRET).update(s).digest('hex') === rec.codeHash) {
      realCode = s
      break
    }
  }

  const vRes = await fetch('http://127.0.0.1:5000/api/verification/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, code: realCode }),
  })
  const vData = await vRes.json()
  const token = vData.verificationToken

  // Frontend payload simulation
  const payloadFromFrontend = {
    eventName: 'Tech Leaders Gala 2026',
    eventType: 'Conference',
    category: 'planner',
    startDate: '2026-10-24', // Today's date in local time
    endDate: '', // empty string when optional endDate not selected
    location: {
      name: 'Mumbai, Maharashtra, India',
      placeId: 'ChIJwe1EZjDG5zsRaYxkjY_oFow',
      address: 'Mumbai, Maharashtra, India',
      lat: 19.076,
      lng: 72.8777,
      unverified: false,
    },
    locationName: 'Mumbai, Maharashtra, India',
    venue: null, // when venue is empty or cleared
    venueName: '',
    contactName: 'Ayaan Ahmed',
    contactEmail: testEmail,
    contactPhone: '', // optional phone left empty string
    verificationToken: token,

    // Category fields as sent by CategoryForm (strings from <input> and <select>)
    plannerScope: 'full',
    plannerGuestCount: '150', // string from <input type="number">
    plannerVenueStatus: 'searching',
    plannerServices: ['venue', 'decor', 'catering'],
    plannerBudget: '₹5,00,000',
    plannerTimeline: 'flexible',
    plannerExperience: '',
    plannerThemes: ['corporate'],
  }

  console.log('\n--- POSTING PAYLOAD ---')
  console.log(JSON.stringify(payloadFromFrontend, null, 2))

  const postRes = await fetch('http://127.0.0.1:5000/api/requirements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payloadFromFrontend),
  })

  console.log('\n--- RESPONSE STATUS ---')
  console.log('Status:', postRes.status)
  const json = await postRes.json()
  console.log('\n--- FULL RESPONSE ---')
  console.log(JSON.stringify(json, null, 2))

  // 2. Test Performer
  const perfEmail = `perf${Date.now()}@example.com`
  await fetch('http://127.0.0.1:5000/api/verification/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: perfEmail }),
  })
  const perfRec = await mongoose.connection.db
    .collection('emailverifications')
    .findOne({ email: perfEmail }, { sort: { createdAt: -1 } })
  let perfCode = null
  for (let c = 100000; c <= 999999; c++) {
    const s = c.toString()
    if (crypto.createHmac('sha256', OTP_SECRET).update(s).digest('hex') === perfRec.codeHash) {
      perfCode = s
      break
    }
  }
  const perfVRes = await fetch('http://127.0.0.1:5000/api/verification/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: perfEmail, code: perfCode }),
  })
  const perfVData = await perfVRes.json()
  const perfPostRes = await fetch('http://127.0.0.1:5000/api/requirements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName: 'Rock Night Live',
      eventType: 'Concert',
      category: 'performer',
      startDate: '2026-10-24',
      endDate: '',
      location: { name: 'Bengaluru, Karnataka, India', address: 'MG Road', placeId: 'abc123' },
      venue: null,
      contactName: 'Rohit Verma',
      contactEmail: perfEmail,
      contactPhone: '+919876543210',
      verificationToken: perfVData.verificationToken,
      performerType: 'live-band',
      performerDuration: '120',
      performerSound: 'yes',
      performerGenres: ['rock', 'pop'],
      performerBudgetMin: '50000',
      performerBudgetMax: '100000',
      performerStageSetup: '',
      performerLanguage: 'Hindi, English',
    }),
  })
  console.log('\n--- PERFORMER STATUS ---', perfPostRes.status)

  // 3. Test Crew
  const crewEmail = `crew${Date.now()}@example.com`
  await fetch('http://127.0.0.1:5000/api/verification/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: crewEmail }),
  })
  const crewRec = await mongoose.connection.db
    .collection('emailverifications')
    .findOne({ email: crewEmail }, { sort: { createdAt: -1 } })
  let crewCode = null
  for (let c = 100000; c <= 999999; c++) {
    const s = c.toString()
    if (crypto.createHmac('sha256', OTP_SECRET).update(s).digest('hex') === crewRec.codeHash) {
      crewCode = s
      break
    }
  }
  const crewVRes = await fetch('http://127.0.0.1:5000/api/verification/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: crewEmail, code: crewCode }),
  })
  const crewVData = await crewVRes.json()
  const crewPostRes = await fetch('http://127.0.0.1:5000/api/requirements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName: 'Summit Operations Crew',
      eventType: 'Summit',
      category: 'crew',
      startDate: '2026-10-24',
      endDate: '',
      location: { name: 'New Delhi, Delhi, India' },
      venue: null,
      contactName: 'Suresh Kumar',
      contactEmail: crewEmail,
      contactPhone: '',
      verificationToken: crewVData.verificationToken,
      crewShift: 'morning',
      crewRolesNeeded: ['usher', 'av-tech'],
      crewEquipmentNeeds: '',
      crewHeadcount: '15',
      crewBudgetPerHead: '₹2,500',
      crewPaymentTerms: '',
      crewExtras: ['meals', 'transport'],
      crewNotes: '',
    }),
  })
  console.log('\n--- CREW STATUS ---', crewPostRes.status)

  await mongoose.disconnect()
}

reproduce().catch(console.error)

