import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getRequirementById } from '@/lib/api'
import { CATEGORY_CONFIGS } from '@/lib/category-config'
import {
  MapPin,
  CalendarDays,
  ShieldCheck,
  ClipboardList,
  Mic2,
  Users,
  ArrowLeft,
  PlusCircle,
  Clock,
  Tag,
  Building,
} from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

const CATEGORY_META = {
  planner: {
    label: 'Event Planner',
    pillClass: 'bg-planner-soft text-planner border-planner/30',
    icon: ClipboardList,
    color: '#0f766e',
  },
  performer: {
    label: 'Performer',
    pillClass: 'bg-performer-soft text-performer border-performer/30',
    icon: Mic2,
    color: '#c2410c',
  },
  crew: {
    label: 'Event Crew',
    pillClass: 'bg-crew-soft text-crew border-crew/30',
    icon: Users,
    color: '#1d4ed8',
  },
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default async function RequirementDetailPage({ params }: PageProps) {
  const { id } = await params
  const req = await getRequirementById(id)

  if (!req) {
    return (
      <div className="min-h-screen flex flex-col bg-page">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="bg-surface border border-border rounded-2xl p-10 sm:p-14 shadow-sm max-w-md mx-auto">
            <h1 className="text-2xl font-display font-bold text-ink mb-2">
              Requirement Not Found
            </h1>
            <p className="text-sm text-muted mb-6">
              The requirement with reference ID <code className="font-mono text-brand font-semibold">{id}</code> does not exist or may have expired.
            </p>
            <Link href="/requirements" className="btn-primary">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Browse open requirements
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const meta = CATEGORY_META[req.category] || CATEGORY_META.planner
  const CategoryIcon = meta.icon

  // Location and venue formatting
  const locationString =
    req.locationName ||
    (typeof req.location === 'object' && req.location !== null
      ? req.location.name
      : typeof req.location === 'string'
      ? req.location
      : 'Not specified')

  const venueString =
    req.venueName ||
    (typeof req.venue === 'object' && req.venue !== null
      ? req.venue.name || req.venue.address
      : typeof req.venue === 'string'
      ? req.venue
      : 'Not specified')

  // Find field label helpers from CATEGORY_CONFIGS
  const config = CATEGORY_CONFIGS[req.category]
  const fieldLabelMap: Record<string, string> = {}
  const optionLabelMap: Record<string, Record<string, string>> = {}

  if (config) {
    ;[...config.step2Fields, ...config.step3Fields].forEach(f => {
      fieldLabelMap[f.name] = f.label
      if (f.options) {
        optionLabelMap[f.name] = {}
        f.options.forEach(opt => {
          optionLabelMap[f.name][opt.value] = opt.label
        })
      }
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Navbar />

      {/* ── BAND HEADER ── */}
      <header className="relative w-full bg-band text-white rounded-b-3xl sm:rounded-b-[2.5rem] overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -right-16 -bottom-24 w-80 h-80 rounded-full bg-white/10 pointer-events-none"
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 sm:pt-10 sm:pb-16">
          {/* Breadcrumb row */}
          <div className="flex items-center gap-2 text-xs text-white/80 mb-4">
            <Link
              href="/requirements"
              className="hover:text-white transition-colors flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All requirements
            </Link>
            <span>/</span>
            <span className="text-white/60 font-mono">{req.id}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-3">
              {/* Category pill & event type */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-ink border border-white/40 shadow-xs`}
                >
                  <CategoryIcon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                  {meta.label}
                </span>

                {req.eventType && (
                  <span className="text-xs font-medium bg-white/15 text-white px-3 py-1 rounded-full border border-white/20">
                    {req.eventType}
                  </span>
                )}
              </div>

              {/* Event Name */}
              <h1 className="text-[28px] sm:text-[36px] font-display font-bold text-white tracking-tight leading-tight">
                {req.eventName}
              </h1>

              {/* Meta details */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/90 pt-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-band-soft" />
                  <span>{locationString}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-band-soft" />
                  <span>
                    {formatDate(req.startDate)}
                    {req.endDate && req.endDate !== req.startDate && ` – ${formatDate(req.endDate)}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT (Two Columns: 65% Left, 35% Right) ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (about 65% / 8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Section: Event Details */}
            <section
              aria-labelledby="section-event-details"
              className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm"
            >
              <h2
                id="section-event-details"
                className="text-[20px] font-display font-semibold text-ink mb-5 pb-3 border-b border-border flex items-center gap-2"
              >
                <Tag className="w-5 h-5 text-brand" />
                Event details
              </h2>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                    Event Title
                  </dt>
                  <dd className="text-ink font-semibold">{req.eventName}</dd>
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                    Event Type
                  </dt>
                  <dd className="text-ink">{req.eventType || 'Not specified'}</dd>
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                    City / Area
                  </dt>
                  <dd className="text-ink font-medium">{locationString}</dd>
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                    Venue / Facility
                  </dt>
                  <dd className="text-ink">{venueString}</dd>
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                    Start Date
                  </dt>
                  <dd className="text-ink font-medium">{formatDate(req.startDate)}</dd>
                </div>

                {req.endDate && (
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                      End Date
                    </dt>
                    <dd className="text-ink">{formatDate(req.endDate)}</dd>
                  </div>
                )}
              </dl>
            </section>

            {/* 2. Section: Category Details */}
            <section
              aria-labelledby="section-category-details"
              className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm"
            >
              <h2
                id="section-category-details"
                className="text-[20px] font-display font-semibold text-ink mb-5 pb-3 border-b border-border flex items-center gap-2"
              >
                <CategoryIcon className="w-5 h-5" style={{ color: meta.color }} />
                {meta.label} specifications
              </h2>

              {/* Dynamic definition list using stored fields */}
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 text-sm">
                {/* PLANNER SPECIFIC FIELDS */}
                {req.category === 'planner' && (
                  <>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                        Planning Scope
                      </dt>
                      <dd className="text-ink font-semibold capitalize">
                        {optionLabelMap.plannerScope?.[req.plannerScope || ''] || req.plannerScope || 'Not specified'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                        Expected Guests
                      </dt>
                      <dd className="text-ink font-semibold">
                        {req.plannerGuestCount ? `${req.plannerGuestCount} attendees` : 'Not specified'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                        Venue Status
                      </dt>
                      <dd className="text-ink">
                        {optionLabelMap.plannerVenueStatus?.[req.plannerVenueStatus || ''] || req.plannerVenueStatus || 'Not specified'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                        Overall Budget
                      </dt>
                      <dd className="text-ink font-semibold text-brand">
                        {req.plannerBudget || 'Budget on request'}
                      </dd>
                    </div>

                    {req.plannerTimeline && (
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                          Timeline Commitment
                        </dt>
                        <dd className="text-ink">
                          {optionLabelMap.plannerTimeline?.[req.plannerTimeline] || req.plannerTimeline}
                        </dd>
                      </div>
                    )}

                    {req.plannerExperience && (
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                          Preferred Experience
                        </dt>
                        <dd className="text-ink">
                          {optionLabelMap.plannerExperience?.[req.plannerExperience] || req.plannerExperience}
                        </dd>
                      </div>
                    )}

                    {req.plannerServices && req.plannerServices.length > 0 && (
                      <div className="sm:col-span-2">
                        <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                          Services Required
                        </dt>
                        <dd className="flex flex-wrap gap-2">
                          {req.plannerServices.map(srv => (
                            <span
                              key={srv}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-planner-soft text-planner border border-planner/20"
                            >
                              {optionLabelMap.plannerServices?.[srv] || srv}
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}

                    {req.plannerThemes && req.plannerThemes.length > 0 && (
                      <div className="sm:col-span-2">
                        <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                          Theme / Styling
                        </dt>
                        <dd className="flex flex-wrap gap-2">
                          {req.plannerThemes.map(theme => (
                            <span
                              key={theme}
                              className="px-3 py-1 rounded-full text-xs font-medium bg-page text-ink border border-border"
                            >
                              {optionLabelMap.plannerThemes?.[theme] || theme}
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}
                  </>
                )}

                {/* PERFORMER SPECIFIC FIELDS */}
                {req.category === 'performer' && (
                  <>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                        Performer Type
                      </dt>
                      <dd className="text-ink font-semibold">
                        {optionLabelMap.performerType?.[req.performerType || ''] || req.performerType || 'Not specified'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                        Set Duration
                      </dt>
                      <dd className="text-ink font-semibold">
                        {req.performerDuration ? `${req.performerDuration} minutes` : 'Not specified'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                        AV / Sound Equipment
                      </dt>
                      <dd className="text-ink">
                        {optionLabelMap.performerSound?.[req.performerSound || ''] || req.performerSound || 'Not specified'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                        Budget Range
                      </dt>
                      <dd className="text-ink font-semibold text-brand">
                        {req.performerBudgetMin || req.performerBudgetMax
                          ? `₹${Number(req.performerBudgetMin || 0).toLocaleString('en-IN')} – ₹${Number(req.performerBudgetMax || 0).toLocaleString('en-IN')}`
                          : 'Budget open to quote'}
                      </dd>
                    </div>

                    {req.performerStageSetup && (
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                          Stage / Setup
                        </dt>
                        <dd className="text-ink">
                          {optionLabelMap.performerStageSetup?.[req.performerStageSetup] || req.performerStageSetup}
                        </dd>
                      </div>
                    )}

                    {req.performerLanguage && (
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                          Language
                        </dt>
                        <dd className="text-ink">{req.performerLanguage}</dd>
                      </div>
                    )}

                    {req.performerGenres && req.performerGenres.length > 0 && (
                      <div className="sm:col-span-2">
                        <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                          Genres / Musical Styles
                        </dt>
                        <dd className="flex flex-wrap gap-2">
                          {req.performerGenres.map(g => (
                            <span
                              key={g}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-performer-soft text-performer border border-performer/20"
                            >
                              {optionLabelMap.performerGenres?.[g] || g}
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}
                  </>
                )}

                {/* CREW SPECIFIC FIELDS */}
                {req.category === 'crew' && (
                  <>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                        Shift Schedule
                      </dt>
                      <dd className="text-ink font-semibold">
                        {optionLabelMap.crewShift?.[req.crewShift || ''] || req.crewShift || 'Not specified'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                        Total Staff Needed
                      </dt>
                      <dd className="text-ink font-semibold">
                        {req.crewHeadcount ? `${req.crewHeadcount} crew members` : 'Not specified'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                        Budget per Staff / Day
                      </dt>
                      <dd className="text-ink font-semibold text-brand">
                        {req.crewBudgetPerHead || 'Standard day rate'}
                      </dd>
                    </div>

                    {req.crewPaymentTerms && (
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                          Payment Terms
                        </dt>
                        <dd className="text-ink">
                          {optionLabelMap.crewPaymentTerms?.[req.crewPaymentTerms] || req.crewPaymentTerms}
                        </dd>
                      </div>
                    )}

                    {req.crewRolesNeeded && req.crewRolesNeeded.length > 0 && (
                      <div className="sm:col-span-2">
                        <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                          Crew Roles Needed
                        </dt>
                        <dd className="flex flex-wrap gap-2">
                          {req.crewRolesNeeded.map(role => (
                            <span
                              key={role}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-crew-soft text-crew border border-crew/20"
                            >
                              {optionLabelMap.crewRolesNeeded?.[role] || role}
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}

                    {req.crewEquipmentNeeds && (
                      <div className="sm:col-span-2">
                        <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                          Equipment &amp; Gear
                        </dt>
                        <dd className="text-ink bg-page p-3 rounded-xl border border-border">
                          {req.crewEquipmentNeeds}
                        </dd>
                      </div>
                    )}

                    {req.crewExtras && req.crewExtras.length > 0 && (
                      <div className="sm:col-span-2">
                        <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                          Extras Provided by Host
                        </dt>
                        <dd className="flex flex-wrap gap-2">
                          {req.crewExtras.map(extra => (
                            <span
                              key={extra}
                              className="px-3 py-1 rounded-full text-xs font-medium bg-page text-ink border border-border"
                            >
                              {optionLabelMap.crewExtras?.[extra] || extra}
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}

                    {req.crewNotes && (
                      <div className="sm:col-span-2">
                        <dt className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
                          Additional Instructions
                        </dt>
                        <dd className="text-ink bg-page p-3 rounded-xl border border-border whitespace-pre-line">
                          {req.crewNotes}
                        </dd>
                      </div>
                    )}
                  </>
                )}
              </dl>
            </section>
          </div>

          {/* Right Column (about 35% / 4 cols): Sticky Summary Card */}
          <aside className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
                  Reference ID
                </span>
                <span className="font-mono text-base font-bold text-ink">
                  {req.id}
                </span>
              </div>

              <div className="pt-4 border-t border-border space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Category</span>
                  <span className={`font-semibold px-2 py-0.5 rounded-full border ${meta.pillClass}`}>
                    {meta.label}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted">Status</span>
                  <span className="font-semibold text-success flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    Open for quotes
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted">Posted on</span>
                  <span className="text-ink font-medium">
                    {formatDate(req.createdAt)}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-border space-y-3">
                <Link
                  href="/post-requirement/step-1"
                  className="btn-primary w-full h-11 rounded-full text-sm font-semibold justify-center shadow-xs"
                >
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  Post another requirement
                </Link>

                <Link
                  href="/requirements"
                  className="btn-secondary w-full h-11 rounded-full text-sm font-semibold justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back to all requirements
                </Link>
              </div>
            </div>

            {/* Trust callout */}
            <div className="p-4 rounded-xl bg-band-soft/50 border border-border text-xs text-muted space-y-2">
              <div className="flex items-center gap-2 font-semibold text-ink">
                <ShieldCheck className="w-4 h-4 text-brand shrink-0" />
                <span>Verified Client Inquiry</span>
              </div>
              <p className="leading-relaxed">
                Contact information is private until matched. Verified talent can quote on this lead through GoPratle.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}
