# Shadcn Bundle Optimization & Performance

## Executive Summary

**Status**: 📋 IN PROGRESS  
**Priority**: High  
**Timeline**: Week 6-7 (7 days)  
**Dependencies**: All previous phases (Tasks 09-12)  
**Risk Level**: Medium  
**Business Impact**: High

Optimize bundle size and runtime performance of Shadcn components to ensure executive dashboard maintains fast loading times and responsive interactions while providing enhanced functionality.

## Performance Objectives

### Primary Goals
1. **Bundle Size Optimization**: Minimize JavaScript bundle increase from Shadcn migration
2. **Runtime Performance**: Maintain or improve component render performance
3. **Loading Optimization**: Implement code splitting and lazy loading strategies
4. **Memory Optimization**: Reduce memory footprint of dashboard components
5. **Network Optimization**: Optimize asset delivery and caching strategies
6. **Executive Experience**: Ensure <2s dashboard load time on executive devices

### Success Criteria
- [ ] Bundle size increase <15% from pre-migration baseline
- [ ] Dashboard load time <2 seconds on executive devices
- [ ] Component render time <100ms for all UI components
- [ ] Memory usage increase <25MB from baseline
- [ ] Lazy loading implemented for non-critical components
- [ ] Tree-shaking eliminates unused Shadcn components
- [ ] Performance monitoring and alerting implemented

## Current Performance Analysis

### Baseline Metrics (Pre-Shadcn Migration)
```typescript
// Performance baselines to maintain or improve
interface PerformanceBaseline {
  bundleSize: {
    main: '245KB gzipped'      // Main application bundle
    vendor: '123KB gzipped'    // Third-party libraries
    total: '368KB gzipped'     // Total initial load
  }
  
  loadTimes: {
    dashboard: '1.2s'          // Executive dashboard first load
    navigation: '150ms'        // Page navigation
    chartRender: '800ms'       // Chart rendering time
  }
  
  runtime: {
    componentRender: '45ms'    // Average component render
    memoryUsage: '18MB'        // Dashboard memory usage
    interactionLatency: '120ms' // User interaction response
  }
}
```

### Performance Risk Assessment
- **High Risk**: Bundle size increase from additional Shadcn components
- **Medium Risk**: Runtime performance impact from enhanced components
- **Low Risk**: Memory leaks from component lifecycle changes

## Bundle Optimization Strategy

### 1. Tree Shaking and Dead Code Elimination

**Vite Configuration Optimization**:
```typescript
// vite.config.ts - Enhanced for Bundle Optimization
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { analyzer } from 'vite-bundle-analyzer'

export default defineConfig({
  plugins: [
    react(),
    // Bundle analysis in development
    process.env.ANALYZE && analyzer({
      analyzerMode: 'server',
      analyzerPort: 8888,
      openAnalyzer: true,
    })
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  build: {
    // Enhanced build optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate chunks for better caching
          'vendor': ['react', 'react-dom'],
          'ui': ['@radix-ui/react-slot', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          'charts': ['chart.js', 'react-chartjs-2', 'recharts'],
          'utils': ['dexie', 'xlsx', 'jspdf'],
          'icons': ['lucide-react']
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? 
            chunkInfo.facadeModuleId.split('/').pop()?.replace('.ts', '').replace('.tsx', '') : 
            'chunk'
          return `assets/${facadeModuleId}-[hash].js`
        }
      },
      
      external: (id) => {
        // Externalize large dependencies that can be loaded separately
        return false // Keep everything bundled for now, but monitor
      }
    },
    
    // Optimize bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,        // Remove console.log in production
        drop_debugger: true,       // Remove debugger statements
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: {
        safari10: true            // Support Safari 10+
      }
    },
    
    // Source map configuration
    sourcemap: process.env.NODE_ENV === 'development',
    
    // Bundle size limits
    chunkSizeWarningLimit: 1000,  // Warn for chunks > 1MB
    
    // Asset inlining threshold
    assetsInlineLimit: 4096,      // Inline assets < 4KB
  },
  
  // Development server optimization
  server: {
    fs: {
      allow: ['..']
    }
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@radix-ui/react-slot',
      'class-variance-authority',
      'clsx',
      'tailwind-merge'
    ],
    exclude: [
      // Exclude heavy dependencies that should be loaded lazily
      'chart.js',
      'jspdf'
    ]
  }
})
```

