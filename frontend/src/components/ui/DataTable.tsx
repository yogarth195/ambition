import React from 'react';
import { Trash2 } from 'lucide-react';

export interface Column<T> {
  header: string;
  render: (row: T, i: number) => React.ReactNode;
  className?: string;
}

interface Props<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  onDelete?: (id: string) => void;
  footer?: React.ReactNode;
  minWidth?: number;
}

const inputCls =
  'rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400';

export function MonthFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Month</label>
      <input type="month" value={value} onChange={e => onChange(e.target.value)} className={inputCls} />
      {value && (
        <button onClick={() => onChange('')} className="text-[11px] text-gray-400 hover:text-gray-600">
          Clear
        </button>
      )}
    </div>
  );
}

export function DateRangeFilter({
  startDate,
  endDate,
  onChange,
}: {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">From</label>
      <input type="date" value={startDate} onChange={e => onChange(e.target.value, endDate)} className={inputCls} />
      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">To</label>
      <input type="date" value={endDate} onChange={e => onChange(startDate, e.target.value)} className={inputCls} />
      {(startDate || endDate) && (
        <button onClick={() => onChange('', '')} className="text-[11px] text-gray-400 hover:text-gray-600">
          Clear
        </button>
      )}
    </div>
  );
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  onDelete,
  footer,
  minWidth = 500,
}: Props<T>) {
  const colCount = columns.length + (onDelete ? 1 : 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ minWidth }}>
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {columns.map(col => (
              <th
                key={col.header}
                className={`px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
            {onDelete && <th className="w-10" />}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={colCount} className="px-4 py-8 text-center text-sm text-gray-400">Loading…</td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="px-4 py-8 text-center text-sm text-gray-400">No entries found</td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id}
                className={`group border-b border-gray-50 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
              >
                {columns.map((col, ci) => (
                  <td key={ci} className={`px-4 py-2.5 ${col.className ?? ''}`}>
                    {col.render(row, i)}
                  </td>
                ))}
                {onDelete && (
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => onDelete(row.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>

        {footer && (
          <tfoot>
            <tr className="bg-slate-900">{footer}</tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
