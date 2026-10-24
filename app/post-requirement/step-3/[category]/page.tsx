'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from '@/lib/form-context'
import { CATEGORY_CONFIGS } from '@/lib/category-config'
import { FormData, ProRole } from '@/lib/types'
import StepProgress from '@/components/StepProgress'
import CategoryForm from '@/components/CategoryForm'

const CATEGORY_BORDER_CLASS: Record<ProRole, string> = {
  planner: 'border-l-planner',
  performer: 'border-l-performer',
  crew: 'border-l-crew',
}

export default function Step3Page() {
  const router = useRouter()
  const params = useParams()
  const category = params.category as ProRole
  const { form, update } = useForm()

  const config = CATEGORY_CONFIGS[category]

  const [values, setValues] = useState<Partial<FormData>>(() => {
    const seed: Partial<FormData> = {}
    config?.step3Fields.forEach(f => {
      const k = f.name as keyof FormData
      seed[k] = form[k] as never
    })
    return seed
  })

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})

  if (!config) {
    return (
      <div className="w-full">
        <div className="bg-surface border border-border rounded-lg p-6 text-sm text-error">
          Unknown category. <Link href="/post-requirement/step-1" className="underline">Go back to step 1.</Link>
        </div>
      </div>
    )
  }

  function onChange(name: string, value: string | string[]) {
    setValues(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => { const next = { ...prev }; delete next[name]; return next })
  }

  function validate() {
    const e: Partial<Record<string, string>> = {}
    config.step3Fields.forEach(f => {
      if (!f.required) return
      const v = values[f.name as keyof FormData]
      const isEmpty = Array.isArray(v) ? v.length === 0 : !v
      if (isEmpty) e[f.name] = `${f.label} is required.`
    })
    return e
  }

  function handleContinue() {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) return
    update(values as Partial<FormData>)
    router.push('/post-requirement/step-4')
  }

  return (
    <div className="w-full">
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
        <StepProgress current={3} />

        {/* Section header with 4px left border in category colour */}
        <div className={`border-l-4 pl-4 mb-6 ${CATEGORY_BORDER_CLASS[category] || 'border-l-brand'}`}>
          <h2 className="text-[22px] sm:text-[24px] font-display font-semibold text-ink mb-1">{config.step3Label}</h2>
          <p className="text-[14px] text-muted">Budget and preference details.</p>
        </div>

        <CategoryForm
          fields={config.step3Fields}
          values={values}
          errors={errors}
          onChange={onChange}
        />

        {/* Action row */}
        <div className="flex items-center justify-between gap-3 mt-8 pt-5 border-t border-border">
          <Link href={`/post-requirement/step-2/${category}`} className="btn-secondary">
            Back
          </Link>
          <button type="button" onClick={handleContinue} className="btn-primary">
            Continue to review
          </button>
        </div>
      </div>
    </div>
  )
}
