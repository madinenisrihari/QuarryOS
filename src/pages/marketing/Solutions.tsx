import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FinalCTA } from '@/components/marketing/Sections'
import { PageHero } from './PageHero'

const SOLUTIONS = [
  { id: 'quarries', title: 'Granite quarries', lead: 'Record every block from the moment it is lifted and sell from live stock, not from memory.', points: ['Bench-level production log', 'Block registry with QR tags', 'Yard occupancy and stock ageing', 'Public storefront for buyers'] },
  { id: 'manufacturers', title: 'Stone manufacturers', lead: 'Keep raw block, cutting and finished stock connected so yield and cost stay visible.', points: ['Track blocks through processing', 'Reserve lots for a production run', 'See volume and weight per block', 'Machinery hours and maintenance'] },
  { id: 'exporters', title: 'Stone exporters', lead: 'Assemble container loads with the weights, photos and paperwork buyers expect.', points: ['Per-block weight and dimensions', 'Photo and video attached to each block', 'Order, transport and payment in one record', 'Multi-currency reporting is planned'] },
  { id: 'dealers', title: 'Stone dealers', lead: 'Know what you hold, what it cost and how long it has been sitting.', points: ['Live stock by type and age', 'Fast quotations from available blocks', 'Customer balances and reminders', 'Slow-moving stock alerts'] },
  { id: 'fabricators', title: 'Fabricators', lead: 'Find the right lot, keep colour consistent and follow a job from order to delivery.', points: ['Filter by type, colour and size', 'Reserve blocks for a job', 'Order status and delivery tracking', 'Purchase history per supplier'] },
]
export default function Solutions() {
  return (
    <>
      <PageHero title="Made for every business that moves natural stone" lead="Quarries, processors, traders and fabricators share the same problem: information about a physical block is scattered. QuarryOS keeps it in one record."><Button to="/signup" variant="primary" size="lg">Start free</Button><Button to="/contact" size="lg">Talk to us</Button></PageHero>
      <div className="container-page divide-y divide-line py-8">
        {SOLUTIONS.map((s) => (
          <section key={s.id} id={s.id} className="grid gap-8 py-14 lg:grid-cols-2">
            <div><h2 className="text-3xl font-semibold tracking-tight">{s.title}</h2><p className="mt-4 max-w-md text-muted">{s.lead}</p></div>
            <ul className="space-y-3">{s.points.map((p) => <li key={p} className="flex items-start gap-3 text-[15px]"><Check className="mt-1 h-4 w-4 shrink-0 text-sand" aria-hidden />{p}</li>)}</ul>
          </section>
        ))}
      </div>
      <FinalCTA />
    </>
  )
}
