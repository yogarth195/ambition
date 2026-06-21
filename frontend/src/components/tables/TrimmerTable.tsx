import React, { useState, useEffect } from 'react';
import { trimmerApi } from '@/api/trimmer';
import { DataTable, MonthFilter } from '@/components/ui/DataTable';

interface Row {
  id: string;
  item: string;
  value: number;
  finalValue: number;
  lastMonthRemaining: number;
  entryDate: string;
  monthBelongs: string;
  forRange?: string;
}

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

interface Props { refreshKey?: number; }

export const TrimmerTable: React.FC<Props> = ({ refreshKey }) => {
  const [data, setData]       = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth]     = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await trimmerApi.getAll(month ? { monthBelongs: month } : undefined);
        setData(res.data ?? []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [month, refreshKey]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await trimmerApi.delete(id);
      setData(prev => prev.filter(r => r.id !== id));
    } catch (err) { console.error(err); }
  };

  const total = data.reduce((s, r) => s + r.finalValue, 0);

  const columns = [
    { header: '#',            render: (_: Row, i: number) => <span className="text-xs text-gray-300 tabular-nums">{i + 1}</span> },
    { header: 'Item',         render: (r: Row) => <span className="text-sm text-gray-900">{r.item}</span> },
    { header: 'Value',        render: (r: Row) => <span className="text-sm text-gray-700 tabular-nums">{r.value.toLocaleString('en-IN')}</span> },
    { header: 'Last Month',   render: (r: Row) => <span className="text-sm text-gray-500 tabular-nums">{r.lastMonthRemaining.toLocaleString('en-IN')}</span> },
    { header: 'Final',        render: (r: Row) => <span className="text-sm font-semibold text-gray-900 tabular-nums">{r.finalValue.toLocaleString('en-IN')}</span> },
    { header: 'Range',        render: (r: Row) => <span className="text-sm text-gray-400">{r.forRange ?? '—'}</span> },
    { header: 'Entry Date',   render: (r: Row) => <span className="text-sm text-gray-500">{fmtDate(r.entryDate)}</span> },
    { header: 'Month',        render: (r: Row) => <span className="text-sm text-gray-500">{r.monthBelongs}</span> },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-gray-400">{data.length} entries</p>
        <MonthFilter value={month} onChange={setMonth} />
      </div>
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        onDelete={handleDelete}
        minWidth={700}
        footer={
          data.length > 0 ? (
            <>
              <td colSpan={4} className="pl-6 py-3 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Total (Final)</td>
              <td className="px-4 py-3 text-sm font-bold text-white tabular-nums">{total.toLocaleString('en-IN')}</td>
              <td colSpan={4} />
            </>
          ) : undefined
        }
      />
    </div>
  );
};
