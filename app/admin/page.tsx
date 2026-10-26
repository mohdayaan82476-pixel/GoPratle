'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  getAdminRequirements,
  updateAdminRequirementStatus,
  getAdminStats,
} from '@/lib/api'
import {
  ShieldCheck,
  Lock,
  Search,
  RotateCcw,
  Phone,
  Mail,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Sparkles,
  ClipboardList,
  Mic2,
  Users,
  AlertCircle,
  LogOut,
  Copy,
  Check,
  Filter,
} from 'lucide-react'

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [keyInput, setKeyInput] = useState<string>('')

  // Data states
  const [requirements, setRequirements] = useState<any[]>([])
  const [stats, setStats] = useState<any | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Check sessionStorage on mount
  useEffect(() => {
    const savedKey = sessionStorage.getItem('gopratle_admin_key')
    if (savedKey) {
      setAdminKey(savedKey)
      setIsAuthenticated(true)
    }
  }, [])

  // Load data when authenticated
  const loadData = useCallback(async () => {
    if (!adminKey) return
    setLoading(true)
    setAuthError(null)
    try {
      const [reqData, statsData] = await Promise.all([
        getAdminRequirements(adminKey, {
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchQuery.trim() || undefined,
        }),
        getAdminStats(adminKey).catch(() => null),
      ])
      setRequirements(reqData.requirements || [])
      if (statsData) setStats(statsData)
    } catch (err: any) {
      if (err.status === 401) {
        setIsAuthenticated(false)
        sessionStorage.removeItem('gopratle_admin_key')
        setAuthError('Invalid admin key. Please enter the correct key.')
      } else {
        setAuthError(err.message || 'Failed to load requirements')
      }
    } finally {
      setLoading(false)
    }
  }, [adminKey, categoryFilter, statusFilter, searchQuery])

  useEffect(() => {
    if (isAuthenticated && adminKey) {
      loadData()
    }
  }, [isAuthenticated, adminKey, loadData])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!keyInput.trim()) return
    const key = keyInput.trim()
    sessionStorage.setItem('gopratle_admin_key', key)
    setAdminKey(key)
    setIsAuthenticated(true)
    setAuthError(null)
  }

  function handleLogout() {
    sessionStorage.removeItem('gopratle_admin_key')
    setAdminKey('')
    setIsAuthenticated(false)
    setRequirements([])
    setStats(null)
  }

  async function handleStatusChange(id: string, newStatus: 'open' | 'matched' | 'closed') {
    if (!adminKey) return
    setUpdatingId(id)
    try {
      await updateAdminRequirementStatus(id, newStatus, adminKey)
      setRequirements((prev) =>
        prev.map((r) => (r.id === id || r.referenceId === id ? { ...r, status: newStatus } : r))
      )
      // Refresh stats in background
      getAdminStats(adminKey).then(setStats).catch(() => {})
    } catch (err: any) {
      alert(`Could not update status: ${err.message}`)
    } finally {
      setUpdatingId(null)
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text)
    setCopiedText(label)
    setTimeout(() => setCopiedText(null), 2000)
  }

  function formatWhatsAppUrl(phone?: string, name?: string, refId?: string): string | null {
    if (!phone) return null
    // Clean digits
    const cleaned = phone.replace(/\D/g, '')
    // Default to Indian country code 91 if 10 digits
    const fullNumber = cleaned.length === 10 ? `91${cleaned}` : cleaned
    const message = encodeURIComponent(
      `Hello ${name || 'there'}! This is GoPratle regarding your requirement (${refId || 'event'}). We have verified professionals ready for your event!`
    )
    return `https://wa.me/${fullNumber}?text=${message}`
  }

  return (
    <div className="min-h-screen bg-page flex flex-col text-ink">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* If not authenticated: Show Passcode Screen */}
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto my-12 bg-surface border border-border rounded-3xl p-8 sm:p-10 shadow-lift text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-display font-bold text-ink mb-2">
              Founder &amp; Admin Portal
            </h1>
            <p className="text-sm text-muted mb-6">
              Enter your admin key to view full lead details, host phone numbers, and manage requirement statuses.
            </p>

            {authError && (
              <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Enter Admin Key (e.g. gopratle2026)"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-page border border-border focus:border-brand focus:ring-2 focus:ring-band focus:outline-none text-sm transition-all text-center"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full h-12 rounded-xl text-sm font-semibold justify-center cursor-pointer shadow-sm hover:shadow-md"
              >
                Access Dashboard
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-xs text-muted">
              Default local dev key: <code className="bg-muted/10 px-2 py-0.5 rounded font-mono text-ink">gopratle2026</code>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <div className="space-y-8">
            {/* Header with Stats & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand border border-brand/20">
                    <ShieldCheck className="w-3.5 h-3.5" /> Founder &amp; Admin View
                  </span>
                  <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Database Connected
                  </span>
                </div>
                <h1 className="text-3xl font-display font-bold text-ink">
                  Requirements &amp; Lead Management
                </h1>
                <p className="text-sm text-muted mt-1">
                  View full unmasked client contacts, follow up via WhatsApp, and match verified talent.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-surface border border-border text-sm font-medium hover:border-brand hover:text-brand transition-colors cursor-pointer"
                  title="Refresh leads"
                >
                  <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-red-500/10 text-red-600 border border-red-500/20 text-sm font-medium hover:bg-red-500/20 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>

            {/* KPI Stat Cards */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs">
                  <span className="text-xs text-muted block mb-1">Total Leads</span>
                  <span className="text-2xl font-display font-bold text-ink">{stats.total || 0}</span>
                </div>
                <div className="bg-surface border border-emerald-500/30 rounded-2xl p-4 shadow-xs">
                  <span className="text-xs text-emerald-600 font-medium block mb-1">Open Leads</span>
                  <span className="text-2xl font-display font-bold text-emerald-600">{stats.open || 0}</span>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs">
                  <span className="text-xs text-muted block mb-1">Matched</span>
                  <span className="text-2xl font-display font-bold text-brand">{stats.matched || 0}</span>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs">
                  <span className="text-xs text-planner font-medium block mb-1">Planners</span>
                  <span className="text-2xl font-display font-bold text-planner">{stats.byCategory?.planner || 0}</span>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs">
                  <span className="text-xs text-performer font-medium block mb-1">Performers</span>
                  <span className="text-2xl font-display font-bold text-performer">{stats.byCategory?.performer || 0}</span>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs">
                  <span className="text-xs text-crew font-medium block mb-1">Crew</span>
                  <span className="text-2xl font-display font-bold text-crew">{stats.byCategory?.crew || 0}</span>
                </div>
              </div>
            )}

            {/* Filter and Search Bar */}
            <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
              {/* Category & Status Tabs */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <span className="text-xs font-semibold text-muted flex items-center gap-1.5 mr-1">
                  <Filter className="w-3.5 h-3.5" /> Category:
                </span>
                {['all', 'planner', 'performer', 'crew'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer capitalize ${
                      categoryFilter === cat
                        ? 'bg-ink text-white shadow-xs'
                        : 'bg-page border border-border text-muted hover:text-ink'
                    }`}
                  >
                    {cat}
                  </button>
                ))}

                <span className="text-xs font-semibold text-muted flex items-center gap-1.5 ml-3 mr-1">
                  Status:
                </span>
                {['all', 'open', 'matched', 'closed'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer capitalize ${
                      statusFilter === st
                        ? 'bg-brand text-white shadow-xs'
                        : 'bg-page border border-border text-muted hover:text-ink'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Search Field */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name, phone, email, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-xl bg-page border border-border focus:border-brand focus:ring-1 focus:ring-band focus:outline-none text-xs"
                />
              </div>
            </div>

            {/* Requirements List / Table */}
            {loading ? (
              <div className="text-center py-20 bg-surface border border-border rounded-3xl">
                <RotateCcw className="w-8 h-8 text-brand animate-spin mx-auto mb-3" />
                <p className="text-sm font-medium text-ink">Loading client requirements from MongoDB...</p>
              </div>
            ) : requirements.length === 0 ? (
              <div className="text-center py-20 bg-surface border border-border rounded-3xl">
                <ClipboardList className="w-12 h-12 text-muted mx-auto mb-3 opacity-40" />
                <h3 className="text-lg font-display font-bold text-ink mb-1">No Requirements Found</h3>
                <p className="text-sm text-muted max-w-md mx-auto mb-6">
                  {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                    ? 'No leads match your current search or filter criteria.'
                    : 'No requirements have been posted yet. Submit a test requirement from the website to see it appear here!'}
                </p>
                <Link
                  href="/get-started"
                  className="btn-primary inline-flex items-center gap-2 h-10 px-6 rounded-full text-xs font-semibold"
                >
                  Post a Test Requirement
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-xs text-muted font-medium px-2 flex justify-between">
                  <span>Showing {requirements.length} requirement{requirements.length === 1 ? '' : 's'}</span>
                  <span>Click any card to expand event specifications</span>
                </div>

                {requirements.map((req) => {
                  const isExpanded = expandedId === req.id || expandedId === req.referenceId
                  const waUrl = formatWhatsAppUrl(req.contactPhone, req.contactName, req.referenceId)

                  const categoryBadgeColor =
                    req.category === 'planner'
                      ? 'bg-planner-soft text-planner border-planner/30'
                      : req.category === 'performer'
                      ? 'bg-performer-soft text-performer border-performer/30'
                      : 'bg-crew-soft text-crew border-crew/30'

                  return (
                    <div
                      key={req.id || req.referenceId || req._id}
                      className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs hover:border-brand/40 transition-all"
                    >
                      {/* Card Summary Header */}
                      <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-ink text-white">
                              {req.referenceId}
                            </span>
                            <span
                              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${categoryBadgeColor}`}
                            >
                              {req.category}
                            </span>
                            <span className="text-xs text-muted">
                              Posted on {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>

                          <h2 className="text-lg font-display font-bold text-ink">
                            {req.eventName}
                          </h2>

                          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-muted">
                            <span>📍 <strong>Location:</strong> {req.locationName || req.location?.name || 'Not specified'}</span>
                            <span>📅 <strong>Dates:</strong> {req.startDate} {req.endDate ? `to ${req.endDate}` : ''}</span>
                            {req.eventType && <span>🎉 <strong>Type:</strong> {req.eventType}</span>}
                          </div>
                        </div>

                        {/* Unmasked Host Contact Information Box */}
                        <div className="bg-page border border-border/80 rounded-xl p-3.5 min-w-[280px] lg:w-80 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                              👤 {req.contactName || 'Host'}
                            </span>
                            {req.emailVerified && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> Verified
                              </span>
                            )}
                          </div>

                          {/* Email Contact */}
                          <div className="flex items-center justify-between text-xs text-muted group">
                            <a
                              href={`mailto:${req.contactEmail}`}
                              className="flex items-center gap-1.5 hover:text-brand truncate font-mono text-[12px]"
                            >
                              <Mail className="w-3.5 h-3.5 shrink-0 text-brand" />
                              <span className="truncate">{req.contactEmail}</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(req.contactEmail, `email-${req.id}`)}
                              className="text-muted hover:text-ink p-1 cursor-pointer"
                              title="Copy email"
                            >
                              {copiedText === `email-${req.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Phone Contact & WhatsApp Button */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
                            {req.contactPhone ? (
                              <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-ink">
                                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{req.contactPhone}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted italic">No phone provided</span>
                            )}

                            {waUrl && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg transition-colors shadow-xs"
                                title="Open WhatsApp chat with host"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                WhatsApp
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Status Dropdown & Expand Toggle */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted">Status:</span>
                            <select
                              value={req.status || 'open'}
                              disabled={updatingId === req.id}
                              onChange={(e) => handleStatusChange(req.id || req.referenceId, e.target.value as any)}
                              className="h-8 px-2.5 rounded-lg border border-border bg-page text-xs font-semibold focus:border-brand focus:outline-none cursor-pointer"
                            >
                              <option value="open">🟢 Open</option>
                              <option value="matched">🤝 Matched</option>
                              <option value="closed">⚪ Closed</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : (req.id || req.referenceId))}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline cursor-pointer"
                          >
                            {isExpanded ? (
                              <>Hide Details <ChevronUp className="w-3.5 h-3.5" /></>
                            ) : (
                              <>View Full Specs <ChevronDown className="w-3.5 h-3.5" /></>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Questionnaire & Form Details */}
                      {isExpanded && (
                        <div className="p-5 sm:p-6 bg-page border-t border-border space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                            Full Category Questionnaire Responses ({req.category})
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {req.details && Object.entries(req.details).map(([key, val]) => {
                              const displayVal = Array.isArray(val) ? val.join(', ') : String(val ?? '—')
                              return (
                                <div key={key} className="bg-surface border border-border/80 rounded-xl p-3">
                                  <span className="text-[11px] font-semibold text-muted block capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^planner|^performer|^crew/i, '')}
                                  </span>
                                  <span className="text-xs font-medium text-ink mt-0.5 block break-words">
                                    {displayVal || '—'}
                                  </span>
                                </div>
                              )
                            })}
                          </div>

                          <div className="pt-2 flex justify-end">
                            <Link
                              href={`/requirements/${req.referenceId}`}
                              target="_blank"
                              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-brand font-medium"
                            >
                              Open public listing page <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
