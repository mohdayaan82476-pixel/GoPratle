'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useForm } from '@/lib/form-context'
import StepProgress from '@/components/StepProgress'
import Field from '@/components/Field'
import PlaceCombobox from '@/components/PlaceCombobox'
import IconInput from '@/components/ui/IconInput'
import { Calendar, CalendarDays, ClipboardList, Mic2, Users, Check, Tag, Building2 } from 'lucide-react'
import { ProRole, PlaceLocation, PlaceVenue } from '@/lib/types'

interface CategoryCardOption {
  value: ProRole
  title: string
  desc: string
  icon: typeof ClipboardList
  strongColor: string
  softBgClass: string
  strongBorderClass: string
  strongTextClass: string
  image: string
}

const CATEGORY_OPTIONS: CategoryCardOption[] = [
  {
    value: 'planner',
    title: 'Event Planner',
    desc: 'Full planning, decor & on-day coordination',
    icon: ClipboardList,
    strongColor: '#0f766e',
    softBgClass: 'bg-planner-soft',
    strongBorderClass: 'border-planner',
    strongTextClass: 'text-planner',
    image: '/images/planner.jpg',
  },
  {
    value: 'performer',
    title: 'Performer / Artist',
    desc: 'Live singers, DJs, anchors & stage artists',
    icon: Mic2,
    strongColor: '#c2410c',
    softBgClass: 'bg-performer-soft',
    strongBorderClass: 'border-performer',
    strongTextClass: 'text-performer',
    image: '/images/performer.jpg',
  },
  {
    value: 'crew',
    title: 'Event Crew & Staff',
    desc: 'Sound, lighting, stagehands & logistics crew',
    icon: Users,
    strongColor: '#1d4ed8',
    softBgClass: 'bg-crew-soft',
    strongBorderClass: 'border-crew',
    strongTextClass: 'text-crew',
    image: '/images/crew.jpg',
  },
]

interface Errors {
  eventName?: string
  category?: string
  startDate?: string
  endDate?: string
  location?: string
}

