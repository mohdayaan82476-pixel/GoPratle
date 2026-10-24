'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useForm } from '@/lib/form-context'
import { ProRole } from '@/lib/types'
import { ClipboardList, Mic2, Users, Check, ChevronDown, ChevronUp, Calendar, MapPin, Tag } from 'lucide-react'

const CATEGORY_META: Record<
  ProRole,
  {
    label: string
    icon: typeof ClipboardList
    image: string
    pillClass: string
    iconColor: string
    softBg: string
  }
> = {
  planner: {
    label: 'Event Planner',
    icon: ClipboardList,
    image: '/images/planner.jpg',
    pillClass: 'bg-planner-soft text-planner',
    iconColor: '#0f766e',
    softBg: '#e6f4f2',
  },
  performer: {
    label: 'Performer / Artist',
    icon: Mic2,
    image: '/images/performer.jpg',
    pillClass: 'bg-performer-soft text-performer',
    iconColor: '#c2410c',
    softBg: '#fdeee6',
  },
  crew: {
    label: 'Event Crew & Staff',
    icon: Users,
    image: '/images/crew.jpg',
    pillClass: 'bg-crew-soft text-crew',
    iconColor: '#1d4ed8',
    softBg: '#e8efff',
  },
}

interface SummaryCardProps {
  mobileOnly?: boolean
  desktopOnly?: boolean
}

export default function SummaryCard({ mobileOnly = false, desktopOnly = false }: SummaryCardProps) {
  const { form } = useForm()
  const [mobileOpen, setMobileOpen] = useState(false)

  const category = form.category as ProRole | ''
  const meta = category ? CATEGORY_META[category] : null
  const CategoryIcon = meta?.icon || Tag

  // Step completions
  const step1Done = Boolean(form.eventName && form.category && form.startDate && form.location)
  const step2Done = Boolean(
    (category === 'planner' && form.plannerScope) ||
    (category === 'performer' && form.performerType) ||
    (category === 'crew' && form.crewShift)
  )
  const step3Done = Boolean(
    (category === 'planner' && form.plannerBudget) ||
    (category === 'performer' && (form.performerBudgetMin || form.performerBudgetMax)) ||
    (category === 'crew' && (form.crewHeadcount || form.crewBudgetPerHead))
  )

  const checklist = [
    { label: '1. Event basics', done: step1Done },
    { label: '2. Category details', done: step2Done },
    { label: '3. Preferences & budget', done: step3Done },
    { label: '4. Review & submit', done: false },
  ]

  const dateDisplay = form.startDate
    ? form.endDate
      ? `${form.startDate} → ${form.endDate}`
      : form.startDate
    : 'Date not set'

  const content = (
    <div className="space-y-4">
      {/* Category header / pill & thumbnail */}
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-page shrink-0 border border-border">
          <Image
            src={meta ? meta.image : '/images/hero.jpg'}
            alt={meta ? meta.label : 'Event preview'}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          {meta ? (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${meta.pillClass}`}
            >
              <CategoryIcon className="w-3.5 h-3.5" aria-hidden="true" />
              {meta.label}
            </span>
          ) : (
            <span className="text-xs text-muted font-medium">Select a category</span>
          )}
          <p className="text-sm font-semibold text-ink truncate mt-1">
            {form.eventName || 'Untitled Event'}
          </p>
        </div>
      </div>

      {/* Details list */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2 text-muted">
          <Calendar className="w-3.5 h-3.5 shrink-0 text-ink" aria-hidden="true" />
          <span className="text-ink font-medium truncate">{dateDisplay}</span>
        </div>
        <div className="flex items-center gap-2 text-muted">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-ink" aria-hidden="true" />
          <span className="text-ink font-medium truncate">
            {form.location ? `${form.location}${form.venue ? ` (${form.venue})` : ''}` : 'Location not set'}
          </span>
        </div>
      </div>

      {/* Completion checklist */}
      <div className="pt-3 border-t border-border">
        <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-2.5">
          Progress checklist
        </p>
        <ul className="space-y-2">
          {checklist.map((item, idx) => (
            <li key={idx} className="flex items-center justify-between text-xs">
              <span className={item.done ? 'text-ink font-medium' : 'text-muted'}>
                {item.label}
              </span>
              {item.done ? (
                <span className="inline-flex items-center gap-1 text-success font-semibold">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                  Done
                </span>
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-border inline-block" />
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Helpful note */}
      <div className="p-3 rounded-xl bg-page border border-border text-[12px] text-muted leading-relaxed">
        Quotes from verified professionals will be tailored to the scope and budget you specify here.
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Collapsible Accordion (visible only < lg) */}
      {!desktopOnly && (
        <div className="lg:hidden mb-6 bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left font-semibold text-xs text-ink bg-surface hover:bg-page transition-colors"
            aria-expanded={mobileOpen}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand" />
              <span>Requirement summary:</span>
              <span className="font-normal text-muted truncate max-w-[160px]">
                {form.eventName || (meta ? meta.label : 'In progress')}
              </span>
            </div>
            {mobileOpen ? (
              <ChevronUp className="w-4 h-4 text-muted" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted" />
            )}
          </button>
          {mobileOpen && <div className="p-4 border-t border-border bg-surface">{content}</div>}
        </div>
      )}

      {/* Desktop Sticky Card (visible lg+) */}
      {!mobileOnly && (
        <aside className="hidden lg:block w-full">
          <div className="sticky top-20 bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
              <h2 className="text-sm font-semibold text-ink">Your requirement</h2>
              <span className="text-[11px] font-semibold text-brand bg-band-soft px-2.5 py-0.5 rounded-full">
                Auto-saved
              </span>
            </div>
            {content}
          </div>
        </aside>
      )}
    </>
  )
}
