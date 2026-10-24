'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Requirement } from '@/lib/types'
import {
  MapPin,
  CalendarDays,
  Users,
  ClipboardList,
  Mic2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'

interface RequirementCardProps {
  requirement: Requirement
}

const CATEGORY_META = {
  planner: {
    label: 'Event Planner',
    pillClass: 'bg-planner-soft text-planner border-planner/30',
    icon: ClipboardList,
    photo: '/images/categories/planner.jpg',
    color: '#0f766e',
  },
  performer: {
    label: 'Performer',
    pillClass: 'bg-performer-soft text-performer border-performer/30',
    icon: Mic2,
    photo: '/images/categories/performer.jpg',
    color: '#c2410c',
  },
  crew: {
    label: 'Event Crew',
    pillClass: 'bg-crew-soft text-crew border-crew/30',
    icon: Users,
    photo: '/images/categories/crew.jpg',
    color: '#1d4ed8',
  },
}

const PERFORMER_TYPE_LABELS: Record<string, string> = {
  dj: 'DJ',
  'live-band': 'Live band',
  'solo-artist': 'Solo artist / singer',
  comedian: 'Comedian',
  dancer: 'Dancer / troupe',
  anchor: 'Anchor / emcee',
  other: 'Live entertainer',
}

const CREW_ROLE_LABELS: Record<string, string> = {
  usher: 'Usher / FOH',
  'av-tech': 'AV & stage tech',
  security: 'Security',
  hospitality: 'Hospitality',
  valet: 'Valet',
  cleanup: 'Setup & cleanup',
}

function formatRelativeTime(dateString: string): string {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHours = Math.floor(diffMin / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 30) {
      return new Date(dateString).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      })
    }
    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMin > 0) return `${diffMin}m ago`
    return 'Just now'
  } catch {
    return 'Recently'
  }
}

function formatDateDisplay(start: string, end?: string): string {
  try {
    const s = new Date(start)
    const sStr = s.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    if (end && end !== start) {
      const e = new Date(end)
      const eStr = e.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
      return `${sStr} – ${eStr}`
    }
    return sStr
  } catch {
    return start
  }
}

export default function RequirementCard({ requirement }: RequirementCardProps) {
  const [imgError, setImgError] = useState(false)
  const meta = CATEGORY_META[requirement.category] || CATEGORY_META.planner
  const Icon = meta.icon

  // Location string extraction
  const locationString =
    requirement.locationName ||
    (typeof requirement.location === 'object' && requirement.location !== null
      ? requirement.location.name
      : typeof requirement.location === 'string'
      ? requirement.location
      : 'Location specified')

  return (
    <article className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:scale-[1.02] hover:border-brand/40 transition-all flex flex-col justify-between group">
      <div>
        {/* Top: Category photo with fallback to category icon */}
        <div className="relative w-full h-40 bg-page overflow-hidden">
          {!imgError ? (
            <Image
              src={meta.photo}
              alt={`${requirement.eventName} - ${meta.label}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={`w-full h-full ${meta.pillClass} flex items-center justify-center`}>
              <Icon className="w-12 h-12" style={{ color: meta.color }} />
            </div>
          )}
        </div>

        {/* Content body */}
        <div className="p-5">
          {/* Metadata pill row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${meta.pillClass}`}
            >
              {meta.label}
            </span>

            {requirement.eventType && (
              <span className="text-xs font-medium text-muted bg-page px-2 py-0.5 rounded border border-border">
                {requirement.eventType}
              </span>
            )}

            <span className="text-[11px] text-muted ml-auto">
              Posted {formatRelativeTime(requirement.createdAt)}
            </span>
          </div>

          {/* Event Name */}
          <h3 className="font-display font-semibold text-[20px] text-ink line-clamp-2 leading-snug mb-3.5 group-hover:text-brand transition-colors">
            {requirement.eventName}
          </h3>

          {/* Icon details rows */}
          <div className="space-y-2 text-[13px] text-muted">
            {/* Location */}
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-brand mt-0.5 shrink-0" aria-hidden="true" />
              <span className="truncate text-ink font-medium">{locationString}</span>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
              <span>{formatDateDisplay(requirement.startDate, requirement.endDate)}</span>
            </div>

            {/* Category-specific details */}
            {requirement.category === 'planner' && (
              <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                <Users className="w-4 h-4 text-planner shrink-0" aria-hidden="true" />
                <span className="text-ink font-medium">
                  {requirement.plannerGuestCount ? `${requirement.plannerGuestCount} guests` : 'Guest count TBA'}
                  {requirement.plannerScope && ` • ${requirement.plannerScope === 'full' ? 'Full planning' : requirement.plannerScope === 'day-of' ? 'Day-of coordination' : 'Vendor sourcing'}`}
                </span>
              </div>
            )}

            {requirement.category === 'performer' && (
              <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                <Mic2 className="w-4 h-4 text-performer shrink-0" aria-hidden="true" />
                <span className="text-ink font-medium truncate">
                  {PERFORMER_TYPE_LABELS[requirement.performerType || ''] || requirement.performerType || 'Live act'}
                  {requirement.performerDuration ? ` • ${requirement.performerDuration} mins set` : ''}
                </span>
              </div>
            )}

            {requirement.category === 'crew' && (
              <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                <Users className="w-4 h-4 text-crew shrink-0" aria-hidden="true" />
                <span className="text-ink font-medium truncate">
                  {requirement.crewHeadcount ? `${requirement.crewHeadcount} staff needed` : 'Crew needed'}
                  {requirement.crewRolesNeeded && requirement.crewRolesNeeded.length > 0
                    ? ` • ${requirement.crewRolesNeeded.map(r => CREW_ROLE_LABELS[r] || r).slice(0, 2).join(', ')}`
                    : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-width brand button */}
      <div className="px-5 pb-5 pt-2">
        <Link
          href={`/requirements/${requirement.id}`}
          className="btn-primary w-full h-11 rounded-full text-sm font-semibold justify-center shadow-xs focus-visible:ring-2 focus-visible:ring-band focus-visible:outline-none"
        >
          View details
          <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
