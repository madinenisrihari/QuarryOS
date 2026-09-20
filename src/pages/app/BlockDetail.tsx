import { AnimatePresence, motion } from 'framer-motion'
import { BookmarkCheck, Copy, FileText, Handshake, Pencil, Play, QrCode } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BlockQR } from '@/components/common/BlockQR'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { StoneSwatch } from '@/components/common/StoneSwatch'
import { Timeline } from '@/components/common/Timeline'
import { Granite3D } from '@/components/three/Granite3D'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState, ErrorState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { Segmented } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/Toast'
import { blockPublicUrl } from '@/data/blocks'
import { getCustomer } from '@/data/people'
import { getQuarry } from '@/data/quarries'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services/api'
import type { Block, BlockEvent, BlockStatus } from '@/types/models'
import { daysSince, dateShort, inr, num } from '@/lib/format'
import { Box } from 'lucide-react'

const KIND_ICON = { extraction: undefined, inspection: undefined, listing: undefined, reservation: BookmarkCheck, sale: Handshake, transport: undefined, note: undefined }

export default function BlockDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const block = useAsync(() => api.blocks.get(id), [id])
  const events = useAsync(() => api.blocks.events(id), [id])
  const [status, setStatus] = useState<BlockStatus>()
  const [media, setMedia] = useState(0)
  const [mode, setMode] = useState<'gallery' | '3d'>('gallery')
  const [confirm, setConfirm] = useState<'reserve' | 'sell' | null>(null)
  const [qr, setQr] = useState(false)
  const [extra, setExtra] = useState<BlockEvent[]>([])
  useEffect(() => { setStatus(undefined); setExtra([]); setMedia(0) }, [id])

  if (block.error) return <ErrorState message={block.error.message} onRetry={block.reload} />
  if (block.loading) return <div className="grid gap-4 lg:grid-cols-3"><Skeleton className="h-[480px] lg:col-span-2" /><Skeleton className="h-[480px]" /></div>
  const b = block.data as Block | null | undefined
  if (!b) return <EmptyState icon={Box} title={`No block found with ID ${id}`} description="It may have been removed, or the ID may be mistyped." action={<Button to="/app/blocks" variant="primary">Back to blocks</Button>} />

  const current = status ?? b.status
  const customer = getCustomer(b.customerId ?? '')
  const quarry = getQuarry(b.quarryId)
  const m = b.media[media]!
  const timeline = [...extra, ...(events.data ?? [])].map((e) => ({ id: e.id + e.at, at: e.at, title: e.title, detail: e.detail, icon: KIND_ICON[e.kind] }))

  const apply = (s: 'reserved' | 'sold') => {
    setStatus(s)
    setExtra((x) => [{ id: `local-${s}`, at: '2026-09-19', kind: s === 'sold' ? 'sale' : 'reservation', title: s === 'sold' ? 'Marked as sold' : 'Reserved', detail: 'Changed in this session (demo, not saved).' }, ...x])
    toast({ title: s === 'sold' ? `${b.id} marked as sold` : `${b.id} reserved`, description: 'Demo change: it resets when you reload.' })
  }
  const canAct = current === 'available' || current === 'reserved'

  return (
    <>
      <PageHeader crumbs={[{ label: 'Blocks', to: '/app/blocks' }, { label: b.id }]} title={`${b.id} · ${b.type}`}
        description={`Extracted ${dateShort(b.extractedOn)} (${daysSince(b.extractedOn)} days ago) from ${quarry?.name ?? 'quarry'}.`}
        actions={<>
          <Button icon={Pencil} onClick={() => toast({ tone: 'info', title: 'Editing is not wired up in the demo' })}>Edit</Button>
          <Button icon={BookmarkCheck} disabled={current !== 'available'} onClick={() => setConfirm('reserve')}>Reserve</Button>
          <Button icon={Handshake} disabled={!canAct} onClick={() => setConfirm('sell')}>Sell</Button>
          <Button icon={FileText} onClick={() => navigate(`/app/quotations?block=${b.id}`)}>Generate quote</Button>
          <Button variant="primary" icon={QrCode} onClick={() => setQr(true)}>Generate QR</Button>
        </>} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative aspect-[16/10] bg-surface-2 sm:aspect-[16/9]">
              {mode === 'gallery' ? (
                <AnimatePresence mode="wait">
                  <motion.div key={m.id} initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="absolute inset-0">
                    <StoneSwatch type={b.type} seed={m.seed} label={`${b.type} block, ${m.label}`} />
                    {m.kind === 'video' && <div className="absolute inset-0 grid place-items-center bg-black/30"><span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-black"><Play className="ml-0.5 h-6 w-6" aria-hidden /></span></div>}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgb(var(--surface-3)),rgb(var(--surface)))]"><Granite3D type={b.type} dims={[b.lengthFt, b.widthFt, b.heightFt]} interactive autoRotate={false} pointerParallax={false} className="h-full w-full" seed={Number(b.id.slice(3))} /></div>
              )}
              <div className="absolute left-3 top-3"><Segmented label="Viewer" value={mode} onChange={setMode} options={[{ value: 'gallery', label: 'Media' }, { value: '3d', label: '3D' }]} /></div>
              <div className="absolute bottom-3 left-3 rounded-md bg-black/55 px-2 py-1 text-xs text-white backdrop-blur">{mode === '3d' ? 'Drag to rotate. Proportions match the recorded dimensions.' : `${m.label} · demo imagery`}</div>
            </div>
            {mode === 'gallery' && (
              <div className="flex gap-2 overflow-x-auto p-3 no-scrollbar" role="tablist" aria-label="Media">
                {b.media.map((it, i) => (
                  <button key={it.id} role="tab" aria-selected={i === media} aria-label={`${it.label}${it.kind === 'video' ? ' (video)' : ''}`} onClick={() => setMedia(i)} className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition ${i === media ? 'border-sand' : 'border-line opacity-70 hover:opacity-100'}`}>
                    <StoneSwatch type={b.type} seed={it.seed} />{it.kind === 'video' && <Play className="absolute inset-0 m-auto h-4 w-4 text-white" aria-hidden />}
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Block history" description="Everything that has happened to this block, newest first" />
            <div className="p-5 pt-6">{events.loading ? <Skeleton className="h-40" /> : <Timeline items={timeline} />}</div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between"><StatusBadge status={current} /><span className="text-xs text-muted">{b.color}</span></div>
            <div className="mt-4 text-3xl font-semibold tracking-tight tabular">{inr(b.price)}</div>
            <div className="mt-1 text-[13px] text-muted">{inr(b.pricePerCft)} per cubic foot</div>
          </Card>

          <Card>
            <CardHeader title="Specification" />
            <dl className="divide-y divide-line px-5 pb-2 pt-2 text-sm">
              {[
                ['Dimensions', <span className="font-mono">{b.lengthFt} × {b.widthFt} × {b.heightFt} ft</span>],
                ['Volume', `${num(b.volumeCft, 1)} cft`],
                ['Weight', `${b.weightT} tonnes`],
                ['Location', b.location],
                ['Bench', b.bench],
                ['Quarry', quarry?.name ?? '-'],
                ['Customer', customer ? <Link to={`/app/customers/${customer.id}`} className="text-sand hover:underline">{customer.company}</Link> : 'Not assigned'],
              ].map(([k, v]) => <div key={String(k)} className="flex items-baseline justify-between gap-4 py-2.5"><dt className="text-muted">{k}</dt><dd className="text-right">{v}</dd></div>)}
            </dl>
          </Card>

          <Card>
            <CardHeader title="Notes" />
            <p className="px-5 pb-5 pt-2 text-sm text-fg/90">{b.notes}</p>
          </Card>

          <Card className="flex items-center gap-4 p-5">
            <BlockQR blockId={b.id} size={84} />
            <div className="min-w-0 text-sm"><div className="font-medium">Public block page</div><p className="mt-0.5 text-[13px] text-muted">Scanning the tag on this block opens a mobile page with photos, size and an enquiry button.</p><Link to={`/b/${b.id}`} className="mt-2 inline-block text-[13px] text-sand hover:underline">Preview the page</Link></div>
          </Card>
        </div>
      </div>

      <ConfirmDialog open={confirm === 'reserve'} onClose={() => setConfirm(null)} onConfirm={() => apply('reserved')} title={`Reserve ${b.id}?`} description="The block will be held and hidden from the public storefront until you release it." confirmLabel="Reserve block" />
      <ConfirmDialog open={confirm === 'sell'} onClose={() => setConfirm(null)} onConfirm={() => apply('sold')} title={`Mark ${b.id} as sold?`} description={`This records a sale at ${inr(b.price)}. In a live workspace it would also create an order and invoice.`} confirmLabel="Mark as sold" />
      <Modal open={qr} onClose={() => setQr(false)} title={`QR tag for ${b.id}`} description="Print and attach to the block. The code links to its public page." size="sm"
        footer={<><Button icon={Copy} onClick={() => { void navigator.clipboard?.writeText(blockPublicUrl(b.id)); toast({ title: 'Link copied' }) }}>Copy link</Button><Button variant="primary" onClick={() => window.print()}>Print label</Button></>}>
        <div className="flex flex-col items-center gap-3 py-2"><BlockQR blockId={b.id} size={200} /><div className="font-mono text-lg tracking-wide">{b.id}</div><div className="text-[13px] text-muted">{b.type} · {b.lengthFt} × {b.widthFt} × {b.heightFt} ft</div></div>
      </Modal>
    </>
  )
}
