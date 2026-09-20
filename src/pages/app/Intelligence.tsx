import { Sparkles } from 'lucide-react'
import { IntelligenceChat } from '@/components/intelligence/IntelligenceChat'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader } from '@/components/ui/Card'

const AVAILABLE = ['Sales and expense summaries', 'Customers with outstanding balances', 'Slow-moving and high-value inventory', 'Best-selling granite types', "Today's production"]
const PLANNED = ['Free-form questions over live data', 'Demand forecasting by granite type', 'Production planning against orders', 'Inventory and pricing recommendations', 'Alerts pushed to WhatsApp or email']

export default function Intelligence() {
  return (
    <>
      <header className="mb-6">
        <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-ai" aria-hidden /><h1 className="text-2xl font-semibold tracking-tight">Quarry Intelligence</h1><Badge tone="ai">Demo</Badge></div>
        <p className="mt-1 max-w-2xl text-sm text-muted">An intelligence layer across your data. Ask about sales, stock, payments and production and get answers with the numbers behind them.</p>
      </header>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-5"><IntelligenceChat className="h-[calc(100dvh-16rem)] min-h-[520px]" /></Card>
        <div className="space-y-4">
          <Card><CardHeader title="Works in this demo" description="Computed from the sample data" /><ul className="space-y-2 px-5 pb-5 pt-3 text-[13px]">{AVAILABLE.map((a) => <li key={a} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ok" aria-hidden />{a}</li>)}</ul></Card>
          <Card><CardHeader title="Planned" description="Not built yet" /><ul className="space-y-2 px-5 pb-5 pt-3 text-[13px] text-muted">{PLANNED.map((a) => <li key={a} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-subtle" aria-hidden />{a}</li>)}</ul></Card>
          <p className="px-1 text-xs leading-relaxed text-subtle">Answers here come from fixed analyses over demo data. A production version would call the backend, which queries your database with read-only tools and keeps a record of what it used.</p>
        </div>
      </div>
    </>
  )
}
