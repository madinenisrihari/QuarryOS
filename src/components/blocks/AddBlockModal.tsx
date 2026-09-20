import { useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { GRANITE_TYPES, TYPE_META } from '@/data/blocks'
import { useToast } from '@/components/ui/Toast'
import { inr } from '@/lib/format'
import type { GraniteType } from '@/types/models'

/** Demo form: computes volume, weight and price live. It does not persist anything until an API is connected. */
export function AddBlockModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast()
  const [type, setType] = useState<GraniteType>('Black Galaxy')
  const [l, setL] = useState('8.0'), [w, setW] = useState('5.0'), [h, setH] = useState('4.8')
  const [rate, setRate] = useState(String(TYPE_META['Black Galaxy'].rate))
  const calc = useMemo(() => {
    const vol = Number(l) * Number(w) * Number(h)
    return { vol, weight: vol * 0.0283168 * 2.7, price: Math.round((vol * Number(rate)) / 1000) * 1000 }
  }, [l, w, h, rate])
  const valid = calc.vol > 0 && Number(rate) > 0
  return (
    <Modal open={open} onClose={onClose} title="Add block" description="Dimensions in feet. Volume, weight and price are calculated for you." size="lg"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" disabled={!valid} onClick={() => { toast({ title: 'Block added (demo)', description: 'A QR tag would be generated on save. Nothing is stored in this demo.' }); onClose() }}>Save block</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Granite type">{(id) => <Select id={id} data-autofocus value={type} onChange={(e) => { const t = e.target.value as GraniteType; setType(t); setRate(String(TYPE_META[t].rate)) }}>{GRANITE_TYPES.map((t) => <option key={t}>{t}</option>)}</Select>}</Field>
        <Field label="Price per cubic foot (₹)">{(id) => <Input id={id} inputMode="numeric" value={rate} onChange={(e) => setRate(e.target.value)} />}</Field>
        <Field label="Length (ft)">{(id) => <Input id={id} inputMode="decimal" value={l} onChange={(e) => setL(e.target.value)} />}</Field>
        <Field label="Width (ft)">{(id) => <Input id={id} inputMode="decimal" value={w} onChange={(e) => setW(e.target.value)} />}</Field>
        <Field label="Height (ft)">{(id) => <Input id={id} inputMode="decimal" value={h} onChange={(e) => setH(e.target.value)} />}</Field>
        <Field label="Yard location">{(id) => <Select id={id}><option>Yard A · Bay 1</option><option>Yard A · Bay 2</option><option>Yard B · Bay 1</option><option>Yard C · Bay 1</option></Select>}</Field>
        <Field label="Notes" className="sm:col-span-2">{(id) => <Textarea id={id} placeholder="Grade, defects, surface condition…" />}</Field>
      </div>
      <dl className="mt-5 grid grid-cols-3 gap-3 rounded-xl border border-line bg-surface-2/40 p-4 text-sm">
        <div><dt className="text-xs text-muted">Volume</dt><dd className="mt-0.5 font-medium tabular">{calc.vol.toFixed(1)} cft</dd></div>
        <div><dt className="text-xs text-muted">Weight</dt><dd className="mt-0.5 font-medium tabular">{calc.weight.toFixed(1)} t</dd></div>
        <div><dt className="text-xs text-muted">List price</dt><dd className="mt-0.5 font-medium tabular">{inr(calc.price)}</dd></div>
      </dl>
    </Modal>
  )
}
