import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

export const LoadingSpinner: React.FC<Props> = ({ className, size = 'md', label }) => (
  <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
    <Loader2 className={cn('animate-spin text-amber-500', sizes[size])} />
    {label && <p className="text-sm text-gray-500">{label}</p>}
  </div>
);
