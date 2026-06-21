import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Section {
  title: string;
  content: React.ReactNode;
}

const sections: Section[] = [
  {
    title: 'Production Entry',
    content: (
      <div className="space-y-2 text-sm text-gray-600">
        <p>Use this page to log daily production shorts by article design.</p>
        <ul className="list-disc list-inside space-y-1 text-gray-500">
          <li>Set the <strong className="text-gray-700">Month</strong> at the top — all rows in a session share it.</li>
          <li>Enter the <strong className="text-gray-700">Design / Article</strong> name, number of <strong className="text-gray-700">Shorts</strong>, and the unit (pairs per short).</li>
          <li>The <strong className="text-gray-700">Total</strong> column computes automatically: Shorts × Unit.</li>
          <li>Click <strong className="text-gray-700">Add row</strong> to log multiple articles at once, then <strong className="text-gray-700">Save entries</strong> to submit all rows together.</li>
          <li>Use the month filter in the Records section below to view past entries by month.</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Trimmer & Buffing',
    content: (
      <div className="space-y-2 text-sm text-gray-600">
        <p>Track trimmer and buffing unit counts per month.</p>
        <ul className="list-disc list-inside space-y-1 text-gray-500">
          <li><strong className="text-gray-700">Value</strong> is the current month's count.</li>
          <li><strong className="text-gray-700">Last Month Remaining</strong> carries over unsettled units from the prior month.</li>
          <li><strong className="text-gray-700">Final Value</strong> is computed server-side as Value + Last Month Remaining — you don't enter it.</li>
          <li><strong className="text-gray-700">For Range</strong> indicates whether the entry covers a day, week, month, or year.</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Repair',
    content: (
      <p className="text-sm text-gray-500">
        Log repair entries by item and value. Use the month filter to review repair costs per period. The repair rate on the dashboard is derived from repair total vs production total.
      </p>
    ),
  },
  {
    title: 'Packed & Sale',
    content: (
      <div className="space-y-2 text-sm text-gray-600">
        <p>Two separate entry pages for packed units and sales.</p>
        <ul className="list-disc list-inside space-y-1 text-gray-500">
          <li><strong className="text-gray-700">Packed</strong> — units packed and ready for dispatch.</li>
          <li><strong className="text-gray-700">Sale</strong> — units actually dispatched or sold.</li>
          <li>The difference (Packed − Sold) is the unsold stock visible on the dashboard.</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Quantity (EVA)',
    content: (
      <p className="text-sm text-gray-500">
        Record EVA material consumption. Each entry has an item type (EVA, EVA for SC, EVA for DC) and a value. Use the month filter to see material usage per month.
      </p>
    ),
  },
  {
    title: 'Labour & Misc Expenses',
    content: (
      <div className="space-y-2 text-sm text-gray-600">
        <p>Log recurring and one-off expenses.</p>
        <ul className="list-disc list-inside space-y-1 text-gray-500">
          <li><strong className="text-gray-700">Labour</strong> — regular wages and contractor payments.</li>
          <li><strong className="text-gray-700">Misc</strong> — any other operational expense.</li>
          <li>Both feed into the Total Expenses and Cost per Pair metrics on the dashboard.</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Dashboard',
    content: (
      <p className="text-sm text-gray-500">
        Shows a summary of the current month across all modules — production, quality, packing, sales, and expenses. Numbers update as you add entries. No manual refresh needed.
      </p>
    ),
  },
];

const AccordionItem: React.FC<{ section: Section }> = ({ section }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50/60 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-800">{section.title}</span>
        {open
          ? <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
          : <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
        }
      </button>
      <div className={cn('px-5 overflow-hidden transition-all duration-200', open ? 'py-4 border-t border-gray-100' : 'max-h-0 py-0')}>
        {open && section.content}
      </div>
    </div>
  );
};

export const HelpPage: React.FC = () => (
  <div className="space-y-6 max-w-2xl">

    <div>
      <h1 className="text-base font-semibold text-gray-900">Help</h1>
      <p className="text-xs text-gray-400 mt-0.5">How to use Sole Report Manager</p>
    </div>

    <div className="space-y-2">
      {sections.map(s => <AccordionItem key={s.title} section={s} />)}
    </div>

    <p className="text-xs text-gray-400">
      This Content is AI Written, if you find any issue in using the app or with the content, Please Contact your Developer.
    </p>

  </div>
);
