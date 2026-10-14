import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ImpactRecord, MetricKey } from '../types'
import type { SponsorSummary } from '../lib/metrics'
import { formatCompact, formatDate, formatNumber, formatShortDate } from '../lib/format'

const BRAND = '#0f766e'
const MUTED = '#cbd5e1'
const AXIS_TEXT = '#475569'

interface Datum {
  id: string
  label: string
  event: string
  date: string
  value: number
}

function TooltipCard({ title, subtitle, metricLabel, value }: { title: string; subtitle?: string; metricLabel: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-xl shadow-slate-900/10">
      <p className="font-semibold text-slate-900">{title}</p>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      <p className="mt-1.5 flex items-center gap-2 text-slate-700">
        <span className="size-2.5 rounded-sm bg-brand-700" aria-hidden />
        {metricLabel}: <span className="font-semibold tabular-nums text-slate-900">{formatNumber(value)}</span>
      </p>
    </div>
  )
}

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s
}

/** Two-line x-axis tick: date, then a shortened event name (dropped when there are many bars). */
function EventTick({ x, y, payload, data, showNames, maxChars }: { x?: number; y?: number; payload?: { value: string; index: number }; data: Datum[]; showNames: boolean; maxChars: number }) {
  const d = payload ? data[payload.index] : undefined
  if (!d) return null
  return (
    <g transform={`translate(${x},${y})`}>
      <text dy={14} textAnchor="middle" fill="#0f172a" fontSize={12.5} fontWeight={600}>
        {formatShortDate(d.date)}
      </text>
      {showNames && (
        <text dy={31} textAnchor="middle" fill={AXIS_TEXT} fontSize={12}>
          {truncate(d.event, maxChars)}
        </text>
      )}
    </g>
  )
}

/** Single-series bar chart: one bar per sponsored event, in date order. */
export function ImpactChart({ records, metric, metricLabel }: { records: ImpactRecord[]; metric: MetricKey; metricLabel: string }) {
  const data: Datum[] = [...records]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({ id: r.id, label: r.id, event: r.event, date: r.date, value: r[metric] }))
  const showNames = data.length <= 7
  // Fewer bars leave more room under each one for the event name.
  const maxChars = Math.max(14, Math.floor(124 / Math.max(data.length, 1)))

  return (
    <div className="h-80 w-full 2xl:h-96" role="img" aria-label={`${metricLabel} per sponsored event, in date order`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 28, right: 8, bottom: showNames ? 22 : 4, left: 0 }} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke="#eef2f6" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
            interval={0}
            tick={(props: object) => <EventTick {...props} data={data} showNames={showNames} maxChars={maxChars} />}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: AXIS_TEXT, fontSize: 12 }}
            tickFormatter={(v: number) => formatCompact(v)}
            width={44}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: '#f1f5f9', radius: 6 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload as Datum
              return <TooltipCard title={d.event} subtitle={formatDate(d.date)} metricLabel={metricLabel} value={d.value} />
            }}
          />
          <Bar dataKey="value" name={metricLabel} fill={BRAND} radius={[6, 6, 0, 0]} maxBarSize={64} animationDuration={450}>
            <LabelList dataKey="value" position="top" offset={8} formatter={(v: unknown) => formatNumber(Number(v))} fill="#0f172a" fontSize={12.5} fontWeight={600} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Horizontal bars for every sponsor on the chosen metric; the selected sponsor is highlighted. Click a bar to switch. */
export function SponsorComparisonChart({
  summaries,
  metric,
  metricLabel,
  selected,
  onSelect,
}: {
  summaries: SponsorSummary[]
  metric: MetricKey
  metricLabel: string
  selected: string
  onSelect: (sponsor: string) => void
}) {
  const data = [...summaries].sort((a, b) => b[metric] - a[metric]).map((s) => ({ sponsor: s.sponsor, value: s[metric] }))
  const height = Math.max(160, data.length * 60 + 20)

  return (
    <div className="w-full" style={{ height }} role="img" aria-label={`${metricLabel} by sponsor, ${selected} highlighted`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 64, bottom: 0, left: 0 }} barCategoryGap="28%">
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="sponsor"
            tickLine={false}
            axisLine={false}
            width={176}
            tick={({ x, y, payload }: { x?: number | string; y?: number | string; payload?: { value: string } }) => (
              <text
                x={x}
                y={y}
                dy={4}
                textAnchor="end"
                fontSize={13}
                fontWeight={payload?.value === selected ? 700 : 500}
                fill={payload?.value === selected ? '#0f172a' : AXIS_TEXT}
              >
                {truncate(payload?.value ?? '', 24)}
              </text>
            )}
          />
          <Tooltip
            cursor={{ fill: '#f1f5f9', radius: 6 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload as { sponsor: string; value: number }
              return (
                <TooltipCard
                  title={d.sponsor}
                  subtitle={d.sponsor === selected ? 'Currently selected' : 'Click to view this sponsor'}
                  metricLabel={metricLabel}
                  value={d.value}
                />
              )
            }}
          />
          <Bar
            dataKey="value"
            radius={[0, 6, 6, 0]}
            maxBarSize={30}
            animationDuration={450}
            cursor="pointer"
            onClick={(d: { payload?: { sponsor: string } }) => d.payload && onSelect(d.payload.sponsor)}
          >
            {data.map((d) => (
              <Cell key={d.sponsor} fill={d.sponsor === selected ? BRAND : MUTED} />
            ))}
            {/* Exact values, so they match the KPI cards when presented */}
            <LabelList dataKey="value" position="right" offset={8} formatter={(v: unknown) => formatNumber(Number(v))} fill="#0f172a" fontSize={12.5} fontWeight={600} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
