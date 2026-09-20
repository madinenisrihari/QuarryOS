import type { Block, BlockEvent, BlockStatus, GraniteType } from '@/types/models'
import { mulberry32, weighted } from '@/lib/seed'
import { isoDaysAgo } from './clock'
import { CUSTOMERS } from './people'

export const GRANITE_TYPES: GraniteType[] = [
  'Black Galaxy', 'Absolute Black', 'Steel Grey', 'Tan Brown', 'Colonial White', 'Viscount White',
]

/** Per-type reference data. `rate` is ₹ per cubic foot (demo values). */
export const TYPE_META: Record<GraniteType, { color: string; rate: number; quarryId: string; benches: string[]; swatch: string }> = {
  'Black Galaxy': { color: 'Black with gold and copper flecks', rate: 1850, quarryId: 'q-kondapi', benches: ['KR-B1', 'KR-B2'], swatch: '#15161a' },
  'Absolute Black': { color: 'Uniform jet black', rate: 1195, quarryId: 'q-kondapi', benches: ['KR-B3'], swatch: '#0d0e10' },
  'Steel Grey': { color: 'Cool grey, fine grain', rate: 620, quarryId: 'q-kondapi', benches: ['KR-B4'], swatch: '#5c6167' },
  'Tan Brown': { color: 'Brown with tan and dark mottle', rate: 780, quarryId: 'q-nagavaram', benches: ['NH-B3'], swatch: '#5b3f2c' },
  'Colonial White': { color: 'White with grey and garnet specks', rate: 700, quarryId: 'q-nagavaram', benches: ['NH-B1'], swatch: '#cfcac0' },
  'Viscount White': { color: 'White with grey-brown veining', rate: 950, quarryId: 'q-nagavaram', benches: ['NH-B2'], swatch: '#d8d3c8' },
}

const YARDS: Record<string, string[]> = {
  'q-kondapi': ['Yard A · Bay 1', 'Yard A · Bay 2', 'Yard A · Bay 3', 'Yard A · Bay 4', 'Yard A · Bay 5', 'Yard B · Bay 1', 'Yard B · Bay 2'],
  'q-nagavaram': ['Yard C · Bay 1', 'Yard C · Bay 2', 'Yard C · Bay 3', 'Yard C · Bay 4'],
}

const NOTES: Record<GraniteType, string[]> = {
  'Black Galaxy': ['Dense, even gold fleck distribution. Suitable for polished slabs.', 'Minor surface weathering on one face; trimmed before tagging.', 'Export grade. Clean on all six faces.'],
  'Absolute Black': ['Very uniform, no visible veining. Preferred for monuments and countertops.', 'One hairline cut mark on rear face; does not affect yield.', 'Premium grade, gang-saw ready.'],
  'Steel Grey': ['Consistent grain. Good for cladding and paving.', 'Slight colour shift towards one end; note for slab matching.', 'Standard grade.'],
  'Tan Brown': ['Warm mottled pattern; strong demand for kitchen tops.', 'Contains a dark cluster near one edge; marked in photos.', 'Standard grade with even colour.'],
  'Colonial White': ['Clean white base with fine garnet specks.', 'Light rust staining on base, removable on dressing.', 'Export grade.'],
  'Viscount White': ['Distinct grey-brown veining. Suited to feature walls and flooring.', 'Two natural veins run parallel; slabs will mirror.', 'Premium grade.'],
}

const rand = mulberry32(1042)

const STATUS_WEIGHTS: (readonly [BlockStatus, number])[] = [
  ['available', 0.52], ['reserved', 0.12], ['sold', 0.15], ['in_processing', 0.08], ['dispatched', 0.13],
]
const TYPE_WEIGHTS: (readonly [GraniteType, number])[] = [
  ['Black Galaxy', 0.25], ['Absolute Black', 0.22], ['Steel Grey', 0.18], ['Tan Brown', 0.12], ['Colonial White', 0.12], ['Viscount White', 0.11],
]
const round1 = (n: number) => Math.round(n * 10) / 10

function make(index: number): Block {
  const type = weighted(rand, TYPE_WEIGHTS)
  const meta = TYPE_META[type]
  const status = weighted(rand, STATUS_WEIGHTS)
  const L = round1(6.8 + rand() * 2.8)
  const W = round1(4.6 + rand() * 1.4)
  const H = round1(4.2 + rand() * 1.4)
  const daysAgo =
    status === 'available'
      ? rand() < 0.18 ? Math.floor(61 + rand() * 90) : Math.floor(3 + rand() * 56)
      : Math.floor(20 + rand() * 140)
  return build(`GR-${1001 + index}`, type, L, W, H, status, daysAgo, rand() * 0.16 - 0.08)
}

