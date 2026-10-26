import type { ProRole, Requirement } from './types'

export interface RequirementFilters {
  category?: ProRole | ProRole[] | string | string[]
  location?: string
  from?: string
  to?: string
  sort?: 'newest' | 'eventDate'
  page?: number
  limit?: number
}

export interface RequirementsListResponse {
  requirements: Requirement[]
  count: number
  page: number
  totalPages: number
}

export interface ApiErrorDetail {
  field: string
  message: string
}

export class ApiError extends Error {
  public status: number
  public details?: ApiErrorDetail[]

  constructor(message: string, status: number, details?: ApiErrorDetail[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL

// Startup check: validate NEXT_PUBLIC_API_URL is configured
if (!rawApiUrl || rawApiUrl.trim() === '') {
  console.error(
    '[GoPratle API] Error: NEXT_PUBLIC_API_URL environment variable is missing or undefined! Falling back to http://localhost:5000. Ensure NEXT_PUBLIC_API_URL is defined in .env.local.'
  )
}

export const API_BASE = (rawApiUrl && rawApiUrl.trim() !== '' ? rawApiUrl : 'http://localhost:5000')
  .trim()
  .replace(/\/+$/, '')

/**
 * Normalizes error messages so network failures return friendly message
 * and never expose raw browser "Failed to fetch"
 */
export function normalizeErrorMessage(err: any): string {
  if (!err) return "Can't reach the server. Please try again."
  const msg = typeof err === 'string' ? err : err.message || ''
  if (
    err.name === 'TypeError' ||
    msg === 'Failed to fetch' ||
    msg.toLowerCase().includes('failed to fetch') ||
    msg.toLowerCase().includes('networkerror') ||
    msg.toLowerCase().includes('load failed') ||
    msg.toLowerCase().includes('network error')
  ) {
    return "Can't reach the server. Please try again."
  }
  return msg || "Can't reach the server. Please try again."
}

/**
 * Fetch a list of requirements with optional filters and pagination
 */
export async function getRequirements(
  filters: RequirementFilters = {}
): Promise<RequirementsListResponse> {
  const params = new URLSearchParams()

  if (filters.category) {
    if (Array.isArray(filters.category)) {
      filters.category.forEach((cat) => params.append('category', cat))
    } else {
      params.set('category', filters.category)
    }
  }

  if (filters.location && filters.location.trim()) {
    params.set('location', filters.location.trim())
  }

  if (filters.from && filters.from.trim()) {
    params.set('from', filters.from.trim())
  }

  if (filters.to && filters.to.trim()) {
    params.set('to', filters.to.trim())
  }

  if (filters.sort) {
    params.set('sort', filters.sort)
  }

  if (filters.page) {
    params.set('page', String(filters.page))
  }

  if (filters.limit) {
    params.set('limit', String(filters.limit))
  }

  const queryString = params.toString()
  const url = `${API_BASE}/api/requirements${queryString ? `?${queryString}` : ''}`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      throw new ApiError(
        errorBody.error || errorBody.message || `Failed to fetch requirements (${res.status})`,
        res.status,
        errorBody.details
      )
    }

    const data = await res.json()
    return {
      requirements: data.requirements || [],
      count: data.count || 0,
      page: data.page || 1,
      totalPages: data.totalPages || 1,
    }
  } catch (err: any) {
    if (err instanceof ApiError) throw err
    throw new ApiError(err.message || 'Could not connect to backend server', 503)
  }
}

/**
 * Fetch a single requirement by its referenceId (e.g. GPR-2026-10492)
 */
export async function getRequirementById(id: string): Promise<Requirement | null> {
  if (!id) return null

  const url = `${API_BASE}/api/requirements/${encodeURIComponent(id)}`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (res.status === 404) {
      return null
    }

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      throw new ApiError(
        errorBody.error || errorBody.message || `Failed to fetch requirement (${res.status})`,
        res.status
      )
    }

    const data = await res.json()
    return (data.requirement || data) as Requirement
  } catch (err: any) {
    if (err instanceof ApiError && err.status === 404) return null
    if (err instanceof ApiError) throw err
    console.error(`[API] Error fetching requirement ${id}:`, err)
    return null
  }
}

/**
 * Submit a new requirement payload to the Express backend
 */
