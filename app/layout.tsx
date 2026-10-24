import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import { FormProvider } from '@/lib/form-context'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'GoPratle — Find & Hire Event Talent Across India',
  description: 'Book verified event planners, live performers, and technical production crew for weddings, corporate summits, concerts, and festivals.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body className="min-h-screen bg-page text-ink font-sans antialiased">
        <FormProvider>
          {children}
        </FormProvider>
      </body>
    </html>
  )
}
