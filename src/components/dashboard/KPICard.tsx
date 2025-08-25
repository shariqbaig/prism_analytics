import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export type KPIStatus = 'success' | 'warning' | 'error' | 'neutral' | 'loading';

export interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  status?: KPIStatus;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}

const statusConfig = {
  success: {
    borderColor: 'border-green-200',
    backgroundColor: 'bg-green-50/30',
    textColor: 'text-green-800',
    iconColor: 'text-green-600',
    icon: CheckCircle
  },
  warning: {
    borderColor: 'border-yellow-200',
    backgroundColor: 'bg-yellow-50/30',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-600',
    icon: AlertTriangle
  },
  error: {
    borderColor: 'border-red-200',
    backgroundColor: 'bg-red-50/30',
    textColor: 'text-red-800',
    iconColor: 'text-red-600',
    icon: AlertTriangle
  },
  neutral: {
    borderColor: 'border-border',
    backgroundColor: 'bg-muted/30',
    textColor: 'text-foreground',
    iconColor: 'text-muted-foreground',
    icon: Minus
  },
  loading: {
    borderColor: 'border-blue-200',
    backgroundColor: 'bg-blue-50/30',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-600',
    icon: Clock
  }
};

const trendConfig = {
  up: {
    icon: TrendingUp,
    color: 'text-green-600',
    backgroundColor: 'bg-green-100'
  },
  down: {
    icon: TrendingDown,
    color: 'text-red-600',
    backgroundColor: 'bg-red-100'
  },
  neutral: {
    icon: Minus,
    color: 'text-gray-600',
    backgroundColor: 'bg-gray-100'
  }
};

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  description,
  status = 'neutral',
  trend,
  trendValue,
  className,
  icon: CustomIcon,
  loading = false
}) => {
  const config = statusConfig[loading ? 'loading' : status];
  const StatusIcon = CustomIcon || config.icon;
  const TrendIcon = trend ? trendConfig[trend].icon : null;

  if (loading) {
    return (
      <Card className={cn('min-h-[120px] border-2', config.borderColor, className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <Skeleton className="w-5 h-5 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Skeleton className="h-8 w-20" />
              {trend && <Skeleton className="h-6 w-12 rounded-full" />}
            </div>
            {description && <Skeleton className="h-4 w-32" />}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'min-h-[120px] border-2 transition-all duration-200 hover:shadow-lg',
      config.borderColor,
      config.backgroundColor,
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <StatusIcon className={cn('w-5 h-5', config.iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div className={cn('text-3xl font-bold', config.textColor)}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            {trend && trendValue && TrendIcon && (
              <div className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                trendConfig[trend].backgroundColor,
                trendConfig[trend].color
              )}>
                <TrendIcon className="w-3 h-3" />
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          {description && (
            <CardDescription className="text-xs">
              {description}
            </CardDescription>
          )}
        </div>
      </CardContent>
    </Card>
  );
};