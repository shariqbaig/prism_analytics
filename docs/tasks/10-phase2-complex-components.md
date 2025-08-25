# Phase 2: Complex Component Shadcn Integration

## Executive Summary

**Status**: 📋 PENDING  
**Priority**: High  
**Timeline**: Week 3-4 (10 days)  
**Dependencies**: Phase 1 Core Components (Task 09)  
**Risk Level**: Medium  
**Business Impact**: Moderate

Integrate complex interactive components with Shadcn patterns, enhance data visualization components, and implement advanced dashboard functionality while maintaining executive-grade performance and user experience.

## Phase 2 Objectives

### Primary Goals
1. **Advanced Interactive Components**: Dialog, Sheet, Popover, Command components
2. **Enhanced Data Tables**: Advanced table features with Shadcn patterns
3. **Form System Completion**: Complete form ecosystem with validation
4. **Chart Integration**: Seamless chart theming with Shadcn design system
5. **Navigation Enhancement**: Advanced navigation patterns for executive dashboard

### Success Criteria
- [ ] All complex interactive components follow Shadcn patterns
- [ ] DataTable enhanced with sorting, filtering, pagination
- [ ] Complete form system with validation and error handling
- [ ] Chart components integrated with Shadcn theming
- [ ] Navigation components standardized with proper accessibility
- [ ] Performance maintained despite increased functionality
- [ ] Executive dashboard workflows preserved and enhanced

## Technical Implementation Plan

### 1. Advanced Interactive Components

**Install Required Components**:
```bash
npx shadcn@latest add dialog
npx shadcn@latest add sheet  
npx shadcn@latest add popover
npx shadcn@latest add command
npx shadcn@latest add tabs
npx shadcn@latest add accordion
npx shadcn@latest add tooltip
```

**Component Implementations**:

**Dialog System for Executive Dashboard**:
```typescript
// src/components/ui/executive-dialog.tsx
import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ExecutiveDialogProps {
  title: string
  description?: string
  trigger: React.ReactNode
  children: React.ReactNode
  actions?: {
    primary?: { label: string; onClick: () => void; loading?: boolean }
    secondary?: { label: string; onClick: () => void }
  }
  size?: "sm" | "default" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  sm: "max-w-md",
  default: "max-w-lg", 
  lg: "max-w-2xl",
  xl: "max-w-4xl"
}

export const ExecutiveDialog: React.FC<ExecutiveDialogProps> = ({
  title,
  description,
  trigger,
  children,
  actions,
  size = "default",
  className
}) => (
  <Dialog>
    <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent className={cn(sizeClasses[size], className)}>
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-primary">
          {title}
        </DialogTitle>
        {description && (
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        )}
      </DialogHeader>
      <div className="py-4">{children}</div>
      {actions && (
        <DialogFooter className="gap-2">
          {actions.secondary && (
            <Button
              variant="outline"
              onClick={actions.secondary.onClick}
            >
              {actions.secondary.label}
            </Button>
          )}
          {actions.primary && (
            <Button
              onClick={actions.primary.onClick}
              disabled={actions.primary.loading}
            >
              {actions.primary.loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              )}
              {actions.primary.label}
            </Button>
          )}
        </DialogFooter>
      )}
    </DialogContent>
  </Dialog>
)
```

**Command Palette for Executive Search**:
```typescript
// src/components/ui/executive-command.tsx
import React from "react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Search, TrendingUp, BarChart3, FileText } from "lucide-react"

export interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  onSelect: () => void
  group: string
}

export interface ExecutiveCommandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: CommandItem[]
  placeholder?: string
}

export const ExecutiveCommand: React.FC<ExecutiveCommandProps> = ({
  open,
  onOpenChange,
  items,
  placeholder = "Search executive dashboard..."
}) => {
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {} as Record<string, CommandItem[]>)

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={placeholder} className="h-12" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Object.entries(groupedItems).map(([group, groupItems], index) => (
          <React.Fragment key={group}>
            {index > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {groupItems.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={item.onSelect}
                  className="flex items-center gap-3 p-3"
                >
                  {item.icon && <item.icon className="w-4 h-4 text-muted-foreground" />}
                  <div className="flex flex-col">
                    <span className="font-medium">{item.label}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
```

### 2. Enhanced DataTable Implementation

