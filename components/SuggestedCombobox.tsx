'use client'

import React, { useState, useEffect, useRef, useId } from 'react'
import { Sparkles, ChevronDown } from 'lucide-react'
import IconInput from '@/components/ui/IconInput'

interface SuggestedComboboxProps {
  id?: string
  value: string
  suggestions: string[]
  placeholder?: string
  onChange: (value: string) => void
  helper?: string
  error?: string
  disabled?: boolean
  required?: boolean
  autoFocus?: boolean
  className?: string
  leadingIcon?: React.ReactNode
}

export default function SuggestedCombobox({
  id: externalId,
  value,
  suggestions,
  placeholder = 'Select or type…',
  onChange,
  helper,
  error,
  disabled = false,
  autoFocus = false,
  className = '',
  leadingIcon,
}: SuggestedComboboxProps) {
  const generatedId = useId()
  const inputId = externalId || generatedId

  const [inputValue, setInputValue] = useState(value || '')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter suggestions by input (or show all if empty/focused)
  const filtered = suggestions.filter(s =>
    inputValue.trim() === '' || s.toLowerCase().includes(inputValue.toLowerCase())
  )

  function selectOption(opt: string) {
    setInputValue(opt)
    setIsOpen(false)
    onChange(opt)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        setHighlightedIndex(0)
      } else if (filtered.length > 0) {
        setHighlightedIndex(prev => (prev + 1 < filtered.length ? prev + 1 : 0))
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        setHighlightedIndex(filtered.length - 1)
      } else if (filtered.length > 0) {
        setHighlightedIndex(prev => (prev - 1 >= 0 ? prev - 1 : filtered.length - 1))
      }
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        e.preventDefault()
        selectOption(filtered[highlightedIndex])
      } else {
        // Submit free text
        setIsOpen(false)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
      setHighlightedIndex(-1)
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <IconInput
        ref={inputRef}
        id={inputId}
        type="text"
        icon={leadingIcon}
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls={`${inputId}-listbox`}
        aria-activedescendant={
          highlightedIndex >= 0 ? `${inputId}-item-${highlightedIndex}` : undefined
        }
        autoComplete="off"
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder={placeholder}
        value={inputValue}
        error={error}
        onChange={e => {
          setInputValue(e.target.value)
          setIsOpen(true)
          onChange(e.target.value)
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        rightElement={
          <button
            type="button"
            tabIndex={-1}
            aria-label="Toggle suggestion list"
            onClick={() => setIsOpen(prev => !prev)}
            className="text-muted hover:text-ink p-1 cursor-pointer"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        }
      />

      {error ? (
        <p role="alert" className="text-[14px] text-error font-medium mt-1">
          {error}
        </p>
      ) : helper ? (
        <p className="text-[14px] text-muted mt-1">{helper}</p>
      ) : null}

      {/* Dropdown list */}
      {isOpen && filtered.length > 0 && (
        <div
          id={`${inputId}-listbox`}
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1.5 bg-surface border border-border rounded-xl shadow-lg max-h-64 overflow-y-auto p-1.5 focus:outline-none"
        >
          <div className="px-2.5 py-1 text-[11px] font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5 border-b border-border/60 mb-1">
            <Sparkles className="w-3 h-3 text-band" />
            <span>Suggestions (or type your own)</span>
          </div>

          {filtered.map((item, idx) => {
            const isHighlighted = highlightedIndex === idx
            const isSelected = inputValue.trim().toLowerCase() === item.toLowerCase()
            return (
              <div
                key={item}
                id={`${inputId}-item-${idx}`}
                role="option"
                aria-selected={isSelected || isHighlighted}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => selectOption(item)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-[15px] cursor-pointer transition-colors ${
                  isHighlighted
                    ? 'bg-band-soft text-brand font-semibold'
                    : isSelected
                    ? 'bg-page text-ink font-semibold'
                    : 'text-ink hover:bg-page'
                }`}
              >
                <span>{item}</span>
                {isSelected && (
                  <span className="text-xs text-brand font-medium">Selected</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
