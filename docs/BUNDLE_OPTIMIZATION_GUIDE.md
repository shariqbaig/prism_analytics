# Bundle Optimization & Performance Guide

## Overview

This guide documents the bundle optimization strategies implemented for the PRISM Analytics project after the Shadcn/UI migration. The goal is to maintain executive dashboard performance while leveraging the full power of Shadcn components.

## Performance Targets

Based on task requirements:
- **Dashboard Load Time**: <2 seconds
- **Component Render Time**: <100ms per component
- **Bundle Size Increase**: <15% over pre-Shadcn implementation
- **Memory Usage**: Optimized for long executive sessions
- **Smooth Interactions**: 60fps animations and transitions

## Bundle Structure & Code Splitting

### Manual Chunks Configuration

The application uses strategic code splitting to optimize loading:

```typescript
manualChunks: {
  // Core React dependencies (30-40KB gzipped)
  vendor: ['react', 'react-dom', 'react-router-dom'],
  
  // Chart libraries (100-120KB gzipped)
  charts: ['chart.js', 'react-chartjs-2', 'recharts'],
  
  // Shadcn/UI components (40-60KB gzipped)
  shadcn: [
    '@radix-ui/react-slot', 
    '@radix-ui/react-toast', 
    '@radix-ui/react-dialog',
    '@radix-ui/react-alert-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-select',
    '@radix-ui/react-tabs',
    'class-variance-authority'
  ],
  
  // State management (5-8KB gzipped)
  stores: ['zustand'],
  
  // Utilities (15-20KB gzipped)
  utils: ['clsx', 'tailwind-merge', 'lucide-react'],
  
  // Animations (25-30KB gzipped)
  motion: ['framer-motion'],
  
  // Data processing (40-50KB gzipped)
  data: ['dexie', 'xlsx', 'jspdf']
}
```

### Loading Strategy

1. **Critical Path**: `vendor` + `utils` chunks load first
2. **Dashboard Core**: `shadcn` chunk loads for UI components
3. **Feature-Based**: `charts`, `motion`, `data` load on-demand
4. **Progressive Enhancement**: Non-critical features load asynchronously

## Tree-Shaking Optimization

### Shadcn Components

Only import used Shadcn components to enable tree-shaking:

```typescript
// ✅ Good - Tree-shakable imports
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// ❌ Avoid - Imports entire library
import * as ShadcnComponents from '@/components/ui'
```

### Lucide Icons

Import icons individually for optimal tree-shaking:

```typescript
// ✅ Good - Individual icon imports
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

// ❌ Avoid - Imports all icons
import * as Icons from 'lucide-react'
```

### Radix UI Components

Use specific Radix imports for each component:

```typescript
// ✅ Good - Specific component imports
import { Select, SelectContent, SelectItem } from '@radix-ui/react-select'

// ❌ Avoid - Root package imports
import { Select } from '@radix-ui/react'
```

## Performance Monitoring

### Automatic Monitoring

The application includes built-in performance monitoring:

```typescript
import { performanceMonitor, bundleMetrics } from '@/lib/performance'

// Initialize monitoring
performanceMonitor.init()

// Track bundle metrics
bundleMetrics.logBundleMetrics()
```

### Component Performance Tracking

Use performance hooks for critical components:

```typescript
import { usePerformanceMonitor } from '@/lib/performance'

export const KPICard: React.FC<KPICardProps> = ({ ... }) => {
  const { startTimer, endTimer } = usePerformanceMonitor('KPICard')
  
  useEffect(() => {
    startTimer()
    return () => endTimer()
  })
  
  // Component implementation
}
```

### Performance Metrics Dashboard

Access real-time performance data:

```typescript
// Generate performance report
console.log(performanceMonitor.generateReport())

// Get specific metrics
const metrics = performanceMonitor.getMetrics()
```

## Build Optimization

### Production Build Settings

Optimized build configuration for production:

```typescript
build: {
  target: 'es2020',           // Modern browser target
  minify: 'esbuild',          // Fast minification
  sourcemap: false,           // Disable sourcemaps in production
  cssMinify: true,            // Minify CSS
  reportCompressedSize: false, // Skip size reporting for speed
  chunkSizeWarningLimit: 1000, // 1MB warning threshold
}
```

### Bundle Analysis

Monitor bundle size with built-in tools:

```bash
# Generate bundle analysis report
npm run build:analyze

# Check bundle sizes
npm run build:stats

# Performance test
npm run perf:test
```

## Memory Optimization

### Component Memoization

Strategic memoization for expensive components:

