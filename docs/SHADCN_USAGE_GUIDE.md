# Shadcn/UI Component Usage Guide

## Overview

This guide provides comprehensive documentation for using Shadcn/UI components in the PRISM Analytics project. All UI components follow Shadcn/UI patterns for consistency, accessibility, and maintainability.

## Core Principles

### 1. Component Structure
All Shadcn components follow this pattern:
```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Component = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <element
    ref={ref}
    className={cn("base-styles", className)}
    {...props}
  />
))
Component.displayName = "Component"

export { Component }
```

### 2. Styling Standards
- Use Tailwind CSS classes exclusively
- Apply `cn()` utility for className merging
- Follow semantic design tokens (primary, secondary, muted, etc.)
- Maintain consistent spacing and typography scales

## Component Categories

### Layout Components

#### Card
Used for container layouts with consistent padding and styling.

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Card content */}
  </CardContent>
</Card>
```

**Best Practices:**
- Always use CardHeader for titles/descriptions
- Use CardContent for main content
- Apply consistent spacing with built-in padding

### Form Components

#### Button
Primary interactive element with multiple variants.

```tsx
import { Button } from '@/components/ui/button';

// Variants
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon Only</Button>
```

**Best Practices:**
- Use semantic variants (default for primary actions, destructive for dangerous actions)
- Include loading states for async operations
- Ensure proper accessibility with aria-labels

#### Input
Text input with consistent styling and validation states.

```tsx
import { Input } from '@/components/ui/input';

<Input 
  type="text" 
  placeholder="Enter text..." 
  className="w-full"
/>

// With validation
<Input 
  type="email" 
  placeholder="email@example.com"
  aria-invalid={hasError}
  className={cn("w-full", hasError && "border-destructive")}
/>
```

#### Select
Dropdown selection component built on Radix UI.

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

<Select onValueChange={(value) => setValue(value)}>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Feedback Components

#### Skeleton
Loading placeholder component.

```tsx
import { Skeleton } from '@/components/ui/skeleton';

// Basic skeleton
<Skeleton className="h-4 w-[250px]" />

// Complex skeleton layout
<div className="space-y-2">
  <Skeleton className="h-6 w-48" />
  <Skeleton className="h-4 w-64" />
  <Skeleton className="h-8 w-20" />
</div>
```

**Loading State Patterns:**
```tsx
if (loading) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[200px] w-full" />
      </CardContent>
    </Card>
  );
}
```

#### Badge
Status and label indicators.

```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Error</Badge>
```

### Navigation Components

#### DropdownMenu
Context menus and action dropdowns.

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Actions</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Data Display Components

#### Table
Structured data presentation.

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Value</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Item 1</TableCell>
      <TableCell>Active</TableCell>
      <TableCell>$100</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Modal Components

#### AlertDialog
Confirmation and alert dialogs.

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete Item</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Executive Dashboard Components

### KPICard
Executive-level metric display with status indicators.

```tsx
import { KPICard } from '@/components/dashboard/KPICard';

<KPICard
  title="Total Revenue"
  value="$2.4M"
  description="Monthly recurring revenue"
  status="success"
  trend="up"
  trendValue="+12%"
/>
```

**Status Options:** `success | warning | error | neutral | loading`
**Trend Options:** `up | down | neutral`

### ExecutiveSummary
High-level metrics container for C-Suite dashboards.

```tsx
import { ExecutiveSummary } from '@/components/dashboard/ExecutiveSummary';

const summaryItems = [
  {
    metric: "Portfolio Health",
    value: "87%",
    status: "good",
    change: { value: "+3%", direction: "up", isPositive: true }
  }
];

<ExecutiveSummary
  title="Executive Summary"
  items={summaryItems}
/>
```

### MetricsGrid
Responsive grid layout for dashboard components.

```tsx
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';

<MetricsGrid columns={4} gap="md" mobileColumns={2}>
  <KPICard {...props1} />
  <KPICard {...props2} />
  <KPICard {...props3} />
  <KPICard {...props4} />
