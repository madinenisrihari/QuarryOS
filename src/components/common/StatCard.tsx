import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCountUp } from '@/hooks/useCountUp'
import { cn } from '@/lib/cn'

export function AnimatedNumber({ value, format = (n: number) => String(Math.round(n)), decimals = 0, duration }: { value: number; format?: (n: number) => string; decimals?: number; duration?: number }) {
  const v = useCountUp(value, duration, decimals)
  return <span className="tabular">{format(v)}</span>
}

interface Props {
  label: string
  value: number
  format?: (n: number) => string
  decimals?: number
  delta?: { value: number; label?: string; invert?: boolean }
  hint?: string
  icon?: LucideIcon
  to?: string
  className?: string
}

export function StatCard({ label, value, format, decimals, delta, hint, icon: Icon, to, className }: Props) {
  const positive = delta ? (delta.invert ? delta.value <= 0 : delta.value >= 0) : true
  const body = (
    <>
      <div className="flex items-center justify-between text-[13px] text-muted">
        <span>{label}</span>
        {Icon && <Icon className="h-4 w-4 text-subtle" aria-hidden />}
      </div>
      <div className="mt-3 text-[1.75rem] font-semibold leading-none tracking-tight sm:text-3xl">
        <AnimatedNumber value={value} format={format} decimals={decimals} />
      </div>
      <div className="mt-2.5 flex min-h-5 items-center gap-2 text-xs">
        {delta && (
          <span className={cn('inline-flex items-center gap-0.5 font-medium', positive ? 'text-ok' : 'text-bad')}>
            {delta.value >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /> : <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />}
            {Math.abs(delta.value).toFixed(0)}%
          </span>
        )}
        {(delta?.label || hint) && <span className="text-muted">{delta?.label ?? hint}</span>}
      </div>
    </>
  )
  const cls = cn('panel block p-4 sm:p-5 transition-colors', to && 'hover:border-line-strong hover:bg-surface-2/70', className)
  return to ? <Link to={to} className={cls}>{body}</Link> : <div className={cls}>{body}</div>
}
