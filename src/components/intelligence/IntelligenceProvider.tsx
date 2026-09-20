import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

const Ctx = createContext<{ open: boolean; setOpen: (v: boolean) => void; openWith: (q?: string) => void; seed?: string } | null>(null)

/** Lets any screen open the Quarry Intelligence drawer (also bound to ⌘K / Ctrl+K). */
export function IntelligenceProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [seed, setSeed] = useState<string>()
  const openWith = useCallback((q?: string) => { setSeed(q); setOpen(true) }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o) } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  const value = useMemo(() => ({ open, setOpen, openWith, seed }), [open, openWith, seed])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export function useIntelligence() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useIntelligence must be used within IntelligenceProvider')
  return c
}
