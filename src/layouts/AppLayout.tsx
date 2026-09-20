import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { IntelligenceProvider, useIntelligence } from '@/components/intelligence/IntelligenceProvider'
import { IntelligenceChat } from '@/components/intelligence/IntelligenceChat'
import { QuarryScopeProvider } from '@/components/common/QuarryScope'
import { Modal } from '@/components/ui/Modal'
import { useIsDesktop } from '@/hooks/useReducedMotion'
import { MobileNav } from './MobileNav'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

function IntelligenceDrawer() {
  const { open, setOpen, seed } = useIntelligence()
  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Quarry Intelligence" description="Ask about sales, stock, payments and production." variant="drawer">
      <IntelligenceChat initialQuestion={seed} className="h-full" key={seed ?? 'default'} />
    </Modal>
  )
}

function Shell() {
  const { pathname } = useLocation()
  const desktop = useIsDesktop()
  const [pref, setPref] = useState(() => { try { return localStorage.getItem('quarryos.sidebar') === '1' } catch { return false } })
  const collapsed = pref || !desktop
  useEffect(() => { try { localStorage.setItem('quarryos.sidebar', pref ? '1' : '0') } catch { /* ignore */ } }, [pref])
  useEffect(() => { document.getElementById('main')?.scrollTo({ top: 0 }) }, [pathname])

  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[200] focus:rounded-lg focus:bg-fg focus:px-3 focus:py-2 focus:text-bg">Skip to content</a>
      <Sidebar collapsed={collapsed} onToggle={() => setPref((p) => !p)} canToggle={desktop} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main id="main" tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto pb-24 outline-none md:pb-10">
          <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="mx-auto w-full max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </motion.div>
        </main>
      </div>
      <MobileNav />
      <IntelligenceDrawer />
    </div>
  )
}

export default function AppLayout() {
  return <QuarryScopeProvider><IntelligenceProvider><Shell /></IntelligenceProvider></QuarryScopeProvider>
}
