import React, { useState, useEffect } from 'react';
import { productionApi } from '@/api/production';
import { DataTable, MonthFilter } from '@/components/ui/DataTable';

interface Row {
  id: string;
  design: string;
  shorts: number;
  shortUnit: number;
  total: number;
  entryDate: string;
  monthBelongs: string;
}

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

interface Props { refreshKey?: number; }

export const ProductionTable: React.FC<Props> = ({ refreshKey }) => {
  const [data, setData]       = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth]     = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await productionApi.getAll(month ? { monthBelongs: month } : undefined);
        setData(res.data ?? []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [month, refreshKey]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await productionApi.delete(id);
      setData(prev => prev.filter(r => r.id !== id));
    } catch (err) { console.error(err); }
  };

  const grandTotal = data.reduce((s, r) => s + r.total, 0);

  const columns = [
    { header: '#',          render: (_: Row, i: number) => <span className="text-xs text-gray-300 tabular-nums">{i + 1}</span> },
    { header: 'Design',     render: (r: Row) => <span className="text-sm font-medium text-gray-900">{r.design}</span> },
    { header: 'Shorts',     render: (r: Row) => <span className="text-sm text-gray-700 tabular-nums">{r.shorts}</span> },
    { header: 'Short Unit', render: (r: Row) => <span className="text-sm text-gray-700 tabular-nums">{r.shortUnit}</span> },
    { header: 'Total',      render: (r: Row) => <span className="text-sm font-semibold text-gray-900 tabular-nums">{r.total.toLocaleString('en-IN')}</span> },
    { header: 'Entry Date', render: (r: Row) => <span className="text-sm text-gray-500">{fmtDate(r.entryDate)}</span> },
    { header: 'Month',      render: (r: Row) => <span className="text-sm text-gray-500">{r.monthBelongs}</span> },
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
        minWidth={620}
        footer={
          data.length > 0 ? (
            <>
              <td colSpan={4} className="pl-6 py-3 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Total</td>
              <td className="px-4 py-3 text-sm font-bold text-white tabular-nums">{grandTotal.toLocaleString('en-IN')}</td>
              <td colSpan={3} />
            </>
          ) : undefined
        }
      />
    </div>
  );
};
