'use client'

import React, { createContext, useContext, useCallback, useReducer, useEffect } from 'react'
import { FormData, defaultFormData } from './types'

const STORAGE_KEY = 'gopratle_form_v2'

type Action =
  | { type: 'UPDATE'; payload: Partial<FormData> }
  | { type: 'RESET' }
  | { type: 'LOAD'; payload: FormData }

function reducer(state: FormData, action: Action): FormData {
  switch (action.type) {
    case 'UPDATE': return { ...state, ...action.payload }
    case 'RESET':  return { ...defaultFormData }
    case 'LOAD':   return action.payload
    default:       return state
  }
}

interface FormContextValue {
  form: FormData
  update: (fields: Partial<FormData>) => void
  reset: () => void
}

const FormContext = createContext<FormContextValue | null>(null)

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [form, dispatch] = useReducer(reducer, defaultFormData)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as FormData
        dispatch({ type: 'LOAD', payload: { ...defaultFormData, ...parsed } })
      }
    } catch { /* ignore */ }
  }, [])

  // Persist on every change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)) } catch { /* ignore */ }
  }, [form])

  const update = useCallback((fields: Partial<FormData>) => {
    dispatch({ type: 'UPDATE', payload: fields })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* noop */ }
  }, [])

  return (
    <FormContext.Provider value={{ form, update, reset }}>
      {children}
    </FormContext.Provider>
  )
}

export function useForm(): FormContextValue {
  const ctx = useContext(FormContext)
  if (!ctx) throw new Error('useForm must be used inside FormProvider')
  return ctx
}
