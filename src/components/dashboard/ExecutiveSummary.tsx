import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface ExecutiveSummaryItem {
  metric: string;
  value: string | number;
  change?: {
    value: string;
    direction: 'up' | 'down';
    isPositive?: boolean;
  };
  status: 'good' | 'warning' | 'critical';
}

interface ExecutiveSummaryProps {
  title: string;
  items: ExecutiveSummaryItem[];
  className?: string;
  loading?: boolean;
}

const statusConfig = {
  good: {
    icon: CheckCircle,
    color: 'text-green-600',
    backgroundColor: 'bg-green-50/50',
    borderColor: 'border-l-green-500'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    backgroundColor: 'bg-yellow-50/50',
    borderColor: 'border-l-yellow-500'
  },
  critical: {
    icon: AlertTriangle,
    color: 'text-red-600',
    backgroundColor: 'bg-red-50/50',
    borderColor: 'border-l-red-500'
  }
};

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  title,
  items,
  className,
  loading = false
}) => {
  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-l-4 border-muted bg-muted/30 p-4 rounded-r">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <CardDescription>
          Key performance indicators at a glance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => {
          const config = statusConfig[item.status];
          const StatusIcon = config.icon;
          
          return (
            <div
              key={index}
              className={cn(
                'border-l-4 p-4 rounded-r transition-all duration-200 hover:shadow-sm',
                config.backgroundColor,
                config.borderColor
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusIcon className={cn('w-4 h-4', config.color)} />
                    <h4 className="font-medium text-gray-900">{item.metric}</h4>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                  </div>
                </div>
                
                {item.change && (
                  <div className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
                    item.change.isPositive 
                      ? 'text-green-700 bg-green-100' 
                      : 'text-red-700 bg-red-100'
                  )}>
                    {item.change.direction === 'up' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{item.change.value}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};