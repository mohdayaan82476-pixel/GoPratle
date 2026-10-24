'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PlaceCombobox from '@/components/PlaceCombobox'
import SuggestedCombobox from '@/components/SuggestedCombobox'
import { useForm } from '@/lib/form-context'
import { ProRole, PlaceLocation } from '@/lib/types'
import {
  MapPin,
  Calendar,
  Sparkles,
  ClipboardList,
  Mic2,
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Tag,
} from 'lucide-react'

const EVENT_TYPE_SUGGESTIONS = [
  'Wedding',
  'Birthday party',
  'Corporate event',
  'Concert',
  'Festival',
  'College fest',
  'Product launch',
  'Other',
]

const EVENT_NAME_PRESETS: Record<string, string[]> = {
  Wedding: [
    'Sharma family wedding',
    'Engagement ceremony',
    'Sangeet & Cocktail Night',
    'Grand Wedding Reception',
  ],
  'Birthday party': [
    '25th Birthday Bash',
    'Kids Superhero Birthday Party',
    'Milestone 50th Birthday Gala',
    'Intimate Birthday Dinner',
  ],
  'Corporate event': [
    'Annual Sales Summit 2026',
    'Tech Leadership Conference',
    'Annual Gala & Awards Night',
    'Executive Retreat & Showcase',
  ],
  Concert: [
    'Live Acoustic Night',
    'Music Festival 2026',
    'Rock Band Showcase',
    'Classical Music Evening',
  ],
  Festival: [
    'Diwali Community Utsav',
    'Holi Color Fest',
    'New Year\'s Eve Extravaganza',
    'Dandiya Night Celebration',
  ],
  'College fest': [
    'Annual Cultural Fest 2026',
    'Tech Fest Hackathon',
    'Inter-College Music Night',
    'Campus Star Night',
  ],
  'Product launch': [
    'Spring Product Reveal 2026',
    'Brand Flagship Launch',
    'Press & Creator Showcase',
    'Next-Gen Product Demo',
  ],
  Other: [
    'Private Gathering',
    'Community Celebration',
    'Special Anniversary',
    'Networking Mixer',
  ],
}

const CATEGORIES: Array<{
  role: ProRole
  title: string
  subtitle: string
  icon: typeof ClipboardList
  color: string
  softBg: string
  borderClass: string
  textClass: string
}> = [
  {
    role: 'planner',
    title: 'Event Planner',
    subtitle: 'Full planning, decor, vendor sourcing & on-day coordination',
    icon: ClipboardList,
    color: '#0f766e',
    softBg: 'bg-planner-soft',
    borderClass: 'border-planner',
    textClass: 'text-planner',
  },
  {
    role: 'performer',
    title: 'Performer / Artist',
    subtitle: 'Live singers, bands, DJs, anchors, magicians & stage artists',
    icon: Mic2,
    color: '#c2410c',
    softBg: 'bg-performer-soft',
    borderClass: 'border-performer',
    textClass: 'text-performer',
  },
  {
    role: 'crew',
    title: 'Event Crew & Staff',
    subtitle: 'Sound & audio engineers, stage lighting, rigging & logistics crew',
    icon: Users,
    color: '#1d4ed8',
    softBg: 'bg-crew-soft',
    borderClass: 'border-crew',
    textClass: 'text-crew',
  },
]

type Step = 'A' | 'B' | 'C' | 'D'

function GetStartedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { form, update } = useForm()

  const [currentStep, setCurrentStep] = useState<Step>('A')

  // Flow form state
  const [locationName, setLocationName] = useState(form.location || '')
  const [locationObj, setLocationObj] = useState<PlaceLocation | null>(form.locationData || null)
  const [eventType, setEventType] = useState(form.eventType || '')
  const [eventName, setEventName] = useState(form.eventName || '')
  const [selectedCategory, setSelectedCategory] = useState<ProRole | ''>(form.category || '')
  const [errorMsg, setErrorMsg] = useState('')

  // Handle URL query parameters (e.g. ?category=planner or ?location=Hyderabad)
  useEffect(() => {
    const cat = searchParams.get('category') as ProRole | null
    if (cat && ['planner', 'performer', 'crew'].includes(cat)) {
      setSelectedCategory(cat)
    }

    const loc = searchParams.get('location')
    if (loc) {
      setLocationName(loc)
      setLocationObj({ name: loc, unverified: true })
    }
  }, [searchParams])

  // Step A validation & continue
  function handleLocationContinue() {
    if (!locationName.trim()) {
      setErrorMsg('Please enter or select a city or area.')
      return
    }
    setErrorMsg('')
    const locData = locationObj || { name: locationName.trim(), unverified: true }
    update({ location: locationName.trim(), locationData: locData })
    setCurrentStep('B')
  }

  // Step B validation & continue
  function handleEventTypeContinue() {
    if (!eventType.trim()) {
      setErrorMsg('Please choose or enter an event type.')
      return
    }
    setErrorMsg('')
    update({ eventType: eventType.trim() })
    setCurrentStep('C')
  }

  // Step C validation & continue
  function handleEventNameContinue() {
    if (!eventName.trim()) {
      setErrorMsg('Please enter a name for your event.')
      return
    }
    setErrorMsg('')
    update({ eventName: eventName.trim() })
    setCurrentStep('D')
  }

  // Step D: Select category and move into Step 1 of the existing flow
  function handleSelectCategory(role: ProRole) {
    const locData = locationObj || (locationName.trim() ? { name: locationName.trim(), unverified: true } : null)
    update({
      location: locationName.trim(),
      locationData: locData,
      eventType: eventType.trim(),
      eventName: eventName.trim(),
      category: role,
    })
    router.push(`/post-requirement/step-1?category=${role}`)
  }

  // Get contextual name suggestions based on eventType
  const currentPresets = EVENT_NAME_PRESETS[eventType] || EVENT_NAME_PRESETS.Other

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Navbar />

      {/* Hero Header */}
      <header className="relative w-full bg-band text-white rounded-b-3xl sm:rounded-b-[2.5rem] overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -right-16 -bottom-24 w-80 h-80 rounded-full bg-white/10 pointer-events-none"
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-16 sm:pt-12 sm:pb-20 text-center">
          <span className="inline-block text-xs uppercase tracking-wider font-semibold text-band-soft bg-white/15 px-3 py-1 rounded-full mb-3">
            Quick Start Guide
          </span>
          <h1 className="text-[28px] sm:text-[36px] lg:text-[40px] font-display font-bold tracking-tight text-white mb-2 leading-tight">
            Let&apos;s plan your event
          </h1>
          <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto font-normal">
            Tell us a few quick details to connect you with top verified talent across India.
          </p>
        </div>
      </header>

      {/* Main Form Wizard Card with 40px overlap */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 -mt-10 sm:-mt-12 relative z-10 pb-16">
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-10 shadow-sm">
          {/* Stepper Dots & Label */}
          <div className="mb-8 pb-5 border-b border-border">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted mb-3">
              <span>
                Step {currentStep === 'A' ? '1 of 4' : currentStep === 'B' ? '2 of 4' : currentStep === 'C' ? '3 of 4' : '4 of 4'}
              </span>
              <span className="text-brand font-bold">
                {currentStep === 'A'
                  ? 'Event Location'
                  : currentStep === 'B'
                  ? 'Event Type'
                  : currentStep === 'C'
                  ? 'Event Name'
                  : 'Role Required'}
              </span>
            </div>

            {/* Stepper bar */}
            <div className="grid grid-cols-4 gap-2">
              <div className={`h-1.5 rounded-full transition-colors ${currentStep === 'A' ? 'bg-band' : 'bg-success'}`} />
              <div className={`h-1.5 rounded-full transition-colors ${currentStep === 'B' ? 'bg-band' : currentStep === 'C' || currentStep === 'D' ? 'bg-success' : 'bg-border'}`} />
              <div className={`h-1.5 rounded-full transition-colors ${currentStep === 'C' ? 'bg-band' : currentStep === 'D' ? 'bg-success' : 'bg-border'}`} />
              <div className={`h-1.5 rounded-full transition-colors ${currentStep === 'D' ? 'bg-band' : 'bg-border'}`} />
            </div>
          </div>

          {/* ── STEP A: LOCATION ── */}
          {currentStep === 'A' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[22px] sm:text-[24px] font-display font-semibold text-ink mb-1.5">
                  Where is your event taking place?
                </h2>
                <p className="text-[14px] text-muted">
                  Type your city, metro area, or neighborhood to receive localized proposals.
                </p>
              </div>

              <div>
                <label htmlFor="get-started-location" className="block text-[15px] font-medium text-ink mb-2">
                  Event city or venue area <span className="text-error">*</span>
                </label>
                <PlaceCombobox
                  id="get-started-location"
                  value={locationName}
                  placeholder="e.g. Hyderabad, Mumbai, Bengaluru, Delhi NCR"
                  onChange={(text, details) => {
                    setLocationName(text)
                    setLocationObj(details || null)
                    setErrorMsg('')
                  }}
                  autoFocus
                  error={errorMsg}
                  helper="Start typing (e.g. 'Hyd' or 'Mum') to select from verified places or use your own custom text."
                />
              </div>

              {/* Verified place preview chip if selected */}
              {locationObj && (
                <div className="p-3.5 rounded-xl bg-band-soft/60 border border-border flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-ink">
                    <MapPin className="w-4 h-4 text-brand shrink-0" />
                    <span className="font-semibold truncate">{locationObj.name}</span>
                  </div>
                  {locationObj.unverified ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-white text-muted border border-border">
                      Custom Unverified
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-success text-white flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
              )}

              {/* Action row */}
              <div className="flex justify-end pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleLocationContinue}
                  className="btn-primary w-full sm:w-auto"
                >
                  Continue to event type
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP B: EVENT TYPE ── */}
          {currentStep === 'B' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[22px] sm:text-[24px] font-display font-semibold text-ink mb-1.5">
                  What type of event are you hosting?
                </h2>
                <p className="text-[14px] text-muted">
                  Choose a popular category or type any custom event format.
                </p>
              </div>

              <div>
                <label htmlFor="get-started-event-type" className="block text-[15px] font-medium text-ink mb-2">
                  Event type <span className="text-error">*</span>
                </label>
                <SuggestedCombobox
                  id="get-started-event-type"
                  value={eventType}
                  suggestions={EVENT_TYPE_SUGGESTIONS}
                  placeholder="e.g. Wedding, Birthday party, Corporate event"
                  onChange={val => {
                    setEventType(val)
                    setErrorMsg('')
                  }}
                  autoFocus
                  error={errorMsg}
                  leadingIcon={<Tag className="w-4 h-4" />}
                />
              </div>

              {/* Quick suggestion pills */}
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2.5">
                  Suggested event types
                </p>
                <div className="flex flex-wrap gap-2">
                  {EVENT_TYPE_SUGGESTIONS.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setEventType(type)
                        setErrorMsg('')
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        eventType === type
                          ? 'bg-brand text-white border-brand shadow-sm'
                          : 'bg-page text-ink border-border hover:border-brand/40 hover:bg-surface'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('')
                    setCurrentStep('A')
                  }}
                  className="btn-secondary"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleEventTypeContinue}
                  className="btn-primary"
                >
                  Continue to event name
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP C: EVENT NAME ── */}
          {currentStep === 'C' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[22px] sm:text-[24px] font-display font-semibold text-ink mb-1.5">
                  Give your event a title
                </h2>
                <p className="text-[14px] text-muted">
                  A clear title helps professionals understand your occasion right away.
                </p>
              </div>

              <div>
                <label htmlFor="get-started-event-name" className="block text-[15px] font-medium text-ink mb-2">
                  Event name <span className="text-error">*</span>
                </label>
                <SuggestedCombobox
                  id="get-started-event-name"
                  value={eventName}
                  suggestions={currentPresets}
                  placeholder="e.g. Annual Sales Summit 2026 or Sharma Wedding"
                  onChange={val => {
                    setEventName(val)
                    setErrorMsg('')
                  }}
                  autoFocus
                  error={errorMsg}
                  leadingIcon={<Calendar className="w-4 h-4" />}
                />
              </div>

              {/* Context-aware suggestions */}
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-band" />
                  Suggestions for {eventType || 'your event'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentPresets.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setEventName(preset)
                        setErrorMsg('')
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        eventName === preset
                          ? 'bg-brand text-white border-brand shadow-sm'
                          : 'bg-page text-ink border-border hover:border-brand/40 hover:bg-surface'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('')
                    setCurrentStep('B')
                  }}
                  className="btn-secondary"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleEventNameContinue}
                  className="btn-primary"
                >
                  Continue to category
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP D: CATEGORY (Moves into Step 1) ── */}
          {currentStep === 'D' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[22px] sm:text-[24px] font-display font-semibold text-ink mb-1.5">
                  What type of professional do you need?
                </h2>
                <p className="text-[14px] text-muted">
                  Choose one to proceed to specific requirement details. You can always post another requirement later.
                </p>
              </div>

              {/* 3 Large Category Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon
                  const isSelected = selectedCategory === cat.role

                  return (
                    <button
                      key={cat.role}
                      type="button"
                      onClick={() => handleSelectCategory(cat.role)}
                      className={`relative text-left p-5 rounded-xl bg-surface transition-all flex flex-col justify-between cursor-pointer border ${
                        isSelected
                          ? `border-2 ${cat.borderClass} ring-2 ring-band/15 shadow-sm`
                          : 'border-border hover:border-brand/40 hover:shadow-sm'
                      }`}
                    >
                      <div>
                        {/* Top icon and category color badge */}
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cat.softBg}`}
                          >
                            <Icon className="w-6 h-6" style={{ color: cat.color }} aria-hidden="true" />
                          </div>

                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cat.softBg} ${cat.textClass}`}>
                            Available
                          </span>
                        </div>

                        <h3 className="text-lg font-display font-bold text-ink mb-1.5">
                          {cat.title}
                        </h3>
                        <p className="text-xs text-muted leading-relaxed">
                          {cat.subtitle}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-brand">
                        <span>Select &amp; proceed</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCurrentStep('C')}
                  className="btn-secondary"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to event name
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function GetStartedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-page text-muted">
          Loading Get Started flow…
        </div>
      }
    >
      <GetStartedContent />
    </Suspense>
  )
}
