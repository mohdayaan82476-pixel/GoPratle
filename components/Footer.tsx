'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowUp } from 'lucide-react'

export default function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setShowBackToTop(window.scrollY > 600)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative bg-ink text-white border-t border-border/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        {/* 2 columns mobile, 4 desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-12">
          {/* Column 1: GoPratle */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-band flex items-center justify-center text-white shadow-xs">
                <span className="font-display font-extrabold text-[15px] leading-none text-white select-none">
                  G
                </span>
              </div>
              <span className="font-display font-bold text-lg text-white">GoPratle</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed mb-4">
              Connecting event hosts with verified planners, performers, and technical crew across India.
            </p>
            <ul className="space-y-2.5 text-xs text-white/80">
              <li>
                <Link
                  href="/about"
                  className="link-underline-light text-white/80 hover:text-white transition-colors"
                >
                  About GoPratle
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="link-underline-light text-white/80 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Planners */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-band-soft mb-4">
              For Event Hosts
            </h3>
            <ul className="space-y-2.5 text-xs text-white/80">
              <li>
                <Link
                  href="/#how-it-works"
                  className="link-underline-light text-white/80 hover:text-white transition-colors"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href="/get-started"
                  className="link-underline-light text-white/80 hover:text-white transition-colors"
                >
                  Post a requirement
                </Link>
              </li>
              <li>
                <Link
                  href="/#browse-categories"
                  className="link-underline-light text-white/80 hover:text-white transition-colors"
                >
                  Browse categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Talent */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-band-soft mb-4">
              For Event Talent
            </h3>
            <ul className="space-y-2.5 text-xs text-white/80">
              <li>
                <Link
                  href="/join"
                  className="link-underline-light text-white/80 hover:text-white transition-colors"
                >
                  Join as talent
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="link-underline-light text-white/80 hover:text-white transition-colors"
                >
                  Pricing &amp; Plans
                </Link>
              </li>
              <li>
                <Link
                  href="/requirements"
                  className="link-underline-light text-white/80 hover:text-white transition-colors"
                >
                  Browse active leads
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-band-soft mb-4">
              Support &amp; Trust
            </h3>
            <ul className="space-y-2.5 text-xs text-white/80">
              <li>
                <Link
                  href="/#help"
                  className="link-underline-light text-white/80 hover:text-white transition-colors"
                >
                  Help &amp; FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="link-underline-light text-white/80 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="link-underline-light text-white/80 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>© {new Date().getFullYear()} GoPratle Technologies Pvt Ltd. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Photos from{' '}
            <span className="text-white/80 font-medium">Unsplash</span> (Nicholas Green, Pablo Heimplatz, Jay Wennington, Austin Neill)
          </p>
        </div>
      </div>

      {/* Floating Back to Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        style={{
          transitionDuration: '300ms',
          transitionTimingFunction: 'var(--ease-out)',
        }}
        aria-label="Back to top"
        title="Back to top"
        className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-brand text-white shadow-lift flex items-center justify-center hover:bg-brand-hover hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-band focus-visible:outline-none transition-all cursor-pointer ${
          showBackToTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ArrowUp className="w-5 h-5" aria-hidden="true" />
        <span className="sr-only">Back to top</span>
      </button>
    </footer>
  )
}
