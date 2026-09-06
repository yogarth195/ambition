import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, Plus, Save } from 'lucide-react';
import { productionApi } from '@/api/production';
import { Button } from '@/components/ui/Button';
import { DataTable, MonthFilter } from '@/components/ui/DataTable';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { createProductionSchema } from '@/schemas/production.schema';

const SHORT_UNIT_OPTIONS = [
  { label: '6', value: 6 },
  { label: '8', value: 8 },
  { label: '10', value: 10 },
  { label: '12', value: 12 },
];

const today = new Date().toISOString().split('T')[0];
const currentMonth = today.slice(0, 7);

const rowSchema = createProductionSchema.omit({ monthBelongs: true, total: true });
const formSchema = z.object({
  monthBelongs: createProductionSchema.shape.monthBelongs,
  rows: z.array(rowSchema).min(1),
});
type FormValues = z.infer<typeof formSchema>;

interface SavedRow {
  id: string; design: string; shorts: number; shortUnit: number;
  total: number; entryDate: string; monthBelongs: string;
}

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const savedColumns = [
  { header: '#', render: (_: SavedRow, i: number) => <span className="text-xs text-gray-400 tabular-nums">{i + 1}</span> },
  { header: 'Design', render: (r: SavedRow) => <span className="text-sm font-medium text-gray-900">{r.design}</span> },
  { header: 'Shorts', render: (r: SavedRow) => <span className="text-sm text-gray-600 tabular-nums">{r.shorts}</span> },
  { header: 'Unit(Pairs per short)', render: (r: SavedRow) => <span className="text-sm text-gray-600 tabular-nums">{r.shortUnit}</span> },
  { header: 'Total', render: (r: SavedRow) => <span className="text-sm font-semibold text-gray-900 tabular-nums">{r.total.toLocaleString('en-IN')}</span> },
  { header: 'Date', render: (r: SavedRow) => <span className="text-sm text-gray-500">{fmtDate(r.entryDate)}</span> },
  { header: 'Month', render: (r: SavedRow) => <span className="text-sm text-gray-400">{r.monthBelongs}</span> },
];

const inputCls = 'w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition';
const inputErr = 'border-red-300 focus:ring-red-400';

