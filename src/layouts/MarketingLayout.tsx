import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Logo } from '@/components/common/Logo'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/auth/AuthProvider'
import { cn } from '@/lib/cn'

const LINKS = [
  { to: '/features', label: 'Features' }, { to: '/solutions', label: 'Solutions' }, { to: '/marketplace', label: 'Marketplace' },
  { to: '/pricing', label: 'Pricing' }, { to: '/about', label: 'About' }, { to: '/contact', label: 'Contact' },
]

function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const { pathname } = useLocation()
  useEffect(() => { const on = () => setScrolled(window.scrollY > 12); on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on) }, [])
  useEffect(() => setOpen(false), [pathname])
  return (
    <header className={cn('fixed inset-x-0 top-0 z-50 transition-colors duration-300', scrolled || open ? 'border-b border-line bg-bg/80 backdrop-blur-xl' : 'border-b border-transparent')}>
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => <NavLink key={l.to} to={l.to} className={({ isActive }) => cn('rounded-lg px-3 py-2 text-sm transition-colors', isActive ? 'text-fg' : 'text-muted hover:text-fg')}>{l.label}</NavLink>)}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {user ? <Button to="/app" variant="primary" size="sm">Open workspace</Button> : <>
            <Button to="/login" variant="ghost" size="sm">Log in</Button>
            <Button to="/signup" variant="primary" size="sm">Start free</Button></>}
        </div>
        <button className="grid h-10 w-10 place-items-center rounded-lg text-fg lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden lg:hidden">
            <nav aria-label="Mobile" className="container-page flex flex-col pb-5 pt-2">
              {LINKS.map((l) => <Link key={l.to} to={l.to} className="border-b border-line py-3.5 text-lg">{l.label}</Link>)}
              <div className="mt-5 flex gap-2"><Button to="/login" className="flex-1" size="lg">Log in</Button><Button to="/signup" variant="primary" className="flex-1" size="lg">Start free</Button></div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function Footer() {
  const cols = [
    { h: 'Platform', l: [['Features', '/features'], ['Solutions', '/solutions'], ['Pricing', '/pricing'], ['Marketplace', '/marketplace']] },
    { h: 'Company', l: [['About', '/about'], ['Contact', '/contact'], ['Log in', '/login'], ['Sign up', '/signup']] },
    { h: 'Explore', l: [['Sample storefront', '/quarry/meridian-granites'], ['Sample block page', '/b/GR-1042'], ['Buyer portal', '/buyer']] },
  ]
  return (
    <footer className="border-t border-line bg-surface/40">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">The digital operating system for quarries and the natural-stone industry.</p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <div className="mb-3 text-sm font-medium">{c.h}</div>
            <ul className="space-y-2 text-sm text-muted">{c.l.map(([t, to]) => <li key={t}><Link to={to!} className="hover:text-fg">{t}</Link></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-subtle sm:flex-row sm:justify-between">
          <span>© 2026 QuarryOS. Product preview.</span>
          <span>All quarries, customers, prices and figures shown are demonstration data.</span>
        </div>
      </div>
    </footer>
  )
}

export default function MarketingLayout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0 }) }, [pathname])
  return (
    <div className="min-h-dvh bg-bg">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[200] focus:rounded-lg focus:bg-fg focus:px-3 focus:py-2 focus:text-bg">Skip to content</a>
      <Header />
      <main id="content"><Outlet /></main>
      <Footer />
    </div>
  )
}
