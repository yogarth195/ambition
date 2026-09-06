import React, { useState } from 'react';
import { apiClient } from '@/api/client';
import { Button } from '@/components/ui/Button';

const today = new Date().toISOString().split('T')[0];
const INPUT = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 transition-colors placeholder-gray-300';
const LABEL = 'block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

interface Props { onSuccess?: () => void; }

export const MiscForm: React.FC<Props> = ({ onSuccess }) => {
  const [form, setForm] = useState({ value: '', date: today });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.misc.create({
        amount: parseInt(form.value, 10),
        entryDate: new Date(form.date).toISOString(),
        monthBelongs: form.date.slice(0, 7),
      });
      setForm({ value: '', date: today });
      onSuccess?.();
    } catch (err) {
      console.error('MiscForm:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end max-w-sm">
      <div>
        <label className={LABEL}>Amount (₹)</label>
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
      <div className="sm:col-span-2 flex justify-end">
        <Button type="submit" isLoading={loading} size="sm">Add Entry</Button>
      </div>
    </form>
  );
};
