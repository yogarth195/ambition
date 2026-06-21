import React, { useState } from 'react';
import { apiClient } from '@/api/client';
import { Button } from '@/components/ui/Button';

const today = new Date().toISOString().split('T')[0];
const INPUT = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 transition-colors placeholder-gray-300';
const LABEL = 'block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

const ITEM_OPTIONS = ['Slider', 'Crocs', 'Jogger', 'B'];

interface Props { onSuccess?: () => void; }

export const SaleForm: React.FC<Props> = ({ onSuccess }) => {
  const [form, setForm] = useState({ item: '', value: '', date: today });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.sale.create({
        item: form.item,
        value: parseInt(form.value, 10),
        date: new Date(form.date).toISOString(),
      });
      setForm({ item: '', value: '', date: today });
      onSuccess?.();
    } catch (err) {
      console.error('SaleForm:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
      <div>
        <label className={LABEL}>Item</label>
        <select
          value={form.item}
          onChange={(e) => setForm(p => ({ ...p, item: e.target.value }))}
          required
          className={INPUT}
        >
          <option value="" disabled>Select item…</option>
          {ITEM_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <div>
        <label className={LABEL}>Value</label>
        <input
          type="number" min={0} value={form.value}
          onChange={(e) => setForm(p => ({ ...p, value: e.target.value }))}
          placeholder="0" required className={INPUT}
        />
      </div>
      <div>
        <label className={LABEL}>Date</label>
        <input
          type="date" value={form.date}
          onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
          required className={INPUT}
        />
      </div>
      <div className="sm:col-span-3 flex justify-end">
        <Button type="submit" isLoading={loading} size="sm">Add Entry</Button>
      </div>
    </form>
  );
};