### 2. Code Splitting and Lazy Loading

**Component-Level Code Splitting**:
```typescript
// src/components/lazy/index.ts - Lazy Component Exports
import { lazy } from 'react'

// Lazy load heavy components
export const LazyAdvancedDataTable = lazy(() => 
  import('@/components/ui/advanced-data-table').then(module => ({
    default: module.AdvancedDataTable
  }))
)

export const LazyExecutiveCommand = lazy(() =>
  import('@/components/ui/executive-command').then(module => ({
    default: module.ExecutiveCommand
  }))
)

export const LazyChartComponents = lazy(() =>
  import('@/components/charts').then(module => ({
    default: module
  }))
)

export const LazyExcelProcessor = lazy(() =>
  import('@/components/FileUpload').then(module => ({
    default: module.FileUpload
  }))
)

// Route-level lazy loading
export const LazyDashboard = lazy(() => import('@/pages/Dashboard'))
export const LazyInventory = lazy(() => import('@/pages/Inventory'))
export const LazyOSR = lazy(() => import('@/pages/OSR'))
export const LazyDemo = lazy(() => import('@/pages/Demo'))
```

**Lazy Loading Wrapper Component**:
```typescript
// src/components/ui/lazy-wrapper.tsx
import React, { Suspense } from 'react'
import { Loading } from '@/components/ui/loading-skeleton'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  error?: React.ReactNode
  className?: string
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback = <Loading variant="skeleton" rows={3} className="min-h-[200px]" />,
  error = <div>Error loading component</div>,
  className
}) => (
  <div className={className}>
    <ErrorBoundary fallback={error}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  </div>
)

// Usage in components
export const DataTableLazy: React.FC<any> = (props) => (
  <LazyWrapper fallback={<div className="h-64 animate-pulse bg-muted rounded" />}>
    <LazyAdvancedDataTable {...props} />
  </LazyWrapper>
)
```

### 3. Shadcn Component Optimization

**Selective Import Strategy**:
```typescript
// src/lib/shadcn-imports.ts - Optimized Shadcn Imports
// Import only used Shadcn components to enable tree-shaking

// Core components (always imported)
export { Button } from '@/components/ui/button'
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
export { Badge } from '@/components/ui/badge'

// Conditional imports based on usage
export const getTableComponents = () => import('@/components/ui/table')
export const getDialogComponents = () => import('@/components/ui/dialog')
export const getFormComponents = () => import('@/components/ui/form')
export const getChartComponents = () => import('@/components/charts')

// Dynamic import utility
export const importShadcnComponent = async (componentName: string) => {
  switch (componentName) {
    case 'table':
      return await getTableComponents()
    case 'dialog':
      return await getDialogComponents()
    case 'form':
      return await getFormComponents()
    default:
      throw new Error(`Unknown component: ${componentName}`)
  }
}
```

**Component Bundle Analysis**:
```typescript
// src/utils/bundle-analyzer.ts - Development Bundle Analysis
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    // Bundle analysis logging
    console.group('🏗️ Bundle Analysis')
    console.log('Shadcn components loaded:', Object.keys(window.__SHADCN_COMPONENTS__ || {}))
    console.log('Bundle size estimate:', performance?.memory?.totalJSHeapSize || 'Not available')
    console.groupEnd()
  }
}

// Performance monitoring
export const monitorPerformance = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          console.log(`⚡ Page Load Time: ${entry.duration}ms`)
        }
        if (entry.entryType === 'measure') {
          console.log(`📊 ${entry.name}: ${entry.duration}ms`)
        }
      }
    })
    
    observer.observe({ entryTypes: ['navigation', 'measure'] })
  }
}
```

