import { FormProvider } from '@/lib/form-context'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SummaryCard from '@/components/SummaryCard'

export default function PostRequirementLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Navbar />

        {/* Full-width bg-band hero area with white display text, rounded bottom corners, and a single flat decorative shape */}
        <header className="relative w-full bg-band text-white rounded-b-3xl sm:rounded-b-[2.5rem] overflow-hidden">
          {/* Single flat decorative shape (flat circle, no gradients, no blurs) */}
          <div
            aria-hidden="true"
            className="absolute -right-16 -bottom-24 w-80 h-80 rounded-full bg-white/10 pointer-events-none"
          />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16 sm:pt-14 sm:pb-20">
            <h1 className="text-[28px] sm:text-[36px] lg:text-[40px] font-display font-bold tracking-tight text-white mb-2 leading-tight">
              Post your event requirement
            </h1>
            <p className="text-sm sm:text-base text-white/90 max-w-xl font-normal">
              Connect with verified event planners, performers, and crew across India.
            </p>
          </div>
        </header>

        {/* Main content sits on pale lavender page and overlaps the bg-band header by 40px */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 -mt-10 sm:-mt-12 relative z-10 pb-16">
          {/* Two-column layout on desktop, single column on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left column: 2/3 width */}
            <div className="lg:col-span-8 min-w-0">
              <SummaryCard mobileOnly />
              {children}
            </div>

            {/* Right column: 1/3 width sticky sidebar */}
            <div className="hidden lg:block lg:col-span-4 min-w-0">
              <SummaryCard desktopOnly />
            </div>
          </div>
        </main>

        <Footer />
      </div>
  )
}

