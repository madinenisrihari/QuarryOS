import { motion } from 'framer-motion'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { can } from '@/auth/permissions'
import { Logo } from '@/components/common/Logo'
import { cn } from '@/lib/cn'
import { NAV } from './nav'

export function Sidebar({ collapsed, onToggle, canToggle }: { collapsed: boolean; onToggle: () => void; canToggle: boolean }) {
  const { user } = useAuth()
  return (
    <motion.aside initial={false} animate={{ width: collapsed ? 68 : 252 }} transition={{ type: 'spring', stiffness: 380, damping: 38 }}
      className="hidden shrink-0 flex-col border-r border-line bg-surface/60 md:flex" aria-label="Primary">
      <div className={cn('flex h-14 items-center border-b border-line', collapsed ? 'justify-center' : 'px-5')}><Logo to="/app" collapsed={collapsed} /></div>
      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-3">
        {NAV.map((group, gi) => {
          const items = group.items.filter((i) => can(user?.role, i.module))
          if (!items.length) return null
          return (
            <div key={gi} className={cn(gi > 0 && 'mt-4')}>
              {group.label && !collapsed && <div className="mb-1 px-2.5 text-2xs font-medium text-subtle">{group.label}</div>}
              {group.label && collapsed && gi > 0 && <div className="mx-2 mb-2 border-t border-line" />}
              <ul className="space-y-0.5">
                {items.map((item) => (
                  <li key={item.to}>
                    <NavLink to={item.to} end={item.end} title={collapsed ? item.label : undefined} aria-label={collapsed ? item.label : undefined}
                      className={({ isActive }) => cn('group relative flex h-9 items-center gap-3 rounded-lg px-2.5 text-[13.5px] transition-colors', collapsed && 'justify-center', isActive ? 'bg-surface-2 text-fg' : 'text-muted hover:bg-surface-2/60 hover:text-fg')}>
                      {({ isActive }) => (
                        <>
                          {isActive && <motion.span layoutId="nav-active" className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-sand" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                          <item.icon className={cn('h-[17px] w-[17px] shrink-0', item.module === 'intelligence' ? 'text-ai' : isActive ? 'text-sand' : '')} aria-hidden />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </nav>
      {canToggle && (
        <div className="border-t border-line p-3">
          <button onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-pressed={collapsed}
            className={cn('flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-[13px] text-muted hover:bg-surface-2/60 hover:text-fg', collapsed && 'justify-center')}>
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" />Collapse</>}
          </button>
        </div>
      )}
    </motion.aside>
  )
}