## Runtime Performance Optimization

### 1. Component Rendering Optimization

**Memoization Strategy**:
```typescript
// src/hooks/useOptimizedComponent.ts
import { memo, useMemo, useCallback } from 'react'

// Higher-order component for optimizing Shadcn components
export function withOptimization<T extends object>(
  Component: React.ComponentType<T>,
  compareProps?: (prevProps: T, nextProps: T) => boolean
) {
  return memo(Component, compareProps)
}

// Custom hooks for expensive computations
export const useOptimizedKPICalculation = (data: any[]) => {
  return useMemo(() => {
    // Expensive KPI calculations
    return data.reduce((acc, item) => ({
      total: acc.total + item.value,
      average: (acc.total + item.value) / (acc.count + 1),
      count: acc.count + 1
    }), { total: 0, average: 0, count: 0 })
  }, [data])
}

export const useOptimizedTableData = (rawData: any[], filters: any) => {
  return useMemo(() => {
    performance.mark('table-filter-start')
    
    const filtered = rawData.filter(item => {
      // Apply filters
      return Object.entries(filters).every(([key, value]) => 
        !value || item[key]?.toString().toLowerCase().includes(value.toLowerCase())
      )
    })
    
    performance.mark('table-filter-end')
    performance.measure('table-filter-duration', 'table-filter-start', 'table-filter-end')
    
    return filtered
  }, [rawData, filters])
}
```

**Virtual Scrolling for Large Tables**:
```typescript
// src/components/ui/virtual-table.tsx
import React, { useMemo, useCallback } from 'react'
import { FixedSizeList as List } from 'react-window'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface VirtualTableProps {
  data: any[]
  columns: any[]
  height?: number
  itemSize?: number
  overscan?: number
}

export const VirtualTable: React.FC<VirtualTableProps> = ({
  data,
  columns,
  height = 400,
  itemSize = 60,
  overscan = 5
}) => {
  const Row = useCallback(({ index, style }: { index: number; style: any }) => {
    const item = data[index]
    
    return (
      <div style={style}>
        <TableRow className="border-b">
          {columns.map((column) => (
            <TableCell key={column.key} className="px-4 py-3">
              {column.render ? column.render(item[column.key], item) : item[column.key]}
            </TableCell>
          ))}
        </TableRow>
      </div>
    )
  }, [data, columns])

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className="px-4 py-3">
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      </Table>
      
      <List
        height={height}
        itemCount={data.length}
        itemSize={itemSize}
        overscanCount={overscan}
        className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-background"
      >
        {Row}
      </List>
    </div>
  )
}
```

### 2. Memory Management

**Component Cleanup and Memory Management**:
```typescript
// src/hooks/useMemoryOptimized.ts
import { useEffect, useRef, useCallback } from 'react'

export const useMemoryOptimized = () => {
  const cleanup = useRef<(() => void)[]>([])
  
  const addCleanup = useCallback((fn: () => void) => {
    cleanup.current.push(fn)
  }, [])
  
  const performCleanup = useCallback(() => {
    cleanup.current.forEach(fn => fn())
    cleanup.current = []
  }, [])
  
  useEffect(() => {
    return performCleanup
  }, [performCleanup])
  
  return { addCleanup }
}

// Chart memory management
export const useChartCleanup = (chartRef: React.RefObject<any>) => {
  const { addCleanup } = useMemoryOptimized()
  
  useEffect(() => {
    if (chartRef.current) {
      addCleanup(() => {
        // Clean up chart resources
        if (chartRef.current?.destroy) {
          chartRef.current.destroy()
        }
      })
    }
  }, [chartRef, addCleanup])
}
```

## Performance Monitoring and Alerting

### 1. Performance Monitoring Setup

