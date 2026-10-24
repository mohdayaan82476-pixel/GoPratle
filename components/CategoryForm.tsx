'use client'
import Field from '@/components/Field'
import { FieldConfig } from '@/lib/category-config'
import { FormData } from '@/lib/types'

interface CategoryFormProps {
  fields: FieldConfig[]
  values: Partial<FormData>
  errors: Partial<Record<string, string>>
  onChange: (name: string, value: string | string[]) => void
}

export default function CategoryForm({ fields, values, errors, onChange }: CategoryFormProps) {
  return (
    <div className="flex flex-col gap-5">
      {fields.map(field => {
        const rawValue = values[field.name as keyof FormData]
        const strValue = typeof rawValue === 'string' ? rawValue : ''
        const arrValue = Array.isArray(rawValue) ? rawValue : []
        const err = errors[field.name]
        const id = `field-${field.name}`

        // ── checkbox group ──────────────────────────────────────────────────
        if (field.type === 'checkbox-group') {
          return (
            <fieldset key={field.name} className="flex flex-col gap-1.5">
              <legend className="text-[15px] font-medium text-ink">
                {field.label}
                {field.required && <span className="text-error ml-0.5" aria-hidden="true">*</span>}
              </legend>
              {field.helper && <p className="text-[14px] text-muted">{field.helper}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
                {field.options?.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2.5 text-base text-ink cursor-pointer hover:text-ink/80">
                    <input
                      type="checkbox"
                      className="form-check focus:ring-2 focus:ring-band"
                      checked={arrValue.includes(opt.value)}
                      onChange={e => {
                        const next = e.target.checked
                            ? [...arrValue, opt.value]
                            : arrValue.filter(v => v !== opt.value)
                        onChange(field.name, next)
                      }}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
              {err && <p role="alert" className="text-[14px] text-error font-medium">{err}</p>}
            </fieldset>
          )
        }

        // ── radio group ─────────────────────────────────────────────────────
        if (field.type === 'radio-group') {
          return (
            <fieldset key={field.name} className="flex flex-col gap-1.5">
              <legend className="text-[15px] font-medium text-ink">
                {field.label}
                {field.required && <span className="text-error ml-0.5" aria-hidden="true">*</span>}
              </legend>
              <div className="flex flex-col gap-2 mt-1">
                {field.options?.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2.5 text-base text-ink cursor-pointer hover:text-ink/80">
                    <input
                      type="radio"
                      name={field.name}
                      className="form-radio focus:ring-2 focus:ring-band"
                      value={opt.value}
                      checked={strValue === opt.value}
                      onChange={e => onChange(field.name, e.target.value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
              {err && <p role="alert" className="text-[14px] text-error font-medium">{err}</p>}
            </fieldset>
          )
        }

        // ── textarea ────────────────────────────────────────────────────────
        if (field.type === 'textarea') {
          return (
            <Field key={field.name} label={field.label} htmlFor={id} helper={field.helper} error={err} required={field.required}>
              <textarea
                id={id}
                rows={3}
                value={strValue}
                onChange={e => onChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className={`form-input h-auto py-2.5 resize-y ${err ? 'border-error' : ''}`}
                style={{ minHeight: '5.5rem' }}
              />
            </Field>
          )
        }

        // ── select ──────────────────────────────────────────────────────────
        if (field.type === 'select') {
          return (
            <Field key={field.name} label={field.label} htmlFor={id} helper={field.helper} error={err} required={field.required}>
              <select
                id={id}
                value={strValue}
                className={`form-input ${err ? 'border-error' : ''}`}
                onChange={e => onChange(field.name, e.target.value)}
              >
                <option value="">{field.required ? 'Select…' : '— Optional —'}</option>
                {field.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Field>
          )
        }

        // ── text / number ───────────────────────────────────────────────────
        return (
          <Field key={field.name} label={field.label} htmlFor={id} helper={field.helper} error={err} required={field.required}>
            <input
              id={id}
              type={field.type === 'number' ? 'number' : 'text'}
              value={strValue}
              className={`form-input ${err ? 'border-error' : ''}`}
              onChange={e => onChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
            />
          </Field>
        )
      })}
    </div>
  )
}
