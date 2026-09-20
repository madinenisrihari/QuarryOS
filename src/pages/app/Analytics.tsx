import { useState } from 'react'
import { AreaTrend, BarTrend, HBars, LineTrend } from '@/components/charts/Charts'
import { C, TYPE_COLORS } from '@/components/charts/theme'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { Tabs, Segmented } from '@/components/ui/Tabs'
import { EXPENSE_BREAKDOWN, MONTHLY_WITH_PROFIT, agingBuckets, demandByType, inventoryMovement, topCustomers } from '@/data/analytics'
import { inrCompact } from '@/lib/format'

type Range = '6' | '12'
export default function Analytics() {
  const [tab, setTab] = useState<'sales' | 'production' | 'inventory' | 'finance'>('sales')
  const [range, setRange] = useState<Range>('12')
  const months = MONTHLY_WITH_PROFIT.slice(-Number(range))
  const total = (k: 'sales' | 'expenses' | 'profit') => months.reduce((s, m) => s + m[k], 0)
  const lakh = (v: number) => `₹${v.toFixed(1)}L`
  const demand = demandByType()

  return (
    <>
      <PageHeader title="Analytics" description="Trends across sales, production, stock and money." actions={<Segmented label="Period" value={range} onChange={setRange} options={[{ value: '6', label: '6 months' }, { value: '12', label: '12 months' }]} />} />
      <section aria-label="Period summary" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Sales" value={total('sales')} decimals={1} format={lakh} hint={`last ${range} months`} />
        <StatCard label="Expenses" value={total('expenses')} decimals={1} format={lakh} />
        <StatCard label="Profit" value={total('profit')} decimals={1} format={lakh} hint={`${((total('profit') / total('sales')) * 100).toFixed(0)}% margin`} />
        <StatCard label="Blocks extracted" value={months.reduce((s, m) => s + m.extracted, 0)} />
      </section>
      <Tabs value={tab} onChange={setTab} className="mb-5" tabs={[{ value: 'sales', label: 'Sales' }, { value: 'production', label: 'Production' }, { value: 'inventory', label: 'Inventory' }, { value: 'finance', label: 'Finance' }]} />

      {tab === 'sales' && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2"><CardHeader title="Monthly sales" description="₹ lakh" /><div className="px-3 pb-4 pt-3"><AreaTrend data={months} xKey="month" series={[{ key: 'sales', label: 'Sales', color: C.sand }]} fmt={(v) => lakh(v)} legend={false} /></div></Card>
          <Card><CardHeader title="Demand by granite type" description="Blocks sold or in processing" /><div className="p-5"><HBars items={[...demand].sort((a, b) => b.soldBlocks - a.soldBlocks).map((d) => ({ label: d.type, value: d.soldBlocks, display: `${d.soldBlocks} · ${inrCompact(d.revenue)}`, color: TYPE_COLORS[d.type] }))} /></div></Card>
          <Card className="lg:col-span-3"><CardHeader title="Sales by customer" description="Total order value" /><div className="grid gap-x-10 gap-y-3 p-5 md:grid-cols-2"><HBars items={topCustomers(6).slice(0, 3).map((c) => ({ label: c.customer.company, value: c.total, display: inrCompact(c.total) }))} /><HBars items={topCustomers(6).slice(3).map((c) => ({ label: c.customer.company, value: c.total, display: inrCompact(c.total) }))} /></div></Card>
        </div>
      )}
      {tab === 'production' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card><CardHeader title="Block extraction" description="Blocks per month" /><div className="px-3 pb-4 pt-3"><BarTrend data={months} xKey="month" series={[{ key: 'extracted', label: 'Extracted', color: C.sand }]} /></div></Card>
          <Card><CardHeader title="Extracted versus dispatched" description="Blocks per month" /><div className="px-3 pb-4 pt-3"><LineTrend data={months} xKey="month" series={[{ key: 'extracted', label: 'Extracted', color: C.sand }, { key: 'dispatched', label: 'Dispatched', color: C.ai }]} /></div></Card>
        </div>
      )}
      {tab === 'inventory' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card><CardHeader title="Inventory movement" description="Net blocks added to stock each month" /><div className="px-3 pb-4 pt-3"><BarTrend data={inventoryMovement().slice(-Number(range))} xKey="month" series={[{ key: 'net', label: 'Net change', color: C.sand }]} /></div></Card>
          <Card><CardHeader title="Time in stock" description="Available blocks by days since extraction" /><div className="px-3 pb-4 pt-3"><BarTrend data={agingBuckets()} xKey="label" series={[{ key: 'count', label: 'Blocks', color: C.sand }]} colorByIndex={[C.sand, C.sand, C.sand, C.warn, C.bad]} /></div></Card>
          <Card className="lg:col-span-2"><CardHeader title="Sell-through by type" description="Share of blocks sold versus still in stock" /><div className="p-5"><HBars items={[...demand].sort((a, b) => b.sellThrough - a.sellThrough).map((d) => ({ label: d.type, value: d.sellThrough * 100, display: `${(d.sellThrough * 100).toFixed(0)}% · ${d.available} in stock`, color: TYPE_COLORS[d.type] }))} /></div></Card>
        </div>
      )}
      {tab === 'finance' && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2"><CardHeader title="Profit trend" description="Sales minus expenses, ₹ lakh" /><div className="px-3 pb-4 pt-3"><LineTrend data={months} xKey="month" series={[{ key: 'profit', label: 'Profit', color: C.ok }, { key: 'expenses', label: 'Expenses', color: C.titanium }]} fmt={(v) => lakh(v)} /></div></Card>
          <Card><CardHeader title="Expenses this month" description="₹ lakh" /><div className="p-5"><HBars items={EXPENSE_BREAKDOWN.map((e) => ({ label: e.category, value: e.amount, display: lakh(e.amount) }))} color={C.titanium} /></div></Card>
        </div>
      )}
      <p className="mt-6 text-xs text-subtle">Demo data. Figures are illustrative and were not calculated from real accounts.</p>
    </>
  )
}
