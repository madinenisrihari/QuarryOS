import { Search, ShieldAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StoneSwatch } from '@/components/common/StoneSwatch'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Field'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonCards } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { GRANITE_TYPES } from '@/data/blocks'
import { QUARRIES } from '@/data/quarries'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services/api'
import { inr } from '@/lib/format'
import { Button } from '@/components/ui/Button'

/** Marketplace preview. Search and filtering are real; listings, other quarries and payments are not. */
export default function Marketplace() {
  const { data, loading } = useAsync(() => api.marketplace.listings(), [])
  const navigate = useNavigate()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  const [kind, setKind] = useState('all')
  const [state, setState] = useState('all')
  const [avail, setAvail] = useState('all')
  const [maxPrice, setMaxPrice] = useState('')

  const states = useMemo(() => [...new Set((data ?? []).map((l) => l.state))], [data])
  const list = (data ?? []).filter((l) =>
    (!q || `${l.title} ${l.quarryName} ${l.type}`.toLowerCase().includes(q.toLowerCase())) &&
    (type === 'all' || l.type === type) && (kind === 'all' || l.kind === kind) && (state === 'all' || l.state === state) &&
    (avail === 'all' || l.availability === avail) && (!maxPrice || l.priceFrom <= Number(maxPrice)))

  return (
    <div className="container-page pb-24 pt-28">
      <Badge tone="sand">Preview</Badge>
      <h1 className="mt-4 text-headline font-semibold">Find granite from verified quarries</h1>
      <p className="mt-3 max-w-2xl text-muted">Search blocks and slabs across quarries, then contact the quarry or request a quotation. Payments are not part of this preview.</p>
      <div role="note" className="mt-6 flex items-start gap-3 rounded-xl border border-line bg-surface-2/40 p-4 text-[13px] text-muted"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-sand" aria-hidden />Listings marked “demo listing” are invented examples. Only the Meridian Granites entries link to a working storefront.</div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="relative sm:col-span-2"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden /><label className="sr-only" htmlFor="mk-q">Search marketplace</label>
          <input id="mk-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Black Galaxy, slabs, quarry…" className="h-10 w-full rounded-lg border border-line-strong bg-surface-2/60 pl-9 pr-3 text-sm focus:border-sand/60 focus:outline-none focus:ring-2 focus:ring-sand/20" /></div>
        <Select aria-label="Granite type" value={type} onChange={(e) => setType(e.target.value)}><option value="all">All granite</option>{GRANITE_TYPES.map((t) => <option key={t}>{t}</option>)}</Select>
        <Select aria-label="Product kind" value={kind} onChange={(e) => setKind(e.target.value)}><option value="all">Blocks and slabs</option><option>Block</option><option>Slab</option></Select>
        <Select aria-label="State" value={state} onChange={(e) => setState(e.target.value)}><option value="all">Any state</option>{states.map((s) => <option key={s}>{s}</option>)}</Select>
        <Select aria-label="Availability" value={avail} onChange={(e) => setAvail(e.target.value)}><option value="all">Any availability</option><option>In stock</option><option>Limited</option><option>Made to order</option></Select>
        <Select aria-label="Country" value="India" onChange={() => undefined} className="lg:col-start-1"><option>India</option></Select>
        <Select aria-label="Maximum price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}><option value="">Any price</option><option value="300">Up to ₹300</option><option value="1000">Up to ₹1,000</option><option value="1500">Up to ₹1,500</option></Select>
      </div>

      <div className="mt-8">
        {loading ? <SkeletonCards /> : !list.length ? <EmptyState icon={Search} title="No listings match" description="Try a different granite type or clear a filter." action={<Button onClick={() => { setQ(''); setType('all'); setKind('all'); setState('all'); setAvail('all'); setMaxPrice('') }}>Clear filters</Button>} /> : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((l) => {
              const live = QUARRIES.some((x) => x.slug === l.quarrySlug)
              return (
                <li key={l.id}>
                  <button onClick={() => live ? navigate(`/quarry/${l.quarrySlug}`) : toast({ tone: 'info', title: 'Demo listing', description: 'This quarry is an invented example and has no storefront.' })} className="group block w-full overflow-hidden rounded-xl border border-line bg-surface text-left transition-colors hover:border-line-strong">
                    <div className="aspect-[16/10] overflow-hidden"><div className="h-full transition-transform duration-500 group-hover:scale-105"><StoneSwatch type={l.type} seed={l.seed} label={l.title} /></div></div>
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2"><Badge>{l.kind}</Badge><Badge tone={l.availability === 'In stock' ? 'ok' : l.availability === 'Limited' ? 'warn' : 'neutral'} dot>{l.availability}</Badge></div>
                      <h3 className="mt-3 font-medium">{l.title}</h3>
                      <p className="mt-1 text-[13px] text-muted">{l.quarryName} · {l.state}</p>
                      <div className="mt-4 flex items-baseline justify-between border-t border-line pt-3 text-sm"><span className="text-muted">{l.size}</span><span className="tabular font-medium">From {inr(l.priceFrom)} <span className="text-xs font-normal text-muted">{l.unit}</span></span></div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
