import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { reportService } from '@/services/report.service';
import { ReportEntryForm } from '@/components/report/ReportEntryForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getYearOptions } from '@/lib/utils';

export const ReportPage: React.FC = () => {
  const yearOptions = getYearOptions();
  const [selectedYear, setSelectedYear] = useState(yearOptions[0]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['reports', selectedYear],
    queryFn: () => reportService.getReportsByYear(selectedYear),
  });

  return (
    <div className="space-y-5">
      {/* Year selector */}
      <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl shadow-sm px-2 py-2 w-fit">
        {yearOptions.map((y) => (
          <button
            key={y}
            onClick={() => setSelectedYear(y)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              selectedYear === y
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            FY {y}–{String(y + 1).slice(2)}
          </button>
        ))}
      </div>

      {isLoading && <LoadingSpinner className="py-24" label="Loading report..." />}

      {error && !isLoading && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-100 px-5 py-4">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">Failed to load report data. Please refresh.</p>
        </div>
      )}

      {data && !isLoading && (
        <ReportEntryForm year={selectedYear} reports={data.reports} summary={data.summary} />
      )}
    </div>
  );
};
