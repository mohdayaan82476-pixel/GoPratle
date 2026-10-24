'use client'

import { Check } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Event basics' },
  { id: 2, label: 'Category details' },
  { id: 3, label: 'Preferences' },
  { id: 4, label: 'Review' },
]

interface StepProgressProps {
  current: 1 | 2 | 3 | 4
}

export default function StepProgress({ current }: StepProgressProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-between w-full">
        {STEPS.map((step, idx) => {
          const isCompleted = step.id < current
          const isCurrent = step.id === current

          return (
            <li
              key={step.id}
              className={`flex items-center ${idx !== STEPS.length - 1 ? 'flex-1' : ''}`}
            >
              <div className="flex items-center gap-2.5">
                {/* Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                    isCompleted
                      ? 'bg-success text-white'
                      : isCurrent
                      ? 'bg-band text-white font-bold shadow-sm'
                      : 'border-2 border-muted/50 text-muted bg-surface font-medium'
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-xs sm:text-sm tracking-tight hidden sm:inline whitespace-nowrap ${
                    isCurrent
                      ? 'font-semibold text-ink'
                      : isCompleted
                      ? 'font-medium text-ink'
                      : 'text-muted font-normal'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line between steps */}
              {idx !== STEPS.length - 1 && (
                <div className="flex-1 mx-3 sm:mx-4 h-[2px]">
                  <div
                    className={`h-full transition-colors ${
                      step.id < current ? 'bg-success' : 'bg-border'
                    }`}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
