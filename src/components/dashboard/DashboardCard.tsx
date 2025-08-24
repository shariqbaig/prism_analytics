import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  children,
  className,
  headerActions,
  footer,
  loading = false
}) => {
  if (loading) {
    return (
      <Card className={cn('transition-all duration-200', className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="animate-pulse">
                <div className="h-5 bg-gray-300 rounded w-32"></div>
              </div>
              {description && (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-48"></div>
                </div>
              )}
            </div>
            {headerActions && (
              <div className="animate-pulse">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </CardContent>
        {footer && (
          <div className="px-6 pb-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className={cn('transition-all duration-200 hover:shadow-lg', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
            )}
          </div>
          {headerActions && (
            <div className="flex-shrink-0">
              {headerActions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      {footer && (
        <div className="px-6 pb-6 pt-0">
          {footer}
        </div>
      )}
    </Card>
  );
};