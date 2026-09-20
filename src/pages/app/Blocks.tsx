import { Plus, QrCode, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BlockCard } from '@/components/blocks/BlockCard'
import { AddBlockModal } from '@/components/blocks/AddBlockModal'
import { activeFilterCount, BlockFilterPanel, DEFAULT_FILTERS, SearchBox } from '@/components/blocks/BlockFilters'
import { useQuarryScope } from '@/components/common/QuarryScope'
import { DataTable, type Column } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { SkeletonCards, SkeletonRows } from '@/components/ui/Skeleton'
import { Segmented } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/Toast'
import { useAsync } from '@/hooks/useAsync'
import { api, type BlockFilters } from '@/services/api'
import type { Block } from '@/types/models'
import { inr, inrCompact, num } from '@/lib/format'
import { Box } from 'lucide-react'
import { motion } from 'framer-motion'
import { listContainer, listItem } from '@/components/common/Motion'

export default function Blocks() {
  const { quarryId } = useQuarryScope()
  const toast = useToast()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<BlockFilters>(DEFAULT_FILTERS)
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [adding, setAdding] = useState(false)
  const applied = { ...filters, quarryId }
  const { data, loading, error, reload } = useAsync(() => api.blocks.list(applied), [JSON.stringify(applied)])
  const count = activeFilterCount(filters)
  const value = data?.reduce((s, b) => s + b.price, 0) ?? 0

  const columns: Column<Block>[] = [
    { key: 'id', header: 'Block', mobile: 'title', sortValue: (b) => b.id, cell: (b) => <span className="font-mono text-[13px]">{b.id} <span className="ml-2 font-sans text-muted">{b.type}</span></span> },
    { key: 'dims', header: 'Dimensions (ft)', cell: (b) => <span className="font-mono text-[13px]">{b.lengthFt} × {b.widthFt} × {b.heightFt}</span> },
    { key: 'vol', header: 'Volume', align: 'right', sortValue: (b) => b.volumeCft, cell: (b) => `${num(b.volumeCft, 1)} cft` },
    { key: 'wt', header: 'Weight', align: 'right', mobile: 'hide', sortValue: (b) => b.weightT, cell: (b) => `${b.weightT} t` },
    { key: 'loc', header: 'Location', cell: (b) => b.location },
    { key: 'status', header: 'Status', sortValue: (b) => b.status, cell: (b) => <StatusBadge status={b.status} /> },
    { key: 'price', header: 'Price', align: 'right', sortValue: (b) => b.price, cell: (b) => <span className="font-medium">{inr(b.price)}</span> },
  ]

  return (
    <>
      <PageHeader title="Blocks" description="Every block from the quarry face to the customer's gate."
        actions={<>
          <Button icon={QrCode} onClick={() => toast({ tone: 'info', title: 'Camera scanning is coming soon', description: 'Scanning a block tag will open its record here. For now, tags open the public block page.' })}>Scan QR</Button>
          <Button variant="primary" icon={Plus} onClick={() => setAdding(true)}>Add block</Button>
        </>} />

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block"><div className="sticky top-20 rounded-xl border border-line bg-surface p-5"><BlockFilterPanel filters={filters} onChange={setFilters} /></div></aside>

        <section aria-label="Block results" className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1"><SearchBox value={filters.q ?? ''} onChange={(q) => setFilters((f) => ({ ...f, q }))} /></div>
            <div className="flex items-center gap-2">
              <Button className="lg:hidden" icon={SlidersHorizontal} onClick={() => setShowFilters(true)}>Filters{count ? ` (${count})` : ''}</Button>
              <label className="sr-only" htmlFor="sort">Sort blocks</label>
              <Select id="sort" className="h-9 w-40" value={filters.sort} onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as BlockFilters['sort'] }))}>
                <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="price_desc">Price, high to low</option><option value="price_asc">Price, low to high</option><option value="volume_desc">Largest volume</option>
              </Select>
              <Segmented label="View" value={view} onChange={setView} options={[{ value: 'grid', label: 'Cards' }, { value: 'table', label: 'Table' }]} />
            </div>
          </div>

          <p className="mb-4 text-[13px] text-muted" aria-live="polite">{loading ? 'Loading blocks…' : `${data?.length ?? 0} blocks · ${inrCompact(value)} list value`}</p>

          {error ? <ErrorState message={error.message} onRetry={reload} />
            : loading ? (view === 'grid' ? <SkeletonCards /> : <SkeletonRows />)
            : !data?.length ? (
              <div className="rounded-xl border border-dashed border-line-strong py-16 text-center">
                <Box className="mx-auto h-6 w-6 text-sand" aria-hidden /><p className="mt-3 font-medium">No blocks match these filters</p>
                <p className="mt-1 text-sm text-muted">Try removing a filter or searching for a different ID.</p>
                <Button className="mt-4" onClick={() => setFilters({ ...DEFAULT_FILTERS })}>Clear filters</Button>
              </div>
            ) : view === 'grid' ? (
              <motion.div key={JSON.stringify(applied)} variants={listContainer} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data.slice(0, 48).map((b) => <motion.div key={b.id} variants={listItem}><BlockCard block={b} /></motion.div>)}
              </motion.div>
            ) : (
              <div className="panel overflow-hidden"><DataTable caption="Blocks" columns={columns} rows={data} rowKey={(b) => b.id} onRowClick={(b) => navigate(`/app/blocks/${b.id}`)} pageSize={15} /></div>
            )}
          {view === 'grid' && (data?.length ?? 0) > 48 && <p className="mt-6 text-center text-[13px] text-muted">Showing the first 48 blocks. Narrow the filters or switch to table view to see all {data!.length}.</p>}
        </section>
      </div>

      <Modal open={showFilters} onClose={() => setShowFilters(false)} title="Filter blocks" variant="sheet" footer={<Button variant="primary" className="w-full" onClick={() => setShowFilters(false)}>Show {data?.length ?? 0} blocks</Button>}>
        <BlockFilterPanel filters={filters} onChange={setFilters} />
      </Modal>
      <AddBlockModal open={adding} onClose={() => setAdding(false)} />
    </>
  )
}
