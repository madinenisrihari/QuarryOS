import { Search, X } from 'lucide-react'
import type { BlockFilters } from '@/services/api'
import { GRANITE_TYPES } from '@/data/blocks'
import { Select } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { TYPE_COLORS } from '@/components/charts/theme'

const chip = (on: boolean) => cn('rounded-full border px-3 py-1.5 text-[13px] transition-colors', on ? 'border-sand/50 bg-sand/10 text-sand' : 'border-line-strong text-muted hover:text-fg')

export const DEFAULT_FILTERS: BlockFilters = { status: 'all', size: 'all', location: 'all', sort: 'newest', types: [], colors: [] }
export const activeFilterCount = (f: BlockFilters) =>
  (f.types?.length ? 1 : 0) + (f.colors?.length ? 1 : 0) + (f.status && f.status !== 'all' ? 1 : 0) + (f.size && f.size !== 'all' ? 1 : 0) + (f.maxPrice ? 1 : 0) + (f.location && f.location !== 'all' ? 1 : 0) + (f.extractedWithinDays ? 1 : 0)

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <fieldset className="space-y-2.5"><legend className="mb-2.5 text-xs font-medium text-muted">{title}</legend>{children}</fieldset>
}

export function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden />
      <label htmlFor="block-search" className="sr-only">Search blocks</label>
      <input id="block-search" type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search by ID, type, location…"
        className="h-10 w-full rounded-lg border border-line-strong bg-surface-2/60 pl-9 pr-9 text-sm placeholder:text-subtle hover:border-fg/25 focus:border-sand/60 focus:outline-none focus:ring-2 focus:ring-sand/20" />
      {value && <button onClick={() => onChange('')} aria-label="Clear search" className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded text-muted hover:text-fg"><X className="h-3.5 w-3.5" /></button>}
    </div>
  )
}

export function BlockFilterPanel({ filters, onChange }: { filters: BlockFilters; onChange: (f: BlockFilters) => void }) {
  const set = (patch: Partial<BlockFilters>) => onChange({ ...filters, ...patch })
  const toggle = <K extends 'types' | 'colors'>(key: K, v: NonNullable<BlockFilters[K]>[number]) => {
    const cur = (filters[key] ?? []) as string[]
    set({ [key]: cur.includes(v as string) ? cur.filter((x) => x !== v) : [...cur, v] } as Partial<BlockFilters>)
  }
  return (
    <div className="space-y-6">
      <Group title="Granite type">
        <div className="flex flex-wrap gap-2">
          {GRANITE_TYPES.map((t) => (
            <button key={t} onClick={() => toggle('types', t)} aria-pressed={filters.types?.includes(t)} className={cn(chip(Boolean(filters.types?.includes(t))), 'flex items-center gap-2')}>
              <span className="h-2 w-2 rounded-full" style={{ background: TYPE_COLORS[t] }} aria-hidden />{t}
            </button>
          ))}
        </div>
      </Group>
      <Group title="Colour">
        <div className="flex flex-wrap gap-2">
          {(['Black', 'Grey', 'White', 'Brown'] as const).map((c) => <button key={c} onClick={() => toggle('colors', c)} aria-pressed={filters.colors?.includes(c)} className={chip(Boolean(filters.colors?.includes(c)))}>{c}</button>)}
        </div>
      </Group>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
        <label className="space-y-1.5 text-xs text-muted">Status
          <Select value={filters.status} onChange={(e) => set({ status: e.target.value as BlockFilters['status'] })}>
            <option value="all">Any status</option><option value="available">Available</option><option value="reserved">Reserved</option><option value="in_processing">In processing</option><option value="sold">Sold</option><option value="dispatched">Dispatched</option>
          </Select>
        </label>
        <label className="space-y-1.5 text-xs text-muted">Size
          <Select value={filters.size} onChange={(e) => set({ size: e.target.value as BlockFilters['size'] })}>
            <option value="all">Any size</option><option value="small">Small (under 150 cft)</option><option value="medium">Medium (150–220 cft)</option><option value="large">Large (over 220 cft)</option>
          </Select>
        </label>
        <label className="space-y-1.5 text-xs text-muted">Price
          <Select value={filters.maxPrice ?? ''} onChange={(e) => set({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}>
            <option value="">Any price</option><option value="150000">Up to ₹1.5L</option><option value="250000">Up to ₹2.5L</option><option value="350000">Up to ₹3.5L</option><option value="500000">Up to ₹5L</option>
          </Select>
        </label>
        <label className="space-y-1.5 text-xs text-muted">Location
          <Select value={filters.location} onChange={(e) => set({ location: e.target.value })}>
            <option value="all">Any yard</option><option value="Yard A">Yard A · Kondapi</option><option value="Yard B">Yard B · Kondapi</option><option value="Yard C">Yard C · Nagavaram</option>
          </Select>
        </label>
        <label className="col-span-2 space-y-1.5 text-xs text-muted lg:col-span-1">Extracted
          <Select value={filters.extractedWithinDays ?? ''} onChange={(e) => set({ extractedWithinDays: e.target.value ? Number(e.target.value) : undefined })}>
            <option value="">Any time</option><option value="30">Last 30 days</option><option value="60">Last 60 days</option><option value="90">Last 90 days</option>
          </Select>
        </label>
      </div>
      {activeFilterCount(filters) > 0 && <Button variant="ghost" size="sm" onClick={() => onChange({ ...DEFAULT_FILTERS, q: filters.q, sort: filters.sort, quarryId: filters.quarryId })}>Clear all filters</Button>}
    </div>
  )
}
