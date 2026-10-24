'use client'

import React, { useState, useEffect, useRef, useId } from 'react'
import { MapPin, Search, Check, AlertCircle, Loader2, LucideIcon } from 'lucide-react'
import IconInput from '@/components/ui/IconInput'
import { PlaceLocation } from '@/lib/types'

interface Prediction {
  placeId: string
  mainText: string
  secondaryText: string
  description: string
}

interface PlaceComboboxProps {
  id?: string
  value: string
  placeholder?: string
  biasLat?: number
  biasLng?: number
  onChange: (value: string, details?: PlaceLocation | null) => void
  helper?: string
  error?: string
  disabled?: boolean
  required?: boolean
  autoFocus?: boolean
  className?: string
  icon?: LucideIcon | React.ComponentType<{ className?: string; size?: number }> | React.ReactNode
}

export default function PlaceCombobox({
  id: externalId,
  value,
  placeholder = 'Event city or venue area',
  biasLat,
  biasLng,
  onChange,
  helper,
  error,
  disabled = false,
  autoFocus = false,
  className = '',
  icon,
}: PlaceComboboxProps) {
  const generatedId = useId()
  const inputId = externalId || generatedId

  const [inputValue, setInputValue] = useState(value || '')
  const [isOpen, setIsOpen] = useState(false)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)
  const [apiFailed, setApiFailed] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Keep input in sync with external value
  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  // Fetch predictions with 250ms debounce
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)

    const trimmed = inputValue.trim()
    if (trimmed.length < 2 || !isOpen) {
      setPredictions([])
      setLoading(false)
      return
    }

    setLoading(true)
    setApiFailed(false)

    debounceTimerRef.current = setTimeout(async () => {
      try {
        let url = `/api/places/autocomplete?q=${encodeURIComponent(trimmed)}`
        if (biasLat !== undefined && biasLng !== undefined) {
          url += `&lat=${encodeURIComponent(biasLat)}&lng=${encodeURIComponent(biasLng)}`
        }

        const res = await fetch(url)
        if (!res.ok) throw new Error('API request failed')
        const data = await res.json() as { predictions?: Prediction[] }
        setPredictions(data.predictions || [])
        setHighlightedIndex(-1)
      } catch (err) {
        console.warn('Autocomplete fetch failed:', err)
        setApiFailed(true)
        setPredictions([])
      } finally {
        setLoading(false)
      }
    }, 250) // 250ms debounce requirement

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [inputValue, isOpen, biasLat, biasLng])

  // Click outside to close
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

  // Select a verified place from the predictions
  async function selectPlace(prediction: Prediction) {
    const displayName = prediction.description || `${prediction.mainText}, ${prediction.secondaryText}`
    setInputValue(displayName)
    setIsOpen(false)
    setLoading(true)

    try {
      const res = await fetch(`/api/places/details?placeId=${encodeURIComponent(prediction.placeId)}`)
      if (res.ok) {
        const data = await res.json() as { place?: PlaceLocation }
        if (data.place) {
          onChange(displayName, {
            name: displayName,
            placeId: prediction.placeId,
            address: data.place.address || displayName,
            lat: data.place.lat,
            lng: data.place.lng,
            unverified: false,
          })
          return
        }
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }

    // Fallback if details endpoint timed out
    onChange(displayName, {
      name: displayName,
      placeId: prediction.placeId,
      unverified: false,
    })
  }

  // Select unverified custom text
  function selectCustomAsTyped() {
    const text = inputValue.trim()
    if (!text) return
    setIsOpen(false)
    onChange(text, {
      name: text,
      unverified: true,
    })
  }

  // Total selectable items: predictions count + 1 (for "Use as typed")
  const totalItems = predictions.length + (inputValue.trim().length >= 2 ? 1 : 0)

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        setHighlightedIndex(0)
      } else {
        setHighlightedIndex(prev => (prev + 1 < totalItems ? prev + 1 : 0))
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        setHighlightedIndex(totalItems - 1)
      } else {
        setHighlightedIndex(prev => (prev - 1 >= 0 ? prev - 1 : totalItems - 1))
      }
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0) {
        e.preventDefault()
        if (highlightedIndex < predictions.length) {
          selectPlace(predictions[highlightedIndex])
        } else {
          selectCustomAsTyped()
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
      setHighlightedIndex(-1)
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input container using IconInput */}
      <IconInput
        ref={inputRef}
        id={inputId}
        type="text"
        icon={icon || MapPin}
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
          // Notify parent of text edit
          onChange(e.target.value, null)
        }}
        onFocus={() => {
          if (inputValue.trim().length >= 2) setIsOpen(true)
        }}
        onKeyDown={handleKeyDown}
        rightElement={
          loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-brand" aria-hidden="true" />
          ) : null
        }
      />

      {/* Helper text or error */}
      {error ? (
        <p role="alert" className="text-[14px] text-error font-medium mt-1">
          {error}
        </p>
      ) : helper ? (
        <p className="text-[14px] text-muted mt-1">{helper}</p>
      ) : null}

      {/* Autocomplete Dropdown: positioned below wrapper with left-0 right-0, z-20 */}
      {isOpen && inputValue.trim().length >= 2 && (
        <div
          id={`${inputId}-listbox`}
          role="listbox"
          className="absolute z-20 left-0 right-0 mt-1.5 bg-surface border border-border rounded-xl shadow-lg max-h-80 overflow-y-auto overflow-x-hidden p-1.5 focus:outline-none"
        >
          {/* Predictions list */}
          {predictions.map((p, idx) => {
            const isHighlighted = highlightedIndex === idx
            return (
              <div
                key={p.placeId || idx}
                id={`${inputId}-item-${idx}`}
                role="option"
                aria-selected={isHighlighted}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => selectPlace(p)}
                className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  isHighlighted ? 'bg-band-soft text-brand' : 'text-ink hover:bg-page'
                }`}
              >
                <MapPin className="w-4 h-4 text-brand mt-0.5 shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-semibold truncate leading-snug">
                    {p.mainText}
                  </div>
                  {p.secondaryText && (
                    <div className="text-[13px] text-muted truncate">
                      {p.secondaryText}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* API notice if connection failed */}
          {apiFailed && (
            <div className="px-3 py-2 text-xs text-muted flex items-center gap-1.5 border-b border-border mb-1">
              <AlertCircle className="w-3.5 h-3.5 text-error shrink-0" />
              <span>Location service unavailable. You can enter your location manually.</span>
            </div>
          )}

          {/* If no predictions found */}
          {!loading && predictions.length === 0 && !apiFailed && (
            <div className="px-3 py-2 text-xs text-muted">
              No verified locations found.
            </div>
          )}

          {/* Always provide "Use '<text>' as typed (Unverified)" */}
          {inputValue.trim().length >= 2 && (
            <div
              id={`${inputId}-item-${predictions.length}`}
              role="option"
              aria-selected={highlightedIndex === predictions.length}
              onMouseEnter={() => setHighlightedIndex(predictions.length)}
              onClick={selectCustomAsTyped}
              className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg cursor-pointer border-t border-border mt-1 transition-colors ${
                highlightedIndex === predictions.length
                  ? 'bg-band-soft text-brand font-semibold'
                  : 'text-ink hover:bg-page'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-4 h-4 text-muted shrink-0" aria-hidden="true" />
                <span className="text-[14px] truncate">
                  Use &ldquo;<strong className="text-ink">{inputValue.trim()}</strong>&rdquo; as typed
                </span>
              </div>
              <span className="text-[11px] font-medium text-muted bg-page px-2 py-0.5 rounded shrink-0">
                Unverified
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
