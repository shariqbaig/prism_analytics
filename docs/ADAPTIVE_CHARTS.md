# Adaptive Chart Rendering System Documentation

## Overview

The Adaptive Chart Rendering System is a comprehensive charting solution that intelligently renders data visualizations based on available data sources, chart types, and rendering libraries. This system provides seamless switching between Chart.js and Recharts while maintaining consistent functionality and robust error handling.

## Architecture

### Core Components

#### 1. AdaptiveChart (`/src/components/charts/AdaptiveChart.tsx`)
- **Main component** that orchestrates chart rendering
- **Adaptive logic** based on data source availability
- **Library switching** between Chart.js and Recharts
- **Automatic fallbacks** when data sources are unavailable

#### 2. ChartWrapper (`/src/components/charts/ChartWrapper.tsx`)
- **Error boundary** for graceful error handling
- **Loading states** with spinners and progress indicators
- **Fallback components** for failed chart renders
- **Retry mechanisms** for temporary failures

#### 3. Library-Specific Renderers
- **ChartJSRenderer** (`/src/components/charts/ChartJSRenderer.tsx`)
- **RechartsRenderer** (`/src/components/charts/RechartsRenderer.tsx`)
- **Consistent API** across different rendering engines
- **Optimized configurations** for each library

#### 4. Data Hook (`/src/hooks/useChartData.ts`)
- **Data fetching** from IndexedDB storage
- **Data transformation** for different chart libraries
- **Loading and error state management**
- **Available data source detection**

## Features

### Adaptive Rendering

#### Data Source Intelligence
- **Inventory-only** mode when only inventory data is available
- **OSR-only** mode when only OSR data is available
- **Combined mode** when both data sources are present
- **Automatic fallbacks** when preferred data source is unavailable

#### Chart Type Optimization
- **Pie chart limits** - Automatically switches to bar chart for >20 data points
- **Responsive breakpoints** - Adjusts chart dimensions for mobile devices
- **Color palette selection** - Adapts colors based on data characteristics

### Multi-Library Support

#### Chart.js Integration
- **Tree-shaking optimization** with explicit component registration
- **Responsive configuration** with maintainAspectRatio: false
- **Custom color generation** for datasets
- **Advanced tooltip configurations**

```typescript
// Chart.js component registration for tree-shaking
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);
```

#### Recharts Integration
- **ResponsiveContainer** for automatic sizing
- **Initial dimensions** for SSR compatibility
- **Custom styling** with consistent theme
- **Enhanced accessibility** features

```typescript
<ResponsiveContainer 
  width="100%" 
  height={height}
  initialDimension={{ width: 520, height }}
>
  {renderChart()}
</ResponsiveContainer>
```

### Error Handling & Resilience

#### Error Boundary Implementation
- **Component-level error catching** prevents app crashes
- **User-friendly error messages** with actionable guidance
- **Retry mechanisms** for transient failures
- **Fallback visualizations** when data is malformed

#### Loading State Management
- **Progressive loading** with skeleton components
- **Data fetching indicators** with progress feedback
- **Timeout handling** for slow operations
- **Graceful degradation** when data is incomplete

## Chart Types Supported

### Bar Charts
- **Vertical bars** with categorical data
- **Horizontal bars** for long category names
- **Stacked bars** for multiple data series
- **Grouped bars** for comparative analysis

### Line Charts
- **Time series** visualization
- **Trend analysis** with smooth curves
- **Multiple series** with different colors
- **Point highlighting** on hover

### Pie Charts
- **Proportional visualization** for categorical data
- **Slice labels** with percentages
- **Color-coded segments** for easy identification
- **Interactive hover effects**

### Area Charts
- **Filled line charts** for cumulative data
- **Stacked areas** for multiple series
- **Gradient fills** for visual appeal
- **Smooth interpolation** between points

## Usage Examples

### Basic Implementation

```typescript
import { AdaptiveChart } from '@/components/charts';
import { useChartData } from '@/hooks/useChartData';

function MyDashboard() {
  const { rechartsData, loading } = useChartData({
    dataSource: 'inventory',
    chartType: 'bar'
  });

  const config = {
    title: 'Inventory Analysis',
    type: 'bar' as const,
    library: 'recharts' as const,
    responsive: true,
    height: 400,
    dataSource: 'inventory' as const
  };

  return (
    <AdaptiveChart
      data={rechartsData || []}
      config={config}
      loading={loading}
    />
  );
}
```

### Advanced Configuration

```typescript
const advancedConfig: ChartConfig = {
  title: 'Executive Dashboard - Combined Analysis',
  type: 'line',
  library: 'chartjs',
  responsive: true,
  height: 600,
  width: 1200,
  dataSource: 'combined'
};

// The system will automatically:
// - Fall back to single data source if combined unavailable
// - Switch to bar chart if line chart not suitable for data
// - Adjust dimensions for mobile devices
// - Handle loading and error states gracefully
```

### Error Handling