**Performance Metrics Collection**:
```typescript
// src/utils/performance-monitor.ts
interface PerformanceMetrics {
  bundleSize: number
  loadTime: number
  renderTime: number
  memoryUsage: number
  interactionLatency: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    bundleSize: 0,
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    interactionLatency: 0
  }
  
  private thresholds = {
    loadTime: 2000,           // 2 seconds max load time
    renderTime: 100,          // 100ms max render time
    memoryUsage: 50 * 1024 * 1024, // 50MB max memory
    bundleSize: 500 * 1024,   // 500KB max bundle size
    interactionLatency: 200   // 200ms max interaction response
  }
  
  measureLoadTime() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      this.metrics.loadTime = navigation.loadEventEnd - navigation.navigationStart
      
      if (this.metrics.loadTime > this.thresholds.loadTime) {
        console.warn(`⚠️ Load time exceeded threshold: ${this.metrics.loadTime}ms`)
      }
    }
  }
  
  measureRenderTime(componentName: string, renderFn: () => void) {
    const start = performance.now()
    renderFn()
    const end = performance.now()
    const duration = end - start
    
    if (duration > this.thresholds.renderTime) {
      console.warn(`⚠️ ${componentName} render time exceeded threshold: ${duration}ms`)
    }
    
    return duration
  }
  
  measureMemoryUsage() {
    if ('memory' in performance) {
      this.metrics.memoryUsage = (performance as any).memory.totalJSHeapSize
      
      if (this.metrics.memoryUsage > this.thresholds.memoryUsage) {
        console.warn(`⚠️ Memory usage exceeded threshold: ${this.metrics.memoryUsage / 1024 / 1024}MB`)
      }
    }
  }
  
  measureInteractionLatency(interactionName: string, fn: () => Promise<void>) {
    return new Promise<void>(async (resolve) => {
      const start = performance.now()
      await fn()
      const end = performance.now()
      const duration = end - start
      
      if (duration > this.thresholds.interactionLatency) {
        console.warn(`⚠️ ${interactionName} latency exceeded threshold: ${duration}ms`)
      }
      
      resolve()
    })
  }
  
  generateReport(): PerformanceMetrics {
    return { ...this.metrics }
  }
}

export const performanceMonitor = new PerformanceMonitor()

// React integration
export const withPerformanceTracking = (
  Component: React.ComponentType<any>,
  componentName: string
) => {
  return React.memo((props: any) => {
    const renderTime = performanceMonitor.measureRenderTime(componentName, () => {
      // Component will render after this measurement setup
    })
    
    React.useEffect(() => {
      performanceMonitor.measureMemoryUsage()
    }, [])
    
    return React.createElement(Component, props)
  })
}
```

### 2. Bundle Size Monitoring

**Automated Bundle Analysis**:
```typescript
// scripts/analyze-bundle.js
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const BUNDLE_SIZE_THRESHOLD = 500 * 1024 // 500KB
const CHUNK_SIZE_THRESHOLD = 100 * 1024  // 100KB

function analyzeBundleSize() {
  // Build the project
  execSync('npm run build', { stdio: 'inherit' })
  
  // Analyze dist folder
  const distPath = path.join(__dirname, '../dist')
  const files = fs.readdirSync(path.join(distPath, 'assets'))
  
  const jsFiles = files.filter(file => file.endsWith('.js'))
  const cssFiles = files.filter(file => file.endsWith('.css'))
  
  let totalSize = 0
  const analysis = {
    javascript: [],
    css: [],
    warnings: []
  }
  
  // Analyze JavaScript files
  jsFiles.forEach(file => {
    const filePath = path.join(distPath, 'assets', file)
    const stats = fs.statSync(filePath)
    const size = stats.size
    totalSize += size
    
    analysis.javascript.push({
      name: file,
      size: size,
      sizeFormatted: formatBytes(size)
    })
    
    if (size > CHUNK_SIZE_THRESHOLD) {
      analysis.warnings.push(`Large chunk detected: ${file} (${formatBytes(size)})`)
    }
  })
  
  // Analyze CSS files
  cssFiles.forEach(file => {
    const filePath = path.join(distPath, 'assets', file)
    const stats = fs.statSync(filePath)
    const size = stats.size
    totalSize += size
    
    analysis.css.push({
      name: file,
      size: size,
      sizeFormatted: formatBytes(size)
    })
  })
  
  // Check total size
  if (totalSize > BUNDLE_SIZE_THRESHOLD) {
    analysis.warnings.push(`Total bundle size exceeds threshold: ${formatBytes(totalSize)}`)
  }
  
  // Generate report
  console.log('📊 Bundle Analysis Report')
  console.log('=======================')
  console.log(`Total Size: ${formatBytes(totalSize)}`)
  console.log(`JavaScript: ${analysis.javascript.length} files`)
  console.log(`CSS: ${analysis.css.length} files`)
  
  if (analysis.warnings.length > 0) {
    console.log('\n⚠️  Warnings:')
    analysis.warnings.forEach(warning => console.log(`  - ${warning}`))
  }
  
  // Save detailed report
  fs.writeFileSync(
    path.join(__dirname, '../bundle-analysis.json'),
    JSON.stringify(analysis, null, 2)
  )
  
  return analysis
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

if (require.main === module) {
  analyzeBundleSize()
}

module.exports = { analyzeBundleSize }
```

