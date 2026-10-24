'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from '@/lib/form-context'
import { CATEGORY_CONFIGS } from '@/lib/category-config'
import { FormData } from '@/lib/types'
import {
  createRequirement,
  sendVerificationCode,
  verifyEmailCode,
  maskEmail,
  VerificationApiError,
  ApiError,
  normalizeErrorMessage,
} from '@/lib/api'
import StepProgress from '@/components/StepProgress'
import {
  Check,
  CheckCircle2,
  AlertCircle,
  Mail,
  User,
  Phone,
  ShieldCheck,
  RefreshCw,
  Edit2,
  ArrowRight,
  Copy,
} from 'lucide-react'

function dl(label: string, value: string | string[] | undefined) {
  const display = Array.isArray(value)
    ? value.length > 0
      ? value.join(', ')
      : '—'
    : value?.trim()
    ? value
    : '—'
  return (
    <div className="flex justify-between gap-4 py-2.5 border-b border-border last:border-0">
      <dt className="text-[14px] text-muted shrink-0">{label}</dt>
      <dd className="text-[14px] text-ink font-medium text-right">{display}</dd>
    </div>
  )
}

function Section({
  title,
  href,
  children,
}: {
  title: string
  href: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[15px] sm:text-[16px] font-display font-semibold text-ink">
          {title}
        </h3>
        <Link
          href={href}
          className="text-xs text-brand hover:underline font-semibold"
        >
          Edit
        </Link>
      </div>
      <dl className="bg-surface border border-border rounded-xl px-5 py-1">
        {children}
      </dl>
    </div>
  )
}

