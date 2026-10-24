'use client'

import React, { ElementType } from 'react'
import { useInView } from '@/hooks/useInView'

interface RevealProps {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: ElementType
}

export default function Reveal({
  children,
  delay = 0,
  className = '',
  as: Component = 'div',
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.12, once: true })

  return (
    <Component
      ref={ref}
      style={{
        transitionDuration: '650ms',
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'var(--ease-out)',
      }}
      className={`reveal-item ${inView ? 'reveal-visible' : 'reveal-hidden'} ${className}`}
    >
      {children}
    </Component>
  )
}
