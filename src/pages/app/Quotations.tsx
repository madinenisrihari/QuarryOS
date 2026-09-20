import { Plus, Printer } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DataTable, type Column } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Logo } from '@/components/common/Logo'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/EmptyState'
import { Field, Input, Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { quoteSubtotal, quoteTotal } from '@/data/commerce'
import { isoDaysAgo, isoDaysAhead } from '@/data/clock'
import { CUSTOMERS, getCustomer } from '@/data/people'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services/api'
import type { Block, Quotation } from '@/types/models'
import { cn } from '@/lib/cn'
import { dateShort, inr } from '@/lib/format'

function QuotePreview({ q, onClose }: { q: Quotation | null; onClose: () => void }) {
  if (!q) return null
  const c = getCustomer(q.customerId)
  const sub = quoteSubtotal(q), taxable = sub + q.transport, tax = Math.round(taxable * (q.taxRatePct / 100))
  return (
    <Modal open onClose={onClose} title={`Quotation ${q.id}`} description="Print-ready preview. PDF export is planned." size="lg"
      footer={<><Button variant="ghost" onClick={onClose}>Close</Button><Button icon={Printer} variant="primary" onClick={() => window.print()}>Print</Button></>}>
      <div className="rounded-xl bg-white p-6 text-[#15161a]">
        <div className="flex items-start justify-between"><div className="text-[#15161a] [&_*]:!text-[#15161a]"><Logo to="#" /></div><div className="text-right text-sm"><div className="font-semibold">{q.id}</div><div className="text-[#5c6068]">Issued {dateShort(q.date)}</div><div className="text-[#5c6068]">Valid until {dateShort(q.validUntil)}</div></div></div>
        <div className="mt-6 text-sm"><div className="text-[#5c6068]">Prepared for</div><div className="font-medium">{c?.company}</div><div>{c?.name}, {c?.city}, {c?.country}</div></div>
        <table className="mt-6 w-full text-sm"><thead><tr className="border-b border-[#d8d5cf] text-left text-[#5c6068]"><th className="py-2 font-medium">Block</th><th className="py-2 font-medium">Description</th><th className="py-2 text-right font-medium">Amount</th></tr></thead>
          <tbody>{q.lines.map((l) => { const b = api.blocks.all().find((x) => x.id === l.blockId); return <tr key={l.blockId} className="border-b border-[#ece9e3]"><td className="py-2 font-mono">{l.blockId}</td><td className="py-2">{b ? `${b.type}, ${b.lengthFt} × ${b.widthFt} × ${b.heightFt} ft, ${b.weightT} t` : ''}</td><td className="py-2 text-right tabular-nums">{inr(l.price)}</td></tr> })}</tbody></table>
        <dl className="ml-auto mt-4 w-64 space-y-1.5 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{inr(sub)}</dd></div>
          <div className="flex justify-between"><dt>Transport</dt><dd className="tabular-nums">{inr(q.transport)}</dd></div>
          <div className="flex justify-between"><dt>GST {q.taxRatePct}%</dt><dd className="tabular-nums">{inr(tax)}</dd></div>
          <div className="flex justify-between border-t border-[#d8d5cf] pt-2 text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{inr(quoteTotal(q))}</dd></div>
        </dl>
        <p className="mt-6 text-xs text-[#5c6068]">Demonstration document. Tax rate is configurable and must be confirmed with your accountant.</p>
      </div>
    </Modal>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3"><h3 className="flex items-center gap-2.5 text-sm font-medium"><span className="grid h-5 w-5 place-items-center rounded-full border border-line-strong text-[11px] text-muted">{n}</span>{title}</h3>{children}</section>
  )
}

function Builder({ open, onClose, blocks, initial, onCreate }: { open: boolean; onClose: () => void; blocks: Block[]; initial: { customer?: string; block?: string }; onCreate: (q: Quotation) => void }) {
  const [customer, setCustomer] = useState(initial.customer ?? '')
  const [picked, setPicked] = useState<string[]>(initial.block ? [initial.block] : [])
  const [prices, setPrices] = useState<Record<string, string>>({})
  const [discount, setDiscount] = useState('0')
  const [transport, setTransport] = useState('0')
  const [tax, setTax] = useState('18')
  const [search, setSearch] = useState('')
  useEffect(() => { if (open) { setCustomer(initial.customer ?? ''); setPicked(initial.block ? [initial.block] : []) } }, [open, initial.customer, initial.block])

  const chosen = picked.map((id) => blocks.find((b) => b.id === id)).filter(Boolean) as Block[]
  const line = (b: Block) => Number(prices[b.id] ?? b.price) || 0
  const disc = Math.min(100, Math.max(0, Number(discount) || 0))
  const sub = chosen.reduce((s, b) => s + Math.round(line(b) * (1 - disc / 100)), 0)
  const tr = Number(transport) || 0, rate = Number(tax) || 0
  const taxAmt = Math.round((sub + tr) * (rate / 100)), total = sub + tr + taxAmt
  const visible = blocks.filter((b) => `${b.id} ${b.type}`.toLowerCase().includes(search.toLowerCase())).slice(0, 40)
  const ready = customer && chosen.length > 0

  const create = () => {
    onCreate({ id: 'pending', customerId: customer, lines: chosen.map((b) => ({ blockId: b.id, price: Math.round(line(b) * (1 - disc / 100)) })), transport: tr, taxRatePct: rate, date: isoDaysAgo(0), validUntil: isoDaysAhead(14), status: 'draft' })
  }
  return (
    <Modal open={open} onClose={onClose} title="New quotation" description="Five quick steps. Totals update as you go." size="xl"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" disabled={!ready} onClick={create}>Generate quote</Button></>}>
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-7">
          <Step n={1} title="Customer"><Select aria-label="Customer" value={customer} onChange={(e) => setCustomer(e.target.value)} data-autofocus><option value="">Choose a customer…</option>{CUSTOMERS.map((c) => <option key={c.id} value={c.id}>{c.company} · {c.city}</option>)}</Select></Step>
          <Step n={2} title={`Blocks (${chosen.length} selected)`}>
            <Input aria-label="Search available blocks" placeholder="Search available blocks…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <ul className="max-h-56 divide-y divide-line overflow-y-auto rounded-lg border border-line">
              {visible.map((b) => { const on = picked.includes(b.id); return (
                <li key={b.id}><label className={cn('flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm hover:bg-surface-2', on && 'bg-sand/[0.06]')}>
                  <input type="checkbox" checked={on} onChange={() => setPicked((p) => on ? p.filter((x) => x !== b.id) : [...p, b.id])} className="h-4 w-4 accent-[rgb(var(--sand))]" />
                  <span className="font-mono text-[13px]">{b.id}</span><span className="flex-1 truncate text-muted">{b.type} · {b.volumeCft} cft</span><span className="tabular">{inr(b.price)}</span></label></li>) })}
            </ul>
          </Step>
          <Step n={3} title="Price">
            {chosen.length === 0 ? <p className="text-[13px] text-muted">Select blocks to set prices.</p> : (
              <div className="space-y-2">{chosen.map((b) => <div key={b.id} className="flex items-center gap-3"><span className="w-20 font-mono text-[13px]">{b.id}</span><Input aria-label={`Price for ${b.id}`} inputMode="numeric" className="h-9" value={prices[b.id] ?? String(b.price)} onChange={(e) => setPrices((p) => ({ ...p, [b.id]: e.target.value.replace(/[^\d]/g, '') }))} /></div>)}
                <Field label="Discount (%)">{(id) => <Input id={id} inputMode="decimal" className="h-9 w-28" value={discount} onChange={(e) => setDiscount(e.target.value)} />}</Field></div>)}
          </Step>
          <Step n={4} title="Transport"><Field label="Transport charge (₹)" hint="Leave at 0 for ex-yard pricing.">{(id, d) => <Input id={id} aria-describedby={d} inputMode="numeric" className="w-48" value={transport} onChange={(e) => setTransport(e.target.value.replace(/[^\d]/g, ''))} />}</Field></Step>
          <Step n={5} title="Tax"><Field label="GST (%)" hint="Default is a placeholder. Confirm the applicable rate for your product and route.">{(id, d) => <Input id={id} aria-describedby={d} inputMode="decimal" className="w-28" value={tax} onChange={(e) => setTax(e.target.value)} />}</Field></Step>
        </div>
        <aside aria-label="Quote summary" className="h-fit rounded-xl border border-line bg-surface-2/50 p-5 lg:sticky lg:top-0">
          <div className="text-xs text-muted">Quote total</div><div className="mt-1 text-3xl font-semibold tabular">{inr(total)}</div>
          <dl className="mt-5 space-y-2 text-[13px]">
            <div className="flex justify-between"><dt className="text-muted">Blocks</dt><dd className="tabular">{chosen.length}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular">{inr(sub)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Transport</dt><dd className="tabular">{inr(tr)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">GST {rate}%</dt><dd className="tabular">{inr(taxAmt)}</dd></div>
          </dl>
        </aside>
      </div>
    </Modal>
  )
}

export default function Quotations() {
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const quotes = useAsync(() => api.quotations.list(), [])
  const avail = useAsync(() => api.blocks.list({ status: 'available', sort: 'oldest' }), [])
  const [created, setCreated] = useState<Quotation[]>([])
  const [building, setBuilding] = useState(false)
  const [preview, setPreview] = useState<Quotation | null>(null)
  const initial = useMemo(() => ({ customer: params.get('customer') ?? undefined, block: params.get('block') ?? undefined }), [params])
  useEffect(() => { if (params.get('block') || params.get('customer')) setBuilding(true) }, [params])
  if (quotes.error) return <ErrorState message={quotes.error.message} onRetry={quotes.reload} />

  const rows = [...created, ...(quotes.data ?? [])]
  const cols: Column<Quotation>[] = [
    { key: 'id', header: 'Quotation', mobile: 'title', sortValue: (q) => q.id, cell: (q) => <span className="font-mono text-[13px]">{q.id}</span> },
    { key: 'cust', header: 'Customer', cell: (q) => getCustomer(q.customerId)?.company },
    { key: 'blocks', header: 'Blocks', align: 'right', cell: (q) => q.lines.length },
    { key: 'total', header: 'Total', align: 'right', sortValue: (q) => quoteTotal(q), cell: (q) => <span className="font-medium">{inr(quoteTotal(q))}</span> },
    { key: 'valid', header: 'Valid until', sortValue: (q) => q.validUntil, cell: (q) => dateShort(q.validUntil) },
    { key: 'st', header: 'Status', cell: (q) => <StatusBadge status={q.status} /> },
  ]
  const close = () => { setBuilding(false); if (params.toString()) setParams({}, { replace: true }) }

  return (
    <>
      <PageHeader title="Quotations" description="Build a quote in a minute, from customer to totals." actions={<Button variant="primary" icon={Plus} onClick={() => setBuilding(true)}>New quotation</Button>} />
      <Card>{quotes.loading ? <Skeleton className="m-5 h-72" /> : <DataTable caption="Quotations" columns={cols} rows={rows} rowKey={(q) => q.id} onRowClick={setPreview} pageSize={10} emptyTitle="No quotations yet" emptyDescription="Create your first quotation from available blocks." emptyAction={<Button variant="primary" onClick={() => setBuilding(true)}>New quotation</Button>} />}</Card>
      <Builder open={building} onClose={close} blocks={avail.data ?? []} initial={initial}
        onCreate={(draft) => { const q = { ...draft, id: `QT-2609-0${15 + created.length}` }; setCreated((c) => [q, ...c]); close(); setPreview(q); toast({ title: `${q.id} created`, description: 'Saved as a draft in this session (demo).' }) }} />
      <QuotePreview q={preview} onClose={() => setPreview(null)} />
    </>
  )
}
