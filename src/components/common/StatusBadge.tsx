import { Badge, type Tone } from '@/components/ui/Badge'

const MAP: Record<string, { label: string; tone: Tone }> = {
  // blocks
  available: { label: 'Available', tone: 'ok' }, reserved: { label: 'Reserved', tone: 'warn' }, in_processing: { label: 'In processing', tone: 'info' },
  sold: { label: 'Sold', tone: 'sand' }, dispatched: { label: 'Dispatched', tone: 'neutral' },
  // orders
  confirmed: { label: 'Confirmed', tone: 'info' }, processing: { label: 'Processing', tone: 'info' }, ready: { label: 'Ready to ship', tone: 'sand' },
  delivered: { label: 'Delivered', tone: 'ok' }, cancelled: { label: 'Cancelled', tone: 'bad' },
  // payments
  received: { label: 'Received', tone: 'ok' }, pending: { label: 'Pending', tone: 'warn' }, overdue: { label: 'Overdue', tone: 'bad' },
  // quotations
  draft: { label: 'Draft', tone: 'neutral' }, sent: { label: 'Sent', tone: 'info' }, accepted: { label: 'Accepted', tone: 'ok' }, expired: { label: 'Expired', tone: 'warn' }, declined: { label: 'Declined', tone: 'bad' },
  // trips
  preparing: { label: 'Preparing', tone: 'neutral' }, loaded: { label: 'Loaded', tone: 'warn' }, in_transit: { label: 'In transit', tone: 'info' },
  // vehicles / machines
  on_trip: { label: 'On trip', tone: 'info' }, maintenance: { label: 'In maintenance', tone: 'warn' },
  running: { label: 'Running', tone: 'ok' }, idle: { label: 'Idle', tone: 'neutral' }, breakdown: { label: 'Breakdown', tone: 'bad' },
  // leads
  new: { label: 'New', tone: 'info' }, contacted: { label: 'Contacted', tone: 'neutral' }, quoted: { label: 'Quoted', tone: 'sand' }, negotiation: { label: 'Negotiation', tone: 'warn' }, won: { label: 'Won', tone: 'ok' }, lost: { label: 'Lost', tone: 'bad' },
  // attendance
  present: { label: 'Present', tone: 'ok' }, absent: { label: 'Absent', tone: 'bad' }, leave: { label: 'On leave', tone: 'warn' }, half_day: { label: 'Half day', tone: 'info' },
  // invoices
  paid: { label: 'Paid', tone: 'ok' }, partial: { label: 'Part paid', tone: 'warn' }, unpaid: { label: 'Unpaid', tone: 'neutral' },
  // benches
  active: { label: 'Active', tone: 'ok' }, planned: { label: 'Planned', tone: 'neutral' },
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const m = MAP[status] ?? { label: status, tone: 'neutral' as Tone }
  return <Badge tone={m.tone} dot className={className}>{m.label}</Badge>
}
