import React, { useState } from 'react';
import { apiClient } from '@/api/client';
import { Button } from '@/components/ui/Button';

const today = new Date().toISOString().split('T')[0];
const INPUT = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 transition-colors placeholder-gray-300';
const LABEL = 'block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

interface Props { onSuccess?: () => void; }

export const RepairForm: React.FC<Props> = ({ onSuccess }) => {
  const [form, setForm] = useState({ item: '', value: '', date: today });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.repair.create({
        item: form.item,
        value: parseInt(form.value, 10),
        entryDate: new Date(form.date).toISOString(),
        monthBelongs: form.date.slice(0, 7),
      });
      setForm({ item: '', value: '', date: today });
      onSuccess?.();
    } catch (err) {
      console.error('RepairForm:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
      <div>
        <label className={LABEL}>Item</label>
        <input type="text" value={form.item} onChange={set('item')} placeholder="e.g. cracked sole" required className={INPUT} />
      </div>
      <div>
        <label className={LABEL}>Value</label>
        <input type="number" min={0} value={form.value} onChange={set('value')} placeholder="0" required className={INPUT} />
      </div>
      <div>
        <label className={LABEL}>Date</label>
        <input type="date" value={form.date} onChange={set('date')} required className={INPUT} />
      </div>
      <div className="sm:col-span-3 flex justify-end">
        <Button type="submit" isLoading={loading} size="sm">Add Entry</Button>
      </div>
    </form>
  );
};