**Advanced DataTable with Shadcn Integration**:
```typescript
// src/components/ui/advanced-data-table.tsx
import React, { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp, MoreHorizontal, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AdvancedTableColumn {
  key: string
  header: string
  type?: 'text' | 'number' | 'status' | 'badge' | 'date' | 'actions'
  sortable?: boolean
  filterable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: any) => React.ReactNode
}

export interface TableAction {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: (row: any) => void
  variant?: 'default' | 'destructive'
}

export interface AdvancedDataTableProps {
  title: string
  description?: string
  columns: AdvancedTableColumn[]
  data: any[]
  actions?: TableAction[]
  searchable?: boolean
  pagination?: boolean
  pageSize?: number
  emptyMessage?: string
  loading?: boolean
  className?: string
}

export const AdvancedDataTable: React.FC<AdvancedDataTableProps> = ({
  title,
  description,
  columns,
  data,
  actions,
  searchable = true,
  pagination = true,
  pageSize = 10,
  emptyMessage = "No data available",
  loading = false,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)

  // Filtering logic
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data
    
    return data.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [data, searchTerm])

  // Sorting logic
  const sortedData = React.useMemo(() => {
    if (!sortColumn) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }
      
      const aString = String(aValue).toLowerCase()
      const bString = String(bValue).toLowerCase()
      
      if (sortDirection === "asc") {
        return aString.localeCompare(bString)
      } else {
        return bString.localeCompare(aString)
      }
    })
  }, [filteredData, sortColumn, sortDirection])

  // Pagination logic
  const paginatedData = React.useMemo(() => {
    if (!pagination) return sortedData
    
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize, pagination])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(columnKey)
      setSortDirection("asc")
    }
  }

  // Render functions remain similar but use Shadcn components...
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {searchable && (
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Table implementation with sorting, filtering, pagination */}
        {/* Implementation details similar to existing DataTable but enhanced */}
      </CardContent>
    </Card>
  )
}
```

### 3. Form System Enhancement

**Complete Form Ecosystem**:
```bash
npx shadcn@latest add form
npx shadcn@latest add textarea
npx shadcn@latest add radio-group
npx shadcn@latest add switch
npx shadcn@latest add slider
```

**Executive Form Components**:
```typescript
// src/components/ui/executive-form.tsx
import React from "react"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio'
  placeholder?: string
  description?: string
  required?: boolean
  validation?: object
  options?: { value: string; label: string }[]
}

export interface ExecutiveFormProps {
  title: string
  fields: FormField[]
  onSubmit: (data: any) => void
  defaultValues?: Record<string, any>
  loading?: boolean
  className?: string
}

export const ExecutiveForm: React.FC<ExecutiveFormProps> = ({
  title,
  fields,
  onSubmit,
  defaultValues = {},
  loading = false,
  className
}) => {
  const form = useForm({
    defaultValues
  })

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {fields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </FormLabel>
                    <FormControl>
                      {field.type === 'text' || field.type === 'email' || field.type === 'number' ? (
                        <Input
                          {...formField}
                          type={field.type}
                          placeholder={field.placeholder}
                          className="h-10"
                        />
                      ) : field.type === 'textarea' ? (
                        <textarea
                          {...formField}
                          placeholder={field.placeholder}
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      ) : null}
                    </FormControl>
                    {field.description && (
                      <FormDescription>{field.description}</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button type="submit" disabled={loading} className="w-full">
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              )}
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
```

### 4. Chart Integration Enhancement

**Chart Theming Integration**:
```typescript
// src/components/charts/shadcn-chart-wrapper.tsx
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Download, Maximize } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface ShadcnChartProps {
  title: string
  description?: string
  children: React.ReactNode
  status?: 'healthy' | 'warning' | 'critical' | 'neutral'
  actions?: Array<{
    label: string
    icon?: React.ComponentType<{ className?: string }>
    onClick: () => void
  }>
  className?: string
  loading?: boolean
}

const statusConfig = {
  healthy: { color: "bg-green-50 text-green-700 border-green-200", badge: "success" },
  warning: { color: "bg-amber-50 text-amber-700 border-amber-200", badge: "warning" },
  critical: { color: "bg-red-50 text-red-700 border-red-200", badge: "destructive" },
  neutral: { color: "", badge: "secondary" }
} as const

export const ShadcnChartWrapper: React.FC<ShadcnChartProps> = ({
  title,
  description,
  children,
  status = 'neutral',
  actions,
  className,
  loading = false
}) => {
  const statusStyle = statusConfig[status]

  return (
    <Card className={cn("relative", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {status !== 'neutral' && (
              <Badge variant={statusStyle.badge as any} className="text-xs">
                {status}
              </Badge>
            )}
          </div>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </div>
        
        {actions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.map((action, index) => (
                <DropdownMenuItem key={index} onClick={action.onClick}>
                  {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="space-y-4 text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
```

