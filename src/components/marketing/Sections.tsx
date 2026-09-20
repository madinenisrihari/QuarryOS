import { motion } from 'framer-motion'
import { BarChart3, Boxes, Calculator, Factory, FileStack, Hammer, PackageSearch, Ship, Store, Truck, Wallet, Warehouse, Users, Route, Mountain, CircleDollarSign } from 'lucide-react'
import { useRef } from 'react'
import { AnswerCard, InsightList } from '@/components/intelligence/IntelligenceChat'
import { AreaTrend, BarTrend } from '@/components/charts/Charts'
import { C } from '@/components/charts/theme'
import { BlockQR } from '@/components/common/BlockQR'
import { Reveal } from '@/components/common/Motion'
import { StoneSwatch } from '@/components/common/StoneSwatch'
import { Timeline } from '@/components/common/Timeline'
import { Button } from '@/components/ui/Button'
import { MONTHLY } from '@/data/analytics'
import { BLOCKS, blockEvents, getBlock } from '@/data/blocks'
import { useAsync } from '@/hooks/useAsync'
import { askIntelligence, computeInsights } from '@/services/intelligence'
import { StrataBackground } from './StrataBackground'
import { Sparkles } from 'lucide-react'
import { dateShort } from '@/lib/format'

/* ---------- Who it's for ---------- */
const INDUSTRIES = [
  { icon: Mountain, name: 'Granite quarries', text: 'Log every block at the face, from bench to yard.' },
  { icon: Factory, name: 'Stone manufacturers', text: 'Match incoming blocks to slab and tile production.' },
  { icon: Ship, name: 'Exporters', text: 'Keep documents, weights and container loads in one record.' },
  { icon: Store, name: 'Stone dealers', text: 'Know what you hold, what it cost and what it will sell for.' },
  { icon: Hammer, name: 'Fabricators', text: 'Reserve the right lot and keep colour consistent across jobs.' },
]
export function Industries() {
  return (
    <section className="border-b border-line py-24">
      <div className="container-page">
        <Reveal><h2 className="max-w-2xl text-headline font-semibold">One platform for the whole natural-stone trade</h2>
          <p className="mt-4 max-w-xl text-muted">QuarryOS is designed around how stone actually moves: from a rock face, through a yard, to a buyer.</p></Reveal>
        <ul className="mt-14 grid border-y border-line md:grid-cols-5 md:divide-x md:divide-line">
          {INDUSTRIES.map((i) => (
            <li key={i.name} className="border-b border-line p-6 last:border-b-0 md:border-b-0">
              <i.icon className="h-5 w-5 text-sand" aria-hidden /><h3 className="mt-5 font-medium">{i.name}</h3><p className="mt-2 text-[13.5px] leading-relaxed text-muted">{i.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs text-subtle">QuarryOS is a new product. We show no customer logos and claim no partnerships.</p>
      </div>
    </section>
  )
}

/* ---------- Problems ---------- */
const PROBLEMS = [
  { icon: FileStack, t: 'Paper-based inventory', d: 'Ledgers get damaged, copied wrongly or left at the yard office.' },
  { icon: PackageSearch, t: 'Lost block information', d: 'Nobody remembers which bay holds which block, or what it measured.' },
  { icon: Calculator, t: 'Manual sales tracking', d: 'Quotes, sold blocks and invoices live in different notebooks and phones.' },
  { icon: Boxes, t: 'Difficult stock management', d: 'Old blocks sit for months because no one sees how long they have waited.' },
  { icon: Truck, t: 'Transport coordination', d: 'Loading, vehicles and drivers are arranged by calls the night before.' },
  { icon: Wallet, t: 'Payment tracking', d: 'Who owes what, and since when, depends on one person’s memory.' },
  { icon: BarChart3, t: 'Lack of analytics', d: 'Which granite earns the most is a guess, not a number.' },
]
export function Problems() {
  return (
    <section className="border-b border-line bg-surface/40 py-24">
      <div className="container-page grid gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <Reveal className="lg:sticky lg:top-28 lg:self-start"><h2 className="text-headline font-semibold">Most quarries run on notebooks, calls and memory</h2>
          <p className="mt-5 max-w-md text-muted">That works until volume grows, staff change or a buyer asks a question you cannot answer quickly.</p></Reveal>
        <ul className="divide-y divide-line border-y border-line">
          {PROBLEMS.map((p) => (
            <li key={p.t} className="flex gap-5 py-5"><p.icon className="mt-0.5 h-5 w-5 shrink-0 text-subtle" aria-hidden /><div><h3 className="font-medium">{p.t}</h3><p className="mt-1 text-[14px] text-muted">{p.d}</p></div></li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------- Solution flow ---------- */
const FLOW = [
  { icon: Mountain, t: 'Quarry', d: 'Benches, crews and daily extraction' },
  { icon: Boxes, t: 'Blocks', d: 'ID, size, weight and photos per block' },
  { icon: Hammer, t: 'Processing', d: 'What is cut, and from which block' },
  { icon: Warehouse, t: 'Inventory', d: 'Live stock by yard, type and age' },
  { icon: CircleDollarSign, t: 'Sales', d: 'Quotations, orders and invoices' },
  { icon: Users, t: 'Customers', d: 'History, balances and notes' },
  { icon: Route, t: 'Delivery', d: 'Vehicles, trips and proof of delivery' },
]
export function Flow() {
  const ref = useRef<HTMLOListElement>(null)
  return (
    <section className="border-b border-line py-24">
      <div className="container-page">
        <Reveal><h2 className="max-w-3xl text-headline font-semibold">Every step connected, so a block never loses its story</h2></Reveal>
        <ol ref={ref} className="relative mt-16 grid gap-0 lg:grid-cols-7">
          <motion.span aria-hidden initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, margin: '-120px' }} transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1] }} className="absolute left-[7%] right-[7%] top-[22px] hidden h-px origin-left bg-gradient-to-r from-sand/80 via-sand/40 to-sand/10 lg:block" />
          {FLOW.map((f, i) => (
            <li key={f.t} className="relative flex gap-4 pb-8 lg:flex-col lg:items-center lg:gap-0 lg:pb-0 lg:text-center">
              <div className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line-strong bg-bg text-sand"><f.icon className="h-[18px] w-[18px]" aria-hidden /></div>
              {i < FLOW.length - 1 && <span aria-hidden className="absolute bottom-0 left-[21px] top-11 w-px bg-line-strong lg:hidden" />}
              <div className="lg:mt-5"><h3 className="font-medium">{f.t}</h3><p className="mt-1 max-w-[11rem] text-[13px] leading-snug text-muted">{f.d}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------- Block intelligence ---------- */
export function BlockIntelligence() {
  const b = getBlock('GR-1042')!
  const ev = blockEvents(b).slice(0, 4).map((e) => ({ id: e.id, at: e.at, title: e.title, detail: e.detail }))
  return (
    <section className="border-b border-line bg-surface/40 py-24">
      <div className="container-page grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <h2 className="text-headline font-semibold">A digital passport for every block</h2>
          <p className="mt-5 max-w-lg text-muted">Each block gets an ID, measured dimensions, photos and a QR tag the day it is lifted. Anyone with a phone can scan it in the yard, and buyers can scan it before they enquire.</p>
          <ul className="mt-8 space-y-3 text-[15px]">
            {['Dimensions, weight and volume calculated once, correctly', 'Photos and video attached to the block, not to a chat thread', 'Status and location updated as the block moves', 'A full history from extraction to dispatch'].map((t) => <li key={t} className="flex gap-3"><span className="mt-2 h-1 w-3 shrink-0 bg-sand" aria-hidden />{t}</li>)}
          </ul>
          <Button to="/b/GR-1042" className="mt-9">Open the sample block page</Button>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="panel-raised overflow-hidden">
            <div className="grid sm:grid-cols-[1fr_auto]">
              <div className="aspect-[16/9] sm:aspect-auto sm:min-h-[200px]"><StoneSwatch type={b.type} seed={5} label="Absolute Black block" /></div>
              <div className="flex items-center justify-center bg-surface-2 p-5"><BlockQR blockId={b.id} size={104} /></div>
            </div>
            <div className="p-6">
              <div className="flex items-baseline justify-between"><div><div className="font-mono text-sm text-muted">{b.id}</div><div className="text-xl font-semibold tracking-tight">{b.type}</div></div><span className="rounded-full border border-ok/25 bg-ok/10 px-2.5 py-1 text-xs text-ok">Available</span></div>
              <p className="mt-2 font-mono text-[13px] text-muted">{b.lengthFt} × {b.widthFt} × {b.heightFt} ft · {b.weightT} t · {b.location}</p>
              <div className="mt-6 border-t border-line pt-6"><Timeline items={ev} /></div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- AI intelligence ---------- */
export function AIIntelligence() {
  const ans = useAsync(() => askIntelligence('Which customers owe money?'), [])
  return (
    <section className="relative overflow-hidden border-b border-line py-24">
      <div className="pointer-events-none absolute -right-40 top-10 h-[420px] w-[420px] rounded-full bg-ai/[0.06] blur-[110px]" aria-hidden />
      <div className="container-page grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Reveal>
          <h2 className="text-headline font-semibold">An intelligence layer that reads your quarry’s numbers</h2>
          <p className="mt-5 max-w-lg text-muted">Ask plain questions about sales, stock and payments and get an answer with the data behind it. Quarry Intelligence is designed to sit across every screen, not in a separate chat window.</p>
          <ul className="mt-8 space-y-2.5 text-[15px] text-fg/90">{['Which blocks have been in stock too long?', 'Which customers owe money?', 'What sold best this month?'].map((q) => <li key={q} className="flex items-center gap-3"><Sparkles className="h-4 w-4 shrink-0 text-ai" aria-hidden />{q}</li>)}</ul>
          <p className="mt-8 max-w-md text-[13px] text-subtle">The example on the right is computed from the demo dataset with fixed analyses. A language model is not connected in this preview.</p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-line-strong bg-surface p-5 shadow-lift sm:p-6">
            <div className="flex items-center gap-2 text-xs font-medium tracking-[0.12em] text-ai"><Sparkles className="h-4 w-4" aria-hidden />QUARRY INTELLIGENCE</div>
            <div className="mt-4"><InsightList insights={computeInsights()} /></div>
            <div className="my-5 ml-auto w-fit rounded-2xl rounded-br-md bg-surface-3 px-4 py-2.5 text-sm">Which customers owe money?</div>
            {ans.data ? <AnswerCard a={ans.data} onFollowUp={() => undefined} /> : <div className="h-40 animate-pulse rounded-xl bg-surface-2" />}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- Showroom ---------- */
export function Showroom() {
  const list = BLOCKS.filter((b) => b.quarryId === 'q-kondapi' && b.status === 'available').slice(0, 3)
  return (
    <section className="border-b border-line bg-surface/40 py-24">
      <div className="container-page grid items-center gap-14 lg:grid-cols-2">
        <Reveal className="lg:order-2">
          <h2 className="text-headline font-semibold">Every quarry gets its own online showroom</h2>
          <p className="mt-5 max-w-lg text-muted">Publish the blocks you want buyers to see. They browse photos and sizes, scan a tag or request a quotation, and the enquiry lands next to the block in your workspace.</p>
          <p className="mt-6 font-mono text-sm text-sand">quarryos.com/quarry/your-quarry</p>
          <Button to="/quarry/meridian-granites" className="mt-8">See the sample storefront</Button>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-2xl border border-line-strong bg-bg shadow-lift">
            <div className="flex items-center gap-2 border-b border-line bg-surface px-4 py-3"><span className="h-2.5 w-2.5 rounded-full bg-line-strong" /><span className="h-2.5 w-2.5 rounded-full bg-line-strong" /><span className="h-2.5 w-2.5 rounded-full bg-line-strong" /><span className="ml-3 flex-1 truncate rounded-md bg-surface-2 px-3 py-1 font-mono text-[11px] text-muted">/quarry/meridian-granites</span></div>
            <div className="relative h-32 overflow-hidden"><StoneSwatch type="Black Galaxy" seed={9} /><div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent" /><div className="absolute bottom-3 left-5"><div className="text-lg font-semibold">Kondapi Ridge</div><div className="text-xs text-muted">Meridian Granites · Prakasam, Andhra Pradesh</div></div></div>
            <div className="grid grid-cols-3 gap-3 p-5">{list.map((b) => <div key={b.id} className="overflow-hidden rounded-lg border border-line"><div className="aspect-[4/3]"><StoneSwatch type={b.type} seed={b.media[0]!.seed} /></div><div className="p-2.5"><div className="truncate text-xs font-medium">{b.type}</div><div className="font-mono text-[10px] text-muted">{b.id}</div></div></div>)}</div>
            <div className="flex items-center justify-between border-t border-line px-5 py-4"><span className="text-xs text-muted">Demo storefront</span><span className="rounded-lg bg-sand px-3.5 py-1.5 text-xs font-medium text-bg">Request quotation</span></div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- Analytics ---------- */
export function AnalyticsSection() {
  return (
    <section className="border-b border-line py-24">
      <div className="container-page">
        <Reveal><h2 className="max-w-2xl text-headline font-semibold">See what your quarry earns, makes and holds</h2></Reveal>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          <Reveal className="panel p-5 lg:col-span-2"><div className="mb-1 text-sm font-medium">Monthly sales</div><div className="mb-3 text-xs text-muted">₹ lakh, demo data</div><AreaTrend data={MONTHLY} xKey="month" series={[{ key: 'sales', label: 'Sales', color: C.sand }, { key: 'expenses', label: 'Expenses', color: C.titanium }]} height={260} fmt={(v) => `₹${v.toFixed(1)}L`} /></Reveal>
          <Reveal delay={0.08} className="panel p-5"><div className="mb-1 text-sm font-medium">Blocks extracted</div><div className="mb-3 text-xs text-muted">Per month, demo data</div><BarTrend data={MONTHLY} xKey="month" series={[{ key: 'extracted', label: 'Extracted', color: C.sand }]} height={260} /></Reveal>
        </div>
        <p className="mt-4 text-xs text-subtle">Sample figures for a fictional quarry. Last updated {dateShort('2026-09-19')}.</p>
      </div>
    </section>
  )
}

/* ---------- Final CTA ---------- */
export function FinalCTA() {
  return (
    <section className="relative isolate overflow-hidden py-32">
      <StrataBackground className="opacity-80" seed={9} />
      <div className="container-page relative text-center">
        <Reveal><h2 className="mx-auto max-w-3xl text-display font-semibold">Bring your quarry into the digital age.</h2>
          <p className="mx-auto mt-6 max-w-lg text-lg text-muted">Start with the demo workspace, or tell us how your quarry runs today.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3"><Button to="/signup" variant="primary" size="lg">Start free</Button><Button to="/contact" size="lg">Talk to us</Button></div></Reveal>
      </div>
    </section>
  )
}
