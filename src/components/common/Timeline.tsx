import { cn } from '@/lib/cn'
import { dateShort } from '@/lib/format'
import type { LucideIcon } from 'lucide-react'

export interface TimelineItem { id: string; at: string; title: string; detail?: string; icon?: LucideIcon; tone?: 'sand' | 'ok' | 'info' | 'neutral' }

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative space-y-5 pl-7 before:absolute before:bottom-1 before:left-[9px] before:top-1 before:w-px before:bg-line-strong">
      {items.map((it, i) => {
        const Icon = it.icon
        return (
          <li key={it.id} className="relative">
            <span className={cn('absolute -left-7 top-0.5 grid h-[19px] w-[19px] place-items-center rounded-full border bg-surface', i === 0 ? 'border-sand text-sand' : 'border-line-strong text-muted')}>
              {Icon ? <Icon className="h-2.5 w-2.5" aria-hidden /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            </span>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <span className="text-sm font-medium">{it.title}</span>
              <time dateTime={it.at} className="text-xs text-muted tabular">{dateShort(it.at)}</time>
            </div>
            {it.detail && <p className="mt-0.5 text-[13px] text-muted">{it.detail}</p>}
          </li>
        )
      })}
    </ol>
  )
}
