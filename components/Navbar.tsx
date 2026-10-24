'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Menu, X, ArrowRight } from 'lucide-react'
import IconInput from '@/components/ui/IconInput'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileDrawerOpen])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/get-started?location=${encodeURIComponent(searchQuery.trim())}`
    } else {
      window.location.href = '/get-started'
    }
  }

  const navLinks = [
    { label: 'Browse categories', href: '/#browse-categories' },
    { label: 'Browse live requirements', href: '/requirements' },
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Event ideas', href: '/get-started' },
    { label: 'Help', href: '/#help' },
  ]

  return (
    <header
      style={{
        boxShadow: scrolled ? 'var(--shadow-soft)' : 'none',
        transitionTimingFunction: 'var(--ease-out)',
      }}
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'h-[68px] bg-surface border-b border-border'
          : 'h-20 bg-surface/95 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
        {/* Left: Brand Monogram "G" + Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[19px] font-display font-bold text-ink shrink-0 tracking-tight focus-visible:ring-2 focus-visible:ring-band focus-visible:outline-none rounded-lg p-1 -ml-1 group"
        >
          {/* Brand "G" Monogram in rounded square */}
          <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center text-white shadow-xs group-hover:bg-brand-hover transition-colors">
            <span className="font-display font-extrabold text-[17px] leading-none text-white select-none">
              G
            </span>
          </div>
          <span>GoPratle</span>
        </Link>

        {/* Centre (md+): Navigation Links with Animated Underline */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-ink">
          {navLinks.map(link => (
            <Link
              key={link.label}
              href={link.href}
              className="link-underline text-muted hover:text-brand transition-colors focus-visible:ring-2 focus-visible:ring-band focus-visible:outline-none rounded px-1 py-1"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right (Desktop): Search, Sign in, List your services */}
        <div className="hidden md:flex items-center gap-4">
          {/* Quick Search */}
          <div className="relative">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <IconInput
                  type="text"
                  autoFocus
                  icon={Search}
                  placeholder="City or event type…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="!h-10 text-xs rounded-full bg-page w-48 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink cursor-pointer"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-ink hover:text-brand hover:bg-page transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-band focus-visible:outline-none"
                aria-label="Search events and talent"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          <Link
            href="/sign-in"
            className="link-underline text-[15px] font-medium text-muted hover:text-brand transition-colors px-2 py-1.5 focus-visible:ring-2 focus-visible:ring-band focus-visible:outline-none rounded-lg"
          >
            Sign in
          </Link>

          <Link
            href="/join"
            className="btn-primary h-11 px-6 rounded-full text-[14px] font-semibold focus-visible:ring-2 focus-visible:ring-band focus-visible:outline-none"
          >
            List your services
            <ArrowRight className="w-4 h-4 arrow-slide" />
          </Link>
        </div>

        {/* Mobile: Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-ink hover:bg-page focus-visible:ring-2 focus-visible:ring-band focus-visible:outline-none cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* ── MOBILE FULL-HEIGHT DRAWER (Sliding in from Right) ── */}
      {mobileDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-0 z-50 flex justify-end lg:hidden"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/50 backdrop-blur-none transition-opacity duration-300"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Sliding Drawer Panel */}
          <div className="relative w-80 max-w-[85vw] h-full bg-surface p-6 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-right duration-300 border-l border-border">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-border mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center text-white shadow-xs">
                    <span className="font-display font-extrabold text-[17px] leading-none text-white select-none">
                      G
                    </span>
                  </div>
                  <span className="font-display font-bold text-ink text-lg">GoPratle</span>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-page cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search input */}
              <form onSubmit={handleSearchSubmit} className="relative mb-6">
                <IconInput
                  type="text"
                  icon={Search}
                  placeholder="City or event type…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="text-sm h-11 rounded-full w-full"
                />
              </form>

              {/* Staggered Nav Links */}
              <nav className="flex flex-col space-y-2 text-base font-medium text-ink">
                {navLinks.map((link, idx) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    style={{
                      animationDelay: `${idx * 80}ms`,
                    }}
                    className="px-3.5 py-3 rounded-xl hover:bg-page hover:text-brand transition-colors flex items-center justify-between"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 text-muted arrow-slide" />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-6 border-t border-border flex flex-col gap-3">
              <Link
                href="/sign-in"
                onClick={() => setMobileDrawerOpen(false)}
                className="text-center py-2.5 text-sm font-semibold text-ink hover:text-brand transition-colors"
              >
                Sign in to your account
              </Link>
              <Link
                href="/join"
                onClick={() => setMobileDrawerOpen(false)}
                className="btn-primary w-full h-12 rounded-full text-sm font-semibold justify-center"
              >
                List your services
                <ArrowRight className="w-4 h-4 ml-1 arrow-slide" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