```typescript
// Memoize expensive calculations
const calculatedMetrics = useMemo(() => {
  return processLargeDataset(data)
}, [data])

// Memoize stable callbacks
const handleItemClick = useCallback((item: Item) => {
  onItemSelect(item)
}, [onItemSelect])

// Memoize components with complex props
const MemoizedChart = React.memo(ChartComponent)
```

### Cleanup Patterns

Proper cleanup for long-running executive sessions:

```typescript
useEffect(() => {
  const timer = setInterval(updateMetrics, 30000)
  const observer = new IntersectionObserver(handleIntersection)
  
  return () => {
    clearInterval(timer)
    observer.disconnect()
    // Cleanup performance monitors
    performanceMonitor.destroy()
  }
}, [])
```

## Runtime Performance

### Loading States

Implement proper loading states to maintain perceived performance:

```typescript
// Use Skeleton components for consistent loading UX
if (loading) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[200px] w-full" />
      </CardContent>
    </Card>
  )
}
```

### Lazy Loading

Implement lazy loading for heavy components:

```typescript
// Lazy load heavy dashboard components
const HeavyDashboard = lazy(() => import('./HeavyDashboard'))

// Use with proper fallbacks
<Suspense fallback={<DashboardSkeleton />}>
  <HeavyDashboard />
</Suspense>
```

## Performance Benchmarks

### Initial Load Performance

Target metrics for executive dashboard:
- **First Contentful Paint**: <1.2s
- **Largest Contentful Paint**: <2.5s
- **Time to Interactive**: <2.0s
- **Cumulative Layout Shift**: <0.1

### Runtime Performance

Target metrics during usage:
- **Component Render**: <100ms per component
- **Animation Frame Rate**: 60fps maintained
- **Memory Growth**: <10MB per hour
- **Bundle Size**: <500KB main chunk (gzipped)

## Monitoring & Alerts

### Performance Regression Detection

Automated monitoring for performance regressions:

```typescript
// Bundle size monitoring
if (bundleSize > previousSize * 1.15) {
  console.warn('Bundle size increased by >15%')
}

// Render time monitoring
if (renderTime > PERFORMANCE_TARGETS.COMPONENT_RENDER_TIME) {
  console.warn(`Component ${name} render time: ${renderTime}ms`)
}
```

### Executive Dashboard KPIs

Key performance indicators for executive use:
- Dashboard responsiveness during peak usage
- Component render consistency across sessions
- Memory stability during long meetings
- Loading performance on executive tablets

## Troubleshooting

### Common Performance Issues

1. **Slow Component Renders**
   - Check for unnecessary re-renders
   - Implement proper memoization
   - Use React DevTools Profiler

2. **Large Bundle Sizes**
   - Audit imports with bundle analyzer
   - Implement lazy loading
   - Check for duplicate dependencies

3. **Memory Leaks**
   - Audit event listeners and timers
   - Check for circular references
   - Monitor component cleanup

### Performance Tools

Essential tools for performance optimization:
- **Bundle Analyzer**: `npm run build:analyze`
- **React DevTools**: Component profiling
- **Chrome DevTools**: Performance tab
- **Lighthouse**: Core Web Vitals
- **Performance Monitor**: Built-in metrics

## Best Practices

### Development Workflow

1. **Profile Before Optimizing**: Always measure first
2. **Optimize Critical Path**: Focus on loading performance
3. **Monitor Continuously**: Track performance metrics
4. **Test on Target Devices**: Validate on executive tablets
5. **Maintain Performance Budget**: Stay within size limits

### Code Review Checklist

- [ ] Proper component memoization implemented
- [ ] Bundle imports are tree-shakable
- [ ] Loading states use Skeleton components
- [ ] Memory cleanup implemented
- [ ] Performance metrics within targets
- [ ] Bundle size impact assessed

## Implementation Status

### ✅ Completed Optimizations

- Bundle analysis and visualization setup
- Strategic code splitting configuration
- Performance monitoring infrastructure
- Tree-shaking optimization for Shadcn components
- Memory usage tracking and optimization

### 📋 Future Enhancements

- Service worker implementation for caching
- Progressive Web App optimization
- Advanced bundle splitting strategies
- Real-time performance monitoring dashboard
- Automated performance regression testing

## Resources

- [Vite Bundle Optimization Guide](https://vitejs.dev/guide/build.html#build-optimizations)
- [React Performance Best Practices](https://react.dev/learn/render-and-commit)
- [Web Performance Metrics](https://web.dev/metrics/)
- [Shadcn Performance Guidelines](https://ui.shadcn.com/docs/optimization)