'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import IconInput from '@/components/ui/IconInput'
import { useInView } from '@/hooks/useInView'
import {
  Star,
  Search,
  ClipboardList,
  Mic2,
  Users,
  ArrowRight,
  ArrowLeft,
  FileText,
  MessageSquareQuote,
  CheckCircle2,
  Sparkles,
  Music,
  PartyPopper,
  Briefcase,
  Cake,
  GraduationCap,
  Rocket,
  Wine,
} from 'lucide-react'

const ROTATING_WORDS = ['planners', 'performers', 'crew']

const CATEGORY_ITEMS = [
  {
    role: 'planner' as const,
    title: 'Event Planner',
    pillText: 'Planning & Decor',
    examples: 'Venues, catering, decor, full planning',
    detailServices: 'Venues, Catering, Decor, Full planning, Vendor coordination',
    icon: ClipboardList,
    photo: '/images/categories/planner.jpg',
    colorHex: '#0f766e',
    softBgClass: 'bg-planner-soft',
    textClass: 'text-planner',
    borderClass: 'border-planner',
  },
  {
    role: 'performer' as const,
    title: 'Performer',
    pillText: 'Artists & Live Acts',
    examples: 'Bands, DJs, dancers, magicians',
    detailServices: 'Live bands, Solo singers, DJs, Dancers, Magicians & Stage acts',
    icon: Mic2,
    photo: '/images/categories/performer.jpg',
    colorHex: '#c2410c',
    softBgClass: 'bg-performer-soft',
    textClass: 'text-performer',
    borderClass: 'border-performer',
  },
  {
    role: 'crew' as const,
    title: 'Event Crew',
    pillText: 'Production & Staff',
    examples: 'Sound, lighting, staff, setup',
    detailServices: 'Sound engineers, Stage lighting, Rigging, Setup crew, Logistics staff',
    icon: Users,
    photo: '/images/categories/crew.jpg',
    colorHex: '#1d4ed8',
    softBgClass: 'bg-crew-soft',
    textClass: 'text-crew',
    borderClass: 'border-crew',
  },
]

const EVENT_MARQUEE_ITEMS = [
  { label: 'Weddings', icon: Sparkles },
  { label: 'Concerts', icon: Music },
  { label: 'Corporate events', icon: Briefcase },
  { label: 'Birthdays', icon: Cake },
  { label: 'Festivals', icon: PartyPopper },
  { label: 'College fests', icon: GraduationCap },
  { label: 'Product launches', icon: Rocket },
  { label: 'Receptions', icon: Wine },
]

const SHOWCASE_ITEMS = [
  {
    title: 'Weddings',
    desc: 'Sangeets, mandaps and receptions',
    photo: '/images/showcase/wedding.jpg',
    alt: 'Luxury wedding reception, floral mandap and stage decor',
  },
  {
    title: 'Mehendi and haldi',
    desc: 'Ceremonies and pre-wedding events',
    photo: '/images/showcase/mehendi.jpg',
    alt: 'Traditional mehendi and haldi pre-wedding celebration',
  },
  {
    title: 'Nightlife',
    desc: 'DJs and club nights',
    photo: '/images/showcase/dj.jpg',
    alt: 'Live DJ mixing music under dynamic stage lights',
  },
  {
    title: 'Corporate events',
    desc: 'Summits, galas and keynotes',
    photo: '/images/showcase/corporate.jpg',
    alt: 'Executive corporate conference and summit stage',
  },
  {
    title: 'Birthdays',
    desc: 'Milestone parties and celebrations',
    photo: '/images/showcase/birthday.jpg',
    alt: 'Milestone birthday party celebration with confetti and lights',
  },
  {
    title: 'Cultural shows',
    desc: 'Folk, classical and dance acts',
    photo: '/images/showcase/dance.jpg',
    alt: 'Classical and folk cultural dance performance on stage',
  },
  {
    title: 'College fests',
    desc: 'Stage shows and live acts',
    photo: '/images/showcase/college-fest.jpg',
    alt: 'College festival arena with live music performance',
  },
  {
    title: 'Launches',
    desc: 'Product reveals and brand events',
    photo: '/images/showcase/launch.jpg',
    alt: 'Product launch reveal and keynote presentation',
  },
]

