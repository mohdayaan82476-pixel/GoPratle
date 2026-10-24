import nodemailer from 'nodemailer'
import { env } from '../config/env'

export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') return '***'
  const parts = email.trim().toLowerCase().split('@')
  if (parts.length !== 2) return '***'
  const [user, domain] = parts
  const maskedUser =
    user.length <= 2 ? `${user[0]}***` : `${user[0]}***${user[user.length - 1]}`
  return `${maskedUser}@${domain}`
}

export function createTransporter() {
  const isAuthEnabled = Boolean(env.SMTP_USER && env.SMTP_USER.trim())
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: isAuthEnabled
      ? {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        }
      : undefined,
  })
}

export const transporter = createTransporter()

/**
 * Send 6-digit OTP verification email
 */
export async function sendVerificationCode(email: string, code: string): Promise<void> {
  const masked = maskEmail(email)
  const escapedCode = escapeHtml(code)

  const subject = 'Your GoPratle verification code'

  const text = `Your GoPratle verification code is: ${code}

This code will expire in 10 minutes.

If you did not request this verification code on GoPratle, please ignore this email.

— Team GoPratle`

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 24px; margin: 0; color: #1e293b;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 20px;">
      GoPratle
    </div>
    <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 12px; color: #0f172a;">
      Verify your email address
    </h2>
    <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px;">
      Please use the following 6-digit verification code to confirm your contact email for your GoPratle requirement:
    </p>
    <div style="background-color: #f1f5f9; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px;">
      <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; font-family: monospace; color: #0f172a;">
        ${escapedCode}
      </span>
    </div>
    <p style="font-size: 13px; color: #64748b; margin: 0 0 16px; line-height: 1.5;">
      ⏰ <strong>This code expires in 10 minutes.</strong>
    </p>
    <p style="font-size: 12px; color: #94a3b8; margin: 0; border-top: 1px solid #f1f5f9; padding-top: 16px;">
      If you did not request this verification code, no action is needed. Do not share this code with anyone.
    </p>
  </div>
</body>
</html>`

  const info = await transporter.sendMail({
    from: env.MAIL_FROM,
    to: email,
    subject,
    text,
    html,
  })

  // Never log raw code or full email address
  console.log(`[Mailer] Verification code email sent to ${masked}`)
  const previewUrl = nodemailer.getTestMessageUrl(info)
  if (previewUrl) {
    console.log(`[Mailer] Verification email preview URL: ${previewUrl}`)
  }
}

/**
 * Send requirement confirmation email
 */
export async function sendRequirementConfirmation(requirement: any): Promise<void> {
  const email = requirement.contactEmail
  const masked = maskEmail(email)

  const referenceId = escapeHtml(requirement.referenceId)
  const eventName = escapeHtml(requirement.eventName)
  const category = escapeHtml(requirement.category)
  const startDate = escapeHtml(requirement.startDate)
  const endDate = requirement.endDate ? escapeHtml(requirement.endDate) : ''
  const locationName = escapeHtml(
    requirement.location?.name || requirement.locationName || 'Location not specified'
  )
  const contactName = escapeHtml(requirement.contactName || 'Event Host')

  // Build category summary
  let detailsSummary = ''
  const details = requirement.details || {}

  if (category === 'planner') {
    detailsSummary = `
      <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Planning Scope:</td><td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 500;">${escapeHtml(details.plannerScope || '—')}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Guest Count:</td><td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 500;">${escapeHtml(details.plannerGuestCount || '—')}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Budget:</td><td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 500;">${escapeHtml(details.plannerBudget || '—')}</td></tr>
    `
  } else if (category === 'performer') {
    detailsSummary = `
      <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Performer Type:</td><td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 500;">${escapeHtml(details.performerType || '—')}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Duration:</td><td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 500;">${escapeHtml(details.performerDuration ? `${details.performerDuration} mins` : '—')}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Budget Range:</td><td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 500;">₹${escapeHtml(details.performerBudgetMin || 0)} – ₹${escapeHtml(details.performerBudgetMax || 0)}</td></tr>
    `
  } else if (category === 'crew') {
    const roles = Array.isArray(details.crewRolesNeeded) ? details.crewRolesNeeded.join(', ') : '—'
    detailsSummary = `
      <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Shift:</td><td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 500;">${escapeHtml(details.crewShift || '—')}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Staff Count:</td><td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 500;">${escapeHtml(details.crewHeadcount || '—')}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Roles Needed:</td><td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 500;">${escapeHtml(roles)}</td></tr>
    `
  }

  const subject = `Your GoPratle requirement ${requirement.referenceId} is received`

  const dateDisplay = endDate ? `${startDate} to ${endDate}` : startDate

  const text = `Hello ${requirement.contactName || 'Host'},

We have received your requirement on GoPratle!

Reference ID: ${requirement.referenceId}
Event: ${requirement.eventName}
Role/Category: ${requirement.category}
Dates: ${dateDisplay}
Location: ${requirement.location?.name || requirement.locationName || 'Location not specified'}

Verified talent matching your requirement will be notified and can express interest directly.

Thank you for choosing GoPratle!
— Team GoPratle`

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 24px; margin: 0; color: #1e293b;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 20px;">
      GoPratle
    </div>
    <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <h2 style="font-size: 16px; font-weight: 700; color: #065f46; margin: 0 0 4px;">
        Requirement Received!
      </h2>
      <p style="font-size: 13px; color: #047857; margin: 0;">
        Reference ID: <strong style="font-family: monospace;">${referenceId}</strong>
      </p>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px;">
      Hello <strong>${contactName}</strong>,
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px;">
      Your event requirement <strong>"${eventName}"</strong> has been saved and posted on GoPratle. Here is a summary of your listing:
    </p>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; padding: 12px 0;">
      <tr>
        <td style="padding: 6px 0; color: #64748b; font-size: 13px; width: 140px;">Category:</td>
        <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 600; text-transform: capitalize;">${category}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Dates:</td>
        <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 500;">${escapeHtml(dateDisplay)}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Location:</td>
        <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 500;">${locationName}</td>
      </tr>
      ${detailsSummary}
    </table>

    <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 24px;">
      Professionals in your region will be able to review your requirement. For your privacy, your contact details are kept secure and never displayed publicly.
    </p>

    <div style="font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px;">
      This email was sent to ${masked} because a requirement was posted with this email address.
    </div>
  </div>
</body>
</html>`

  const info = await transporter.sendMail({
    from: env.MAIL_FROM,
    to: email,
    subject,
    text,
    html,
  })

  console.log(`[Mailer] Confirmation email sent for ${requirement.referenceId} to ${masked}`)
  const previewUrl = nodemailer.getTestMessageUrl(info)
  if (previewUrl) {
    console.log(`[Mailer] Confirmation email preview URL: ${previewUrl}`)
  }
}
