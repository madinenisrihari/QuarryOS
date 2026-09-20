import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type Tone = 'neutral' | 'ok' | 'warn' | 'bad' | 'info' | 'sand' | 'ai'
const TONES: Record<Tone, string> = {
  neutral: 'bg-surface-3 text-muted border-line',
  ok: 'bg-ok/10 text-ok border-ok/20',
  warn: 'bg-warn/10 text-warn border-warn/20',
  bad: 'bg-bad/10 text-bad border-bad/20',
  info: 'bg-info/10 text-info border-info/20',
  sand: 'bg-sand/10 text-sand border-sand/20',
  ai: 'bg-ai/10 text-ai border-ai/20',
}
export const DOT: Record<Tone, string> = { neutral: 'bg-subtle', ok: 'bg-ok', warn: 'bg-warn', bad: 'bg-bad', info: 'bg-info', sand: 'bg-sand', ai: 'bg-ai' }

export function Badge({ tone = 'neutral', dot, className, children }: { tone?: Tone; dot?: boolean; className?: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-2xs font-medium', TONES[tone], className)}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', DOT[tone])} aria-hidden />}
      {children}
    </span>
  )
}