export default function Step4Page() {
  const router = useRouter()
  const { form, reset } = useForm()

  // Contact details state
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  // Verification state (stored in React state ONLY, never localStorage)
  const [codeSent, setCodeSent] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [codeValues, setCodeValues] = useState<string[]>(['', '', '', '', '', ''])
  const [verifying, setVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verificationToken, setVerificationToken] = useState<string>('')
  const [verifiedEmail, setVerifiedEmail] = useState<string>('')

  // Verification countdown & errors
  const [countdown, setCountdown] = useState(0)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null)

  // Submission state
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [reqId, setReqId] = useState('')
  const [submissionEmailStatus, setSubmissionEmailStatus] = useState<
    'sent' | 'failed' | 'pending'
  >('pending')
  const [serverError, setServerError] = useState('')
  const [validationDetails, setValidationDetails] = useState<
    { step: number; title: string; href: string; field: string; message: string }[]
  >([])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [copied, setCopied] = useState(false)
  const [shake, setShake] = useState(false)
  const isVerifyingRef = useRef(false)

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([])
  const contactCardRef = useRef<HTMLDivElement | null>(null)
  const serverErrorRef = useRef<HTMLDivElement | null>(null)

  const category = form.category
  const config = category ? CATEGORY_CONFIGS[category] : null

  function getFieldStepInfo(
    field: string,
    cat: string
  ): { step: number; title: string; href: string } {
    if (
      [
        'eventName',
        'eventType',
        'category',
        'startDate',
        'endDate',
        'location',
        'venue',
        'locationName',
        'venueName',
      ].some((f) => field === f || field.startsWith(`${f}.`))
    ) {
      return { step: 1, title: 'Event basics', href: '/post-requirement/step-1' }
    }

    if (
      ['contactName', 'contactEmail', 'contactPhone', 'verificationToken'].includes(
        field
      )
    ) {
      return { step: 4, title: 'Contact details', href: '#contact-details-card' }
    }

    if (
      [
        'plannerScope',
        'plannerGuestCount',
        'plannerVenueStatus',
        'plannerServices',
      ].some((f) => field.includes(f))
    ) {
      return {
        step: 2,
        title: 'Event Planner details',
        href: `/post-requirement/step-2/${cat}`,
      }
    }
    if (
      [
        'plannerBudget',
        'plannerTimeline',
        'plannerExperience',
        'plannerThemes',
      ].some((f) => field.includes(f))
    ) {
      return {
        step: 3,
        title: 'Event Planner preferences',
        href: `/post-requirement/step-3/${cat}`,
      }
    }

    if (
      [
        'performerType',
        'performerDuration',
        'performerSound',
        'performerGenres',
      ].some((f) => field.includes(f))
    ) {
      return {
        step: 2,
        title: 'Performer details',
        href: `/post-requirement/step-2/${cat}`,
      }
    }
    if (
      [
        'performerBudgetMin',
        'performerBudgetMax',
        'performerStageSetup',
        'performerLanguage',
      ].some((f) => field.includes(f))
    ) {
      return {
        step: 3,
        title: 'Performer preferences',
        href: `/post-requirement/step-3/${cat}`,
      }
    }

    if (
      ['crewShift', 'crewRolesNeeded', 'crewEquipmentNeeds'].some((f) =>
        field.includes(f)
      )
    ) {
      return {
        step: 2,
        title: 'Event crew details',
        href: `/post-requirement/step-2/${cat}`,
      }
    }
    if (
      [
        'crewHeadcount',
        'crewBudgetPerHead',
        'crewPaymentTerms',
        'crewExtras',
        'crewNotes',
      ].some((f) => field.includes(f))
    ) {
      return {
        step: 3,
        title: 'Crew preferences',
        href: `/post-requirement/step-3/${cat}`,
      }
    }

    return { step: 1, title: 'Event details', href: '/post-requirement/step-1' }
  }

  // Confetti burst on success (lazy-loaded, skipped under prefers-reduced-motion)
  useEffect(() => {
    if (!submitted) return
    if (typeof window === 'undefined') return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    import('canvas-confetti')
      .then((module) => {
        const confetti = module.default
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          disableForReducedMotion: true,
        })
      })
      .catch(() => {})
  }, [submitted])

  function handleCopyId() {
    if (!reqId) return
    navigator.clipboard.writeText(reqId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  // 60-second timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((c) => c - 1)
      }, 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  // Handle email changes: reset verification if user modifies email
  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newEmail = e.target.value
    setContactEmail(newEmail)

    // Reset verification if email changed after verification or sending
    if (isVerified || codeSent) {
      setIsVerified(false)
      setVerificationToken('')
      setCodeSent(false)
      setCodeValues(['', '', '', '', '', ''])
      setVerificationError(null)
      setAttemptsRemaining(null)
    }
  }

  // Send verification code
  async function handleSendCode() {
    const trimmedEmail = contactEmail.trim().toLowerCase()
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setVerificationError('Please enter a valid email address.')
      return
    }

    if (!contactName.trim()) {
      setVerificationError('Please enter your full name before requesting a code.')
      return
    }

    setSendingCode(true)
    setVerificationError(null)

    try {
      await sendVerificationCode(trimmedEmail)
      setCodeSent(true)
      setCountdown(60)
      setCodeValues(['', '', '', '', '', ''])
      setAttemptsRemaining(null)
      // Focus first OTP input after DOM updates
      setTimeout(() => {
        otpInputsRef.current[0]?.focus()
      }, 100)
    } catch (err: any) {
      if (err instanceof VerificationApiError && err.status === 429) {
        setVerificationError(
          err.message || 'Please wait before requesting another code.'
        )
        if (err.retryAfter) setCountdown(err.retryAfter)
      } else {
        setVerificationError(normalizeErrorMessage(err))
      }
    } finally {
      setSendingCode(false)
    }
  }

  // Handle OTP digit change with auto-advance and auto-verify
  function handleOtpChange(index: number, val: string) {
    if (verifying || isVerifyingRef.current) return
    const digit = val.replace(/\D/g, '').slice(-1) // accept only single digit
    const updated = [...codeValues]
    updated[index] = digit
    setCodeValues(updated)
    setVerificationError(null)

    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus()
    }

    // Auto-verify when 6th digit is entered
    if (digit && updated.every((d) => d.length === 1)) {
      triggerVerify(updated.join(''))
    }
  }

  // Handle Backspace navigation
  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (!codeValues[index] && index > 0) {
        otpInputsRef.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputsRef.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputsRef.current[index + 1]?.focus()
    }
  }

  // Handle OTP Paste
  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    if (verifying || isVerifyingRef.current) return
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return

    const updated = [...codeValues]
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || ''
    }
    setCodeValues(updated)
    setVerificationError(null)

    // Focus appropriate input
    const nextIdx = Math.min(pasted.length, 5)
    otpInputsRef.current[nextIdx]?.focus()

    // Auto-verify if all 6 digits pasted
    if (pasted.length === 6) {
      triggerVerify(pasted)
    }
  }

  // Trigger verify with a given or current code
  async function triggerVerify(rawCode?: string) {
    const code = rawCode || codeValues.join('')
    if (code.length !== 6) {
      setVerificationError('Please enter all 6 digits of the code.')
      return
    }

    // Guard against duplicate requests
    if (isVerifyingRef.current || verifying) {
      return
    }

    isVerifyingRef.current = true
    setVerifying(true)
    setVerificationError(null)

    try {
      const res = await verifyEmailCode(contactEmail, code)
      if (res.verified && res.verificationToken) {
        setIsVerified(true)
        setVerificationToken(res.verificationToken)
        setVerifiedEmail(contactEmail.trim().toLowerCase())
        setCodeSent(false)
        setVerificationError(null)
        setAttemptsRemaining(null)
      }
    } catch (err: any) {
      // Trigger shake animation on wrong code / verification error
      setShake(true)
      setTimeout(() => setShake(false), 400)

      if (err instanceof VerificationApiError) {
        if (err.attemptsLeft !== undefined) {
          setAttemptsRemaining(err.attemptsLeft)
          setVerificationError(
            err.attemptsLeft === 0
              ? 'Code locked after 5 failed attempts. Please request a new code.'
              : `Invalid verification code. ${err.attemptsLeft} attempt${
                  err.attemptsLeft === 1 ? '' : 's'
                } remaining.`
          )
        } else if (err.expired) {
          setVerificationError(
            'Verification code has expired. Please request a new code.'
          )
        } else {
          setVerificationError(normalizeErrorMessage(err))
        }
      } else {
        setVerificationError(normalizeErrorMessage(err))
      }
    } finally {
      setVerifying(false)
      isVerifyingRef.current = false
    }
  }

  // Reset to change email
  function handleChangeEmail() {
    setCodeSent(false)
    setIsVerified(false)
    setVerificationToken('')
    setCodeValues(['', '', '', '', '', ''])
    setVerificationError(null)
    setAttemptsRemaining(null)
  }

  // Handle final submission
  async function handleSubmit() {
    if (!isVerified || !verificationToken) {
      setServerError('Please verify your email address before submitting.')
      contactCardRef.current?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    if (!contactName.trim()) {
      setServerError('Please provide your full name.')
      contactCardRef.current?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    setSubmitting(true)
    setServerError('')
    setValidationDetails([])
    setFieldErrors({})

    try {
      // Prepare location payload
      let locationPayload: Record<string, unknown> | undefined
      if (form.locationData && form.locationData.name) {
        locationPayload = {
          name: form.locationData.name.trim(),
          placeId: form.locationData.placeId || undefined,
          address: form.locationData.address || undefined,
          lat: form.locationData.lat,
          lng: form.locationData.lng,
          unverified: form.locationData.unverified,
        }
      } else if (form.location && form.location.trim()) {
        locationPayload = {
          name: form.location.trim(),
          unverified: true,
        }
      }

      // Prepare venue payload (null if not provided or empty)
      let venuePayload: Record<string, unknown> | null = null
      if (form.venueData && form.venueData.name && form.venueData.name.trim()) {
        venuePayload = {
          name: form.venueData.name.trim(),
          placeId: form.venueData.placeId || undefined,
          address: form.venueData.address || undefined,
          lat: form.venueData.lat,
          lng: form.venueData.lng,
          unverified: form.venueData.unverified,
        }
      } else if (form.venue && form.venue.trim()) {
        venuePayload = {
          name: form.venue.trim(),
          unverified: true,
        }
      }

      const body: Record<string, unknown> = {
        eventName: form.eventName.trim(),
        eventType: form.eventType?.trim() || undefined,
        category: form.category,
        startDate: form.startDate,
        endDate: form.endDate?.trim() || undefined,
        location: locationPayload,
        locationName: form.location?.trim() || undefined,
        venue: venuePayload,
        venueName: form.venue?.trim() || undefined,

        // Contact info & verification token
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim().toLowerCase(),
        contactPhone: contactPhone.trim() ? contactPhone.trim() : undefined,
        verificationToken,
      }

      // Attach category-specific fields, casting numbers appropriately
      const numericFields = new Set([
        'plannerGuestCount',
        'performerDuration',
        'performerBudgetMin',
        'performerBudgetMax',
        'crewHeadcount',
      ])

      if (category && config) {
        ;[...config.step2Fields, ...config.step3Fields].forEach((f) => {
          const k = f.name as keyof FormData
          const val = form[k]
          if (val !== undefined && val !== null && val !== '') {
            if (numericFields.has(f.name)) {
              const parsedNum = Number(val)
              body[f.name] = !isNaN(parsedNum) ? parsedNum : val
            } else {
              body[f.name] = val
            }
          }
        })
      }

      const saved = await createRequirement(body)
      setReqId(saved.id || (saved as any).referenceId || `GPR-${Date.now()}`)
      setSubmissionEmailStatus(
        (saved as any).emailStatus === 'failed' ? 'failed' : 'sent'
      )
      setSubmitted(true)
      reset()
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 403) {
        setIsVerified(false)
        setVerificationToken('')
        setCodeSent(false)
        setServerError('Email verification expired or invalid. Please verify your email again.')
        setValidationDetails([])
        setFieldErrors({})
        contactCardRef.current?.scrollIntoView({ behavior: 'smooth' })
      } else if (err instanceof ApiError && err.status === 422) {
        const details = err.details || []
        const fieldMap: Record<string, string> = {}
        const items: { step: number; title: string; href: string; field: string; message: string }[] = []

        details.forEach((d) => {
          const cleanField = d.field.replace(/^details\./, '')
          fieldMap[cleanField] = d.message
          const stepInfo = getFieldStepInfo(cleanField, category || 'planner')
          items.push({
            ...stepInfo,
            field: cleanField,
            message: d.message,
          })
        })

        setValidationDetails(items)
        setFieldErrors(fieldMap)
        setServerError('')

        // If there's an error on step 4 fields, scroll to and focus that input
        const step4Field = details.find((d) =>
          ['contactName', 'contactEmail', 'contactPhone', 'verificationToken'].includes(d.field)
        )
        if (step4Field) {
          const inputEl = document.getElementById(step4Field.field)
          if (inputEl) {
            inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
            inputEl.focus()
          } else {
            contactCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        } else {
          serverErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      } else {
        setServerError(normalizeErrorMessage(err))
        setValidationDetails([])
        setFieldErrors({})
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    const masked = maskEmail(verifiedEmail || contactEmail)
    return (
      <div className="w-full">
        <div className="bg-surface border border-border rounded-2xl p-8 sm:p-12 text-center shadow-sm">
          {/* Success banner */}
          <div className="mb-6 p-4 rounded-xl bg-band-soft/70 border border-border flex items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-white shrink-0">
              <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />
            </div>
            <div className="text-left">
              <h2 className="text-sm font-semibold text-ink">
                Requirement saved successfully!
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-muted">
                  Reference ID:{' '}
                  <strong className="text-brand font-semibold">{reqId}</strong>
                </p>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-brand bg-surface border border-border rounded-md hover:bg-page transition-colors cursor-pointer"
                  aria-label="Copy reference ID"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-success stroke-[2.5]" aria-hidden="true" />
                      <span className="text-success font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-muted" aria-hidden="true" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <h1 className="text-[26px] sm:text-[30px] font-display font-bold text-ink mb-2">
            We received your event request
          </h1>

          {/* Email Confirmation Notice */}
          <div className="my-6 max-w-md mx-auto p-4 rounded-xl bg-surface-subtle border border-border text-center">
            {submissionEmailStatus === 'failed' ? (
              <p className="text-sm text-error flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                We saved your requirement, but couldn&apos;t send the email.
              </p>
            ) : (
              <p className="text-sm text-muted">
                A confirmation has been sent to{' '}
                <strong className="text-ink font-semibold">{masked}</strong>.
              </p>
            )}
          </div>

          <p className="text-[15px] text-muted max-w-md mx-auto mb-8">
            Verified professionals in your area will review your details and send
            customized quotes directly to your dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/requirements"
              className="btn-secondary min-h-[44px] inline-flex items-center justify-center"
            >
              Browse live requirements
            </Link>
            <button
              onClick={() => {
                reset()
                router.push('/post-requirement/step-1')
              }}
              className="btn-secondary min-h-[44px]"
            >
              Post another requirement
            </button>
            <Link href="/" className="btn-primary min-h-[44px] inline-flex items-center justify-center">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Review & Submit state ───────────────────────────────────────────────────
  return (
    <div className="w-full">
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
        <StepProgress current={4} />

        <h2 className="text-[22px] sm:text-[24px] font-display font-semibold text-ink mb-1">
          Review and submit
        </h2>
        <p className="text-[14px] text-muted mb-6">
          Check all details and verify your contact email before submitting.
        </p>

        {/* Validation or server error banner */}
        {(serverError || validationDetails.length > 0) && (
          <div
            ref={serverErrorRef}
            role="alert"
            aria-live="polite"
            className="mb-5 p-4 bg-error-bg border border-error/30 rounded-xl flex flex-col gap-2.5"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-error">
                  {validationDetails.length > 0
                    ? 'Please review the following requirements before submitting:'
                    : serverError}
                </p>
                {validationDetails.length > 0 && (
                  <ul className="mt-2.5 space-y-1.5 text-xs text-error">
                    {validationDetails.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 bg-surface/80 p-2.5 rounded-lg border border-error/20"
                      >
                        <span>
                          <strong className="font-semibold text-ink">
                            Step {item.step} ({item.title}):
                          </strong>{' '}
                          {item.message}
                        </span>
                        {item.href.startsWith('#') ? (
                          <button
                            type="button"
                            onClick={() => {
                              const el =
                                document.getElementById(item.field) ||
                                contactCardRef.current
                              el?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center',
                              })
                              if (el instanceof HTMLInputElement) el.focus()
                            }}
                            className="text-brand font-semibold hover:underline shrink-0 text-xs text-left cursor-pointer"
                          >
                            Go to field &rarr;
                          </button>
                        ) : (
                          <Link
                            href={item.href}
                            className="text-brand font-semibold hover:underline shrink-0 text-xs inline-flex items-center gap-1"
                          >
                            Edit Step {item.step} &rarr;
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                className="text-xs font-semibold text-error underline shrink-0 cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Event basics */}
        <Section title="Event basics" href="/post-requirement/step-1">
          {dl('Event name', form.eventName)}
          {form.eventType && dl('Event type', form.eventType)}
          {dl('Category', form.category)}
          {dl('Start date', form.startDate)}
          {dl('End date', form.endDate || '—')}
          {dl(
            'Location',
            form.location
              ? `${form.location}${
                  form.locationData && !form.locationData.unverified
                    ? ' (Verified)'
                    : ''
                }`
              : '—'
          )}
          {dl('Venue', form.venue || '—')}
        </Section>

        {/* Category step 2 */}
        {config && (
          <Section
            title={config.step2Label}
            href={`/post-requirement/step-2/${category}`}
          >
            {config.step2Fields.map((f) => {
              const v = form[f.name as keyof FormData]
              return dl(
                f.label,
                typeof v === 'string'
                  ? v
                  : Array.isArray(v)
                  ? v
                  : undefined
              )
            })}
          </Section>
        )}

        {/* Category step 3 */}
        {config && (
          <Section
            title={config.step3Label}
            href={`/post-requirement/step-3/${category}`}
          >
            {config.step3Fields.map((f) => {
              const v = form[f.name as keyof FormData]
              return dl(
                f.label,
                typeof v === 'string'
                  ? v
                  : Array.isArray(v)
                  ? v
                  : undefined
              )
            })}
          </Section>
        )}

        {/* ── Contact Details & Verification Card ───────────────────────────── */}
        <div
          ref={contactCardRef}
          id="contact-details-card"
          className="mb-6 p-5 sm:p-6 bg-surface-subtle border border-border rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-brand" />
            <h3 className="text-[16px] sm:text-[17px] font-display font-semibold text-ink">
              Contact details & verification
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="contactName"
                className="block text-xs font-semibold text-ink mb-1.5"
              >
                Full name <span className="text-brand">*</span>
              </label>
              <div className="relative">
                <input
                  id="contactName"
                  type="text"
                  value={contactName}
                  onChange={(e) => {
                    setContactName(e.target.value)
                    if (fieldErrors['contactName']) {
                      setFieldErrors((prev) => ({ ...prev, contactName: '' }))
                    }
                  }}
                  disabled={isVerified}
                  placeholder="e.g. Priya Sharma"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent disabled:opacity-75 disabled:bg-surface-subtle min-h-[44px] ${
                    fieldErrors['contactName']
                      ? 'border-error ring-1 ring-error'
                      : 'border-border'
                  }`}
                  required
                />
              </div>
              {fieldErrors['contactName'] && (
                <p className="text-xs text-error mt-1">{fieldErrors['contactName']}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="contactEmail"
                className="block text-xs font-semibold text-ink mb-1.5"
              >
                Email address <span className="text-brand">*</span>
              </label>
              <div className="relative">
                <input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => {
                    handleEmailChange(e)
                    if (fieldErrors['contactEmail']) {
                      setFieldErrors((prev) => ({ ...prev, contactEmail: '' }))
                    }
                  }}
                  disabled={isVerified}
                  placeholder="you@example.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent disabled:opacity-75 disabled:bg-surface-subtle min-h-[44px] ${
                    fieldErrors['contactEmail']
                      ? 'border-error ring-1 ring-error'
                      : 'border-border'
                  }`}
                  required
                />
              </div>
              {fieldErrors['contactEmail'] && (
                <p className="text-xs text-error mt-1">{fieldErrors['contactEmail']}</p>
              )}
            </div>

            {/* Phone Number (Optional) */}
            <div className="sm:col-span-2">
              <label
                htmlFor="contactPhone"
                className="block text-xs font-semibold text-ink mb-1.5"
              >
                Phone number <span className="text-muted font-normal">(optional, Indian mobile)</span>
              </label>
              <input
                id="contactPhone"
                type="tel"
                value={contactPhone}
                onChange={(e) => {
                  setContactPhone(e.target.value)
                  if (fieldErrors['contactPhone']) {
                    setFieldErrors((prev) => ({ ...prev, contactPhone: '' }))
                  }
                }}
                placeholder="+91 98765 43210"
                className={`w-full sm:max-w-md px-3.5 py-2.5 rounded-xl border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent min-h-[44px] ${
                  fieldErrors['contactPhone']
                    ? 'border-error ring-1 ring-error'
                    : 'border-border'
                }`}
              />
              {fieldErrors['contactPhone'] && (
                <p className="text-xs text-error mt-1">{fieldErrors['contactPhone']}</p>
              )}
            </div>
          </div>

          {/* Privacy Consent Line */}
          <p className="text-xs text-muted mb-4">
            We&apos;ll use these details only to confirm and follow up on your requirement.
          </p>

          {/* Verification Actions Area */}
          {!isVerified && !codeSent && (
            <div className="pt-2">
              <button
                type="button"
                id="send-code-btn"
                onClick={handleSendCode}
                disabled={sendingCode || !contactEmail.trim() || !contactName.trim()}
                className="btn-primary min-h-[44px] text-xs font-semibold px-5 py-2.5 rounded-full inline-flex items-center gap-2 disabled:opacity-50"
              >
                {sendingCode ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Sending code…
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    Send verification code
                  </>
                )}
              </button>
            </div>
          )}

          {/* 6-box OTP entry section */}
          {!isVerified && codeSent && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-xs text-muted">
                  Enter the 6-digit code sent to{' '}
                  <strong className="text-ink font-semibold">
                    {maskEmail(contactEmail)}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  className="text-xs text-brand hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <Edit2 className="w-3 h-3" /> Change email
                </button>
              </div>

              {/* 6 OTP boxes */}
              <div className={`flex items-center gap-2 sm:gap-3 mb-4 ${shake ? 'animate-shake' : ''}`}>
                {codeValues.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpInputsRef.current[i] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    disabled={verifying}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                    aria-label={`Digit ${i + 1} of verification code`}
                    className="w-11 h-12 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-mono font-bold border border-border rounded-xl bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                ))}
              </div>

              {/* Verify & Resend buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  id="verify-code-btn"
                  onClick={() => triggerVerify()}
                  disabled={verifying || codeValues.join('').length !== 6}
                  className="btn-primary min-h-[44px] text-xs font-semibold px-5 py-2 rounded-full inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    'Verify code'
                  )}
                </button>

                {countdown > 0 ? (
                  <span className="text-xs text-muted">
                    Resend code in <strong className="font-semibold text-ink">{countdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sendingCode}
                    className="text-xs text-brand hover:underline font-semibold min-h-[44px] flex items-center"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Inline Error for OTP */}
          {verificationError && (
            <div
              role="alert"
              aria-live="polite"
              className="mt-3 p-3 bg-error-bg border border-error/30 rounded-xl flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
              <p className="text-xs text-error font-medium">{verificationError}</p>
            </div>
          )}

          {/* Green Verified State */}
          {isVerified && (
            <div className="mt-2 p-3.5 bg-success/10 border border-success/30 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-white shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-success">Email verified</h4>
                  <p className="text-xs text-muted">
                    Verified for {maskEmail(contactEmail)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleChangeEmail}
                className="text-xs text-muted hover:text-ink underline"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-border">
          <Link
            href={`/post-requirement/step-3/${category}`}
            className="btn-secondary min-h-[44px]"
          >
            Back
          </Link>

          <button
            type="button"
            id="submit-requirement-btn"
            onClick={handleSubmit}
            disabled={submitting || !isVerified}
            className="btn-primary min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Submitting…
              </span>
            ) : isVerified ? (
              'Submit requirement'
            ) : (
              'Verify email to submit'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
