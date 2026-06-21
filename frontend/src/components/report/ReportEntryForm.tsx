import React, { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, CheckCircle2, AlertCircle, Calculator } from 'lucide-react';
import { reportService, MonthReportInput, YearlySummaryInput } from '@/services/report.service';
import { SoleReport, YearlySummary } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  FINANCIAL_YEAR_MONTHS,
  parseNullableInt,
  parseNullableFloat,
  formatNumber,
  formatCurrency,
} from '@/lib/utils';
import { cn } from '@/lib/utils';

/* ── Types ──────────────────────────────────────────────────────────────────── */
interface MonthRowData {
  totalProduction: string;
  trimmer:         string;
  buffing:         string;
  repair:          string;
  packed:          string;
  balance:         string;
  purchaseQty:     string;
  purchaseAmt:     string;
  isDirty:  boolean;
  isSaved:  boolean;
}

interface SummaryData {
  laborTotal:   string;
  expenseTotal: string;
  isDirty: boolean;
}

interface Props {
  year:     number;
  reports:  SoleReport[];
  summary:  YearlySummary | null;
}

/* ── Helpers ────────────────────────────────────────────────────────────────── */
const emptyRow = (): MonthRowData => ({
  totalProduction: '', trimmer: '', buffing: '', repair: '',
  packed: '', balance: '', purchaseQty: '', purchaseAmt: '',
  isDirty: false, isSaved: false,
});

const reportToRow = (r: SoleReport): MonthRowData => ({
  totalProduction: r.totalProduction?.toString() ?? '',
  trimmer:         r.trimmer?.toString()         ?? '',
  buffing:         r.buffing?.toString()         ?? '',
  repair:          r.repair?.toString()          ?? '',
  packed:          r.packed                      ?? '',
  balance:         r.balance?.toString()         ?? '',
  purchaseQty:     r.purchaseQty?.toString()     ?? '',
  purchaseAmt:     r.purchaseAmt?.toString()     ?? '',
  isDirty: false, isSaved: false,
});

/* ── Sub-components ─────────────────────────────────────────────────────────── */
const CellInput: React.FC<{
  value:       string;
  onChange:    (v: string) => void;
  placeholder?: string;
  align?:      'left' | 'right';
}> = ({ value, onChange, placeholder = '', align = 'right' }) => (
  <input
    type="text"
    inputMode="decimal"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={cn(
      'w-full min-w-[72px] bg-transparent text-[13px] tabular-nums border-0 rounded-md px-2 py-1.5',
      'placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:bg-amber-50/70',
      'transition-colors duration-100',
      align === 'right' ? 'text-right' : 'text-left'
    )}
  />
);

const TH: React.FC<{ children: React.ReactNode; className?: string; colSpan?: number }> = ({
  children, className, colSpan,
}) => (
  <th
    colSpan={colSpan}
    className={cn(
      'px-3 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap select-none',
      className
    )}
  >
    {children}
  </th>
);

const TD: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <td className={cn('px-1.5 py-0.5 border-b border-gray-50', className)}>{children}</td>
);

