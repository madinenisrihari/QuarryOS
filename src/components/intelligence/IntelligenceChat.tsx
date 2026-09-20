import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { HBars } from '@/components/charts/Charts'
import { C } from '@/components/charts/theme'
import { useAsync } from '@/hooks/useAsync'
import { askIntelligence, getInsights, SUGGESTED_QUESTIONS } from '@/services/intelligence'
import type { IntelligenceAnswer, Insight } from '@/types/models'
import { cn } from '@/lib/cn'
import { Skeleton } from '@/components/ui/Skeleton'

type Msg = { id: number; role: 'user'; text: string } | { id: number; role: 'ai'; answer: IntelligenceAnswer } | { id: number; role: 'pending' }
let mid = 0

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning.' : h < 17 ? 'Good afternoon.' : 'Good evening.' }

export function InsightList({ insights }: { insights: Insight[] }) {
  return (
    <ul className="space-y-2.5">
      {insights.map((i) => (
        <li key={i.id} className="flex gap-3 text-[14px] leading-snug">
          <span className={cn('mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full', i.tone === 'positive' ? 'bg-ok' : i.tone === 'attention' ? 'bg-warn' : 'bg-subtle')} aria-hidden />
          {i.href ? <Link to={i.href} className="hover:text-ai">{i.text}</Link> : <span>{i.text}</span>}
        </li>
      ))}
    </ul>
  )
}

export function AnswerCard({ a, onFollowUp }: { a: IntelligenceAnswer; onFollowUp: (q: string) => void }) {
  return (
    <div className="rounded-xl border border-ai/20 bg-gradient-to-b from-ai/[0.06] to-transparent p-4">
      <div className="flex items-center gap-2 text-xs text-ai"><Sparkles className="h-3.5 w-3.5" aria-hidden />{a.title}</div>
      <p className="mt-2 text-[14.5px] leading-relaxed">{a.summary}</p>
      {a.metrics && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {a.metrics.map((m) => (
            <div key={m.label} className="rounded-lg border border-line bg-surface/60 px-3 py-2">
              <div className="text-2xs text-muted">{m.label}</div>
              <div className={cn('text-lg font-semibold tabular', m.tone === 'positive' && 'text-ok', m.tone === 'attention' && 'text-warn')}>{m.value}</div>
            </div>
          ))}
        </div>
      )}
      {a.bars && <HBars className="mt-4" items={a.bars} color={C.ai} />}
      {a.table && (
        <div className="mt-4 overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-line text-left text-xs text-muted">{a.table.columns.map((c) => <th key={c} className="px-3 py-2 font-medium">{c}</th>)}</tr></thead>
            <tbody>{a.table.rows.map((r, i) => <tr key={i} className="border-b border-line/60 last:border-0">{r.map((cell, j) => <td key={j} className="px-3 py-2 tabular">{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-muted">Basis: {a.basis}</p>
      {a.followUps && a.followUps.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {a.followUps.map((f) => <button key={f} onClick={() => onFollowUp(f)} className="rounded-full border border-line-strong px-3 py-1.5 text-xs text-muted hover:border-ai/40 hover:text-ai">{f}</button>)}
        </div>
      )}
    </div>
  )
}

export function IntelligenceChat({ initialQuestion, className }: { initialQuestion?: string; className?: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const end = useRef<HTMLDivElement>(null)
  const insights = useAsync(getInsights, [])

  const ask = async (q: string) => {
    const question = q.trim()
    if (!question || busy) return
    setText(''); setBusy(true)
    const pid = ++mid
    setMsgs((m) => [...m, { id: ++mid, role: 'user', text: question }, { id: pid, role: 'pending' }])
    const answer = await askIntelligence(question)
    setMsgs((m) => m.map((x) => (x.id === pid ? { id: pid, role: 'ai', answer } : x)))
    setBusy(false)
  }
  useEffect(() => { if (initialQuestion) void ask(initialQuestion) /* eslint-disable-next-line */ }, [initialQuestion])
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [msgs])

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pb-4" aria-live="polite">
        <div className="rounded-xl border border-line bg-surface-2/40 p-5">
          <div className="flex items-center gap-2 text-xs font-medium tracking-[0.12em] text-ai"><Sparkles className="h-4 w-4" aria-hidden />QUARRY INTELLIGENCE</div>
          <p className="mt-4 text-xl font-semibold tracking-tight">{greeting()}</p>
          {insights.loading ? <div className="mt-3 space-y-2"><Skeleton className="h-4 w-4/5" /><Skeleton className="h-4 w-3/5" /><Skeleton className="h-4 w-2/3" /></div>
            : <><p className="mb-3 mt-1 text-sm text-muted">{insights.data?.length ?? 0} important insights found.</p>{insights.data && <InsightList insights={insights.data} />}</>}
        </div>

        {msgs.length === 0 && (
          <div>
            <div className="mb-2 text-xs text-muted">Try asking</div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => <button key={q} onClick={() => ask(q)} className="rounded-full border border-line-strong bg-surface-2/40 px-3.5 py-2 text-[13px] text-fg/90 hover:border-ai/40 hover:text-ai">{q}</button>)}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {msgs.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              {m.role === 'user' && <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-surface-3 px-4 py-2.5 text-sm">{m.text}</div>}
              {m.role === 'pending' && <div className="flex items-center gap-2 px-1 text-sm text-muted" role="status"><Sparkles className="h-4 w-4 animate-pulseDot text-ai" aria-hidden />Analysing your data…</div>}
              {m.role === 'ai' && <AnswerCard a={m.answer} onFollowUp={ask} />}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={end} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); void ask(text) }} className="border-t border-line pt-3">
        <div className="flex items-center gap-2 rounded-xl border border-line-strong bg-surface-2/60 py-1.5 pl-4 pr-1.5 focus-within:border-ai/50 focus-within:ring-2 focus-within:ring-ai/15">
          <label htmlFor="qi-input" className="sr-only">Ask Quarry Intelligence</label>
          <input id="qi-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask Quarry Intelligence…" className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle" autoComplete="off" />
          <button type="submit" disabled={!text.trim() || busy} aria-label="Send question" className="grid h-9 w-9 place-items-center rounded-lg bg-ai/15 text-ai transition-opacity hover:bg-ai/25 disabled:opacity-40"><ArrowUp className="h-4 w-4" /></button>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-subtle">Demo: answers are computed from sample data for a fixed set of questions. No language model is connected.</p>
      </form>
    </div>
  )
}
