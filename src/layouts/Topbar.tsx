import { Bell, ChevronDown, LogOut, Search, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { ROLE_LABEL } from '@/auth/permissions'
import { Logo } from '@/components/common/Logo'
import { useQuarryScope } from '@/components/common/QuarryScope'
import { useIntelligence } from '@/components/intelligence/IntelligenceProvider'
import { Badge } from '@/components/ui/Badge'
import { QUARRIES } from '@/data/quarries'
import { maintenanceAlerts } from '@/data/operations'
import { computeInsights } from '@/services/intelligence'
import { initials } from '@/lib/format'
import type { Role } from '@/types/models'
import { cn } from '@/lib/cn'

function useOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onOutside() }
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onOutside() }
    document.addEventListener('mousedown', h); document.addEventListener('keydown', k)
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k) }
  }, [onOutside])
  return ref
}

function Popover({ button, children, align = 'right' }: { button: (p: { open: boolean; toggle: () => void }) => ReactNode; children: ReactNode; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false)
  const ref = useOutside(() => setOpen(false))
  return (
    <div ref={ref} className="relative">
      {button({ open, toggle: () => setOpen((o) => !o) })}
      {open && <div className={cn('panel-raised absolute top-full z-50 mt-2 w-72 p-1.5', align === 'right' ? 'right-0' : 'left-0')}>{children}</div>}
    </div>
  )
}

export function Topbar() {
  const { user, signOut, signInDemo } = useAuth()
  const { quarryId, setQuarryId } = useQuarryScope()
  const { setOpen } = useIntelligence()
  const navigate = useNavigate()
  const scopeName = quarryId === 'all' ? 'All quarries' : QUARRIES.find((q) => q.id === quarryId)?.name
  const alerts = maintenanceAlerts().filter((a) => a.severity !== 'soon')
  const insights = computeInsights()
  const count = alerts.length + insights.filter((i) => i.tone === 'attention').length

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-bg/80 px-4 backdrop-blur-xl sm:px-6">
      <Logo to="/app" collapsed className="md:hidden" />
      <Popover align="left" button={({ open, toggle }) => (
        <button onClick={toggle} aria-expanded={open} aria-haspopup="menu" className="flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm hover:bg-surface-2">
          <span className="max-w-[9rem] truncate font-medium">{scopeName}</span><ChevronDown className="h-3.5 w-3.5 text-muted" aria-hidden />
        </button>
      )}>
        <div role="menu" aria-label="Choose quarry">
          {[{ id: 'all', name: 'All quarries', sub: `${QUARRIES.length} sites` }, ...QUARRIES.map((q) => ({ id: q.id, name: q.name, sub: `${q.district}, ${q.state}` }))].map((q) => (
            <button role="menuitemradio" aria-checked={quarryId === q.id} key={q.id} onClick={() => setQuarryId(q.id)} className={cn('flex w-full flex-col rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-3', quarryId === q.id && 'bg-surface-3')}>
              <span>{q.name}</span><span className="text-xs text-muted">{q.sub}</span>
            </button>
          ))}
        </div>
      </Popover>
      {user?.demo && <Badge tone="sand" className="hidden sm:inline-flex">Demo data</Badge>}

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button onClick={() => setOpen(true)} className="hidden h-9 items-center gap-2 rounded-lg border border-line-strong bg-surface-2/50 pl-3 pr-2 text-sm text-muted hover:border-ai/40 hover:text-fg sm:flex">
          <Search className="h-3.5 w-3.5" aria-hidden /><span className="w-40 text-left lg:w-56">Ask Quarry Intelligence</span>
          <kbd className="rounded border border-line-strong px-1.5 py-0.5 font-mono text-[10px] text-subtle">⌘K</kbd>
        </button>
        <button onClick={() => setOpen(true)} aria-label="Ask Quarry Intelligence" className="grid h-9 w-9 place-items-center rounded-lg text-ai hover:bg-ai/10 sm:hidden"><Sparkles className="h-[18px] w-[18px]" /></button>

        <Popover button={({ open, toggle }) => (
          <button onClick={toggle} aria-expanded={open} aria-label={`Notifications, ${count} need attention`} className="relative grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg">
            <Bell className="h-[18px] w-[18px]" />{count > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-sand ring-2 ring-bg" aria-hidden />}
          </button>
        )}>
          <div className="px-3 pb-1 pt-2 text-xs font-medium text-muted">Needs attention</div>
          {insights.filter((i) => i.tone === 'attention').map((i) => <Link key={i.id} to={i.href ?? '/app'} className="block rounded-lg px-3 py-2 text-[13px] hover:bg-surface-3">{i.text}</Link>)}
          {alerts.slice(0, 3).map((a) => <Link key={a.machine.id + a.severity} to="/app/maintenance" className="block rounded-lg px-3 py-2 text-[13px] hover:bg-surface-3"><span className="font-medium">{a.machine.tag}</span> · {a.message}</Link>)}
        </Popover>

        <Popover button={({ open, toggle }) => (
          <button onClick={toggle} aria-expanded={open} aria-haspopup="menu" aria-label="Account menu" className="flex h-9 items-center gap-2 rounded-lg pl-1 pr-1.5 hover:bg-surface-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-sand/15 text-[11px] font-semibold text-sand">{initials(user?.name ?? 'U')}</span>
          </button>
        )}>
          <div className="border-b border-line px-3 py-2.5"><div className="text-sm font-medium">{user?.name}</div><div className="text-xs text-muted">{user?.email}</div><Badge className="mt-2" tone="neutral">{user ? ROLE_LABEL[user.role] : ''}</Badge></div>
          {user?.demo && (
            <div className="border-b border-line py-1.5">
              <div className="px-3 pb-1 pt-1 text-2xs text-muted">View as another role (demo)</div>
              {(['owner', 'manager', 'sales', 'worker'] as Role[]).map((r) => <button key={r} onClick={() => { signInDemo(r); navigate('/app') }} className={cn('block w-full rounded-lg px-3 py-1.5 text-left text-[13px] hover:bg-surface-3', user.role === r && 'text-sand')}>{ROLE_LABEL[r]}</button>)}
            </div>
          )}
          <button onClick={async () => { await signOut(); navigate('/') }} className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] hover:bg-surface-3"><LogOut className="h-4 w-4" aria-hidden />Sign out</button>
        </Popover>
      </div>
    </header>
  )
}
