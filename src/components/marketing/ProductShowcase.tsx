import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { AreaTrend, HBars, Sparkline } from '@/components/charts/Charts'
import { C, TYPE_COLORS } from '@/components/charts/theme'
import { Reveal } from '@/components/common/Motion'
import { StoneSwatch } from '@/components/common/StoneSwatch'
import { AnswerCard } from '@/components/intelligence/IntelligenceChat'
import { MONTHLY, demandByType } from '@/data/analytics'
import { BLOCKS } from '@/data/blocks'
import { LEADS } from '@/data/commerce'
import { useAsync } from '@/hooks/useAsync'
import { buildDashboardSummary } from '@/services/api'
import { askIntelligence } from '@/services/intelligence'
import { cn } from '@/lib/cn'
import { inrCompact } from '@/lib/format'
import { Logo } from '@/components/common/Logo'

const TABS = ['Dashboard', 'Block inventory', 'Sales', 'Analytics', 'Assistant'] as const
type Tab = (typeof TABS)[number]

function DashboardMock() {
  const d = buildDashboardSummary('all')
  const k = [['Total blocks', String(d.totalBlocks)], ['Monthly sales', `₹${d.monthlySalesLakh.toFixed(1)}L`], ['Active orders', String(d.activeOrders)], ['Pending payments', inrCompact(d.outstanding)]]
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">{k.map(([l, v]) => <div key={l} className="rounded-lg border border-line bg-surface p-3"><div className="text-[10.5px] text-muted">{l}</div><div className="mt-1.5 text-xl font-semibold tabular">{v}</div></div>)}</div>
      <div className="rounded-lg border border-line bg-surface p-3"><div className="mb-1 text-[11px] text-muted">Sales and expenses</div><AreaTrend data={MONTHLY} xKey="month" series={[{ key: 'sales', label: 'Sales', color: C.sand }, { key: 'expenses', label: 'Expenses', color: C.titanium }]} height={150} legend={false} /></div>
    </div>
  )
}
function BlocksMock() {
  const list = BLOCKS.filter((b) => b.status === 'available').slice(0, 6)
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">{['Black Galaxy', 'Absolute Black', 'Available', 'Yard A'].map((f, i) => <span key={f} className={cn('rounded-full border px-2.5 py-1 text-[11px]', i < 2 ? 'border-sand/40 bg-sand/10 text-sand' : 'border-line-strong text-muted')}>{f}</span>)}</div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">{list.map((b) => <div key={b.id} className="overflow-hidden rounded-lg border border-line bg-surface"><div className="relative aspect-[16/9]"><StoneSwatch type={b.type} seed={b.media[0]!.seed} /><span className="absolute left-2 top-2 rounded bg-black/55 px-1.5 py-0.5 font-mono text-[10px] text-white">{b.id}</span></div><div className="p-2.5"><div className="flex justify-between text-[12px]"><span className="truncate font-medium">{b.type}</span><span className="tabular">{inrCompact(b.price)}</span></div><div className="mt-0.5 font-mono text-[10px] text-muted">{b.lengthFt} × {b.widthFt} × {b.heightFt} ft</div></div></div>)}</div>
    </div>
  )
}
function SalesMock() {
  const cols = [['New', 'new'], ['Quoted', 'quoted'], ['Negotiation', 'negotiation']] as const
  return (
    <div className="grid gap-2.5 sm:grid-cols-3">{cols.map(([label, key]) => <div key={key} className="rounded-lg border border-line bg-surface/60 p-2"><div className="mb-2 px-1 text-[11px] font-medium">{label}</div><div className="space-y-2">{LEADS.filter((l) => l.stage === key).slice(0, 2).map((l) => <div key={l.id} className="rounded-md border border-line bg-surface p-2.5"><div className="text-[12px] font-medium">{l.company}</div><div className="mt-0.5 text-[11px] text-muted">{l.interest}</div><div className="mt-2 text-[12px] tabular">{inrCompact(l.estValue)}</div></div>)}</div></div>)}</div>
  )
}
function AnalyticsMock() {
  const d = demandByType().sort((a, b) => b.soldBlocks - a.soldBlocks)
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-line bg-surface p-3"><div className="mb-2 text-[11px] text-muted">Demand by granite type</div><HBars items={d.map((x) => ({ label: x.type, value: x.soldBlocks, display: String(x.soldBlocks), color: TYPE_COLORS[x.type] }))} /></div>
      <div className="rounded-lg border border-line bg-surface p-3"><div className="mb-2 text-[11px] text-muted">Extraction trend</div><Sparkline values={MONTHLY.map((m) => m.extracted)} className="h-24" /><div className="mt-3 text-[11px] text-muted">Sales trend</div><Sparkline values={MONTHLY.map((m) => m.sales)} className="h-16" stroke={C.ai} /></div>
    </div>
  )
}
function AssistantMock() {
  const a = useAsync(() => askIntelligence('What are my best-selling granite types?'), [])
  return <div className="space-y-3"><div className="ml-auto w-fit rounded-2xl rounded-br-md bg-surface-3 px-3.5 py-2 text-[12.5px]">What are my best-selling granite types?</div>{a.data && <AnswerCard a={a.data} onFollowUp={() => undefined} />}</div>
}

export function ProductShowcase() {
  const [tab, setTab] = useState<Tab>('Dashboard')
  return (
    <section className="border-b border-line bg-surface/40 py-24">
      <div className="container-page">
        <Reveal><h2 className="max-w-3xl text-headline font-semibold">A workspace built for the yard, the office and the road</h2>
          <p className="mt-4 max-w-xl text-muted">These previews are rendered from the same demo data as the live workspace.</p></Reveal>
        <div className="mt-10 flex gap-1 overflow-x-auto no-scrollbar" role="tablist" aria-label="Product screens">
          {TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn('shrink-0 rounded-full border px-4 py-2 text-sm transition-colors', tab === t ? 'border-sand/50 bg-sand/10 text-sand' : 'border-line-strong text-muted hover:text-fg')}>{t}</button>)}
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-line-strong bg-bg shadow-lift" role="tabpanel" aria-label={`${tab} preview`}>
          <div className="flex items-center gap-2 border-b border-line bg-surface px-4 py-3"><span className="h-2.5 w-2.5 rounded-full bg-line-strong" /><span className="h-2.5 w-2.5 rounded-full bg-line-strong" /><span className="h-2.5 w-2.5 rounded-full bg-line-strong" /><Logo to="/" collapsed className="ml-3 [&_svg]:h-4 [&_svg]:w-4" /><span className="ml-1 font-mono text-[11px] text-muted">/app</span></div>
          <div className="min-h-[360px] p-4 sm:min-h-[420px] sm:p-6" aria-hidden>
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                {tab === 'Dashboard' && <DashboardMock />}{tab === 'Block inventory' && <BlocksMock />}{tab === 'Sales' && <SalesMock />}{tab === 'Analytics' && <AnalyticsMock />}{tab === 'Assistant' && <AssistantMock />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
