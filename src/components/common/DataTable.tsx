import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import type { LucideIcon } from 'lucide-react'

export interface Column<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  align?: 'left' | 'right'
  className?: string
  /** value used for sorting; omit to make the column unsortable */
  sortValue?: (row: T) => string | number
  /** on small screens: 'title' becomes the card heading, 'hide' removes the column, default shows label + value */
  mobile?: 'title' | 'hide' | 'default'
}

interface Props<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  pageSize?: number
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: LucideIcon
  emptyAction?: ReactNode
  caption: string
  dense?: boolean
}

/** Table on ≥md, stacked cards on mobile. Sorting and pagination are client-side for demo data. */
export function DataTable<T>({ columns, rows, rowKey, onRowClick, pageSize = 12, emptyTitle = 'Nothing here yet', emptyDescription, emptyIcon, emptyAction, caption, dense }: Props<T>) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null)
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sort?.key)
    if (!col?.sortValue || !sort) return rows
    const sv = col.sortValue
    return [...rows].sort((a, b) => { const x = sv(a), y = sv(b); return (x < y ? -1 : x > y ? 1 : 0) * sort.dir })
  }, [rows, columns, sort])

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, pages - 1)
  const visible = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize)

  if (!rows.length) return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} action={emptyAction} />

  const title = columns.find((c) => c.mobile === 'title') ?? columns[0]!
  const mobileCols = columns.filter((c) => c !== title && c.mobile !== 'hide')
  const activate = (e: React.KeyboardEvent, row: T) => { if (onRowClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onRowClick(row) } }

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              {columns.map((c) => {
                const active = sort?.key === c.key
                return (
                  <th key={c.key} scope="col" aria-sort={active ? (sort!.dir === 1 ? 'ascending' : 'descending') : undefined} className={cn('whitespace-nowrap px-4 py-2.5 font-medium', c.align === 'right' && 'text-right', c.className)}>
                    {c.sortValue ? (
                      <button onClick={() => setSort(active && sort!.dir === -1 ? null : { key: c.key, dir: active ? -1 : 1 })} className="inline-flex items-center gap-1 hover:text-fg">
                        {c.header}
                        {active && (sort!.dir === 1 ? <ArrowUp className="h-3 w-3" aria-hidden /> : <ArrowDown className="h-3 w-3" aria-hidden />)}
                      </button>
                    ) : c.header}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={rowKey(row)} tabIndex={onRowClick ? 0 : undefined} onClick={() => onRowClick?.(row)} onKeyDown={(e) => activate(e, row)}
                className={cn('border-b border-line/70 last:border-0', onRowClick && 'cursor-pointer transition-colors hover:bg-surface-2/70 focus-visible:bg-surface-2')}>
                {columns.map((c) => (
                  <td key={c.key} className={cn('px-4 align-middle', dense ? 'py-2' : 'py-3', c.align === 'right' && 'text-right tabular', c.className)}>{c.cell(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-line md:hidden" aria-label={caption}>
        {visible.map((row) => (
          <li key={rowKey(row)} tabIndex={onRowClick ? 0 : undefined} onClick={() => onRowClick?.(row)} onKeyDown={(e) => activate(e, row)}
            className={cn('px-4 py-3.5', onRowClick && 'active:bg-surface-2')}>
            <div className="text-sm font-medium">{title.cell(row)}</div>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px]">
              {mobileCols.map((c) => (
                <div key={c.key} className="min-w-0">
                  <dt className="text-2xs text-muted">{c.header}</dt>
                  <dd className="truncate">{c.cell(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-line px-4 py-3 text-[13px] text-muted">
          <span className="tabular">{safePage * pageSize + 1}–{Math.min(sorted.length, (safePage + 1) * pageSize)} of {sorted.length}</span>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" aria-label="Previous page" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" aria-label="Next page" disabled={safePage >= pages - 1} onClick={() => setPage(safePage + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  )
}
