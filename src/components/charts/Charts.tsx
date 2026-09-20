import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { usePrefersReducedMotion } from '@/hooks/useReducedMotion'
import { C } from './theme'
import { cn } from '@/lib/cn'

export interface Series { key: string; label: string; color: string }

function ChartTooltip({ active, payload, label, fmt }: { active?: boolean; payload?: { name?: string; value?: number; color?: string; dataKey?: string }[]; label?: string; fmt?: (v: number, key: string) => string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="panel-raised min-w-32 px-3 py-2 text-xs">
      <div className="mb-1 font-medium text-fg">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted"><span className="h-2 w-2 rounded-full" style={{ background: p.color }} />{p.name}</span>
          <span className="tabular text-fg">{fmt ? fmt(p.value ?? 0, String(p.dataKey)) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

const axisProps = { stroke: C.axis, tickLine: false, axisLine: false, fontSize: 11 } as const

export function AreaTrend({ data, xKey, series, height = 260, fmt, yFormat, legend = true }: { data: object[]; xKey: string; series: Series[]; height?: number; fmt?: (v: number, key: string) => string; yFormat?: (v: number) => string; legend?: boolean }) {
  const reduced = usePrefersReducedMotion()
  return (
    <div style={{ height }} role="img" aria-label={`Area chart of ${series.map((s) => s.label).join(', ')}`}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={s.color} stopOpacity={0.22} /><stop offset="1" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke={C.grid} vertical={false} />
          <XAxis dataKey={xKey} {...axisProps} dy={6} />
          <YAxis {...axisProps} tickFormatter={yFormat} width={48} />
          <Tooltip content={<ChartTooltip fmt={fmt} />} cursor={{ stroke: C.grid }} />
          {legend && series.length > 1 && <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 12, color: C.axis, paddingTop: 8 }} />}
          {series.map((s) => (
            <Area key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={1.75} fill={`url(#g-${s.key})`} isAnimationActive={!reduced} animationDuration={900} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function LineTrend({ data, xKey, series, height = 260, fmt, yFormat }: { data: object[]; xKey: string; series: Series[]; height?: number; fmt?: (v: number, key: string) => string; yFormat?: (v: number) => string }) {
  const reduced = usePrefersReducedMotion()
  return (
    <div style={{ height }} role="img" aria-label={`Line chart of ${series.map((s) => s.label).join(', ')}`}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke={C.grid} vertical={false} />
          <XAxis dataKey={xKey} {...axisProps} dy={6} />
          <YAxis {...axisProps} tickFormatter={yFormat} width={48} />
          <Tooltip content={<ChartTooltip fmt={fmt} />} cursor={{ stroke: C.grid }} />
          <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 12, color: C.axis, paddingTop: 8 }} />
          {series.map((s) => <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={1.75} dot={false} activeDot={{ r: 3 }} isAnimationActive={!reduced} animationDuration={900} />)}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BarTrend({ data, xKey, series, height = 260, stacked, fmt, yFormat, colorByIndex }: { data: object[]; xKey: string; series: Series[]; height?: number; stacked?: boolean; fmt?: (v: number, key: string) => string; yFormat?: (v: number) => string; colorByIndex?: string[] }) {
  const reduced = usePrefersReducedMotion()
  return (
    <div style={{ height }} role="img" aria-label={`Bar chart of ${series.map((s) => s.label).join(', ')}`}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid stroke={C.grid} vertical={false} />
          <XAxis dataKey={xKey} {...axisProps} dy={6} />
          <YAxis {...axisProps} tickFormatter={yFormat} width={48} />
          <Tooltip content={<ChartTooltip fmt={fmt} />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          {series.length > 1 && <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 12, color: C.axis, paddingTop: 8 }} />}
          {series.map((s, si) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} stackId={stacked ? 'a' : undefined} radius={stacked ? 0 : [3, 3, 0, 0]} isAnimationActive={!reduced} animationDuration={800}>
              {colorByIndex && si === 0 && data.map((_, i) => <Cell key={i} fill={colorByIndex[i % colorByIndex.length]} />)}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Plain horizontal bars: precise, readable, and accessible without a chart library. */
export function HBars({ items, className, color = C.sand }: { items: { label: string; value: number; display: string; color?: string }[]; className?: string; color?: string }) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <ul className={cn('space-y-3', className)}>
      {items.map((i) => (
        <li key={i.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[13px]"><span className="truncate">{i.label}</span><span className="tabular shrink-0 text-muted">{i.display}</span></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-3"><div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${(i.value / max) * 100}%`, background: i.color ?? color }} /></div>
        </li>
      ))}
    </ul>
  )
}

export function Sparkline({ values, className, stroke = C.sand, fill = true }: { values: number[]; className?: string; stroke?: string; fill?: boolean }) {
  const w = 120, h = 32
  const min = Math.min(...values), max = Math.max(...values)
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - 3 - ((v - min) / (max - min || 1)) * (h - 6)] as const)
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn('h-8 w-full', className)} preserveAspectRatio="none" aria-hidden>
      {fill && <path d={`${d} L${w} ${h} L0 ${h}Z`} fill={stroke} opacity=".1" />}
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
