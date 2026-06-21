import React, { useState } from 'react';
import { Receipt } from 'lucide-react';
import { MiscForm } from '@/components/forms/MiscForm';
import { MiscTable } from '@/components/tables/MiscTable';

export const MiscPage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">Misc Expense</h2>
        <p className="text-xs text-gray-400 mt-0.5">Log miscellaneous expense entries</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <Receipt className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <p className="text-sm font-semibold text-gray-900">Add Entry</p>
        </div>
        <div className="px-6 py-5">
          <MiscForm onSuccess={() => setRefreshKey(k => k + 1)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">All Entries</p>
          <p className="text-xs text-gray-400 mt-0.5">Filter by date range to narrow results</p>
        </div>
        <div className="px-6 py-5">
          <MiscTable refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
};
