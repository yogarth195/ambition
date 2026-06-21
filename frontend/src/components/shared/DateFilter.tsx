import React from 'react';

interface Props {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

export const DateFilter: React.FC<Props> = ({ startDate, endDate, onChange }) => (
  <div className="flex items-center gap-2 flex-wrap">
    <input
      type="date"
      value={startDate}
      onChange={(e) => onChange(e.target.value, endDate)}
      className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 transition-colors"
    />
    <span className="text-xs text-gray-400">to</span>
    <input
      type="date"
      value={endDate}
      onChange={(e) => onChange(startDate, e.target.value)}
      className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 transition-colors"
    />
    {(startDate || endDate) && (
      <button
        type="button"
        onClick={() => onChange('', '')}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
      >
        Clear
      </button>
    )}
  </div>
);
