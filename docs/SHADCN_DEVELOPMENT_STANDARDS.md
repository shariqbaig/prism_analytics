# Shadcn/UI Development Standards

## Overview

This document establishes development standards and coding guidelines for maintaining Shadcn/UI uniformity across the PRISM Analytics project. These standards ensure consistency, maintainability, and professional quality.

## File Naming Conventions

### Component Files
- Use PascalCase for component files: `KPICard.tsx`, `ExecutiveSummary.tsx`
- UI components should match Shadcn naming: `button.tsx`, `card.tsx`, `table.tsx`
- Custom dashboard components use descriptive names: `ChartCard.tsx`, `MetricsGrid.tsx`

### Directory Structure
```
src/
├── components/
│   ├── ui/                    # Shadcn base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── skeleton.tsx
│   ├── dashboard/             # Executive dashboard components
│   │   ├── KPICard.tsx
│   │   ├── ExecutiveSummary.tsx
│   │   └── ChartCard.tsx
│   └── layout/               # Layout components
└── lib/
    └── utils.ts              # Utility functions including cn()
```

## Import/Export Patterns

### Standard Imports
```tsx
// React imports first
import React from 'react';

// Shadcn UI imports
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Utility imports
import { cn } from '@/lib/utils';

// Icon imports
import { TrendingUp, AlertTriangle } from 'lucide-react';

// Type imports (with type keyword)
import type { ComponentProps } from 'react';
```

### Export Patterns
```tsx
// Named exports for components
export const KPICard: React.FC<KPICardProps> = ({ ... }) => {
  // Component implementation
};

// Export types alongside components
export type { KPICardProps, KPIStatus };

// Default exports only for pages
export default Dashboard;
```

## TypeScript Standards

### Component Props Interface
```tsx
interface ComponentProps {
  title: string;
  description?: string;
  className?: string;
  loading?: boolean;
  children?: React.ReactNode;
  onAction?: () => void;
}

// Use React.FC for functional components
export const Component: React.FC<ComponentProps> = ({
  title,
  description,
  className,
  loading = false,
  children,
  onAction
}) => {
  // Component implementation
};
```

### Props Destructuring Standards
```tsx
// ✅ Good - Destructure with defaults
export const Component: React.FC<Props> = ({
  title,
  variant = 'default',
  loading = false,
  className,
  ...props
}) => {
  // Implementation
};

// ❌ Avoid - Don't destructure everything at once if not used
export const Component: React.FC<Props> = (props) => {
  const { title, variant = 'default' } = props;
  // Implementation
};
```

### Type Definitions
```tsx
// Use union types for variants
type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';

// Use specific types over generic ones
type Status = 'success' | 'warning' | 'error' | 'neutral' | 'loading';

// Extend HTML attributes when appropriate
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  loading?: boolean;
}
```

## Component Structure Standards

### Executive Dashboard Components
```tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ComponentProps {
  // Props definition
}

export const Component: React.FC<ComponentProps> = ({
  // Props destructuring with defaults
}) => {
  // Loading state first
  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
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

  // Error state second
  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="py-8 text-center">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Main render
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Main content */}
      </CardContent>
    </Card>
  );
};
```

### Loading State Patterns
```tsx
// ✅ Preferred - Structured loading with Skeleton
if (loading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-[200px] w-full" />
    </div>
  );
}

// ❌ Avoid - Generic loading text
if (loading) {
  return <div>Loading...</div>;
}
```

## Styling Guidelines

### Tailwind Class Organization
```tsx
// Order: Layout → Spacing → Typography → Colors → Effects
<div className="
  flex flex-col              // Layout
  gap-4 p-6                 // Spacing  
  text-lg font-semibold     // Typography
  text-foreground bg-card   // Colors
  rounded-lg shadow-sm      // Effects
  hover:shadow-md           // States
  transition-shadow         // Transitions
">
```

### Semantic Color Usage
```tsx
// ✅ Use semantic colors
<div className="text-foreground bg-background">
<p className="text-muted-foreground">
<Button className="bg-primary text-primary-foreground">
<div className="border-destructive text-destructive">

// ❌ Avoid hardcoded colors
<div className="text-gray-900 bg-white">
<p className="text-gray-500">
<Button className="bg-blue-600 text-white">
<div className="border-red-500 text-red-500">
```

### Responsive Design Standards
```tsx
// Mobile-first responsive design
<div className="
  grid grid-cols-1          // Mobile: 1 column
  md:grid-cols-2           // Tablet: 2 columns  
  lg:grid-cols-4           // Desktop: 4 columns
  gap-4                    // Consistent gap
">
```

## State Management Standards

### Component State
```tsx
// ✅ Use descriptive state names
const [isLoading, setIsLoading] = useState(false);
const [selectedItem, setSelectedItem] = useState<Item | null>(null);
const [formErrors, setFormErrors] = useState<Record<string, string>>({});

// ❌ Avoid generic names
const [data, setData] = useState();
const [flag, setFlag] = useState(false);
```

