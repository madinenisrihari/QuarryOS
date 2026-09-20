import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  /** centre dialog, right-hand drawer, or bottom sheet */
  variant?: 'dialog' | 'drawer' | 'sheet'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const SIZE = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'

/** Accessible modal: focus trap, Escape to close, scroll lock, focus restore. */
export function Modal({ open, onClose, title, description, children, footer, variant = 'dialog', size = 'md' }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = window.setTimeout(() => (ref.current?.querySelector<HTMLElement>('[data-autofocus]') ?? ref.current?.querySelector<HTMLElement>(FOCUSABLE))?.focus(), 30)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); closeRef.current(); return }
      if (e.key !== 'Tab' || !ref.current) return
      const items = [...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (!items.length) return
      const first = items[0]!, last = items[items.length - 1]!
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { window.clearTimeout(t); document.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; previous?.focus?.() }
  }, [open])

  const panelMotion =
    variant === 'drawer' ? { initial: { x: 40, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 40, opacity: 0 } }
    : variant === 'sheet' ? { initial: { y: 60, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 60, opacity: 0 } }
    : { initial: { y: 12, opacity: 0, scale: 0.98 }, animate: { y: 0, opacity: 1, scale: 1 }, exit: { y: 8, opacity: 0, scale: 0.98 } }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={cn('fixed inset-0 z-[100] flex', variant === 'drawer' ? 'justify-end' : variant === 'sheet' ? 'items-end justify-center' : 'items-center justify-center p-4')}>
          <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onClick={onClose} aria-hidden />
          <motion.div
            ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descId : undefined}
            {...panelMotion} transition={{ type: 'spring', stiffness: 420, damping: 38 }}
            className={cn('panel-raised relative flex max-h-[90dvh] w-full flex-col overflow-hidden',
              variant === 'drawer' && 'h-full max-h-none max-w-xl rounded-none rounded-l-2xl',
              variant === 'sheet' && 'max-w-xl rounded-b-none rounded-t-2xl',
              variant === 'dialog' && SIZE[size])}>
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div className="min-w-0">
                <h2 id={titleId} className="text-base font-medium tracking-tight">{title}</h2>
                {description && <p id={descId} className="mt-0.5 text-[13px] text-muted">{description}</p>}
              </div>
              <button onClick={onClose} aria-label="Close" className="-mr-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-surface-3 hover:text-fg"><X className="h-4 w-4" /></button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer && <div className="flex items-center justify-end gap-2 border-t border-line bg-surface/60 px-5 py-3.5">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
