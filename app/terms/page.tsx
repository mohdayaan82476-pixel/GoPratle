import React from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FileText, Shield, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service | GoPratle Event Marketplace',
  description: 'Terms of Service governing the use of GoPratle event talent and services marketplace.',
}

export default function TermsPage() {
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand mb-3">
              <FileText className="w-3.5 h-3.5" /> Legal Agreement
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-ink tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs text-muted mt-2">
              Last updated: October 2026 • Effective immediately
            </p>
          </div>

          <section className="space-y-4 text-sm text-ink/80 leading-relaxed">
            <h2 className="text-xl font-display font-bold text-ink">1. Acceptance of Terms</h2>
            <p>
              By accessing or using GoPratle (the &quot;Platform&quot;), including posting event requirements, applying as a service provider, or browsing listings, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section className="space-y-4 text-sm text-ink/80 leading-relaxed">
            <h2 className="text-xl font-display font-bold text-ink">2. Marketplace Role</h2>
            <p>
              GoPratle is an event talent marketplace that connects event hosts with independent event planners, performers, and technical crew across India. GoPratle is not an employer, agency, or contractor of the service providers listed on the platform.
            </p>
            <p>
              All contractual agreements, performance commitments, and deliverables are made directly between the event host and the selected professional.
            </p>
          </section>

          <section className="space-y-4 text-sm text-ink/80 leading-relaxed">
            <h2 className="text-xl font-display font-bold text-ink">3. Requirement Posting &amp; Verification</h2>
            <p>
              When posting a requirement on GoPratle:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must provide accurate, truthful details regarding event dates, locations, and requirements.</li>
              <li>You must verify your contact email address via a 6-digit One-Time Password (OTP) before publication.</li>
              <li>You agree that verified professionals matching your category and location may contact you regarding your requirement.</li>
            </ul>
          </section>

          <section className="space-y-4 text-sm text-ink/80 leading-relaxed">
            <h2 className="text-xl font-display font-bold text-ink">4. Privacy &amp; Public Display</h2>
            <p>
              To protect event organizers from unsolicited spam and automated scraping, client contact details (email address and phone number) are masked on the public requirements directory. Only authorized administrators and verified matching talent receive direct contact credentials.
            </p>
          </section>

          <section className="space-y-4 text-sm text-ink/80 leading-relaxed">
            <h2 className="text-xl font-display font-bold text-ink">5. Prohibited Conduct</h2>
            <p>
              Users may not submit false or misleading event listings, post offensive or unauthorized content, attempt to bypass rate limits, or misuse client information obtained through the platform.
            </p>
          </section>

          <section className="space-y-4 text-sm text-ink/80 leading-relaxed">
            <h2 className="text-xl font-display font-bold text-ink">6. Contact Us</h2>
            <p>
              If you have questions about these Terms of Service, please reach out to us at <a href="mailto:support@gopratle.com" className="text-brand font-medium hover:underline">support@gopratle.com</a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
