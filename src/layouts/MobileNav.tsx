import { LayoutDashboard, Box, TrendingUp, Route, Menu } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { can } from '@/auth/permissions'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import { NAV } from './nav'

const PRIMARY = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, module: 'overview' as const, end: true },
  { to: '/app/blocks', label: 'Blocks', icon: Box, module: 'blocks' as const },
  { to: '/app/sales', label: 'Sales', icon: TrendingUp, module: 'sales' as const },
  { to: '/app/transport', label: 'Transport', icon: Route, module: 'transport' as const },
]

/** Bottom navigation for phones, with the full module list in a sheet. Targets are ≥44px. */
export function MobileNav() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const items = PRIMARY.filter((i) => can(user?.role, i.module))
  return (
    <>
      <nav aria-label="Primary" className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 backdrop-blur-xl md:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {items.map((i) => (
            <li key={i.to}>
              <NavLink to={i.to} end={i.end} className={({ isActive }) => cn('flex min-h-[54px] flex-col items-center justify-center gap-1 text-[11px]', isActive ? 'text-sand' : 'text-muted')}>
                <i.icon className="h-5 w-5" aria-hidden />{i.label}
              </NavLink>
            </li>
          ))}
          <li>
            <button onClick={() => setOpen(true)} className="flex min-h-[54px] w-full flex-col items-center justify-center gap-1 text-[11px] text-muted"><Menu className="h-5 w-5" aria-hidden />More</button>
          </li>
        </ul>
      </nav>
      <Modal open={open} onClose={() => setOpen(false)} title="All modules" variant="sheet">
        <div className="space-y-5 pb-2">
          {NAV.map((g, gi) => {
            const list = g.items.filter((i) => can(user?.role, i.module))
            if (!list.length) return null
            return (
              <div key={gi}>
                {g.label && <div className="mb-2 text-xs font-medium text-muted">{g.label}</div>}
                <div className="grid grid-cols-3 gap-2">
                  {list.map((i) => (
                    <NavLink key={i.to} to={i.to} end={i.end} onClick={() => setOpen(false)}
                      className={({ isActive }) => cn('flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-xl border p-2 text-center text-xs', isActive ? 'border-sand/40 bg-sand/10 text-sand' : 'border-line bg-surface-2/50 text-fg/90')}>
                      <i.icon className="h-5 w-5" aria-hidden /><span className="leading-tight">{i.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Modal>
    </>
  )
}