## Implementation Sequence

### Day 11-13: Advanced Interactive Components
1. **Install and Configure Components**
   - Install Dialog, Sheet, Popover, Command components
   - Configure executive-specific variants
   - Create wrapper components for common patterns

2. **Executive Dialog System**
   - Implement ExecutiveDialog component
   - Create confirmation dialogs for critical actions
   - Add loading states and proper accessibility

3. **Command Palette**
   - Implement ExecutiveCommand for dashboard search
   - Integrate with routing and navigation
   - Add keyboard shortcuts and search functionality

### Day 14-16: Data Table and Form Enhancements
1. **Advanced DataTable**
   - Enhance existing DataTable with sorting, filtering
   - Add pagination and advanced table features
   - Implement row actions and bulk operations

2. **Complete Form System**
   - Install and configure form components
   - Create ExecutiveForm wrapper component
   - Add validation patterns and error handling
   - Implement form field variants for executive needs

### Day 17-18: Chart Integration and Navigation
1. **Chart Component Integration**
   - Create ShadcnChartWrapper for consistent theming
   - Integrate with existing chart libraries
   - Add chart actions and export functionality

2. **Navigation Enhancement**
   - Standardize navigation components with Shadcn patterns
   - Implement breadcrumbs and navigation helpers
   - Add responsive navigation patterns

### Day 19-20: Integration Testing and Optimization
1. **Component Integration Testing**
   - Test all complex components together
   - Verify performance and accessibility
   - Check TypeScript compliance and error handling

2. **Performance Optimization**
   - Bundle size analysis and optimization
   - Runtime performance testing
   - Memory usage optimization

## Quality Assurance Requirements

### Component Testing Framework
```typescript
// Example testing patterns for complex components
describe("ExecutiveDialog", () => {
  it("handles complex interactions correctly", () => {
    // Test dialog open/close, form submission, loading states
  })
  
  it("maintains accessibility standards", () => {
    // Test keyboard navigation, ARIA labels, focus management
  })
})

describe("AdvancedDataTable", () => {
  it("handles large datasets efficiently", () => {
    // Performance testing with 1000+ rows
  })
  
  it("supports all filtering and sorting combinations", () => {
    // Comprehensive feature testing
  })
})
```

### Performance Benchmarks
- **Component Render Time**: <16ms for 60fps
- **Table with 1000 rows**: <500ms initial render
- **Dialog Open/Close**: <150ms animation duration
- **Form Validation**: <100ms response time
- **Chart Rendering**: <1s for complex visualizations

## Risk Assessment

### Technical Risks
1. **Performance Impact**: Medium risk - complex components may impact performance
2. **Bundle Size**: Medium risk - additional components increase bundle
3. **Accessibility**: High risk - complex interactions require careful a11y implementation
4. **Browser Compatibility**: Low risk - Shadcn components well-tested

### Mitigation Strategies
1. **Lazy Loading**: Implement code splitting for complex components
2. **Performance Monitoring**: Real-time performance tracking
3. **Accessibility Testing**: Automated and manual a11y testing
4. **Progressive Enhancement**: Graceful degradation for older browsers

## Success Metrics

### Technical KPIs
- [ ] All complex components follow Shadcn patterns
- [ ] DataTable supports 1000+ rows with <1s render time
- [ ] Form validation responds within 100ms
- [ ] Bundle size increase <10% from Phase 1 baseline
- [ ] All components maintain WCAG 2.1 AA compliance

### Executive Dashboard KPIs
- [ ] Dialog interactions feel responsive and professional
- [ ] Search functionality provides relevant results within 200ms
- [ ] Data tables handle executive reporting requirements
- [ ] Form components support complex business data entry
- [ ] Chart integration maintains visual consistency

---

**Deliverables**: 
- Advanced interactive Shadcn components
- Enhanced data table with full feature set
- Complete form ecosystem with validation
- Integrated chart theming system
- Performance-optimized complex interactions

**Next Step**: Proceed to Phase 3 custom dashboard component standardization