import React, { useEffect, useMemo, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';
import {
  KPI_SERIES_TABLES, KpiGranularity, KpiSeriesRow, KpiSeriesTable, kpiSeriesApi,
} from '@/api/kpiSeries';

type ChartType = 'line' | 'bar';

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Mirrors the backend's own custom-range rule (kpi.schema.ts): both dates
 * required together, from <= to, and — the reason for this validator —
 * neither may be in the future, since no data can exist for a date that
 * hasn't happened yet. Checked client-side so an invalid range never
 * reaches the network.
 */
function validateDateRange(from: string, to: string): string | null {
  if (!from && !to) return null;
  if (!from || !to) return 'Both From and To dates are required.';
  const max = today();
  if (from > max || to > max) return 'Dates cannot be in the future.';
  if (from > to) return 'From date must be before To date.';
  return null;
}

/**
 * Fixed categorical color per table — identity, not rank. A table keeps its
 * color whether it's shown alone or alongside seven others, so toggling one
 * series never repaints the rest. Validated 8-slot palette (dataviz skill);
 * "sale" is excluded — the PRD deprioritizes it, and a 9th series would force
 * reusing a hue, breaking the colorblind-safety guarantee of the 8-slot set.
 */
const TABLE_META: Record<KpiSeriesTable, { label: string; color: string }> = {
  production: { label: 'Production', color: '#2a78d6' },
  trimmer:    { label: 'Trimmer',    color: '#eb6834' },
  buffing:    { label: 'Buffing',    color: '#1baf7a' },
  repair:     { label: 'Repair',     color: '#eda100' },
  packed:     { label: 'Packed',     color: '#e87ba4' },
  quantity:   { label: 'Quantity',   color: '#008300' },
  labour:     { label: 'Labour',     color: '#4a3aa7' },
  misc:       { label: 'Misc',       color: '#e34948' },
};

const GRANULARITIES: { value: KpiGranularity; label: string }[] = [
  { value: 'day',   label: 'Day' },
  { value: 'month', label: 'Month' },
  { value: 'year',  label: 'Year' },
];

interface TooltipPayloadEntry {
  dataKey: KpiSeriesTable;
  value:   number;
}

interface ComparisonTooltipProps {
  active?:  boolean;
  payload?: TooltipPayloadEntry[];
  label?:   string;
  tables:   KpiSeriesTable[];
}

/** Values lead, series name follows; a line-key (not a box) carries identity — per dataviz skill. */
const ComparisonTooltip: React.FC<ComparisonTooltipProps> = ({ active, payload, label, tables }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-[11px] text-gray-400 mb-1.5">{label}</p>
      <div className="space-y-1">
        {tables.map(table => {
          const entry = payload.find(p => p.dataKey === table);
          if (!entry) return null;
          return (
            <div key={table} className="flex items-center gap-2 text-xs">
              <span className="inline-block h-0.5 w-3 shrink-0 rounded-full" style={{ backgroundColor: TABLE_META[table].color }} />
              <span className="text-gray-500">{TABLE_META[table].label}</span>
              <span className="ml-auto font-semibold text-gray-900 tabular-nums">{entry.value.toLocaleString('en-IN')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** The relief channel the dataviz skill requires for the palette's sub-3:1 hues (aqua/yellow/magenta): a plain table, always reachable. */
const TableView: React.FC<{ data: KpiSeriesRow[]; tables: KpiSeriesTable[] }> = ({ data, tables }) => (
  <div className="max-h-80 overflow-auto rounded-lg border border-gray-100">
    <table className="w-full text-xs">
      <thead>
        <tr className="sticky top-0 border-b border-gray-100 bg-gray-50/80">
          <th className="px-3 py-2 text-left font-semibold text-gray-400 uppercase tracking-wider">Period</th>
          {tables.map(table => (
            <th key={table} className="px-3 py-2 text-right font-semibold text-gray-400 uppercase tracking-wider">
              {TABLE_META[table].label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.period} className="border-b border-gray-50 last:border-0">
            <td className="px-3 py-2 text-gray-500">{row.period}</td>
            {tables.map(table => (
              <td key={table} className="px-3 py-2 text-right tabular-nums text-gray-900">
                {row[table].toLocaleString('en-IN')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export interface ComparisonChartProps {
  title?:              string;
  defaultTables?:      KpiSeriesTable[];
  defaultGranularity?: KpiGranularity;
}

/**
 * Reusable time-comparison chart: pick any of the 8 domain tables, a
 * granularity (day/month/year), and an optional date range — it fetches
 * from the always-consistent /kpi/series endpoint and plots one line per
 * selected table, X = time, Y = value.
 */
export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  title = 'Metrics comparison',
  defaultTables = ['production', 'trimmer', 'buffing', 'repair'],
  defaultGranularity = 'month',
}) => {
  const { isAuthenticated } = useAuth();

  const [selectedTables, setSelectedTables] = useState<KpiSeriesTable[]>(defaultTables);
  const [granularity, setGranularity]       = useState<KpiGranularity>(defaultGranularity);
  const [chartType, setChartType]           = useState<ChartType>('line');

  // Draft dates track the inputs as you type; applied dates are what's actually
  // fetched — they only change when you click "Apply filter", and only once
  // the range passes validation (never for an invalid or future-dated range).
  const [draftFromDate, setDraftFromDate]     = useState('');
  const [draftToDate, setDraftToDate]         = useState('');
  const [appliedFromDate, setAppliedFromDate] = useState('');
  const [appliedToDate, setAppliedToDate]     = useState('');

  const [data, setData]           = useState<KpiSeriesRow[] | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  const dateError = useMemo(() => validateDateRange(draftFromDate, draftToDate), [draftFromDate, draftToDate]);
  const isDirty   = draftFromDate !== appliedFromDate || draftToDate !== appliedToDate;

  const applyDateFilter = () => {
    if (dateError) return;
    setAppliedFromDate(draftFromDate);
    setAppliedToDate(draftToDate);
  };

  useEffect(() => {
    if (!isAuthenticated || selectedTables.length === 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    kpiSeriesApi
      .get({ tables: selectedTables, granularity, startDate: appliedFromDate || undefined, endDate: appliedToDate || undefined })
      .then(res => { if (!cancelled) setData(res.series); })
      .catch((err: { response?: { data?: { message?: string } } }) => {
        if (cancelled) return;
        setError(err?.response?.data?.message ?? 'Failed to load comparison data.');
        setData(null);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [selectedTables, granularity, appliedFromDate, appliedToDate, isAuthenticated]);

  const toggleTable = (table: KpiSeriesTable) => {
    setSelectedTables(prev => {
      const next = prev.includes(table) ? prev.filter(t => t !== table) : [...prev, table];
      return KPI_SERIES_TABLES.filter(t => next.includes(t));
    });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {data && data.length > 0 && selectedTables.length > 0 && (
          <button
            onClick={() => setShowTable(v => !v)}
            className="text-xs font-medium text-amber-600 transition-colors hover:text-amber-700"
          >
            {showTable ? 'Show chart' : 'Show table'}
          </button>
        )}
      </div>

      {/* Filters — one row, above the chart */}
      <div className="mb-5 flex flex-wrap items-center gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          {GRANULARITIES.map(g => (
            <button
              key={g.value}
              onClick={() => setGranularity(g.value)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                granularity === g.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setChartType('line')}
            title="Line chart"
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors',
              chartType === 'line' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <LineChartIcon className="h-3.5 w-3.5" /> Line
          </button>
          <button
            onClick={() => setChartType('bar')}
            title="Bar chart"
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors',
              chartType === 'bar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <BarChart3 className="h-3.5 w-3.5" /> Bar
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-gray-500">
              From
              <input
                type="date"
                value={draftFromDate}
                max={today()}
                onChange={e => setDraftFromDate(e.target.value)}
                className={cn(
                  'rounded-md border px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-400',
                  dateError ? 'border-red-300' : 'border-gray-200',
                )}
              />
            </label>
            <label className="flex items-center gap-1.5 text-xs text-gray-500">
              To
              <input
                type="date"
                value={draftToDate}
                max={today()}
                onChange={e => setDraftToDate(e.target.value)}
                className={cn(
                  'rounded-md border px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-400',
                  dateError ? 'border-red-300' : 'border-gray-200',
                )}
              />
            </label>
            <button
              onClick={applyDateFilter}
              disabled={!!dateError || !isDirty}
              className="rounded-md bg-amber-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Apply filter
            </button>
          </div>
          {dateError && <span className="text-[11px] text-red-500">{dateError}</span>}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {KPI_SERIES_TABLES.map(table => {
            const active = selectedTables.includes(table);
            return (
              <button
                key={table}
                onClick={() => toggleTable(table)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                  active ? 'border-transparent text-white' : 'border-gray-200 text-gray-500 hover:border-gray-300',
                )}
                style={active ? { backgroundColor: TABLE_META[table].color } : undefined}
              >
                {!active && (
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: TABLE_META[table].color }} />
                )}
                {TABLE_META[table].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      {selectedTables.length === 0 ? (
        <div className="flex h-80 items-center justify-center text-sm text-gray-400">
          Select at least one metric to compare.
        </div>
      ) : loading && !data ? (
        <div className="flex h-80 items-center justify-center">
          <LoadingSpinner size="md" label="Loading comparison data…" />
        </div>
      ) : error ? (
        <div className="flex h-80 items-center justify-center text-sm text-red-500">{error}</div>
      ) : !data || data.length === 0 ? (
        <div className="flex h-80 items-center justify-center text-sm text-gray-400">No data for this range.</div>
      ) : (
        <div className="relative">
          {/* Refetch (granularity/table toggle) keeps the previous render visible, dimmed, with a spinner overlay — no flash, no layout jump. */}
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
              <LoadingSpinner size="sm" />
            </div>
          )}
          <div className={cn('transition-opacity duration-150', loading && 'pointer-events-none opacity-50')}>
            {showTable ? (
              <TableView data={data} tables={selectedTables} />
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                {chartType === 'bar' ? (
                  <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }} barGap={2} barCategoryGap="20%">
                    <CartesianGrid stroke="#e1e0d9" vertical={false} />
                    <XAxis
                      dataKey="period"
                      tick={{ fill: '#898781', fontSize: 11 }}
                      axisLine={{ stroke: '#c3c2b7' }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fill: '#898781', fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
                    <Tooltip content={<ComparisonTooltip tables={selectedTables} />} cursor={{ fill: '#f9f9f7' }} />
                    {selectedTables.length > 1 && (
                      <Legend
                        iconType="rect"
                        wrapperStyle={{ fontSize: 12, color: '#52514e', paddingTop: 12 }}
                        formatter={(value: string) => TABLE_META[value as KpiSeriesTable]?.label ?? value}
                      />
                    )}
                    {selectedTables.map(table => (
                      <Bar
                        key={table}
                        dataKey={table}
                        name={table}
                        fill={TABLE_META[table].color}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={24}
                      />
                    ))}
                  </BarChart>
                ) : (
                  <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid stroke="#e1e0d9" vertical={false} />
                    <XAxis
                      dataKey="period"
                      tick={{ fill: '#898781', fontSize: 11 }}
                      axisLine={{ stroke: '#c3c2b7' }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fill: '#898781', fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
                    <Tooltip content={<ComparisonTooltip tables={selectedTables} />} />
                    {selectedTables.length > 1 && (
                      <Legend
                        iconType="line"
                        wrapperStyle={{ fontSize: 12, color: '#52514e', paddingTop: 12 }}
                        formatter={(value: string) => TABLE_META[value as KpiSeriesTable]?.label ?? value}
                      />
                    )}
                    {selectedTables.map(table => (
                      <Line
                        key={table}
                        type="monotone"
                        dataKey={table}
                        name={table}
                        stroke={TABLE_META[table].color}
                        strokeWidth={2}
                        dot={{ r: 4, fill: TABLE_META[table].color, stroke: '#fcfcfb', strokeWidth: 2 }}
                        activeDot={{ r: 6, stroke: '#fcfcfb', strokeWidth: 2 }}
                      />
                    ))}
                  </LineChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
