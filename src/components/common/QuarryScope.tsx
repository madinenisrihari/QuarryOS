import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

/** Which quarry the workspace is scoped to. 'all' aggregates every quarry. */
const Ctx = createContext<{ quarryId: string; setQuarryId: (id: string) => void } | null>(null)
export function QuarryScopeProvider({ children }: { children: ReactNode }) {
  const [quarryId, setQuarryId] = useState('all')
  const value = useMemo(() => ({ quarryId, setQuarryId }), [quarryId])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export function useQuarryScope() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useQuarryScope must be used within QuarryScopeProvider')
  return c
}