## Implementation Timeline

### Day 1-2: Bundle Analysis and Optimization Setup
1. **Bundle Analysis**
   - Implement bundle size monitoring
   - Set up performance thresholds
   - Create baseline measurements

2. **Vite Configuration Enhancement**
   - Optimize build configuration
   - Implement code splitting
   - Configure tree-shaking

### Day 3-4: Component-Level Optimization
1. **Lazy Loading Implementation**
   - Implement lazy loading for heavy components
   - Create loading fallbacks
   - Test lazy loading performance

2. **Component Memoization**
   - Add memoization to expensive components
   - Optimize render performance
   - Implement virtual scrolling for tables

### Day 5-6: Runtime Performance Optimization
1. **Memory Management**
   - Implement memory cleanup strategies
   - Add performance monitoring
   - Optimize component lifecycles

2. **Network Optimization**
   - Implement asset caching strategies
   - Optimize network requests
   - Add compression and minification

### Day 7: Testing and Validation
1. **Performance Testing**
   - Load testing with realistic data
   - Memory leak testing
   - Network performance testing

2. **Executive Device Testing**
   - Test on executive hardware
   - Validate loading times
   - Verify interaction responsiveness

## Quality Assurance

### Performance Testing Suite
```typescript
// Performance tests
describe('Bundle Performance', () => {
  it('should load dashboard within 2 seconds', async () => {
    // Performance timing test
  })
  
  it('should maintain memory usage under 50MB', () => {
    // Memory usage test
  })
  
  it('should render components within 100ms', () => {
    // Component render performance test
  })
})
```

### Automated Performance Monitoring
- **CI/CD Integration**: Bundle size checks in build pipeline
- **Performance Regression Detection**: Automated alerts for performance degradation
- **Executive Device Testing**: Regular testing on target hardware

## Success Metrics

### Bundle Optimization
- [ ] **Bundle Size**: <15% increase from baseline (target: <425KB total)
- [ ] **Code Splitting**: 5+ separate chunks for optimal caching
- [ ] **Tree Shaking**: Unused Shadcn components eliminated
- [ ] **Compression**: Gzip compression achieving >70% reduction

### Runtime Performance
- [ ] **Dashboard Load**: <2 seconds on executive devices
- [ ] **Component Render**: <100ms for all UI components
- [ ] **Memory Usage**: <25MB increase from baseline
- [ ] **Interaction Latency**: <200ms response time

### Executive Experience
- [ ] **First Contentful Paint**: <800ms
- [ ] **Largest Contentful Paint**: <1.5s
- [ ] **Cumulative Layout Shift**: <0.1
- [ ] **First Input Delay**: <100ms

---

**Deliverables**:
- Optimized bundle configuration with code splitting
- Lazy loading implementation for non-critical components  
- Performance monitoring and alerting system
- Component-level optimization and memoization
- Memory management and cleanup strategies
- Executive device performance validation

**Next Step**: Proceed to Documentation & Standards (Task 14)