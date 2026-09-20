import { Bookmark, Inbox, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatusBadge } from '@/components/common/StatusBadge'
import { StoneSwatch } from '@/components/common/StoneSwatch'

const ENQUIRIES = [
  { id: 'EN-2071', item: 'Black Galaxy blocks, 6 units', quarry: 'Meridian Granites · Kondapi Ridge', status: 'quoted', when: '2 days ago' },
  { id: 'EN-2064', item: 'Colonial White blocks, 4 units', quarry: 'Meridian Granites · Nagavaram Hills', status: 'sent', when: '6 days ago' },
  { id: 'EN-2049', item: 'Steel Grey blocks, 8 units', quarry: 'Meridian Granites · Kondapi Ridge', status: 'accepted', when: '3 weeks ago' },
]

/** Concept screen for the future buyer account. Static sample content. */
export default function BuyerPortal() {
  return (
    <div className="container-page pb-24 pt-28">
      <Badge tone="sand">Concept preview</Badge>
      <h1 className="mt-4 text-headline font-semibold">Buyer portal</h1>
      <p className="mt-3 max-w-2xl text-muted">A single place for buyers to track enquiries, compare quotations and reorder from quarries they trust. Sample data below.</p>
      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Your enquiries" description="Quotations arrive here as quarries respond" action={<Button size="sm" to="/marketplace">New search</Button>} />
          <ul className="divide-y divide-line px-5 pb-2 pt-2">
            {ENQUIRIES.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-surface-3 text-muted"><MessageSquare className="h-4 w-4" aria-hidden /></span><div><div className="text-sm font-medium">{e.item}</div><div className="text-xs text-muted">{e.quarry} · {e.when}</div></div></div>
                <StatusBadge status={e.status} />
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Saved quarries" />
          <div className="space-y-3 p-5">
            {['meridian-granites', 'meridian-granites-nagavaram'].map((s, i) => (
              <Link key={s} to={`/quarry/${s}`} className="flex items-center gap-3 rounded-lg border border-line p-2.5 hover:border-line-strong"><div className="h-10 w-12 overflow-hidden rounded"><StoneSwatch type={i ? 'Colonial White' : 'Black Galaxy'} seed={i + 3} /></div><div className="text-sm">{i ? 'Nagavaram Hills' : 'Kondapi Ridge'}<div className="text-xs text-muted">Meridian Granites</div></div><Bookmark className="ml-auto h-4 w-4 text-sand" aria-hidden /></Link>
            ))}
          </div>
        </Card>
      </div>
      <p className="mt-8 flex items-center gap-2 text-xs text-subtle"><Inbox className="h-3.5 w-3.5" aria-hidden />Not connected to accounts yet. See the roadmap on the Features page.</p>
    </div>
  )
}