### Event Handlers
```tsx
// ✅ Descriptive handler names
const handleSubmit = (event: React.FormEvent) => { ... };
const handleItemSelect = (item: Item) => { ... };
const handleModalClose = () => { ... };

// ❌ Generic handler names  
const onClick = () => { ... };
const handler = () => { ... };
```

## Accessibility Standards

### Required Attributes
```tsx
// Form controls
<Input
  aria-label="Search inventory"
  aria-describedby={error ? "error-message" : undefined}
  aria-invalid={!!error}
/>

// Interactive elements
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

// Status indicators
<div aria-live="polite" aria-atomic="true">
  Status updated successfully
</div>
```

### Focus Management
```tsx
// Modal focus management
const dialogRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (open && dialogRef.current) {
    dialogRef.current.focus();
  }
}, [open]);
```

## Performance Standards

### Memoization Guidelines
```tsx
// Memoize expensive calculations
const calculatedMetrics = useMemo(() => {
  return processLargeDataset(data);
}, [data]);

// Memoize stable callbacks
const handleItemClick = useCallback((item: Item) => {
  onItemSelect(item);
}, [onItemSelect]);

// Memoize components with complex props
const MemoizedChart = React.memo(ChartComponent);
```

### Code Splitting
```tsx
// Lazy load heavy components
const HeavyDashboard = lazy(() => import('./HeavyDashboard'));

// Use with proper fallbacks
<Suspense fallback={<DashboardSkeleton />}>
  <HeavyDashboard />
</Suspense>
```

## Testing Requirements

### Component Tests
```tsx
describe('KPICard', () => {
  it('renders title and value correctly', () => {
    render(
      <KPICard title="Revenue" value="$100k" status="success" />
    );
    
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$100k')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<KPICard title="Revenue" loading={true} />);
    
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const onClickMock = jest.fn();
    render(<KPICard title="Revenue" onClick={onClickMock} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onClickMock).toHaveBeenCalled();
  });
});
```

### Accessibility Tests
```tsx
it('meets accessibility standards', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Code Review Checklist

### Component Review
- [ ] Follows naming conventions
- [ ] Uses proper TypeScript types
- [ ] Implements loading states with Skeleton
- [ ] Handles error states appropriately
- [ ] Uses semantic colors and spacing
- [ ] Includes accessibility attributes
- [ ] Follows responsive design patterns
- [ ] Has appropriate tests

### UI/UX Review
- [ ] Matches executive dashboard aesthetics
- [ ] Maintains 120px minimum height for KPI cards
- [ ] Works on mobile devices (tablets)
- [ ] Provides proper feedback for user actions
- [ ] Follows design system tokens
- [ ] Smooth animations and transitions

### Performance Review
- [ ] Uses memoization where appropriate
- [ ] Implements code splitting for large components
- [ ] Optimizes bundle size
- [ ] Avoids unnecessary re-renders
- [ ] Includes performance monitoring

## Documentation Requirements

### Component Documentation
```tsx
/**
 * KPICard - Executive dashboard metric display
 * 
 * Displays key performance indicators with status color coding,
 * trend indicators, and professional loading states suitable
 * for C-Suite dashboards.
 * 
 * @param title - Metric title
 * @param value - Current metric value
 * @param status - Visual status indicator
 * @param trend - Trend direction (up/down/neutral)
 * @param loading - Loading state flag
 */
export const KPICard: React.FC<KPICardProps> = ({ ... }) => {
```

### README Updates
When adding new components, update relevant README files:
- Component purpose and usage
- Props interface documentation
- Code examples
- Migration notes (if updating existing components)

## Error Handling Standards

### Error Boundaries
```tsx
// Wrap complex components
<ErrorBoundary fallback={<ErrorFallback />}>
  <ComplexDashboard />
</ErrorBoundary>
```

### Graceful Degradation
```tsx
// Handle missing data gracefully
{data.length > 0 ? (
  <DataVisualization data={data} />
) : (
  <div className="text-center py-8 text-muted-foreground">
    <p>No data available</p>
    <Button onClick={handleRefresh} variant="outline">
      Refresh Data
    </Button>
  </div>
)}
```

## Migration Guidelines

### Converting Existing Components
1. **Audit current component**: Identify styling and functionality
2. **Map to Shadcn components**: Find equivalent Shadcn components
3. **Update imports**: Replace custom with Shadcn imports
4. **Refactor styling**: Use Tailwind with semantic tokens
5. **Add loading states**: Implement Skeleton loading patterns
6. **Test thoroughly**: Verify functionality and accessibility
7. **Update documentation**: Document changes and new usage patterns

### Backward Compatibility
- Maintain existing prop interfaces when possible
- Provide migration guides for breaking changes
- Use feature flags for gradual rollouts
- Document deprecated patterns with migration paths

## Quality Assurance

### Automated Checks
- TypeScript compilation
- ESLint for code quality
- Prettier for formatting
- Jest for unit tests
- Playwright for E2E tests
- Lighthouse for performance/accessibility

### Manual Verification
- Visual regression testing
- Cross-browser compatibility
- Mobile responsiveness
- Executive user acceptance testing