export async function createRequirement(
  payload: Record<string, unknown>
): Promise<Requirement> {
  const url = `${API_BASE}/api/requirements`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const body = await res.json().catch(() => ({}))

    if (!res.ok) {
      const errorMessage =
        body.error ||
        body.message ||
        (Array.isArray(body.details) && body.details.length > 0
          ? body.details.map((d: any) => `${d.field}: ${d.message}`).join(', ')
          : `Failed to create requirement (${res.status})`)

      throw new ApiError(errorMessage, res.status, body.details)
    }

    return body as Requirement
  } catch (err: any) {
    if (err instanceof ApiError) throw err
    throw new ApiError(normalizeErrorMessage(err), 503)
  }
}

export interface SendCodeResponse {
  message: string
  expiresInSeconds: number
}

export interface VerifyCodeResponse {
  verified: boolean
  verificationToken: string
}

export class VerificationApiError extends ApiError {
  public attemptsLeft?: number
  public locked?: boolean
  public expired?: boolean
  public retryAfter?: number

  constructor(message: string, status: number, meta?: { attemptsLeft?: number; locked?: boolean; expired?: boolean; retryAfter?: number }) {
    super(message, status)
    this.name = 'VerificationApiError'
    if (meta) {
      this.attemptsLeft = meta.attemptsLeft
      this.locked = meta.locked
      this.expired = meta.expired
      this.retryAfter = meta.retryAfter
    }
  }
}

/**
 * Send OTP verification code to contact email
 */
export async function sendVerificationCode(email: string): Promise<SendCodeResponse> {
  const url = `${API_BASE}/api/verification/send`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    })

    const body = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new VerificationApiError(
        body.error || 'Failed to send verification code',
        res.status,
        { retryAfter: body.retryAfter }
      )
    }

    return body as SendCodeResponse
  } catch (err: any) {
    if (err instanceof ApiError) throw err
    throw new VerificationApiError(
      normalizeErrorMessage(err),
      503
    )
  }
}

/**
 * Verify 6-digit OTP code and retrieve temporary verificationToken
 */
export async function verifyEmailCode(
  email: string,
  code: string
): Promise<VerifyCodeResponse> {
  const url = `${API_BASE}/api/verification/verify`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
    })

    const body = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new VerificationApiError(
        body.error || 'Invalid verification code',
        res.status,
        {
          attemptsLeft: body.attemptsLeft,
          locked: body.locked,
          expired: body.expired,
        }
      )
    }

    return body as VerifyCodeResponse
  } catch (err: any) {
    if (err instanceof ApiError) throw err
    throw new VerificationApiError(
      normalizeErrorMessage(err),
      503
    )
  }
}

/**
 * Helper to mask email address, e.g. u***@gmail.com
 */
export function maskEmail(email: string): string {
  if (!email) return '***'
  const parts = email.trim().toLowerCase().split('@')
  if (parts.length !== 2) return '***'
  const [user, domain] = parts
  const maskedUser =
    user.length <= 2 ? `${user[0]}***` : `${user[0]}***${user[user.length - 1]}`
  return `${maskedUser}@${domain}`
}

/**
 * Admin API: Fetch all requirements with unmasked contact info
 */
export async function getAdminRequirements(
  adminKey: string,
  params?: { category?: string; status?: string; search?: string }
): Promise<{ requirements: any[]; totalCount: number }> {
  const url = new URL(`${API_BASE}/api/admin/requirements`)
  if (params?.category) url.searchParams.set('category', params.category)
  if (params?.status) url.searchParams.set('status', params.status)
  if (params?.search) url.searchParams.set('search', params.search)

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-admin-key': adminKey,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(body.error || 'Failed to fetch admin requirements', res.status)
  }

  return res.json()
}

/**
 * Admin API: Update requirement status (open, matched, closed)
 */
export async function updateAdminRequirementStatus(
  id: string,
  status: 'open' | 'matched' | 'closed',
  adminKey: string
): Promise<{ success: boolean; requirement: any }> {
  const url = `${API_BASE}/api/admin/requirements/${encodeURIComponent(id)}/status`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'x-admin-key': adminKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(body.error || 'Failed to update requirement status', res.status)
  }

  return res.json()
}

/**
 * Admin API: Fetch admin overview statistics
 */
export async function getAdminStats(
  adminKey: string
): Promise<{
  total: number
  open: number
  matched: number
  closed: number
  byCategory: { planner: number; performer: number; crew: number }
}> {
  const url = `${API_BASE}/api/admin/stats`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'x-admin-key': adminKey,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(body.error || 'Failed to fetch admin statistics', res.status)
  }

  return res.json()
}


