import { motion } from 'framer-motion'
import { useId } from 'react'
import { cn } from '@/lib/cn'

export interface TabItem<T extends string> { value: T; label: string; count?: number }

export function Tabs<T extends string>({ tabs, value, onChange, className }: { tabs: TabItem<T>[]; value: T; onChange: (v: T) => void; className?: string }) {
  const group = useId()
  return (
    <div role="tablist" className={cn('no-scrollbar -mb-px flex gap-1 overflow-x-auto border-b border-line', className)}>
      {tabs.map((t) => {
        const active = t.value === value
        return (
          <button key={t.value} role="tab" aria-selected={active} onClick={() => onChange(t.value)}
            className={cn('relative shrink-0 px-3 py-2.5 text-sm transition-colors', active ? 'text-fg' : 'text-muted hover:text-fg')}>
            {t.label}
            {t.count !== undefined && <span className="ml-1.5 text-xs text-subtle tabular">{t.count}</span>}
            {active && <motion.span layoutId={`tab-${group}`} className="absolute inset-x-2 -bottom-px h-px bg-sand" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
          </button>
        )
      })}
    </div>
  )
}

/** Compact segmented control for view toggles and filters. */
export function Segmented<T extends string>({ options, value, onChange, label }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border border-line-strong bg-surface-2/60 p-0.5">
      {options.map((o) => (
        <button key={o.value} role="radio" aria-checked={o.value === value} onClick={() => onChange(o.value)}
          className={cn('rounded-md px-3 py-1.5 text-[13px] transition-colors', o.value === value ? 'bg-surface-3 text-fg shadow-ring' : 'text-muted hover:text-fg')}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
