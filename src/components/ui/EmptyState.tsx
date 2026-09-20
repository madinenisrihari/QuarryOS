import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, RotateCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './Button'
import { cn } from '@/lib/cn'

export function EmptyState({ icon: Icon, title, description, action, className }: { icon?: LucideIcon; title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center', className)}>
      {Icon && <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl border border-line-strong bg-surface-2 text-sand"><Icon className="h-5 w-5" aria-hidden /></div>}
      <h3 className="text-base font-medium">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center">
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl border border-bad/30 bg-bad/10 text-bad"><AlertTriangle className="h-5 w-5" aria-hidden /></div>
      <h3 className="text-base font-medium">We couldn't load this data</h3>
      <p className="mt-1.5 text-sm text-muted">{message ?? 'The request failed. Check your connection and try again.'}</p>
      {onRetry && <Button className="mt-5" icon={RotateCw} onClick={onRetry}>Try again</Button>}
    </div>
  )
}
