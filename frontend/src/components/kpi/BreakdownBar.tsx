import React from 'react';

interface Item { item: string; value: number }

interface BreakdownBarProps {
  title: string;
  items: Item[];
  color?: string;
  formatValue?: (v: number) => string;
}

const COLORS = ['bg-amber-500', 'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500'];

export const BreakdownBar: React.FC<BreakdownBarProps> = ({
  title,
  items,
  formatValue = (v) => v.toLocaleString('en-IN'),
}) => {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (items.length === 0) {
    return (
      <div>
        <p className="text-xs font-semibold text-gray-700 mb-3">{title}</p>
        <p className="text-xs text-gray-400 py-4 text-center">No data</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-700 mb-3">{title}</p>
      <div className="space-y-2.5">
        {items.map((item, i) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div key={item.item}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">{item.item}</span>
                <span className="text-xs font-semibold text-gray-900 tabular-nums">
                  {formatValue(item.value)}
                  <span className="ml-1 text-[10px] font-normal text-gray-400">
                    ({Math.round(pct)}%)
                  </span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${COLORS[i % COLORS.length]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
