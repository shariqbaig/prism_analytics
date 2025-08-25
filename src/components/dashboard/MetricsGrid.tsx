import React from 'react';
import { cn } from '@/lib/utils';

interface MetricsGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
  mobileColumns?: 1 | 2;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  children,
  columns = 4,
  className,
  gap = 'md',
  mobileColumns = 1
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: mobileColumns === 2 ? 'grid-cols-2 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2',
    3: mobileColumns === 2 ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: mobileColumns === 2 ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn(
      'grid',
      gridCols[columns],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};