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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusDot } from './StatusIndicator';
import { cn } from '@/lib/utils';
import { ChevronDown, Filter, Search, ArrowUpDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type StatusLevel = 'success' | 'warning' | 'error' | 'pending' | 'neutral';

export interface TableColumn {
  key: string;
  header: string;
  type?: 'text' | 'number' | 'status' | 'badge' | 'date';
  align?: 'left' | 'center' | 'right';
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
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
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onFilter?: (column: string, value: string) => void;
  onSearch?: (query: string) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  title,
  description,
  columns,
  data,
  emptyMessage = 'No data available',
  className,
  loading = false,
  maxHeight = '400px',
  searchable = false,
  filterable = false,
  sortable = false,
  onSort,
  onFilter: _onFilter,
  onSearch
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const handleSort = (columnKey: string) => {
    if (!sortable) return;
    
    const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(columnKey);
    setSortDirection(newDirection);
    
    if (onSort) {
      onSort(columnKey, newDirection);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const renderSortableHeader = (column: TableColumn) => {
    if (!sortable || !column.sortable) {
      return column.header;
    }

    const isCurrentSort = sortColumn === column.key;
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 font-semibold hover:bg-transparent"
        onClick={() => handleSort(column.key)}
      >
        <span className="flex items-center gap-1">
          {column.header}
          <ArrowUpDown className={cn(
            "h-3 w-3 transition-colors",
            isCurrentSort ? "text-foreground" : "text-muted-foreground"
          )} />
        </span>
      </Button>
    );
  };

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
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            {description && <Skeleton className="h-4 w-64" />}
          </div>
          {(searchable || filterable) && (
            <div className="flex gap-2 mt-4">
              {searchable && <Skeleton className="h-9 flex-1" />}
              {filterable && <Skeleton className="h-9 w-24" />}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-4">
              {columns.map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
              ))}
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                {columns.map((_, j) => (
                  <Skeleton key={j} className="h-8 flex-1" />
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
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          
          {filterable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columns.filter(col => col.filterable).map((column) => (
                  <DropdownMenuItem key={column.key}>
                    {column.header}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {searchable && (
          <div className="relative mt-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
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
                      column.align === 'center' && 'text-center',
                      sortable && column.sortable && 'hover:bg-muted/50 cursor-pointer'
                    )}
                    style={{ width: column.width }}
                  >
                    {renderSortableHeader(column)}
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