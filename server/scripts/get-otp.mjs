import mongoose from 'mongoose'
import crypto from 'crypto'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gopratle'
const OTP_SECRET = process.env.OTP_SECRET || 'gopratle_dev_otp_secret_key_1234567890'

async function getOtp() {
  const targetEmail = process.argv[2]?.trim().toLowerCase()

  await mongoose.connect(MONGODB_URI)
  const db = mongoose.connection.db
  const collection = db.collection('emailverifications')

  const query = targetEmail ? { email: targetEmail } : {}
  const latest = await collection.findOne(query, { sort: { createdAt: -1 } })

  if (!latest) {
    console.log(targetEmail ? `No verification records found for ${targetEmail}` : 'No verification records found.')
    await mongoose.disconnect()
    return
  }

  // Brute force 6 digits against HMAC-SHA256 (takes ~30ms)
  let foundCode = null
  for (let c = 100000; c <= 999999; c++) {
    const codeStr = c.toString()
    const hash = crypto.createHmac('sha256', OTP_SECRET).update(codeStr).digest('hex')
    if (hash === latest.codeHash) {
      foundCode = codeStr
      break
    }
  }

  const isExpired = new Date() > new Date(latest.expiresAt)

  console.log('\n========================================')
  console.log('       GoPratle Local Dev OTP Helper     ')
  console.log('========================================')
  console.log(`Email:        ${latest.email}`)
  console.log(`OTP Code:     ${foundCode || 'Could not resolve code'}`)
  console.log(`Status:       ${latest.consumed ? 'CONSUMED' : isExpired ? 'EXPIRED' : 'ACTIVE'}`)
  console.log(`Attempts:     ${latest.attempts} / 5`)
  console.log(`Created:      ${new Date(latest.createdAt).toLocaleTimeString()}`)
  console.log(`Expires:      ${new Date(latest.expiresAt).toLocaleTimeString()}`)
  console.log('========================================\n')

  await mongoose.disconnect()
}

getOtp().catch(console.error)