export const ProductionEntryPage: React.FC = () => {
  const [savedData, setSavedData] = useState<SavedRow[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');

  const reloadTable = async (month: string) => {
    setTableLoading(true);
    try {
      const res = await productionApi.getAll(month ? { monthBelongs: month } : undefined);
      console.log("res: ", res);
      setSavedData(res.data ?? []);
    } catch (err) { console.error(err); }
    finally { setTableLoading(false); }
  };

  useEffect(() => { reloadTable(filterMonth); }, [filterMonth]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await productionApi.delete(id);
      setSavedData(prev => prev.filter(r => r.id !== id));
    } catch (err) { console.error(err); }
  };

  const savedGrandTotal = savedData.reduce((s, r) => s + r.total, 0);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthBelongs: currentMonth,
      rows: [{ design: '', shorts: undefined as unknown as number, shortUnit: 8, entryDate: today }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'rows' });
  const watchedRows = useWatch({ control, name: 'rows' });

  const calcTotal = (idx: number) => {
    const r = watchedRows?.[idx];
    if (!r) return null;
    const n = Number(r.shorts), u = Number(r.shortUnit);
    return n > 0 && u > 0 ? n * u : null;
  };

  const grandTotal = watchedRows?.reduce((sum, r) => {
    const n = Number(r.shorts), u = Number(r.shortUnit);
    return sum + (n > 0 && u > 0 ? n * u : 0);
  }, 0) ?? 0;

  const onSubmit = async (values: FormValues) => {
    try {
      for (const row of values.rows) {
        await productionApi.create({
          design: row.design,
          shorts: row.shorts,
          shortUnit: row.shortUnit,
          entryDate: new Date(row.entryDate).toISOString(),
          monthBelongs: values.monthBelongs,
          total: row.shorts * row.shortUnit,
        });
      }
      reset({ monthBelongs: currentMonth, rows: [{ design: '', shorts: undefined as unknown as number, shortUnit: 8, entryDate: today }] });
      toast.success('Entries saved.');
      await reloadTable(filterMonth);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Failed to save entries.';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-8">

      {/* ── Page title ── */}
      <div>
        <h1 className="text-base font-semibold text-gray-900">Production Entry</h1>
        <p className="text-xs text-gray-400 mt-0.5">Log daily production shorts by article design</p>
      </div>

      {/* ── Entry form ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 shadow-sm">

        {/* Form header — month picker inline */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-gray-500">Month</label>
            <input
              type="month"
              {...register('monthBelongs')}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
            />
            {errors.monthBelongs && (
              <span className="text-xs text-red-400">{errors.monthBelongs.message}</span>
            )}
          </div>
          {grandTotal > 0 && (
            <span className="text-xs text-gray-400 tabular-nums">
              Session total: <strong className="text-gray-700">{grandTotal.toLocaleString('en-IN')} pairs</strong>
            </span>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 680 }}>
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="w-9 px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Design / Article</th>
                <th className="w-28 px-3 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Shorts</th>
                <th className="w-36 px-3 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Unit(Pairs per short)</th>
                <th className="w-36 px-3 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="w-28 px-4 py-3 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {fields.map((field, idx) => {
                const total = calcTotal(idx);
                return (
                  <tr
                    key={field.id}
                    className="group hover:bg-amber-50/30 transition-colors"
                  >
                    <td className="px-4 py-2.5 text-xs text-gray-300 tabular-nums select-none">{idx + 1}</td>

                    <td className="px-3 py-2">
                      <input
                        {...register(`rows.${idx}.design`)}
                        placeholder="Article name"
                        className={cn(inputCls, errors.rows?.[idx]?.design && inputErr)}
                      />
                    </td>

                    <td className="px-3 py-2">
                      <input
                        type="number" min={1}
                        {...register(`rows.${idx}.shorts`, { valueAsNumber: true })}
                        placeholder="—"
                        className={cn(inputCls, 'text-right tabular-nums', errors.rows?.[idx]?.shorts && inputErr)}
                      />
                    </td>

                    <td className="px-3 py-2">
                      <select
                        {...register(`rows.${idx}.shortUnit`, { valueAsNumber: true })}
                        className={cn(inputCls)}
                      >
                        {SHORT_UNIT_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label} pairs</option>
                        ))}
                      </select>
                    </td>

                    <td className="px-3 py-2">
                      <input
                        type="date"
                        {...register(`rows.${idx}.entryDate`)}
                        className={cn(inputCls)}
                      />
                    </td>

                    <td className="px-4 py-2.5 text-right">
                      {total !== null
                        ? <span className="text-sm font-semibold text-gray-900 tabular-nums">{total.toLocaleString('en-IN')}</span>
                        : <span className="text-sm text-gray-300">—</span>
                      }
                    </td>

                    <td className="px-2 py-2 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => remove(idx)}
                        disabled={fields.length === 1}
                        className="text-gray-300 hover:text-red-400 hover:bg-red-50 disabled:opacity-0 disabled:pointer-events-none opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Form footer — add row + save */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/40">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => append({ design: '', shorts: undefined as unknown as number, shortUnit: 8, entryDate: today })}
          >
            <Plus className="h-3.5 w-3.5" />
            Add row
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
          >
            <Save className="h-3.5 w-3.5" />
            Save entries
          </Button>
        </div>
      </form>

      {/* ── Saved records ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-900">Records</p>
            <p className="text-xs text-gray-400 mt-0.5">{savedData.length} entries</p>
          </div>
          <MonthFilter value={filterMonth} onChange={v => { setFilterMonth(v); reloadTable(v); }} />
        </div>
        <div className="px-5 py-4">
          <DataTable
            columns={savedColumns}
            data={savedData}
            loading={tableLoading}
            onDelete={handleDelete}
            minWidth={620}
            footer={
              savedData.length > 0 ? (
                <>
                  <td colSpan={4} className="pl-6 py-3 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Grand Total</td>
                  <td className="px-4 py-3 text-sm font-bold text-white tabular-nums">{savedGrandTotal.toLocaleString('en-IN')}</td>
                  <td colSpan={3} />
                </>
              ) : undefined
            }
          />
        </div>
      </div>

    </div>
  );
};
