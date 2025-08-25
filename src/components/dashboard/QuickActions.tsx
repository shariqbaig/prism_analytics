import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
}

interface QuickActionsProps {
  title: string;
  description?: string;
  actions: QuickAction[];
  layout?: 'grid' | 'list';
  className?: string;
  loading?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  title,
  description,
  actions,
  layout = 'grid',
  className,
  loading = false
}) => {
  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          {description && <Skeleton className="h-4 w-48" />}
        </CardHeader>
        <CardContent>
          <div className={cn(
            'space-y-2',
            layout === 'grid' && 'grid grid-cols-1 md:grid-cols-2 gap-3 space-y-0'
          )}>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const gridLayout = layout === 'grid' ? 
    'grid grid-cols-1 md:grid-cols-2 gap-3' : 
    'flex flex-col gap-2';

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className={gridLayout}>
          {actions.map((action) => {
            const Icon = action.icon;
            
            return (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                onClick={action.onClick}
                disabled={action.disabled}
                className={cn(
                  'justify-start gap-2 h-auto p-3',
                  layout === 'list' && 'w-full'
                )}
              >
                <Icon className="w-4 h-4" />
                <div className="flex flex-col items-start text-left">
                  <span className="font-medium">{action.label}</span>
                  {action.description && (
                    <span className="text-xs text-muted-foreground font-normal">
                      {action.description}
                    </span>
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};