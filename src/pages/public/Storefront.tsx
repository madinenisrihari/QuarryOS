import { Award, Mail, MapPin } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StoneSwatch } from '@/components/common/StoneSwatch'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { BLOCKS } from '@/data/blocks'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services/api'
import { inr } from '@/lib/format'
import { Mountain } from 'lucide-react'
import { EnquiryModal } from './EnquiryModal'
import type { GraniteType } from '@/types/models'

/** Public B2B showroom for one quarry: /quarry/:slug */
export default function Storefront() {
  const { slug = '' } = useParams()
  const { data: q, loading } = useAsync(() => api.quarries.bySlug(slug), [slug])
  const [quote, setQuote] = useState(false)
  const [type, setType] = useState<GraniteType | 'all'>('all')

  if (loading) return <div className="container-page pt-28"><Skeleton className="h-72" /></div>
  if (!q) return <div className="pt-32"><EmptyState icon={Mountain} title="Storefront not found" description={`No quarry is published at /quarry/${slug}.`} action={<Button to="/marketplace" variant="primary">Browse the marketplace</Button>} /></div>

  const blocks = BLOCKS.filter((b) => b.quarryId === q.id && b.status === 'available')
  const shown = blocks.filter((b) => type === 'all' || b.type === type).slice(0, 12)
  return (
    <>
      <section className="relative overflow-hidden border-b border-line pt-16">
        <div className="absolute inset-0 opacity-50"><StoneSwatch type={q.stoneTypes[0]!} seed={7} /></div>
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-bg/50" />
        <div className="container-page relative pb-14 pt-20">
          <Badge tone="sand">Demo storefront</Badge>
          <h1 className="mt-5 text-headline font-semibold">{q.name}</h1>
          <p className="mt-2 text-lg text-muted">{q.company}</p>
          <p className="mt-4 flex items-center gap-1.5 text-sm text-muted"><MapPin className="h-4 w-4" aria-hidden />{q.district}, {q.state}, {q.country}</p>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-fg/85">{q.about}</p>
          <div className="mt-8 flex flex-wrap gap-3"><Button variant="accent" size="lg" onClick={() => setQuote(true)}>Request quotation</Button><Button size="lg" href="#available">View available blocks</Button></div>
        </div>
      </section>

      <section className="container-page grid gap-8 py-14 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Granite types</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {q.stoneTypes.map((t) => (
              <div key={t} className="overflow-hidden rounded-xl border border-line bg-surface"><div className="aspect-[3/2]"><StoneSwatch type={t} seed={t.length * 5} label={t} /></div><div className="p-3.5"><div className="font-medium">{t}</div><div className="text-xs text-muted">{blocks.filter((b) => b.type === t).length} blocks available</div></div></div>
            ))}
          </div>
        </div>
        <aside className="space-y-4">
          <div className="panel p-5"><h3 className="flex items-center gap-2 text-sm font-medium"><Award className="h-4 w-4 text-sand" aria-hidden />Certifications and documents</h3>
            <ul className="mt-3 space-y-2 text-[13px] text-muted">{q.certifications.map((c) => <li key={c}>{c}</li>)}</ul>
            <p className="mt-3 text-xs text-subtle">Sample entries. Verified documents would be uploaded by the quarry.</p></div>
          <div className="panel p-5"><h3 className="flex items-center gap-2 text-sm font-medium"><Mail className="h-4 w-4 text-sand" aria-hidden />Contact</h3><p className="mt-3 text-[13px] text-muted">sales@meridian-granites.example<br />+91 90000 10000 (demo)</p></div>
        </aside>
      </section>

      <section id="available" className="container-page pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h2 className="text-xl font-semibold tracking-tight">Available blocks</h2><p className="mt-1 text-sm text-muted">{blocks.length} blocks in stock. Prices on request.</p></div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by granite type">
            {(['all', ...q.stoneTypes] as const).map((t) => <button key={t} aria-pressed={type === t} onClick={() => setType(t)} className={`rounded-full border px-3 py-1.5 text-[13px] ${type === t ? 'border-sand/50 bg-sand/10 text-sand' : 'border-line-strong text-muted hover:text-fg'}`}>{t === 'all' ? 'All types' : t}</button>)}
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((b) => (
            <Link key={b.id} to={`/b/${b.id}`} className="group overflow-hidden rounded-xl border border-line bg-surface hover:border-line-strong">
              <div className="aspect-[16/10] overflow-hidden"><div className="h-full transition-transform duration-500 group-hover:scale-105"><StoneSwatch type={b.type} seed={b.media[0]!.seed} /></div></div>
              <div className="flex items-center justify-between p-4"><div><div className="font-medium">{b.type}</div><div className="font-mono text-xs text-muted">{b.id} · {b.lengthFt} × {b.widthFt} × {b.heightFt} ft</div></div><span className="text-xs text-muted">{b.weightT} t</span></div>
            </Link>
          ))}
        </div>
        {!shown.length && <EmptyState title="No blocks of this type in stock" description="Request a quotation and the quarry will confirm upcoming extraction." />}
      </section>

      <section className="border-t border-line bg-surface/40"><div className="container-page py-14">
        <h2 className="text-xl font-semibold tracking-tight">Slabs</h2>
        <p className="mt-2 max-w-xl text-sm text-muted">Slab inventory is part of the roadmap. Quarries that process their own blocks will list polished and honed slabs here.</p>
        <p className="mt-6 text-xs text-subtle">Reference price: Absolute Black blocks from {inr(1195)} per cubic foot (demo value).</p>
      </div></section>
      <EnquiryModal open={quote} onClose={() => setQuote(false)} quote subject={`${q.name}, ${q.company}`} />
    </>
  )
}