function build(id: string, type: GraniteType, L: number, W: number, H: number, status: BlockStatus, daysAgo: number, jitter: number): Block {
  const meta = TYPE_META[type]
  const volumeCft = round1(L * W * H)
  const weightT = round1(volumeCft * 0.0283168 * 2.7)
  const pricePerCft = Math.round(meta.rate * (1 + jitter))
  const price = Math.round((volumeCft * pricePerCft) / 1000) * 1000
  const quarryId = meta.quarryId
  const needsCustomer = status !== 'available'
  const n = Number(id.slice(3))
  return {
    id, quarryId, type, color: meta.color,
    lengthFt: L, widthFt: W, heightFt: H, volumeCft, weightT, status, pricePerCft, price,
    location: status === 'dispatched' ? 'Left the yard' : YARDS[quarryId]![n % YARDS[quarryId]!.length]!,
    extractedOn: isoDaysAgo(daysAgo),
    bench: meta.benches[n % meta.benches.length]!,
    notes: NOTES[type][n % 3]!,
    customerId: needsCustomer ? CUSTOMERS[(n * 7) % CUSTOMERS.length]!.id : undefined,
    media: [
      { id: `${id}-p1`, kind: 'photo', label: 'Front face', seed: n },
      { id: `${id}-p2`, kind: 'photo', label: 'Top face', seed: n + 101 },
      { id: `${id}-p3`, kind: 'photo', label: 'Side face', seed: n + 202 },
      ...(n % 5 < 2 ? [{ id: `${id}-v1`, kind: 'video' as const, label: 'Walk-around clip', seed: n + 303 }] : []),
    ],
  }
}

export const BLOCKS: Block[] = Array.from({ length: 186 }, (_, i) => make(i)).map((b) =>
  // Pin the example block from the product brief so screenshots and docs are stable.
  b.id === 'GR-1042'
    ? { ...build('GR-1042', 'Absolute Black', 8.2, 5.1, 4.8, 'available', 12, 0), price: 240000 }
    : b,
)

export const getBlock = (id: string) => BLOCKS.find((b) => b.id === id)

export function blockEvents(b: Block): BlockEvent[] {
  const day = (offset: number) => {
    const d = new Date(b.extractedOn); d.setDate(d.getDate() + offset)
    return d.toISOString().slice(0, 10)
  }
  const customer = CUSTOMERS.find((c) => c.id === b.customerId)
  const ev: BlockEvent[] = [
    { id: 'e1', at: b.extractedOn, kind: 'extraction', title: 'Extracted', detail: `Bench ${b.bench}. Lifted and moved to dressing area.` },
    { id: 'e2', at: day(1), kind: 'inspection', title: 'Measured and graded', detail: `${b.lengthFt} × ${b.widthFt} × ${b.heightFt} ft, ${b.weightT} t.` },
    { id: 'e3', at: day(2), kind: 'inspection', title: 'Photographed and QR tagged', detail: `Tag ${b.id} attached. ${b.media.length} media items uploaded.` },
    { id: 'e4', at: day(3), kind: 'listing', title: 'Listed for sale', detail: `Listed at ₹${b.pricePerCft.toLocaleString('en-IN')} per cft.` },
  ]
  if (b.status === 'reserved' && customer) ev.push({ id: 'e5', at: day(18), kind: 'reservation', title: 'Reserved', detail: `Held for ${customer.company}.` })
  if (['sold', 'in_processing', 'dispatched'].includes(b.status) && customer) {
    ev.push({ id: 'e5', at: day(14), kind: 'reservation', title: 'Reserved', detail: `Held for ${customer.company}.` })
    ev.push({ id: 'e6', at: day(20), kind: 'sale', title: 'Sold', detail: `Invoiced to ${customer.company}.` })
  }
  if (b.status === 'in_processing') ev.push({ id: 'e7', at: day(26), kind: 'note', title: 'Sent for processing', detail: 'Moved to the cutting line.' })
  if (b.status === 'dispatched') ev.push({ id: 'e7', at: day(28), kind: 'transport', title: 'Dispatched', detail: 'Loaded and released from the yard gate.' })
  return ev.filter((e) => new Date(e.at) <= new Date('2026-09-19')).reverse()
}

export const blockPublicUrl = (id: string) => `${window.location.origin}/b/${id}`
export const getTypeSwatch = (t: GraniteType) => TYPE_META[t].swatch
