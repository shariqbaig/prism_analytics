import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusDot } from './StatusIndicator';
import { cn } from '@/lib/utils';

type StatusLevel = 'success' | 'warning' | 'error' | 'pending' | 'neutral';

export interface TableColumn {
  key: string;
  header: string;
  type?: 'text' | 'number' | 'status' | 'badge' | 'date';
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface TableRow {
  id: string | number;
  [key: string]: any;
}

interface DataTableProps {
  title: string;
  description?: string;
  columns: TableColumn[];
  data: TableRow[];
  emptyMessage?: string;
  className?: string;
  loading?: boolean;
  maxHeight?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  title,
  description,
  columns,
  data,
  emptyMessage = 'No data available',
  className,
  loading = false,
  maxHeight = '400px'
}) => {
  const renderCell = (column: TableColumn, value: any, row: TableRow) => {
    // Custom render function takes precedence
    if (column.render) {
      return column.render(value, row);
    }

    // Default rendering based on column type
    switch (column.type) {
      case 'number':
        return (
          <span className="font-mono">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
        );

      case 'status':
        return (
          <div className="flex items-center gap-2">
            <StatusDot status={value as StatusLevel} />
            <span className="capitalize">{value}</span>
          </div>
        );

      case 'badge':
        const badgeVariant = value === 'active' || value === 'success' 
          ? 'default' 
          : value === 'warning' 
            ? 'secondary' 
            : 'outline';
        return (
          <Badge variant={badgeVariant} className="capitalize">
            {value}
          </Badge>
        );

      case 'date':
        return new Date(value).toLocaleDateString();

      default:
        return String(value || '');
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-300 rounded w-48"></div>
            {description && (
              <div className="h-4 bg-gray-300 rounded w-64"></div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="animate-pulse flex gap-4">
              {columns.map((_, i) => (
                <div key={i} className="h-4 bg-gray-300 rounded flex-1"></div>
              ))}
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4">
                {columns.map((_, j) => (
                  <div key={j} className="h-8 bg-gray-200 rounded flex-1"></div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div 
          className="border rounded-lg overflow-auto"
          style={{ maxHeight }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      'font-semibold',
                      column.align === 'right' && 'text-right',
                      column.align === 'center' && 'text-center'
                    )}
                    style={{ width: column.width }}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/50">
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn(
                          column.align === 'right' && 'text-right',
                          column.align === 'center' && 'text-center'
                        )}
                      >
                        {renderCell(column, row[column.key], row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};