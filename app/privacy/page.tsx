import React from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ShieldCheck, ArrowLeft, Lock, EyeOff, Mail } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | GoPratle Event Marketplace',
  description: 'GoPratle Privacy Policy regarding client data protection, email verification, and contact privacy.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-page flex flex-col text-ink">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-brand transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-surface border border-border rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
          <div className="border-b border-border pb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Data Security &amp; Trust
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-ink tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs text-muted mt-2">
              Last updated: October 2026 • Committed to organizer privacy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-page border border-border rounded-2xl p-4">
              <EyeOff className="w-6 h-6 text-brand mb-2" />
              <h3 className="text-sm font-bold text-ink mb-1">Masked Contacts</h3>
              <p className="text-xs text-muted">Your phone number and email are never shown on the public marketplace directory.</p>
            </div>
            <div className="bg-page border border-border rounded-2xl p-4">
              <Lock className="w-6 h-6 text-emerald-600 mb-2" />
              <h3 className="text-sm font-bold text-ink mb-1">OTP Verified</h3>
              <p className="text-xs text-muted">Every posting requires email ownership verification with a secure 10-minute OTP.</p>
            </div>
            <div className="bg-page border border-border rounded-2xl p-4">
              <Mail className="w-6 h-6 text-brand mb-2" />
              <h3 className="text-sm font-bold text-ink mb-1">Zero Spam</h3>
              <p className="text-xs text-muted">We never sell your contact information to third-party data brokers or marketing lists.</p>
            </div>
          </div>

          <section className="space-y-4 text-sm text-ink/80 leading-relaxed">
            <h2 className="text-xl font-display font-bold text-ink">1. Information We Collect</h2>
            <p>
              When you post an event requirement on GoPratle, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Event Specifications:</strong> Event name, event type, date and time, location city/venue, and category-specific needs (e.g. musical genre, guest count, shift hours).</li>
              <li><strong>Contact Information:</strong> Contact person name, email address, and optional phone number.</li>
              <li><strong>Verification Tokens:</strong> Cryptographic confirmation that you own the supplied email address.</li>
            </ul>
          </section>

          <section className="space-y-4 text-sm text-ink/80 leading-relaxed">
            <h2 className="text-xl font-display font-bold text-ink">2. How We Use Your Information</h2>
            <p>
              We use your information exclusively to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Facilitate discovery and matching between event organizers and verified talent.</li>
              <li>Send you essential booking notifications, reference IDs, and requirement status updates.</li>
              <li>Allow verified talent and platform administrators to contact you regarding your posting.</li>
            </ul>
          </section>

          <section className="space-y-4 text-sm text-ink/80 leading-relaxed">
            <h2 className="text-xl font-display font-bold text-ink">3. Data Retention &amp; Security</h2>
            <p>
              Email verification OTP codes are hashed using industry-standard HMAC-SHA256 and expire automatically after 10 minutes. Verification database records are automatically pruned via MongoDB TTL indexes after 24 hours.
            </p>
          </section>

          <section className="space-y-4 text-sm text-ink/80 leading-relaxed">
            <h2 className="text-xl font-display font-bold text-ink">4. Your Rights</h2>
            <p>
              You have the right to request closing your requirement listing, updating your contact details, or removing your submission at any time by contacting us at <a href="mailto:privacy@gopratle.com" className="text-brand font-medium hover:underline">privacy@gopratle.com</a> with your Reference ID.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
