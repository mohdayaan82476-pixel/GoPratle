'use client'

import React, { forwardRef } from 'react'
import { LucideIcon } from 'lucide-react'

export interface IconInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon | React.ComponentType<{ className?: string; size?: number; 'aria-hidden'?: boolean | 'true' | 'false' }> | React.ReactNode
  error?: boolean | string
  wrapperClassName?: string
  rightElement?: React.ReactNode
}

export const IconInput = forwardRef<HTMLInputElement, IconInputProps>(function IconInput(
  {
    icon: Icon,
    type = 'text',
    className = '',
    wrapperClassName = '',
    error,
    rightElement,
    disabled,
    ...props
  },
  ref
) {
  const isDate = type === 'date'

  return (
    <div className={`relative w-full ${wrapperClassName}`}>
      {Icon && (
        <span
          aria-hidden="true"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none z-10 flex items-center justify-center w-[18px] h-[18px]"
        >
          {React.isValidElement(Icon) ? (
            Icon
          ) : (
            (() => {
              const IconComp = Icon as React.ElementType
              return <IconComp size={18} className="w-[18px] h-[18px] text-muted" aria-hidden="true" />
            })()
          )}
        </span>
      )}

      <input
        ref={ref}
        type={type}
        disabled={disabled}
        className={`w-full h-12 rounded-lg border bg-white text-base text-ink placeholder:text-muted transition-colors duration-150 outline-none appearance-none focus:outline-none focus:border-band focus:ring-2 focus:ring-band ${
          Icon ? 'pl-12 !pl-12' : 'pl-4'
        } ${
          isDate
            ? 'pr-3 [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer'
            : rightElement
            ? 'pr-10'
            : 'pr-4'
        } ${
          error
            ? 'border-error focus:border-error focus:ring-error'
            : 'border-border'
        } ${disabled ? 'bg-page text-muted cursor-not-allowed' : ''} ${className}`}
        {...props}
      />

      {rightElement && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 flex items-center">
          {rightElement}
        </div>
      )}
    </div>
  )
})

IconInput.displayName = 'IconInput'

export default IconInput