function Step1Content() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { form, update } = useForm()

  const [eventName, setEventName] = useState(form.eventName || '')
  const [eventType, setEventType] = useState(form.eventType || '')
  const [category, setCategory]   = useState<ProRole | ''>((form.category as ProRole) || '')
  const [startDate, setStartDate] = useState(form.startDate || '')
  const [endDate, setEndDate]     = useState(form.endDate || '')
  const [location, setLocation]   = useState(form.location || '')
  const [locationObj, setLocationObj] = useState<PlaceLocation | null>(form.locationData || null)
  const [venue, setVenue]         = useState(form.venue || '')
  const [venueObj, setVenueObj]   = useState<PlaceVenue | null>(form.venueData || null)
  const [errors, setErrors]       = useState<Errors>({})

  // Pick up changes from form context or searchParams
  useEffect(() => {
    if (form.eventName && !eventName) setEventName(form.eventName)
    if (form.eventType && !eventType) setEventType(form.eventType)
    if (form.location && !location) {
      setLocation(form.location)
      setLocationObj(form.locationData)
    }
    if (form.venue && !venue) {
      setVenue(form.venue)
      setVenueObj(form.venueData)
    }

    const catParam = searchParams.get('category') as ProRole | null
    if (catParam && ['planner', 'performer', 'crew'].includes(catParam)) {
      setCategory(catParam)
    } else if (form.category) {
      setCategory(form.category)
    }
  }, [form, searchParams])

  const selectedCategoryMeta = CATEGORY_OPTIONS.find(c => c.value === category)

  function validate(): Errors {
    const e: Errors = {}
    if (!eventName.trim()) e.eventName = 'Event name is required.'
    if (!category)         e.category  = 'Please select a category.'
    if (!startDate)        e.startDate = 'Start date is required.'
    if (endDate && startDate && endDate < startDate)
      e.endDate = 'End date must be on or after the start date.'
    if (!location.trim())  e.location  = 'Location is required.'
    return e
  }

  function handleContinue() {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) return

    const locData = locationObj || (location.trim() ? { name: location.trim(), unverified: true } : null)
    const venData = venueObj || (venue.trim() ? { name: venue.trim(), unverified: true } : null)

    update({
      eventName: eventName.trim(),
      eventType: eventType.trim(),
      category: category as ProRole,
      startDate,
      endDate,
      location: location.trim(),
      locationData: locData,
      venue: venue.trim(),
      venueData: venData,
    })
    router.push(`/post-requirement/step-2/${category}`)
  }

  return (
    <div className="w-full">
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
        <StepProgress current={1} />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h2 className="text-[22px] sm:text-[24px] font-display font-semibold text-ink mb-1">
              Event basics
            </h2>
            <p className="text-[14px] text-muted">
              Schedule, location, and professional role needed.
            </p>
          </div>

          {eventType && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-band-soft text-brand self-start sm:self-auto border border-border">
              <Tag className="w-3.5 h-3.5" />
              <span>{eventType}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {/* Event name */}
          <Field label="Event name" htmlFor="eventName" required error={errors.eventName}>
            <input
              id="eventName"
              type="text"
              className={`form-input ${errors.eventName ? 'border-error' : ''}`}
              value={eventName}
              onChange={e => {
                setEventName(e.target.value)
                update({ eventName: e.target.value })
              }}
              onBlur={() => {
                if (!eventName.trim()) setErrors(p => ({ ...p, eventName: 'Event name is required.' }))
              }}
              placeholder="e.g. Annual Sales Summit 2026 or Sharma Wedding"
            />
          </Field>

          {/* Category Selector with thumbnail preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[15px] font-medium text-ink">
                Professional category <span className="text-error">*</span>
              </label>

              {/* Dynamic thumbnail & pill beside selector */}
              {selectedCategoryMeta && (
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${selectedCategoryMeta.softBgClass} ${selectedCategoryMeta.strongTextClass}`}
                  >
                    {selectedCategoryMeta.title}
                  </span>
                  <div className="relative w-9 h-7 rounded-lg border border-border overflow-hidden shrink-0">
                    <Image
                      src={selectedCategoryMeta.image}
                      alt={selectedCategoryMeta.title}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
            <p className="text-[14px] text-muted mb-3">Choose the category of professionals you need for your event.</p>

            {/* Hidden input for accessibility */}
            <input type="hidden" id="category" name="category" value={category} />

            {/* 3 Selectable Cards in Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Event category selection">
              {CATEGORY_OPTIONS.map(opt => {
                const isSelected = category === opt.value
                const Icon = opt.icon

                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      setCategory(opt.value)
                      update({ category: opt.value })
                      if (errors.category) setErrors(p => ({ ...p, category: undefined }))
                    }}
                    className={`relative text-left p-4 rounded-xl bg-surface transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? `border-2 ${opt.strongBorderClass} scale-[1.02] shadow-sm`
                        : 'border border-border hover:border-brand/40'
                    }`}
                  >
                    <div>
                      {/* Top icon and radio check indicator */}
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${opt.softBgClass}`}
                        >
                          <Icon className="w-5 h-5" style={{ color: opt.strongColor }} aria-hidden="true" />
                        </div>

                        {/* Radio check indicator */}
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'border-transparent text-white'
                              : 'border-border bg-surface'
                          }`}
                          style={{ backgroundColor: isSelected ? opt.strongColor : undefined }}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />}
                        </div>
                      </div>

                      <h3 className="text-base font-display font-semibold text-ink mb-1">{opt.title}</h3>
                      <p className="text-xs text-muted leading-snug">{opt.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
            {errors.category && (
              <p className="text-[14px] text-error mt-2 font-medium">{errors.category}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Start date" htmlFor="startDate" required error={errors.startDate}>
              <IconInput
                id="startDate"
                type="date"
                icon={CalendarDays}
                error={errors.startDate}
                value={startDate}
                onChange={e => {
                  setStartDate(e.target.value)
                  update({ startDate: e.target.value })
                }}
                onBlur={() => { if (!startDate) setErrors(p => ({ ...p, startDate: 'Start date is required.' })) }}
              />
            </Field>
            <Field label="End date" htmlFor="endDate" error={errors.endDate} helper="Optional. Must be ≥ start date.">
              <IconInput
                id="endDate"
                type="date"
                icon={CalendarDays}
                error={errors.endDate}
                value={endDate}
                min={startDate || undefined}
                onChange={e => {
                  setEndDate(e.target.value)
                  update({ endDate: e.target.value })
                  if (startDate && e.target.value < startDate)
                    setErrors(p => ({ ...p, endDate: 'End date must be on or after the start date.' }))
                  else
                    setErrors(p => ({ ...p, endDate: undefined }))
                }}
              />
            </Field>
          </div>

          {/* Location: Connected to Google Places Autocomplete */}
          <div>
            <label htmlFor="location" className="block text-[15px] font-medium text-ink mb-1.5">
              City / Region <span className="text-error">*</span>
            </label>
            <PlaceCombobox
              id="location"
              value={location}
              placeholder="e.g. Hyderabad, Mumbai, Bengaluru, Delhi NCR"
              onChange={(text, details) => {
                setLocation(text)
                setLocationObj(details || (text ? { name: text, unverified: true } : null))
                update({
                  location: text,
                  locationData: details || (text ? { name: text, unverified: true } : null),
                })
                if (text.trim()) setErrors(p => ({ ...p, location: undefined }))
              }}
              error={errors.location}
              helper="City or metro area. Type to select verified locations or enter custom text."
            />
          </div>

          {/* Venue: Connected to Google Places Autocomplete with 25km Location Bias to the city */}
          <div>
            <label htmlFor="venue" className="block text-[15px] font-medium text-ink mb-1.5">
              Venue name / Address
            </label>
            <PlaceCombobox
              id="venue"
              value={venue}
              icon={Building2}
              biasLat={locationObj?.lat}
              biasLng={locationObj?.lng}
              placeholder="e.g. Novotel Convention Centre, Grand Hyatt Ballroom, or private lawn"
              onChange={(text, details) => {
                setVenue(text)
                const ven = details
                  ? {
                      name: details.name,
                      placeId: details.placeId,
                      address: details.address || details.name,
                      lat: details.lat,
                      lng: details.lng,
                      unverified: details.unverified,
                    }
                  : text
                  ? { name: text, unverified: true }
                  : null
                setVenueObj(ven)
                update({ venue: text, venueData: ven })
              }}
              helper={
                locationObj?.lat && locationObj?.lng
                  ? `Filtered with a 25km bias around ${locationObj.name}.`
                  : 'Optional hotel, banquet hall, convention center, or private grounds.'
              }
            />
          </div>
        </div>

        {/* Action row */}
        <div className="flex justify-end mt-8 pt-5 border-t border-border">
          <button type="button" onClick={handleContinue} className="btn-primary w-full sm:w-auto">
            Continue to category details
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Step1Page() {
  return (
    <Suspense fallback={<div className="bg-surface border border-border rounded-2xl p-8 text-center text-muted">Loading step 1…</div>}>
      <Step1Content />
    </Suspense>
  )
}
