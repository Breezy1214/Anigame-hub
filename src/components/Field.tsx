import type { InputHTMLAttributes } from 'react'

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { id: string; label: string }

export default function Field({ id, label, ...inputProps }: FieldProps) {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} {...inputProps} />
    </>
  )
}