```typescript
function RobustChart() {
  const customErrorFallback = (
    <div className="chart-error">
      <p>Custom error message</p>
      <button onClick={() => window.location.reload()}>
        Refresh Page
      </button>
    </div>
  );

  return (
    <AdaptiveChart
      data={data}
      config={config}
      loading={loading}
      errorFallback={customErrorFallback}
    />
  );
}
```

## Data Transformation

### Chart.js Format
```typescript
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}
```

### Recharts Format
```typescript
interface RechartData {
  [key: string]: string | number;
}

// Example:
const rechartsData: RechartData[] = [
  { name: 'Q1', value: 12000, category: 'Inventory' },
  { name: 'Q2', value: 15000, category: 'Inventory' }
];
```

## Performance Considerations

### Optimization Strategies
- **Tree-shaking** eliminates unused Chart.js components
- **Lazy loading** of chart libraries reduces initial bundle size
- **Memoization** prevents unnecessary re-renders
- **Data caching** reduces database queries

### Memory Management
- **Component cleanup** when charts are unmounted
- **Event listener removal** to prevent memory leaks
- **Data garbage collection** for large datasets
- **Efficient re-rendering** with React.memo

## Responsive Design

### Breakpoint Adaptations
- **Mobile devices** (<768px): Simplified charts with essential data
- **Tablets** (768px-1024px): Medium complexity with key metrics
- **Desktop** (>1024px): Full-featured charts with all data

### Visual Adaptations
- **Font scaling** based on container size
- **Color contrast** optimization for different themes
- **Touch-friendly** interactions on mobile devices
- **Accessibility compliance** with WCAG guidelines

## Integration Points

### Data Layer Integration
- **IndexedDB queries** through useDataStorage hook
- **Real-time updates** when data changes
- **Efficient caching** to reduce load times
- **Error recovery** for database connection issues

### Theme Integration
- **shadcn/ui** component styling consistency
- **CSS custom properties** for theme switching
- **Color palette** synchronized with app theme
- **Dark mode support** with appropriate chart colors

## Testing Strategy

### Unit Tests
- **Component rendering** with various data inputs
- **Error boundary behavior** with malformed data
- **Data transformation** accuracy
- **Configuration validation** for different scenarios

### Integration Tests
- **Data fetching** from IndexedDB
- **Chart library switching** without errors
- **Responsive behavior** across different screen sizes
- **Error recovery** mechanisms

### Performance Tests
- **Large dataset rendering** (>1000 points)
- **Memory usage** during chart operations
- **Loading time benchmarks** for different chart types
- **Bundle size optimization** verification

## Browser Compatibility

### Supported Browsers
- **Chrome/Edge** - Full feature support with optimal performance
- **Firefox** - Complete compatibility with minor performance differences
- **Safari** - Full support with Canvas API optimizations
- **Mobile browsers** - Touch-optimized with responsive adaptations

### Polyfills Required
- **ResizeObserver** for older browsers (included in chart libraries)
- **IntersectionObserver** for performance optimizations
- **Canvas API** features for advanced chart rendering

## Future Enhancements

### Planned Features
- **Real-time data streaming** with WebSocket integration
- **Advanced animations** with custom transition effects
- **Export functionality** to PDF, PNG, and SVG formats
- **Interactive drill-down** capabilities for detailed analysis

### Performance Improvements
- **WebGL rendering** for large datasets
- **Worker thread processing** for complex calculations
- **Incremental loading** for massive datasets
- **Caching strategies** for frequently accessed charts

### Accessibility Enhancements
- **Screen reader support** with detailed chart descriptions
- **Keyboard navigation** for interactive elements
- **High contrast mode** for visual impairments
- **Voice announcements** for data point changes

## Related Documentation

- [Data Layer Documentation](./DATA_LAYER.md) - Database and storage implementation
- [Dashboard Components](./DASHBOARD_COMPONENTS.md) - UI component integration
- [useDataStorage Hook](../src/hooks/useDataStorage.ts) - Data access patterns
- [Chart Demo Page](../src/pages/ChartDemo.tsx) - Interactive demonstration

## Dependencies

### Core Dependencies
- `chart.js` (^4.4.0) - Chart.js library for Canvas-based charts
- `react-chartjs-2` (^5.2.0) - React wrapper for Chart.js
- `recharts` (^2.12.0) - React charts built with D3

### Development Dependencies
- `@types/chart.js` - TypeScript definitions
- Testing utilities for chart component testing
- Performance monitoring tools for optimization

## Migration Guide

### From Individual Chart Libraries
If migrating from direct Chart.js or Recharts usage:

1. Replace individual chart components with `AdaptiveChart`
2. Update data structures to match the unified interfaces
3. Configure the `ChartConfig` object with desired settings
4. Remove direct library imports and use the centralized system

### Configuration Migration
```typescript
// Before (direct Recharts usage)
<BarChart data={data} width={400} height={300}>
  <XAxis dataKey="name" />
  <YAxis />
  <Bar dataKey="value" fill="#8884d8" />
</BarChart>

// After (AdaptiveChart)
<AdaptiveChart
  data={data}
  config={{
    title: 'My Chart',
    type: 'bar',
    library: 'recharts',
    height: 300,
    dataSource: 'inventory'
  }}
/>
```