</MetricsGrid>
```

**Grid Options:**
- `columns`: 1-4 desktop columns
- `gap`: `sm | md | lg` spacing
- `mobileColumns`: 1-2 mobile columns

### ChartCard
Chart container with export and fullscreen capabilities.

```tsx
import { ChartCard } from '@/components/dashboard/ChartCard';

<ChartCard
  title="Revenue Trends"
  description="Monthly performance overview"
  onExport={() => handleExport()}
  onFullscreen={() => handleFullscreen()}
  onRefresh={() => handleRefresh()}
  trend={{ value: 12, label: "vs last month", positive: true }}
  loading={isLoading}
  error={errorMessage}
>
  {/* Chart content */}
</ChartCard>
```

### DataTable
Enhanced table with sorting, filtering, and search.

```tsx
import { DataTable } from '@/components/dashboard/DataTable';

<DataTable
  title="Inventory Data"
  description="Current inventory status"
  columns={columns}
  data={data}
  searchable={true}
  sortable={true}
  filterable={true}
  onSort={(column, direction) => handleSort(column, direction)}
  onSearch={(query) => handleSearch(query)}
  loading={isLoading}
/>
```

## Accessibility Standards

### Required Attributes
- `aria-label` for icon-only buttons
- `aria-describedby` for form validation
- `aria-expanded` for collapsible elements
- `role` attributes where semantic HTML isn't sufficient

### Keyboard Navigation
- All interactive elements must be focusable
- Tab order should be logical
- Enter/Space should activate buttons
- Escape should close modals/dropdowns

### Color Contrast
- Text contrast ratio ≥ 4.5:1 (AA standard)
- Interactive elements ≥ 3:1
- Use semantic colors for status indication

## Performance Guidelines

### Code Splitting
```tsx
// Lazy load heavy components
const HeavyChart = React.lazy(() => import('./HeavyChart'));

// Use with Suspense
<Suspense fallback={<Skeleton className="h-[400px]" />}>
  <HeavyChart data={data} />
</Suspense>
```

### Memoization
```tsx
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Memoize components
const MemoizedComponent = React.memo(Component);
```

### Loading States
Always provide loading states for async operations:
```tsx
{loading ? (
  <Skeleton className="h-8 w-full" />
) : (
  <DataDisplay data={data} />
)}
```

## Common Patterns

### Form Validation
```tsx
const [errors, setErrors] = useState<Record<string, string>>({});

<div className="space-y-2">
  <Input
    placeholder="Email"
    aria-invalid={!!errors.email}
    className={cn(errors.email && "border-destructive")}
  />
  {errors.email && (
    <p className="text-sm text-destructive">{errors.email}</p>
  )}
</div>
```

### Conditional Rendering
```tsx
{data.length > 0 ? (
  <DataTable data={data} />
) : (
  <div className="text-center py-8 text-muted-foreground">
    No data available
  </div>
)}
```

### Error Boundaries
```tsx
<ErrorBoundary>
  <ComplexComponent />
</ErrorBoundary>
```

## Testing Strategies

### Component Testing
```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

test('button renders with correct text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

### Accessibility Testing
```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should not have accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Troubleshooting

### Common Issues

1. **Styling not applying**: Ensure Tailwind CSS is properly configured
2. **TypeScript errors**: Check component prop types and imports
3. **Accessibility warnings**: Validate ARIA attributes and semantic HTML
4. **Performance issues**: Check for unnecessary re-renders and heavy calculations

### Debug Tools
- React Developer Tools for component inspection
- Lighthouse for performance and accessibility auditing
- axe-core for accessibility testing

## Migration Checklist

When migrating existing components to Shadcn:

- [ ] Replace custom styles with Shadcn components
- [ ] Update imports to use Shadcn components
- [ ] Add proper TypeScript types
- [ ] Include loading states with Skeleton
- [ ] Test accessibility compliance
- [ ] Verify responsive design
- [ ] Update documentation