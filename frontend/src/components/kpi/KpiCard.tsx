import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: number;        // % change, undefined = no trend badge
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trendInverted?: boolean; // for metrics where up is bad (e.g. repair rate, expenses)
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label, value, sub, trend, icon: Icon, iconBg, iconColor, trendInverted = false,
}) => {
  const isPositive = trendInverted ? (trend ?? 0) < 0 : (trend ?? 0) > 0;
  const isNeutral  = trend === undefined || trend === 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-start gap-4">
      <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
        <Icon className={cn('h-5 w-5', iconColor)} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5 tabular-nums leading-tight">{value}</p>
        <div className="flex items-center gap-2 mt-1">
          {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
          {!isNeutral && trend !== undefined && (
            <span className={cn(
              'inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md',
              isPositive
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-500'
            )}>
              {isPositive
                ? <TrendingUp className="h-3 w-3" />
                : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trend)}%
            </span>
          )}
          {isNeutral && trend === 0 && (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-gray-50 text-gray-400">
              <Minus className="h-3 w-3" />0%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
