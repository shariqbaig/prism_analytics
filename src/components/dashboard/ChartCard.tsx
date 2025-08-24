import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Download, Maximize2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  showActions?: boolean;
  height?: string | number;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  children,
  className,
  loading = false,
  onExport,
  onFullscreen,
  showActions = true,
  height = 400
}) => {
  const chartHeight = typeof height === 'number' ? `${height}px` : height;

  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-48"></div>
              </div>
              {description && (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-64"></div>
                </div>
              )}
            </div>
            {showActions && (
              <div className="animate-pulse">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="animate-pulse bg-gray-200 rounded"
            style={{ height: chartHeight }}
          />
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
          </div>
          
          {showActions && (onExport || onFullscreen) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
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