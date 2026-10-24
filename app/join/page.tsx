import React from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Sparkles, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'

export const metadata = {
  title: 'Join as Talent — GoPratle',
  description: 'Join GoPratle as a verified event planner, performer, or event crew member.',
}

export default function JoinPage() {
  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-16 sm:py-24 flex flex-col items-center text-center">
        {/* Pill Badge */}
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-band-soft text-brand mb-6 border border-border">
          <Sparkles className="w-3.5 h-3.5 text-band" />
          Talent Network Early Access
        </span>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-ink tracking-tight mb-4 max-w-2xl">
          Grow your event business with GoPratle
        </h1>

        <p className="text-base sm:text-lg text-muted max-w-xl mx-auto mb-10 leading-relaxed">
          We are onboarding premier event planners, live performers, and technical crew across India. The talent onboarding portal is coming soon.
        </p>

        {/* Benefits Card */}
        <div className="w-full bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm text-left mb-10 max-w-2xl">
          <h2 className="text-lg font-display font-bold text-ink mb-4">
            Why join our verified talent marketplace?
          </h2>
          <ul className="space-y-3.5 text-sm text-ink/90">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <span><strong>Direct event leads:</strong> Get matched with real corporate summits, weddings, and concerts in your city.</span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <span><strong>Zero upfront commission:</strong> Showcase your portfolio and quote directly with event organizers.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <span><strong>Verified badges:</strong> Stand out to premium hosts with our rigorous verification credentials.</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/"
            className="btn-secondary h-12 px-7 rounded-full text-sm font-semibold inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <Link
            href="/get-started"
            className="btn-primary h-12 px-7 rounded-full text-sm font-semibold inline-flex items-center gap-2"
          >
            Explore client requirements
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
