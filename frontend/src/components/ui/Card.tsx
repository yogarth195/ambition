import React from 'react';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<Props> = ({ className, children }) => (
  <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm', className)}>{children}</div>
);

export const CardHeader: React.FC<Props> = ({ className, children }) => (
  <div className={cn('px-6 py-4 border-b border-gray-100', className)}>{children}</div>
);

export const CardContent: React.FC<Props> = ({ className, children }) => (
  <div className={cn('px-6 py-4', className)}>{children}</div>
);

export const CardTitle: React.FC<Props & { description?: string }> = ({ className, children, description }) => (
  <div>
    <h3 className={cn('text-base font-semibold text-gray-900', className)}>{children}</h3>
    {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
  </div>
);
