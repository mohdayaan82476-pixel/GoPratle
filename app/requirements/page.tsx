'use client'

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import RequirementCard from '@/components/RequirementCard'
import { Requirement, ProRole } from '@/lib/types'
import { getRequirements } from '@/lib/api'
import {
  SlidersHorizontal,
  X,
  Search,
  RotateCcw,
  PlusCircle,
  AlertCircle,
  Calendar,
  CalendarDays,
  MapPin,
  ArrowUpDown,
  Check,
} from 'lucide-react'
import IconInput from '@/components/ui/IconInput'

const CATEGORIES: { role: ProRole; label: string; colorClass: string }[] = [
  { role: 'planner', label: 'Event Planner', colorClass: 'text-planner' },
  { role: 'performer', label: 'Performer', colorClass: 'text-performer' },
  { role: 'crew', label: 'Event Crew', colorClass: 'text-crew' },
]

function RequirementsContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Read URL query params
  const urlCategories = useMemo(() => {
    const cat = searchParams.get('category')
    if (!cat) return []
    return cat.split(',').filter(c => ['planner', 'performer', 'crew'].includes(c)) as ProRole[]
  }, [searchParams])

  const urlLocation = searchParams.get('location') || ''
  const urlFrom = searchParams.get('from') || ''
  const urlTo = searchParams.get('to') || ''
  const urlSort = (searchParams.get('sort') as 'newest' | 'eventDate') || 'newest'

  // Local filter states
  const [selectedCategories, setSelectedCategories] = useState<ProRole[]>(urlCategories)
  const [locationInput, setLocationInput] = useState(urlLocation)
  const [dateFrom, setDateFrom] = useState(urlFrom)
  const [dateTo, setDateTo] = useState(urlTo)
  const [sortBy, setSortBy] = useState<'newest' | 'eventDate'>(urlSort)

  // Data fetching states
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Keep state in sync with URL searchParams (e.g. Back/Forward navigation)
  useEffect(() => {
    setSelectedCategories(urlCategories)
    setLocationInput(urlLocation)
    setDateFrom(urlFrom)
    setDateTo(urlTo)
    setSortBy(urlSort)
  }, [urlCategories, urlLocation, urlFrom, urlTo, urlSort])

  // Sync state to URL searchParams
  const syncToUrl = useCallback(
    (cats: ProRole[], loc: string, from: string, to: string, sort: 'newest' | 'eventDate') => {
      const params = new URLSearchParams()
      if (cats.length > 0) params.set('category', cats.join(','))
      if (loc.trim()) params.set('location', loc.trim())
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      if (sort !== 'newest') params.set('sort', sort)

      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [router, pathname]
  )

  // Fetch from Express API using lib/api
  const fetchRequirements = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getRequirements({
        category: selectedCategories.length > 0 ? selectedCategories : undefined,
        location: locationInput.trim() || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        sort: sortBy,
      })

      setRequirements(data.requirements || [])
      setTotalCount(data.count ?? data.requirements?.length ?? 0)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Unable to load requirements. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [selectedCategories, locationInput, dateFrom, dateTo, sortBy])

  // Trigger fetch whenever filters change
  useEffect(() => {
    fetchRequirements()
  }, [fetchRequirements])

  // Clear filters
  function handleClearFilters() {
    setSelectedCategories([])
    setLocationInput('')
    setDateFrom('')
    setDateTo('')
    setSortBy('newest')
    syncToUrl([], '', '', '', 'newest')
    setMobileFiltersOpen(false)
  }

  // Count active filters
  const activeFilterCount =
    (selectedCategories.length > 0 ? 1 : 0) +
    (locationInput.trim() ? 1 : 0) +
    (dateFrom || dateTo ? 1 : 0) +
    (sortBy !== 'newest' ? 1 : 0)

  // Filter Sidebar / Bottom Sheet Component
  const FilterControls = (
    <div className="space-y-6">
      {/* Category Checkboxes */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
          Category
        </h3>
        <div className="space-y-2.5">
          {CATEGORIES.map(cat => {
            const isChecked = selectedCategories.includes(cat.role)
            return (
              <label
                key={cat.role}
                className="flex items-center gap-3 text-sm text-ink font-medium cursor-pointer select-none group"
              >
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isChecked
                      ? 'bg-brand border-brand text-white'
                      : 'bg-surface border-border group-hover:border-brand/60'
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    const next = isChecked
                      ? selectedCategories.filter(c => c !== cat.role)
                      : [...selectedCategories, cat.role]
                    setSelectedCategories(next)
                    syncToUrl(next, locationInput, dateFrom, dateTo, sortBy)
                  }}
                  className="sr-only"
                />
                <span className={isChecked ? 'text-brand font-semibold' : ''}>
                  {cat.label}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Location Filter */}
      <div className="pt-4 border-t border-border">
        <label htmlFor="filter-location" className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
          Location
        </label>
        <IconInput
          id="filter-location"
          type="text"
          icon={MapPin}
          placeholder="City (e.g. Hyderabad, Mumbai)"
          value={locationInput}
          onChange={e => {
            setLocationInput(e.target.value)
            syncToUrl(selectedCategories, e.target.value, dateFrom, dateTo, sortBy)
          }}
          className="text-sm rounded-lg"
        />
      </div>

      {/* Date Range */}
      <div className="pt-4 border-t border-border">
        <span className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
          Event Date
        </span>
        <div className="space-y-2">
          <div>
            <label htmlFor="filter-date-from" className="block text-[11px] text-muted mb-1">
              From
            </label>
            <IconInput
              id="filter-date-from"
              type="date"
              icon={CalendarDays}
              value={dateFrom}
              onChange={e => {
                setDateFrom(e.target.value)
                syncToUrl(selectedCategories, locationInput, e.target.value, dateTo, sortBy)
              }}
              className="text-xs rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="filter-date-to" className="block text-[11px] text-muted mb-1">
              To
            </label>
            <IconInput
              id="filter-date-to"
              type="date"
              icon={CalendarDays}
              min={dateFrom || undefined}
              value={dateTo}
              onChange={e => {
                setDateTo(e.target.value)
                syncToUrl(selectedCategories, locationInput, dateFrom, e.target.value, sortBy)
              }}
              className="text-xs rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Sort */}
      <div className="pt-4 border-t border-border">
        <label htmlFor="filter-sort" className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
          Sort by
        </label>
        <div className="relative">
          <ArrowUpDown className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            id="filter-sort"
            value={sortBy}
            onChange={e => {
              const val = e.target.value as 'newest' | 'eventDate'
              setSortBy(val)
              syncToUrl(selectedCategories, locationInput, dateFrom, dateTo, val)
            }}
            className="form-input pl-9 h-10 text-sm rounded-lg"
          >
            <option value="newest">Newest first</option>
            <option value="eventDate">Event date</option>
          </select>
        </div>
      </div>

      {/* Clear Filters Action */}
      {activeFilterCount > 0 && (
        <div className="pt-2">
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1.5 text-xs text-brand font-semibold hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Navbar />

      {/* ── HEADER: bg-band strip with title and real count ── */}
      <header className="relative w-full bg-band text-white rounded-b-3xl sm:rounded-b-[2.5rem] overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -right-16 -bottom-24 w-80 h-80 rounded-full bg-white/10 pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 sm:pt-12 sm:pb-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-band-soft bg-white/15 px-3 py-1 rounded-full">
                Active Client Inquiries
              </span>
            </div>
            <h1 className="text-[28px] sm:text-[36px] lg:text-[40px] font-display font-bold tracking-tight text-white leading-tight">
              Open requirements
            </h1>
            <p className="text-sm sm:text-base text-white/90 max-w-xl font-normal mt-1">
              {loading
                ? 'Fetching active requirements…'
                : `Showing ${totalCount} open requirement${totalCount === 1 ? '' : 's'} across India.`}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            <Link
              href="/post-requirement/step-1"
              className="btn-secondary bg-white text-brand hover:bg-band-soft h-11 px-5 rounded-full text-sm font-semibold shadow-sm"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Post a requirement
            </Link>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Mobile Filter Trigger Button & active indicator */}
        <div className="flex lg:hidden items-center justify-between gap-3 mb-6">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="btn-secondary h-11 px-5 rounded-full text-sm font-semibold inline-flex items-center gap-2 shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <span className="text-xs text-muted font-medium">
            {totalCount} result{totalCount === 1 ? '' : 's'}
          </span>
        </div>

        {/* 2-Column Layout: Sidebar (about 25%) + Results Grid (about 75%) */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0 sticky top-24 bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
              <h2 className="font-display font-semibold text-ink text-base">Filters</h2>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs text-brand font-semibold hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
            {FilterControls}
          </aside>

          {/* Results Grid Area */}
          <section className="flex-1 w-full min-w-0" aria-label="Requirements listings">
            {/* Top Bar on Desktop */}
            <div className="hidden lg:flex items-center justify-between mb-5">
              <p className="text-sm text-muted">
                Showing <strong className="text-ink font-semibold">{totalCount}</strong> open requirement
                {totalCount === 1 ? '' : 's'}
              </p>

              {/* Quick sort toggle */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted">Sort:</span>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('newest')
                    syncToUrl(selectedCategories, locationInput, dateFrom, dateTo, 'newest')
                  }}
                  className={`px-3 py-1 rounded-full font-medium transition-colors ${
                    sortBy === 'newest'
                      ? 'bg-brand text-white'
                      : 'bg-surface text-ink border border-border hover:border-brand/40'
                  }`}
                >
                  Newest
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('eventDate')
                    syncToUrl(selectedCategories, locationInput, dateFrom, dateTo, 'eventDate')
                  }}
                  className={`px-3 py-1 rounded-full font-medium transition-colors ${
                    sortBy === 'eventDate'
                      ? 'bg-brand text-white'
                      : 'bg-surface text-ink border border-border hover:border-brand/40'
                  }`}
                >
                  Event Date
                </button>
              </div>
            </div>

            {/* Loading Skeleton */}
            {loading && (
              <div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                aria-busy="true"
                aria-label="Loading requirements"
              >
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div
                    key={i}
                    className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm animate-pulse flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-full h-40 bg-page" />
                      <div className="p-5 space-y-3">
                        <div className="flex gap-2">
                          <div className="h-5 w-20 bg-page rounded-full" />
                          <div className="h-5 w-16 bg-page rounded" />
                        </div>
                        <div className="h-5 w-4/5 bg-page rounded" />
                        <div className="h-4 w-3/5 bg-page/70 rounded" />
                        <div className="h-4 w-2/5 bg-page/70 rounded" />
                      </div>
                    </div>
                    <div className="p-5 pt-0">
                      <div className="h-11 w-full bg-page rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="bg-surface border border-error/30 rounded-2xl p-10 text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-display font-semibold text-ink mb-1">
                  Something went wrong
                </h3>
                <p className="text-sm text-muted mb-5 max-w-sm mx-auto">{error}</p>
                <button
                  type="button"
                  onClick={fetchRequirements}
                  className="btn-primary h-11 px-6 rounded-full text-sm font-semibold"
                >
                  Retry loading
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && requirements.length === 0 && (
              <div className="bg-surface border border-border rounded-2xl p-10 sm:p-14 text-center shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-band-soft flex items-center justify-center mx-auto mb-4 border border-border">
                  <Search className="w-7 h-7 text-brand" />
                </div>

                <h3 className="text-[22px] font-display font-semibold text-ink mb-1.5">
                  No requirements match these filters
                </h3>
                <p className="text-sm text-muted max-w-md mx-auto mb-6">
                  Try adjusting or clearing your category, location, or date filters to view open client inquiries.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="btn-secondary h-11 px-6 rounded-full text-sm font-semibold"
                    >
                      Clear filters
                    </button>
                  )}
                  <Link
                    href="/post-requirement/step-1"
                    className="btn-primary h-11 px-6 rounded-full text-sm font-semibold"
                  >
                    Post a requirement
                  </Link>
                </div>
              </div>
            )}

            {/* Results Grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
            {!loading && !error && requirements.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {requirements.map(req => (
                  <RequirementCard key={req.id} requirement={req} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ── MOBILE BOTTOM SHEET FOR FILTERS ── */}
      {mobileFiltersOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-filters-title"
          className="fixed inset-0 z-50 bg-ink/60 lg:hidden flex flex-col justify-end animate-in fade-in duration-200"
        >
          <div className="bg-surface rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-6 animate-in slide-in-from-bottom duration-250">
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h2 id="mobile-filters-title" className="font-display font-bold text-lg text-ink">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-page"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter controls */}
            {FilterControls}

            {/* Sheet Footer Actions */}
            <div className="pt-4 border-t border-border flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn-secondary flex-1 h-12 rounded-full text-sm font-semibold"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="btn-primary flex-1 h-12 rounded-full text-sm font-semibold"
              >
                View {totalCount} results
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default function RequirementsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-page text-muted">
          Loading requirements…
        </div>
      }
    >
      <RequirementsContent />
    </Suspense>
  )
}
