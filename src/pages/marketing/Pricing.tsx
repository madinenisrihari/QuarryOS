import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageHero } from './PageHero'
import { cn } from '@/lib/cn'

const PLANS = [
  { name: 'Starter', price: 'Free', note: 'For trying QuarryOS on a single site', features: ['1 quarry', 'Up to 100 blocks', '3 users', 'Block registry and QR tags', 'Public block pages'], cta: 'Start free', to: '/signup', featured: false },
  { name: 'Growth', price: '₹14,999', note: 'per month, indicative', features: ['Up to 3 quarries', 'Unlimited blocks', '15 users with roles', 'Sales, orders and payments', 'Transport and machinery', 'Quarry Intelligence'], cta: 'Start free', to: '/signup', featured: true },
  { name: 'Enterprise', price: 'Custom', note: 'For groups and exporters', features: ['Unlimited quarries and users', 'Single sign-on', 'Custom integrations', 'Priority support', 'Data migration help'], cta: 'Talk to us', to: '/contact', featured: false },
]
const FAQ = [
  ['Is this pricing final?', 'No. QuarryOS is a product preview and these tiers show the intended shape, not a commitment. Final pricing will be published before launch.'],
  ['Can I import my existing block list?', 'CSV import is on the roadmap. During onboarding we would help you load your current records.'],
  ['Where is my data stored?', 'The production design uses PostgreSQL on Supabase with row-level security so each organisation only sees its own data. The demo stores nothing.'],
  ['Does it work on a phone in the yard?', 'Yes. The interface is designed mobile-first for yard tasks, and camera QR scanning is planned.'],
]
export default function Pricing() {
  return (
    <>
      <PageHero title="Simple plans that grow with your quarry" lead="Start free on one site. Add quarries, users and modules as your operation grows." />
      <div className="container-page py-20">
        <div className="grid gap-4 lg:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.name} className={cn('flex flex-col rounded-2xl border p-7', p.featured ? 'border-sand/40 bg-sand/[0.04]' : 'border-line bg-surface')}>
              <h2 className="text-lg font-medium">{p.name}</h2>
              <div className="mt-4 text-4xl font-semibold tracking-tight">{p.price}</div><div className="mt-1 min-h-5 text-[13px] text-muted">{p.note}</div>
              <ul className="my-7 flex-1 space-y-3 text-[14px]">{p.features.map((f) => <li key={f} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-sand" aria-hidden />{f}</li>)}</ul>
              <Button to={p.to} variant={p.featured ? 'accent' : 'secondary'} size="lg">{p.cta}</Button>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-subtle">Indicative pricing for a product preview. Not an offer.</p>
        <section className="mt-24 max-w-3xl" aria-labelledby="faq"><h2 id="faq" className="text-2xl font-semibold tracking-tight">Questions</h2>
          <div className="mt-6 divide-y divide-line border-y border-line">{FAQ.map(([q, a]) => <details key={q} className="group py-4"><summary className="cursor-pointer list-none text-[15px] font-medium marker:hidden [&::-webkit-details-marker]:hidden">{q}</summary><p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted">{a}</p></details>)}</div></section>
      </div>
    </>
  )
}
