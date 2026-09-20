import { CheckCircle2, MapPin, Ruler, Weight } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Logo } from '@/components/common/Logo'
import { StoneSwatch } from '@/components/common/StoneSwatch'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { ToastProvider } from '@/components/ui/Toast'
import { getQuarry } from '@/data/quarries'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services/api'
import { dateShort, num } from '@/lib/format'
import { Box } from 'lucide-react'
import { EnquiryModal } from './EnquiryModal'

/** Destination of the QR tag. Mobile-first and intentionally shows public data only (no customer, no internal location). */
export default function PublicBlock() {
  const { id = '' } = useParams()
  const { data: b, loading } = useAsync(() => api.blocks.get(id), [id])
  const [open, setOpen] = useState(false)
  const [photo, setPhoto] = useState(0)

  return (
    <div className="mx-auto min-h-dvh max-w-xl bg-bg pb-28">
      <header className="flex h-14 items-center justify-between px-4"><Logo /><span className="text-xs text-muted">Block passport</span></header>
      {loading ? <div className="space-y-4 p-4"><Skeleton className="aspect-[4/3]" /><Skeleton className="h-8 w-40" /><Skeleton className="h-32" /></div>
        : !b ? <EmptyState icon={Box} title={`No block found for ${id}`} description="This tag may be damaged or the block may have been removed." action={<Link className="text-sand underline" to="/">Visit QuarryOS</Link>} />
        : (() => {
          const q = getQuarry(b.quarryId)!
          const sold = b.status === 'sold' || b.status === 'dispatched' || b.status === 'in_processing'
          const photos = b.media.filter((m) => m.kind === 'photo')
          return (
            <>
              <div className="aspect-[4/3] overflow-hidden"><StoneSwatch type={b.type} seed={photos[photo]!.seed} label={`${b.type} block ${b.id}`} /></div>
              <div className="flex gap-2 px-4 pt-3">
                {photos.map((p, i) => <button key={p.id} onClick={() => setPhoto(i)} aria-label={p.label} aria-pressed={i === photo} className={`h-12 w-16 overflow-hidden rounded-md border ${i === photo ? 'border-sand' : 'border-line opacity-70'}`}><StoneSwatch type={b.type} seed={p.seed} /></button>)}
              </div>
              <div className="px-4 pt-5">
                <div className="font-mono text-sm tracking-wide text-muted">{b.id}</div>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">{b.type}</h1>
                <p className="mt-1 text-sm text-muted">{b.color}</p>
                <div className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${sold ? 'border-line-strong text-muted' : b.status === 'reserved' ? 'border-warn/30 bg-warn/10 text-warn' : 'border-ok/30 bg-ok/10 text-ok'}`}>
                  <CheckCircle2 className="h-4 w-4" aria-hidden />{sold ? 'No longer available' : b.status === 'reserved' ? 'Reserved. Enquire for alternatives' : 'Available now'}
                </div>
                <dl className="mt-6 grid grid-cols-2 gap-3">
                  {[[Ruler, 'Dimensions', `${b.lengthFt} × ${b.widthFt} × ${b.heightFt} ft`], [Weight, 'Weight', `${b.weightT} t`], [Box, 'Volume', `${num(b.volumeCft, 1)} cft`], [MapPin, 'Quarry', q.name]].map(([Icon, k, v]) => {
                    const I = Icon as typeof Ruler
                    return <div key={String(k)} className="rounded-xl border border-line bg-surface p-3.5"><dt className="flex items-center gap-1.5 text-xs text-muted"><I className="h-3.5 w-3.5" aria-hidden />{String(k)}</dt><dd className="mt-1 text-[15px] font-medium">{String(v)}</dd></div>
                  })}
                </dl>
                <div className="mt-3 rounded-xl border border-line bg-surface p-4 text-sm">
                  <div className="text-xs text-muted">Origin</div>
                  <div className="mt-1">{q.company} · {q.district}, {q.state}, {q.country}</div>
                  <div className="mt-3 text-xs text-muted">Extracted</div><div className="mt-1">{dateShort(b.extractedOn)}</div>
                </div>
                <p className="mt-4 text-xs text-subtle">Price on request. Photos on this demo page are generated illustrations.</p>
              </div>
              <div className="safe-bottom fixed inset-x-0 bottom-0 border-t border-line bg-bg/90 px-4 pt-3 backdrop-blur-xl"><div className="mx-auto max-w-xl"><Button variant="accent" size="lg" className="w-full" onClick={() => setOpen(true)}>Enquire about {b.id}</Button></div></div>
              <ToastProvider><EnquiryModal open={open} onClose={() => setOpen(false)} subject={`${b.id} · ${b.type} · ${b.lengthFt} × ${b.widthFt} × ${b.heightFt} ft`} /></ToastProvider>
            </>
          )
        })()}
    </div>
  )
}