const HERO_COLUMN_1 = [
  {
    id: 'hero-col1-1',
    src: '/images/hero/hero-1.jpg',
    alt: 'Live acoustic concert performer on stage',
    chip: 'Live music',
    heightClass: 'h-[220px]',
    priority: true,
  },
  {
    id: 'hero-col1-2',
    src: '/images/hero/party-7.jpg',
    alt: 'Joyful Indian wedding celebration and sangeet night with fairy lights',
    chip: 'Celebrations',
    heightClass: 'h-[300px]',
    priority: true,
  },
  {
    id: 'hero-col1-3',
    src: '/images/hero/hero-3.jpg',
    alt: 'Professional sound engineer mixing live concert audio',
    chip: 'Sound & Stage',
    heightClass: 'h-[260px]',
    priority: false,
  },
  {
    id: 'hero-col1-4',
    src: '/images/hero/party-6.jpg',
    alt: 'Club DJ performing live electronic music set at nighttime event',
    chip: 'Nightlife & DJs',
    heightClass: 'h-[340px]',
    priority: false,
  },
]

const HERO_COLUMN_2 = [
  {
    id: 'hero-col2-1',
    src: '/images/hero/hero-2.jpg',
    alt: 'Luxury banquet wedding ballroom with floral chandeliers',
    chip: 'Weddings',
    heightClass: 'h-[300px]',
    priority: true,
  },
  {
    id: 'hero-col2-2',
    src: '/images/hero/party-8.jpg',
    alt: 'Stage rigging and lighting production crew installing spotlights',
    chip: 'Production Crew',
    heightClass: 'h-[240px]',
    priority: true,
  },
  {
    id: 'hero-col2-3',
    src: '/images/hero/hero-5.jpg',
    alt: 'Solo musical artist singing under vibrant event spotlight',
    chip: 'Performers',
    heightClass: 'h-[320px]',
    priority: false,
  },
  {
    id: 'hero-col2-4',
    src: '/images/hero/hero-4.jpg',
    alt: 'Grand concert celebration arena under spectacular beam lighting',
    chip: 'Concerts & Fests',
    heightClass: 'h-[260px]',
    priority: false,
  },
]

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  // Reduced motion detection
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsReducedMotion(mediaQuery.matches)

    function handleChange(e: MediaQueryListEvent) {
      setIsReducedMotion(e.matches)
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Rotating headline word state
  const [wordIndex, setWordIndex] = useState(0)
  const [wordFading, setWordFading] = useState(false)

  // Showcase slider ref
  const showcaseScrollRef = useRef<HTMLDivElement>(null)

  // How it works dashed line draw inView
  const { ref: howItWorksRef, inView: howItWorksInView } = useInView<HTMLElement>({
    threshold: 0.2,
    once: true,
  })

  // Headline rotating word effect (2.4s interval)
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const timer = setInterval(() => {
      setWordFading(true)
      setTimeout(() => {
        setWordIndex(prev => (prev + 1) % ROTATING_WORDS.length)
        setWordFading(false)
      }, 250)
    }, 2400)

    return () => clearInterval(timer)
  }, [])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/get-started?location=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/get-started')
    }
  }

  function scrollShowcase(direction: 'left' | 'right') {
    if (showcaseScrollRef.current) {
      const offset = direction === 'left' ? -340 : 340
      showcaseScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Navbar />

      <main className="flex-1">
        {/* ── 1. HERO SECTION (Split Layout) ── */}
        <section
          aria-label="Find and hire talent for your event"
          className="relative w-full bg-band text-white overflow-hidden"
        >
          {/* Flat decorative circular shape at 10% opacity (no gradient, no blur) */}
          <div
            aria-hidden="true"
            className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white/10 pointer-events-none"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-14 sm:pb-16">
            <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-10">
              {/* Left Column (about 55%) */}
              <div className="w-full lg:w-[55%] flex flex-col justify-center">
                {/* 1. Pill Badge - 0ms */}
                <Reveal delay={0}>
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/15 text-white">
                      <Star className="w-3.5 h-3.5 fill-[#f2b01e] text-[#f2b01e]" aria-hidden="true" />
                      Built for event planners across India
                    </span>
                  </div>
                </Reveal>

                {/* 2. Rotating Headline - 80ms */}
                <Reveal delay={80}>
                  <h1 className="text-[34px] sm:text-[46px] lg:text-[52px] font-display font-bold text-white tracking-[-0.01em] leading-[1.12] mb-3">
                    Find and hire{' '}
                    <span className="inline-block min-w-[170px] sm:min-w-[230px] lg:min-w-[270px] text-band-soft text-left">
                      <span
                        className={`inline-block transition-all duration-250 ${
                          wordFading
                            ? '-translate-y-2 opacity-0'
                            : 'translate-y-0 opacity-100'
                        }`}
                      >
                        {ROTATING_WORDS[wordIndex]}
                      </span>
                    </span>{' '}
                    for your event
                  </h1>
                </Reveal>

                {/* 3. Subtext - 160ms */}
                <Reveal delay={160}>
                  <p className="text-[17px] sm:text-[18px] text-white/90 font-normal leading-relaxed mb-6 sm:mb-8">
                    Planners, performers and crew, all in one place.
                  </p>
                </Reveal>

                {/* 4. Entry Card - 240ms */}
                <Reveal delay={240}>
                  <div className="bg-surface rounded-2xl shadow-sm p-5 sm:p-6 text-ink border border-border/50">
                    {/* Search Form: uses IconInput with leading Search icon */}
                    <form onSubmit={handleSearchSubmit} className="relative mb-5">
                      <label htmlFor="hero-search-input" className="sr-only">
                        Find talent and event services
                      </label>
                      <IconInput
                        id="hero-search-input"
                        type="text"
                        icon={Search}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Find talent and event services"
                      />
                    </form>

                    {/* Heading: Browse categories */}
                    <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                      Browse categories
                    </h2>

                    {/* Three Interactive Category Rows with Hover Motion */}
                    <div className="space-y-2.5">
                      {CATEGORY_ITEMS.map(cat => {
                        const Icon = cat.icon
                        return (
                          <Link
                            key={cat.role}
                            href={`/get-started?category=${cat.role}`}
                            style={{ transitionTimingFunction: 'var(--ease-out)' }}
                            className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-band-soft/80 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 group focus-visible:ring-2 focus-visible:ring-band focus-visible:outline-none"
                          >
                            {/* 56px rounded-xl icon tile: fills with category colour & white icon on hover */}
                            <div
                              style={{ transitionTimingFunction: 'var(--ease-out)' }}
                              className={`w-14 h-14 rounded-xl ${cat.softBgClass} flex items-center justify-center shrink-0 border border-border/40 transition-colors duration-250 group-hover:bg-[var(--hover-bg)]`}
                              ref={el => {
                                if (el) el.style.setProperty('--hover-bg', cat.colorHex)
                              }}
                            >
                              <Icon
                                className="w-6 h-6 transition-colors duration-250 group-hover:text-white"
                                style={{ color: cat.colorHex }}
                                aria-hidden="true"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="text-[15px] font-semibold text-ink leading-snug group-hover:text-brand transition-colors">
                                {cat.title}
                              </h3>
                              <p className="text-xs text-muted truncate">
                                {cat.examples}
                              </p>
                            </div>

                            <ArrowRight
                              className="w-4 h-4 text-muted group-hover:text-brand arrow-slide shrink-0 mr-1"
                              aria-hidden="true"
                            />
                          </Link>
                        )
                      })}
                    </div>

                    {/* Full-width Brand Button with motion rules */}
                    <Link
                      href="/get-started"
                      className="btn-primary w-full h-12 rounded-full font-semibold text-[15px] justify-center mt-4 focus-visible:ring-2 focus-visible:ring-band focus-visible:outline-none"
                    >
                      Get started
                      <ArrowRight className="w-4 h-4 arrow-slide" aria-hidden="true" />
                    </Link>
                  </div>
                </Reveal>
              </div>

              {/* Right Column (about 45%): Opposing Infinite Vertical Marquee - 320ms */}
              <div className="w-full lg:w-[45%] flex flex-col justify-center">
                <Reveal delay={320} className="w-full">
                  <div
                    aria-label="Event gallery photos"
                    className="hero-marquee-panel relative w-full h-[420px] lg:h-[560px] bg-band-soft rounded-2xl p-3 sm:p-4 overflow-hidden border border-white/20 select-none"
                  >
                    {/* Feathered mask on top and bottom edges (48px linear gradient) */}
                    <div className="hero-marquee-mask h-full w-full">
                      <div className="grid grid-cols-2 gap-4 h-full">
                        {/* Column 1: Scrolls UP continuously */}
                        <div className="relative h-full overflow-hidden">
                          <div className="hero-marquee-track-up">
                            {/* Copy 1 */}
                            <div className="flex flex-col">
                              {HERO_COLUMN_1.map((img) => (
                                <div
                                  key={img.id}
                                  className={`relative w-full ${img.heightClass} rounded-2xl overflow-hidden shadow-sm group/img mb-4 shrink-0 bg-white/40`}
                                >
                                  <Image
                                    src={img.src}
                                    alt={img.alt}
                                    fill
                                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 280px"
                                    className="object-cover transition-transform duration-250 ease-out group-hover/img:scale-[1.04]"
                                    priority={img.priority}
                                  />
                                  <div className="absolute inset-0 photo-scrim pointer-events-none opacity-0 group-hover/img:opacity-100 transition-opacity duration-200" />
                                  <span className="absolute bottom-3 left-3 bg-ink/85 backdrop-blur-xs text-white text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 pointer-events-none">
                                    {img.chip}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Copy 2: Seamless loop duplicate */}
                            <div
                              aria-hidden="true"
                              data-marquee-duplicate="true"
                              className="flex flex-col"
                            >
                              {HERO_COLUMN_1.map((img) => (
                                <div
                                  key={`dup-${img.id}`}
                                  className={`relative w-full ${img.heightClass} rounded-2xl overflow-hidden shadow-sm group/img mb-4 shrink-0 bg-white/40`}
                                >
                                  <Image
                                    src={img.src}
                                    alt=""
                                    fill
                                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 280px"
                                    className="object-cover transition-transform duration-250 ease-out group-hover/img:scale-[1.04]"
                                    aria-hidden="true"
                                    tabIndex={-1}
                                  />
                                  <div className="absolute inset-0 photo-scrim pointer-events-none opacity-0 group-hover/img:opacity-100 transition-opacity duration-200" />
                                  <span className="absolute bottom-3 left-3 bg-ink/85 backdrop-blur-xs text-white text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 pointer-events-none">
                                    {img.chip}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Scrolls DOWN continuously */}
                        <div className="relative h-full overflow-hidden">
                          <div className="hero-marquee-track-down">
                            {/* Copy 1 */}
                            <div className="flex flex-col">
                              {HERO_COLUMN_2.map((img) => (
                                <div
                                  key={img.id}
                                  className={`relative w-full ${img.heightClass} rounded-2xl overflow-hidden shadow-sm group/img mb-4 shrink-0 bg-white/40`}
                                >
                                  <Image
                                    src={img.src}
                                    alt={img.alt}
                                    fill
                                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 280px"
                                    className="object-cover transition-transform duration-250 ease-out group-hover/img:scale-[1.04]"
                                    priority={img.priority}
                                  />
                                  <div className="absolute inset-0 photo-scrim pointer-events-none opacity-0 group-hover/img:opacity-100 transition-opacity duration-200" />
                                  <span className="absolute bottom-3 left-3 bg-ink/85 backdrop-blur-xs text-white text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 pointer-events-none">
                                    {img.chip}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Copy 2: Seamless loop duplicate */}
                            <div
                              aria-hidden="true"
                              data-marquee-duplicate="true"
                              className="flex flex-col"
                            >
                              {HERO_COLUMN_2.map((img) => (
                                <div
                                  key={`dup-${img.id}`}
                                  className={`relative w-full ${img.heightClass} rounded-2xl overflow-hidden shadow-sm group/img mb-4 shrink-0 bg-white/40`}
                                >
                                  <Image
                                    src={img.src}
                                    alt=""
                                    fill
                                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 280px"
                                    className="object-cover transition-transform duration-250 ease-out group-hover/img:scale-[1.04]"
                                    aria-hidden="true"
                                    tabIndex={-1}
                                  />
                                  <div className="absolute inset-0 photo-scrim pointer-events-none opacity-0 group-hover/img:opacity-100 transition-opacity duration-200" />
                                  <span className="absolute bottom-3 left-3 bg-ink/85 backdrop-blur-xs text-white text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 pointer-events-none">
                                    {img.chip}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>

          {/* Hero Bottom Edge: Flat SVG curve into page background */}
          <div aria-hidden="true" className="w-full overflow-hidden leading-none">
            <svg
              viewBox="0 0 1440 48"
              fill="none"
              preserveAspectRatio="none"
              className="w-full h-8 sm:h-12 block text-page"
            >
              <path
                d="M0,0 C360,48 1080,48 1440,0 L1440,48 L0,48 Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </section>

        {/* ── 2. EVENT-TYPE MARQUEE ── */}
        <section
          aria-label="Popular event types"
          className="w-full bg-surface border-y border-border py-4 overflow-hidden marquee-container select-none"
        >
          <div className="max-w-7xl mx-auto px-4 overflow-hidden">
            <div className="marquee-track flex items-center gap-8 text-sm font-semibold text-ink">
              {/* First loop */}
              {EVENT_MARQUEE_ITEMS.map((item, idx) => {
                const Icon = item.icon
                return (
                  <div
                    key={`m1-${idx}`}
                    className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-page border border-border/80 whitespace-nowrap"
                  >
                    <Icon className="w-4 h-4 text-brand shrink-0" />
                    <span>{item.label}</span>
                  </div>
                )
              })}

              {/* Duplicate loop for seamless loop */}
              {EVENT_MARQUEE_ITEMS.map((item, idx) => {
                const Icon = item.icon
                return (
                  <div
                    key={`m2-${idx}`}
                    className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-page border border-border/80 whitespace-nowrap"
                  >
                    <Icon className="w-4 h-4 text-brand shrink-0" />
                    <span>{item.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── 3. HOW IT WORKS ── */}
        <section
          id="how-it-works"
          ref={howItWorksRef as any}
          aria-label="How it works"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
        >
          <Reveal delay={0}>
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand bg-band-soft px-3.5 py-1 rounded-full mb-3 inline-block">
                Simple Booking Flow
              </span>
              <h2 className="text-[28px] sm:text-[34px] font-display font-bold text-ink tracking-tight mb-2">
                How it works
              </h2>
              <p className="text-[15px] text-muted">
                Post what you need once. We match you with verified planners, performers, and crew in your city.
              </p>
            </div>
          </Reveal>

          {/* Cards container with drawing dashed line on desktop */}
          <div className="relative max-w-6xl mx-auto">
            {/* Desktop SVG Connecting Dashed Line (Self-drawing stroke) */}
            <svg
              className="hidden md:block absolute top-12 left-24 right-24 w-[calc(100%-12rem)] h-4 pointer-events-none z-0"
              viewBox="0 0 800 16"
              fill="none"
              aria-hidden="true"
            >
              <line
                x1="0"
                y1="8"
                x2="800"
                y2="8"
                stroke="#e3d8f0"
                strokeWidth="2"
                strokeDasharray="8 8"
                className={howItWorksInView ? 'animate-dash-draw' : ''}
              />
            </svg>

            {/* Three Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {/* Step 1 */}
              <Reveal delay={80}>
                <div
                  style={{ transitionTimingFunction: 'var(--ease-out)' }}
                  className="bg-surface border border-border rounded-2xl p-7 shadow-sm hover:-translate-y-1 hover:shadow-lift transition-all duration-250 flex flex-col items-center text-center group cursor-default"
                >
                  <div
                    style={{ transitionTimingFunction: 'var(--ease-out)' }}
                    className="w-16 h-16 rounded-full bg-band-soft flex items-center justify-center mb-5 shrink-0 transition-colors duration-250 group-hover:bg-brand"
                  >
                    <FileText className="w-7 h-7 text-brand group-hover:text-white transition-colors duration-250" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted group-hover:text-brand transition-colors mb-1.5">
                    Step 1
                  </span>
                  <h3 className="text-xl font-display font-bold text-ink mb-2">
                    Post your requirement
                  </h3>
                  <p className="text-[14px] text-muted leading-relaxed">
                    Tell us the event, location and what you need.
                  </p>
                </div>
              </Reveal>

              {/* Step 2 */}
              <Reveal delay={160}>
                <div
                  style={{ transitionTimingFunction: 'var(--ease-out)' }}
                  className="bg-surface border border-border rounded-2xl p-7 shadow-sm hover:-translate-y-1 hover:shadow-lift transition-all duration-250 flex flex-col items-center text-center group cursor-default"
                >
                  <div
                    style={{ transitionTimingFunction: 'var(--ease-out)' }}
                    className="w-16 h-16 rounded-full bg-band-soft flex items-center justify-center mb-5 shrink-0 transition-colors duration-250 group-hover:bg-brand"
                  >
                    <MessageSquareQuote className="w-7 h-7 text-brand group-hover:text-white transition-colors duration-250" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted group-hover:text-brand transition-colors mb-1.5">
                    Step 2
                  </span>
                  <h3 className="text-xl font-display font-bold text-ink mb-2">
                    Get quotes
                  </h3>
                  <p className="text-[14px] text-muted leading-relaxed">
                    Our team shares matched planners, performers and crew.
                  </p>
                </div>
              </Reveal>

              {/* Step 3 */}
              <Reveal delay={240}>
                <div
                  style={{ transitionTimingFunction: 'var(--ease-out)' }}
                  className="bg-surface border border-border rounded-2xl p-7 shadow-sm hover:-translate-y-1 hover:shadow-lift transition-all duration-250 flex flex-col items-center text-center group cursor-default"
                >
                  <div
                    style={{ transitionTimingFunction: 'var(--ease-out)' }}
                    className="w-16 h-16 rounded-full bg-band-soft flex items-center justify-center mb-5 shrink-0 transition-colors duration-250 group-hover:bg-brand"
                  >
                    <CheckCircle2 className="w-7 h-7 text-brand group-hover:text-white transition-colors duration-250" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted group-hover:text-brand transition-colors mb-1.5">
                    Step 3
                  </span>
                  <h3 className="text-xl font-display font-bold text-ink mb-2">
                    Hire and book
                  </h3>
                  <p className="text-[14px] text-muted leading-relaxed">
                    Confirm your choice and finalise the details.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── 4. BROWSE BY CATEGORY ── */}
        <section
          id="browse-categories"
          aria-label="Browse by category"
          className="bg-surface border-y border-border py-14 sm:py-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal delay={0}>
              <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand bg-band-soft px-3.5 py-1 rounded-full mb-3 inline-block">
                  Verified Marketplace
                </span>
                <h2 className="text-[28px] sm:text-[34px] font-display font-bold text-ink tracking-tight mb-2">
                  Browse by category
                </h2>
                <p className="text-[15px] text-muted">
                  Explore planners, performers and crew for every kind of event.
                </p>
              </div>
            </Reveal>

            {/* Three Large Category Panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {CATEGORY_ITEMS.map((cat, idx) => {
                const Icon = cat.icon
                return (
                  <Reveal key={cat.role} delay={idx * 80}>
                    <div
                      style={{ transitionTimingFunction: 'var(--ease-out)' }}
                      className="bg-surface border border-border rounded-2xl overflow-hidden p-5 shadow-sm hover:-translate-y-1 hover:shadow-lift transition-all duration-250 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Photo at top (h-48, rounded-xl, zooms 1.06 on hover) */}
                        <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4 bg-page">
                          <Image
                            src={cat.photo}
                            alt={`${cat.title} professional service`}
                            fill
                            sizes="(max-width: 768px) 100vw, 360px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />

                          {/* Floating circular arrow chip appearing top-right on hover */}
                          <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white text-brand shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Category Pill */}
                        <span
                          className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${cat.softBgClass} ${cat.textClass}`}
                        >
                          {cat.pillText}
                        </span>

                        {/* Title */}
                        <h3 className="text-xl font-display font-bold text-ink mb-2 group-hover:text-brand transition-colors">
                          {cat.title}
                        </h3>

                        {/* Example Services as Plain Text */}
                        <p className="text-[14px] text-muted leading-relaxed mb-6">
                          {cat.detailServices}
                        </p>
                      </div>

                      {/* Post a Requirement button with sliding arrow */}
                      <Link
                        href={`/get-started?category=${cat.role}`}
                        className="btn-primary w-full h-11 rounded-full text-sm font-semibold justify-center focus-visible:ring-2 focus-visible:ring-band focus-visible:outline-none"
                      >
                        Post a requirement
                        <ArrowRight className="w-4 h-4 arrow-slide" aria-hidden="true" />
                      </Link>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── 5. PHOTO SHOWCASE: Every kind of event ── */}
        <section
          id="gallery"
          aria-label="Every kind of event gallery"
          className="py-14 sm:py-20 w-full overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <Reveal delay={0}>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand bg-band-soft px-3.5 py-1 rounded-full mb-2 inline-block">
                    Event Gallery
                  </span>
                  <h2 className="text-[28px] sm:text-[34px] font-display font-bold text-ink tracking-tight">
                    Every kind of event
                  </h2>
                  <p className="text-[15px] text-muted mt-1">
                    From intimate wedding ceremonies to stadium tours and corporate summits.
                  </p>
                </div>

                {/* Arrow buttons: Only shown in reduced-motion / manual mode, hidden when marquee is running */}
                {isReducedMotion && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => scrollShowcase('left')}
                      className="w-10 h-10 rounded-full border border-border bg-surface text-ink hover:text-brand hover:border-brand flex items-center justify-center transition-colors shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-band focus-visible:outline-none"
                      aria-label="Scroll left"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollShowcase('right')}
                      className="w-10 h-10 rounded-full border border-border bg-surface text-ink hover:text-brand hover:border-brand flex items-center justify-center transition-colors shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-band focus-visible:outline-none"
                      aria-label="Scroll right"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </Reveal>
          </div>

          {/* Full-bleed track running edge-to-edge across screen */}
          {isReducedMotion ? (
            /* Reduced Motion: Horizontal Scroll-Snap Row */
            <div
              ref={showcaseScrollRef}
              className="flex gap-5 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-6 pt-2 snap-x snap-mandatory scrollbar-none"
            >
              {SHOWCASE_ITEMS.map((item) => (
                <div
                  key={`reduced-${item.title}`}
                  tabIndex={0}
                  role="group"
                  aria-label={`${item.title}: ${item.desc}`}
                  style={{ transitionTimingFunction: 'var(--ease-out)' }}
                  className="relative shrink-0 w-[260px] sm:w-[320px] aspect-[4/5] rounded-2xl overflow-hidden snap-start group cursor-pointer bg-page shadow-sm hover:shadow-lift hover:-translate-y-1 focus:-translate-y-1 focus:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-band transition-all duration-[250ms]"
                >
                  <Image
                    src={item.photo}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 640px) 320px, 260px"
                    className="object-cover transition-transform duration-[250ms] group-hover:scale-[1.06] group-focus-visible:scale-[1.06]"
                    style={{ transitionTimingFunction: 'var(--ease-out)' }}
                  />

                  {/* Dark scrim behind the text only, rising from the bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-44 photo-scrim pointer-events-none" />

                  {/* Caption chip and description */}
                  <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col items-start gap-2 z-10">
                    <span
                      style={{ transitionTimingFunction: 'var(--ease-out)' }}
                      className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 border border-white/30 text-white transition-colors duration-[250ms] group-hover:bg-brand group-hover:border-brand"
                    >
                      {item.title}
                    </span>
                    <p className="text-[14px] text-white/95 font-medium leading-snug line-clamp-2 m-0">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Auto-scrolling infinite marquee: duplicates card list, animates translateX 0 to -50% */
            <div
              className="gallery-marquee-container w-full overflow-hidden py-3"
              aria-label="Infinite event gallery"
            >
              <div className="gallery-marquee-track flex gap-5 pr-5">
                {[...SHOWCASE_ITEMS, ...SHOWCASE_ITEMS].map((item, idx) => (
                  <div
                    key={`marquee-${idx}`}
                    tabIndex={0}
                    role="group"
                    aria-label={`${item.title}: ${item.desc}`}
                    style={{ transitionTimingFunction: 'var(--ease-out)' }}
                    className="relative shrink-0 w-[260px] sm:w-[320px] aspect-[4/5] rounded-2xl overflow-hidden group cursor-pointer bg-page shadow-sm hover:shadow-lift hover:-translate-y-1 focus:-translate-y-1 focus:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-band transition-all duration-[250ms]"
                  >
                    <Image
                      src={item.photo}
                      alt={item.alt}
                      fill
                      sizes="(min-width: 640px) 320px, 260px"
                      className="object-cover transition-transform duration-[250ms] group-hover:scale-[1.06] group-focus-visible:scale-[1.06]"
                      style={{ transitionTimingFunction: 'var(--ease-out)' }}
                    />

                    {/* Dark scrim behind the text only, rising from the bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-44 photo-scrim pointer-events-none" />

                    {/* Caption chip and description */}
                    <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col items-start gap-2 z-10">
                      <span
                        style={{ transitionTimingFunction: 'var(--ease-out)' }}
                        className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 border border-white/30 text-white transition-colors duration-[250ms] group-hover:bg-brand group-hover:border-brand"
                      >
                        {item.title}
                      </span>
                      <p className="text-[14px] text-white/95 font-medium leading-snug line-clamp-2 m-0">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── 6. FREQUENTLY ASKED QUESTIONS (HELP) ── */}
        <section
          id="help"
          aria-label="Frequently Asked Questions"
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 border-t border-border/60"
        >
          <Reveal delay={0}>
            <div className="text-center mb-12">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand bg-band-soft px-3.5 py-1 rounded-full mb-3 inline-block">
                Help &amp; FAQ
              </span>
              <h2 className="text-[28px] sm:text-[34px] font-display font-bold text-ink tracking-tight mb-2">
                Frequently asked questions
              </h2>
              <p className="text-[15px] text-muted">
                Everything you need to know about posting requirements and booking talent on GoPratle.
              </p>
            </div>
          </Reveal>

          <div className="space-y-4">
            {[
              {
                q: 'How does GoPratle match talent with my event?',
                a: 'Once you post your event requirement, our system classifies your specific category (Planner, Performer, or Crew) and notifies verified professionals in your city whose skills, availability, and rate card match your budget.',
              },
              {
                q: 'Is posting an event requirement free for hosts?',
                a: 'Yes, posting requirements on GoPratle is 100% free with no hidden charges. You receive direct bids and portfolio introductions from interested professionals without any upfront commitment.',
              },
              {
                q: 'How are professionals and talent verified?',
                a: 'All planners, artists, and technical crew undergo portfolio review, experience background checks, and client reference verification before they are marked as verified on our platform.',
              },
              {
                q: 'Why do I need to verify my email address with an OTP?',
                a: 'Email verification ensures that every listing on our marketplace is genuine and protects event professionals from spam inquiries. Your contact information is never shown publicly.',
              },
              {
                q: 'How soon will I start receiving responses for my requirement?',
                a: 'Most organizers start receiving inquiries and quotes within 2 to 4 hours of publishing their requirement.',
              },
            ].map((faq, idx) => (
              <Reveal key={faq.q} delay={idx * 50}>
                <details className="group bg-surface border border-border rounded-2xl p-5 shadow-xs transition-colors hover:border-brand/40 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between font-display font-bold text-ink cursor-pointer text-base">
                    <span>{faq.q}</span>
                    <span className="ml-4 shrink-0 text-brand text-xl group-open:rotate-45 transition-transform duration-200">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-muted leading-relaxed border-t border-border/50 pt-3">
                    {faq.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── 7. DUAL CTA BANNER ── */}
        <section
          aria-label="Get started or join as talent"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16"
        >
          <Reveal delay={0}>
            <div className="relative bg-band rounded-2xl max-w-6xl mx-auto p-8 sm:p-12 text-white shadow-sm overflow-hidden">
              {/* Flat decorative circular shape at 15% opacity in corner (no gradient) */}
              <div
                aria-hidden="true"
                className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-band-soft/15 pointer-events-none"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
                {/* Left CTA: Hosting an event? (lifts 2px on hover) */}
                <div
                  style={{ transitionTimingFunction: 'var(--ease-out)' }}
                  className="space-y-4 hover:-translate-y-0.5 transition-transform duration-200"
                >
                  <h2 className="text-[26px] sm:text-[30px] font-display font-bold text-white tracking-tight">
                    Hosting an event?
                  </h2>
                  <p className="text-[15px] text-white/90 leading-relaxed max-w-md">
                    Tell us your dates and requirements. We match you with verified planners, artists, and crew in your city.
                  </p>
                  <div>
                    <Link
                      href="/get-started"
                      className="inline-flex items-center gap-2 h-11 px-7 rounded-full text-sm font-semibold bg-white text-brand hover:bg-band-soft transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none shadow-xs group"
                    >
                      Post a requirement
                      <ArrowRight className="w-4 h-4 arrow-slide" aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                {/* Right CTA: Are you a performer or crew? (lifts 2px on hover) */}
                <div
                  style={{ transitionTimingFunction: 'var(--ease-out)' }}
                  className="space-y-4 border-t border-white/20 pt-6 md:pt-0 md:border-t-0 md:border-l md:border-white/20 md:pl-10 hover:-translate-y-0.5 transition-transform duration-200"
                >
                  <h2 className="text-[26px] sm:text-[30px] font-display font-bold text-white tracking-tight">
                    Are you a performer or crew?
                  </h2>
                  <p className="text-[15px] text-white/90 leading-relaxed max-w-md">
                    Join our network to receive direct booking inquiries from event hosts across India with zero upfront fees.
                  </p>
                  <div>
                    <Link
                      href="/join"
                      className="inline-flex items-center gap-2 h-11 px-7 rounded-full text-sm font-semibold border-2 border-white text-white hover:bg-white/10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none group"
                    >
                      Join as talent
                      <ArrowRight className="w-4 h-4 arrow-slide" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  )
}
