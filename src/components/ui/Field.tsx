import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const base = 'w-full rounded-lg border border-line-strong bg-surface-2/60 px-3 text-sm text-fg placeholder:text-subtle transition-colors hover:border-fg/25 focus:border-sand/60 focus:outline-none focus:ring-2 focus:ring-sand/20 disabled:opacity-50'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, 'h-10', className)} {...props} />
}
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(base, 'min-h-24 py-2.5', className)} {...props} />
}
export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(base, 'h-10 appearance-none bg-no-repeat pr-8', className)}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b8f98' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundPosition: 'right 0.75rem center' }}
      {...props}>{children}</select>
  )
}

/** Label + control + hint/error wiring for accessible forms. */
export function Field({ label, hint, error, children, className }: { label: string; hint?: string; error?: string; children: (id: string, describedBy?: string) => ReactNode; className?: string }) {
  const id = useId()
  const descId = hint || error ? `${id}-desc` : undefined
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="text-[13px] font-medium text-fg/90">{label}</label>
      {children(id, descId)}
      {(hint || error) && <p id={descId} className={cn('text-xs', error ? 'text-bad' : 'text-muted')}>{error ?? hint}</p>}
    </div>
  )
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={cn('relative h-5 w-9 shrink-0 rounded-full border transition-colors', checked ? 'border-sand/50 bg-sand/30' : 'border-line-strong bg-surface-3')}>
      <span className={cn('absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all', checked ? 'left-[1.15rem] bg-sand' : 'left-0.5 bg-muted')} />
    </button>
  )
}
