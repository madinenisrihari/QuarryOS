import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type ToastTone = 'success' | 'error' | 'info'
interface ToastItem { id: number; title: string; description?: string; tone: ToastTone }
interface ToastApi { toast: (t: { title: string; description?: string; tone?: ToastTone }) => void }

const ToastContext = createContext<ToastApi | null>(null)
let counter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const dismiss = useCallback((id: number) => setItems((s) => s.filter((t) => t.id !== id)), [])
  const toast = useCallback<ToastApi['toast']>(({ title, description, tone = 'success' }) => {
    const id = ++counter
    setItems((s) => [...s.slice(-3), { id, title, description, tone }])
    window.setTimeout(() => dismiss(id), 4800)
  }, [dismiss])
  const api = useMemo(() => ({ toast }), [toast])

  const Icon = { success: CheckCircle2, error: AlertCircle, info: Info }
  const color = { success: 'text-ok', error: 'text-bad', info: 'text-info' }
  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[120] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:px-6" role="region" aria-label="Notifications" aria-live="polite">
        <AnimatePresence initial={false}>
          {items.map((t) => {
            const I = Icon[t.tone]
            return (
              <motion.div key={t.id} layout initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}
                className="panel-raised pointer-events-auto flex w-full max-w-sm items-start gap-3 p-3.5">
                <I className={cn('mt-0.5 h-4 w-4 shrink-0', color[t.tone])} aria-hidden />
                <div className="min-w-0 flex-1"><p className="text-sm font-medium">{t.title}</p>{t.description && <p className="mt-0.5 text-[13px] text-muted">{t.description}</p>}</div>
                <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="text-subtle hover:text-fg"><X className="h-4 w-4" /></button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx.toast
}
