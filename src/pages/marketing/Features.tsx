import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { FinalCTA } from '@/components/marketing/Sections'
import { PageHero } from './PageHero'

type State = 'Preview' | 'Planned'
const GROUPS: { title: string; blurb: string; items: [string, string, State][] }[] = [
  { title: 'Operations', blurb: 'Know what is being lifted and what is in the yard.', items: [
    ['Multi-quarry workspace', 'Switch between sites or see them together.', 'Preview'],
    ['Block registry', 'ID, dimensions, weight, volume, photos, location and price.', 'Preview'],
    ['QR block tags', 'Each block links to a public, mobile-friendly page.', 'Preview'],
    ['Production log', 'Daily extraction by bench, crew and machine.', 'Preview'],
    ['Inventory ageing', 'See which blocks have waited longest.', 'Preview'],
    ['Camera QR scanning', 'Scan a tag in the yard to open the block.', 'Planned'],
  ] },
  { title: 'Business', blurb: 'From enquiry to money in the bank.', items: [
    ['Customers', 'Profiles, purchase history and balances.', 'Preview'],
    ['Leads and pipeline', 'Track enquiries through to won or lost.', 'Preview'],
    ['Quotation builder', 'Customer, blocks, price, transport and tax in one screen.', 'Preview'],
    ['Orders and payments', 'Status, receivables ageing and reminders.', 'Preview'],
    ['PDF quotations and invoices', 'Print-ready preview exists; PDF export is next.', 'Planned'],
  ] },
  { title: 'Logistics and people', blurb: 'Vehicles, drivers, machines and staff.', items: [
    ['Fleet and dispatch board', 'Trips from preparing to delivered.', 'Preview'],
    ['Machinery and maintenance', 'Service intervals, alerts and cost history.', 'Preview'],
    ['Employees', 'Attendance, assignments and salary records.', 'Preview'],
    ['Role-based access', 'Owner, admin, manager, sales and worker roles.', 'Preview'],
  ] },
  { title: 'Intelligence and reach', blurb: 'Understand the business and be found.', items: [
    ['Analytics', 'Sales, production, stock and finance trends.', 'Preview'],
    ['Quarry Intelligence', 'Questions answered from your data. Demo uses fixed analyses.', 'Preview'],
    ['Free-form AI, forecasting', 'Demand forecasts and production planning.', 'Planned'],
    ['Public storefront', 'Your quarry’s online showroom.', 'Preview'],
    ['Marketplace', 'Search across quarries. Payments are not included.', 'Planned'],
  ] },
]

export default function Features() {
  return (
    <>
      <PageHero title="Everything a quarry runs on, in one place" lead="Each module is built to connect to the others, so a block sold in Sales is already known to Inventory, Transport and Payments."><Button to="/signup" variant="primary" size="lg">Start free</Button></PageHero>
      <div className="container-page py-20">
        <p className="mb-12 max-w-2xl text-sm text-muted">“Preview” means it works in the demo workspace with sample data. “Planned” means it is designed but not built.</p>
        <div className="space-y-16">
          {GROUPS.map((g) => (
            <section key={g.title} className="grid gap-8 lg:grid-cols-[280px_1fr]">
              <div><h2 className="text-2xl font-semibold tracking-tight">{g.title}</h2><p className="mt-2 text-sm text-muted">{g.blurb}</p></div>
              <ul className="divide-y divide-line border-y border-line">
                {g.items.map(([t, d, s]) => <li key={t} className="flex items-start justify-between gap-6 py-4"><div><h3 className="font-medium">{t}</h3><p className="mt-1 text-[14px] text-muted">{d}</p></div><Badge tone={s === 'Preview' ? 'ok' : 'neutral'} dot>{s}</Badge></li>)}
              </ul>
            </section>
          ))}
        </div>
      </div>
      <FinalCTA />
    </>
  )
}