/* ── Main component ─────────────────────────────────────────────────────────── */
export const ReportEntryForm: React.FC<Props> = ({ year, reports, summary }) => {
  const queryClient = useQueryClient();

  const [rows, setRows] = useState<Record<number, MonthRowData>>({});
  const [summaryData, setSummaryData] = useState<SummaryData>({
    laborTotal: '', expenseTotal: '', isDirty: false,
  });
  const [savingMonth, setSavingMonth] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<Record<number, string>>({});

  /* Init from server data */
  useEffect(() => {
    const initial: Record<number, MonthRowData> = {};
    FINANCIAL_YEAR_MONTHS.forEach(({ value }) => {
      const r = reports.find((r) => r.month === value);
      initial[value] = r ? reportToRow(r) : emptyRow();
    });
    setRows(initial);
  }, [reports]);

  useEffect(() => {
    setSummaryData({
      laborTotal:   summary?.laborTotal?.toString()   ?? '',
      expenseTotal: summary?.expenseTotal?.toString() ?? '',
      isDirty: false,
    });
  }, [summary]);

  const updateRow = useCallback((month: number, field: keyof MonthRowData, value: string) => {
    setRows((prev) => ({
      ...prev,
      [month]: { ...prev[month], [field]: value, isDirty: true, isSaved: false },
    }));
    setSaveError((prev) => ({ ...prev, [month]: '' }));
  }, []);

  /* Mutations */
  const saveMutation = useMutation({
    mutationFn: (input: MonthReportInput) => reportService.upsertMonthReport(input),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['reports', year] });
      setRows((prev) => ({
        ...prev,
        [vars.month]: { ...prev[vars.month], isDirty: false, isSaved: true },
      }));
      setTimeout(() => {
        setRows((prev) => ({ ...prev, [vars.month]: { ...prev[vars.month], isSaved: false } }));
      }, 2500);
      setSavingMonth(null);
    },
    onError: (_, vars) => {
      setSaveError((prev) => ({ ...prev, [vars.month]: 'Save failed' }));
      setSavingMonth(null);
    },
  });

  const summarySaveMutation = useMutation({
    mutationFn: (input: YearlySummaryInput) => reportService.upsertYearlySummary(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', year] });
      setSummaryData((prev) => ({ ...prev, isDirty: false }));
    },
  });

  const handleSaveRow = (monthValue: number, monthName: string) => {
    const row = rows[monthValue];
    if (!row) return;
    setSavingMonth(monthValue);
    saveMutation.mutate({
      year, month: monthValue, monthName,
      totalProduction: parseNullableInt(row.totalProduction),
      trimmer:         parseNullableInt(row.trimmer),
      buffing:         parseNullableInt(row.buffing),
      repair:          parseNullableInt(row.repair),
      packed:          row.packed.trim() || null,
      balance:         parseNullableFloat(row.balance),
      purchaseQty:     parseNullableFloat(row.purchaseQty),
      purchaseAmt:     parseNullableFloat(row.purchaseAmt),
    });
  };

  /* Live totals */
  const totals = FINANCIAL_YEAR_MONTHS.reduce(
    (acc, { value }) => {
      const row = rows[value];
      if (!row) return acc;
      return {
        totalProduction: acc.totalProduction + (parseNullableInt(row.totalProduction)    ?? 0),
        trimmer:         acc.trimmer         + (parseNullableInt(row.trimmer)            ?? 0),
        buffing:         acc.buffing         + (parseNullableInt(row.buffing)            ?? 0),
        repair:          acc.repair          + (parseNullableInt(row.repair)             ?? 0),
        purchaseQty:     acc.purchaseQty     + (parseNullableFloat(row.purchaseQty)      ?? 0),
        purchaseAmt:     acc.purchaseAmt     + (parseNullableFloat(row.purchaseAmt)      ?? 0),
      };
    },
    { totalProduction: 0, trimmer: 0, buffing: 0, repair: 0, purchaseQty: 0, purchaseAmt: 0 }
  );

  const grandTotal =
    (parseNullableFloat(summaryData.laborTotal) ?? 0) +
    (parseNullableFloat(summaryData.expenseTotal) ?? 0);

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-5">
      {/* ── Production table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-900">Monthly Production Data</p>
            <p className="text-xs text-gray-400 mt-0.5">
              FY {year}–{year + 1} &mdash; edit any cell, then save the row
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-amber-200" /> Unsaved
            </span>
            <span className="mx-1">·</span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-emerald-200" /> Saved
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: '860px' }}>
            <thead>
              {/* Group header row */}
              <tr className="bg-gray-50">
                <th className="w-24" />
                {/* Sole Report group */}
                <th
                  colSpan={6}
                  className="px-3 pt-3 pb-1 text-[10px] font-bold text-amber-600 uppercase tracking-widest text-center border-b border-amber-100"
                >
                  Sole Report
                </th>
                {/* Divider */}
                <th className="w-px bg-gray-200" />
                {/* Purchase group */}
                <th
                  colSpan={2}
                  className="px-3 pt-3 pb-1 text-[10px] font-bold text-emerald-600 uppercase tracking-widest text-center border-b border-emerald-100"
                >
                  Purchase
                </th>
                <th className="w-16" />
              </tr>
              {/* Column labels */}
              <tr className="bg-gray-50 border-b border-gray-100">
                <TH className="text-left pl-6">Month</TH>
                <TH className="text-right">Total Prod.</TH>
                <TH className="text-right">Trimmer</TH>
                <TH className="text-right">Buffing</TH>
                <TH className="text-right">Repair</TH>
                <TH className="text-center">Packed</TH>
                <TH className="text-right">Balance</TH>
                <th className="w-px" />
                <TH className="text-right">Qty</TH>
                <TH className="text-right">Amount</TH>
                <TH className="text-center">Save</TH>
              </tr>
            </thead>

            <tbody>
              {FINANCIAL_YEAR_MONTHS.map(({ value, label, name }, idx) => {
                const row = rows[value];
                const isSaving = savingMonth === value;
                if (!row) return null;

                return (
                  <tr
                    key={value}
                    className={cn(
                      'group transition-colors duration-100',
                      row.isSaved  ? 'bg-emerald-50/60' :
                      row.isDirty  ? 'bg-amber-50/60'   :
                      idx % 2 === 0 ? 'bg-white'         : 'bg-gray-50/40',
                      'hover:bg-amber-50/30'
                    )}
                  >
                    {/* Dirty indicator */}
                    <TD className="pl-0 pr-2 relative">
                      <div
                        className={cn(
                          'absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full transition-opacity',
                          row.isDirty && !row.isSaved ? 'bg-amber-400 opacity-100' :
                          row.isSaved               ? 'bg-emerald-400 opacity-100' :
                          'opacity-0'
                        )}
                      />
                      <span className="pl-5 text-[13px] font-medium text-gray-700 whitespace-nowrap block">
                        {label}
                      </span>
                    </TD>

                    <TD><CellInput value={row.totalProduction} onChange={(v) => updateRow(value, 'totalProduction', v)} /></TD>
                    <TD><CellInput value={row.trimmer}         onChange={(v) => updateRow(value, 'trimmer',         v)} /></TD>
                    <TD><CellInput value={row.buffing}         onChange={(v) => updateRow(value, 'buffing',         v)} /></TD>
                    <TD><CellInput value={row.repair}          onChange={(v) => updateRow(value, 'repair',          v)} /></TD>
                    <TD>
                      <CellInput
                        value={row.packed}
                        onChange={(v) => updateRow(value, 'packed', v)}
                        placeholder="e.g. 49/3"
                        align="left"
                      />
                    </TD>
                    <TD><CellInput value={row.balance}     onChange={(v) => updateRow(value, 'balance',     v)} /></TD>

                    {/* Section divider */}
                    <td className="w-px bg-gray-100" />

                    <TD><CellInput value={row.purchaseQty} onChange={(v) => updateRow(value, 'purchaseQty', v)} /></TD>
                    <TD><CellInput value={row.purchaseAmt} onChange={(v) => updateRow(value, 'purchaseAmt', v)} /></TD>

                    <TD className="text-center px-2">
                      {row.isSaved ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                      ) : saveError[value] ? (
                        <span title={saveError[value]}>
                          <AlertCircle className="h-4 w-4 text-red-500 mx-auto" />
                        </span>
                      ) : (
                        <Button
                          size="xs"
                          variant={row.isDirty ? 'primary' : 'ghost'}
                          isLoading={isSaving}
                          onClick={() => handleSaveRow(value, name)}
                          disabled={!row.isDirty && !isSaving}
                          className="mx-auto"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                      )}
                    </TD>
                  </tr>
                );
              })}
            </tbody>

            {/* Totals footer */}
            <tfoot>
              <tr className="bg-slate-900">
                <td className="pl-6 pr-3 py-3 text-[11px] font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">
                  Totals
                </td>
                <td className="px-3 py-3 text-right text-[13px] font-semibold text-white tabular-nums">
                  {formatNumber(totals.totalProduction)}
                </td>
                <td className="px-3 py-3 text-right text-[13px] font-semibold text-white tabular-nums">
                  {formatNumber(totals.trimmer)}
                </td>
                <td className="px-3 py-3 text-right text-[13px] font-semibold text-white tabular-nums">
                  {formatNumber(totals.buffing)}
                </td>
                <td className="px-3 py-3 text-right text-[13px] font-semibold text-white tabular-nums">
                  {formatNumber(totals.repair)}
                </td>
                <td className="px-3 py-3 text-center text-slate-600 text-sm">—</td>
                <td className="px-3 py-3 text-center text-slate-600 text-sm">—</td>
                <td className="w-px bg-slate-800" />
                <td className="px-3 py-3 text-right text-[13px] font-semibold text-white tabular-nums">
                  {totals.purchaseQty.toLocaleString('en-IN')}
                </td>
                <td className="px-3 py-3 text-right text-[13px] font-semibold text-white tabular-nums">
                  {formatCurrency(totals.purchaseAmt)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Yearly summary ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <Calculator className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Yearly Summary</p>
            <p className="text-xs text-gray-400 mt-0.5">Labor and expense totals for FY {year}</p>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-end">
            {/* Labor total */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Labor Total
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={summaryData.laborTotal}
                onChange={(e) => setSummaryData((p) => ({ ...p, laborTotal: e.target.value, isDirty: true }))}
                placeholder="0"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-right
                           tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                           focus:bg-white transition-all duration-150"
              />
            </div>

            {/* Expense total */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Expense Total
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={summaryData.expenseTotal}
                onChange={(e) => setSummaryData((p) => ({ ...p, expenseTotal: e.target.value, isDirty: true }))}
                placeholder="0"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-right
                           tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                           focus:bg-white transition-all duration-150"
              />
            </div>

            {/* Grand total — read only */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Grand Total
                <span className="ml-1.5 text-[10px] font-normal text-gray-400 normal-case tracking-normal">(auto)</span>
              </label>
              <div className="w-full rounded-xl border border-amber-100 bg-amber-50 px-4 py-2.5 text-sm text-right font-bold text-amber-700 tabular-nums">
                {formatCurrency(grandTotal)}
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              onClick={() =>
                summarySaveMutation.mutate({
                  year,
                  laborTotal:   parseNullableFloat(summaryData.laborTotal),
                  expenseTotal: parseNullableFloat(summaryData.expenseTotal),
                })
              }
              isLoading={summarySaveMutation.isPending}
              disabled={!summaryData.isDirty}
              variant={summaryData.isDirty ? 'primary' : 'secondary'}
            >
              <Save className="h-4 w-4" />
              Save Summary
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
