import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Download, Maximize2, TrendingUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  onExport?: () => void;
  onFullscreen?: () => void;
  onRefresh?: () => void;
  showActions?: boolean;
  height?: string | number;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  error?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  children,
  className,
  loading = false,
  onExport,
  onFullscreen,
  onRefresh,
  showActions = true,
  height = 400,
  trend,
  error
}) => {
  const chartHeight = typeof height === 'number' ? `${height}px` : height;

  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              {description && <Skeleton className="h-4 w-64" />}
              {trend && <Skeleton className="h-4 w-32" />}
            </div>
            {showActions && <Skeleton className="h-8 w-8" />}
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full rounded" style={{ height: chartHeight }} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              {description && (
                <CardDescription className="text-sm">
                  {description}
                </CardDescription>
              )}
            </div>
            {showActions && onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                Retry
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="flex items-center justify-center bg-muted/10 rounded border-2 border-dashed border-muted"
            style={{ height: chartHeight }}
          >
            <div className="text-center space-y-2">
              <div className="text-muted-foreground">
                Failed to load chart data
              </div>
              <div className="text-sm text-destructive">{error}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
            )}
            {trend && (
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className={cn(
                  "h-3 w-3",
                  trend.positive ? "text-green-600" : "text-red-600"
                )} />
                <span className={cn(
                  "font-medium",
                  trend.positive ? "text-green-600" : "text-red-600"
                )}>
                  {trend.positive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </div>
          
          {showActions && (onExport || onFullscreen || onRefresh) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {onRefresh && (
                  <DropdownMenuItem onClick={onRefresh}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Refresh
                  </DropdownMenuItem>
                )}
                {(onRefresh && (onFullscreen || onExport)) && (
                  <DropdownMenuSeparator />
                )}
                {onFullscreen && (
                  <DropdownMenuItem onClick={onFullscreen}>
                    <Maximize2 className="mr-2 h-4 w-4" />
                    Fullscreen
                  </DropdownMenuItem>
                )}
                {onExport && (
                  <DropdownMenuItem onClick={onExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div 
          className="w-full"
          style={{ height: chartHeight }}
        >
          {children}
        </div>
      </CardContent>
    </Card>
  );
};