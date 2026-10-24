'use client'

interface FieldProps {
  label: string
  name?: string
  htmlFor?: string
  helper?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export default function Field({ label, htmlFor, helper, error, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[15px] font-medium text-ink"
      >
        {label}
        {required && <span className="text-error ml-0.5" aria-hidden="true">*</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-[14px] text-error font-medium">{error}</p>
      ) : helper ? (
        <p className="text-[14px] text-muted">{helper}</p>
      ) : null}
    </div>
  )
}
