import { cn } from '@/lib/cn'

export function Progress({ value, tone = 'sand', className, label }: { value: number; tone?: 'sand' | 'ok' | 'warn' | 'bad' | 'ai'; className?: string; label?: string }) {
  const v = Math.max(0, Math.min(100, value))
  const color = { sand: 'bg-sand', ok: 'bg-ok', warn: 'bg-warn', bad: 'bg-bad', ai: 'bg-ai' }[tone]
  return (
    <div role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100} aria-label={label} className={cn('h-1.5 w-full overflow-hidden rounded-full bg-surface-3', className)}>
      <div className={cn('h-full rounded-full transition-[width] duration-700', color)} style={{ width: `${v}%` }} />
    </div>
  )
}
