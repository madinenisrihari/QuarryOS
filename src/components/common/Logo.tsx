import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

/** Isometric block mark: one strata line runs through it. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-6 w-6', className)} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden>
      <path d="M16 4.5 26 10.25v11.5L16 27.5 6 21.75v-11.5z" />
      <path d="M6 10.25 16 16l10-5.75M16 16v11.5" />
      <path d="M11 13.4l10 5.8" strokeOpacity=".45" />
    </svg>
  )
}

export function Logo({ to = '/', collapsed, className }: { to?: string; collapsed?: boolean; className?: string }) {
  return (
    <Link to={to} aria-label="QuarryOS home" className={cn('inline-flex items-center gap-2.5 text-fg', className)}>
      <LogoMark className="h-6 w-6 shrink-0 text-sand" />
      {!collapsed && <span className="text-[15px] font-semibold tracking-[0.14em]">QUARRYOS</span>}
    </Link>
  )
}
