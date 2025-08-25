/**
 * Performance monitoring utilities for PRISM Analytics
 * Tracks bundle size, render times, and user experience metrics
 */

import React from 'react';

// Performance metrics interface
interface PerformanceMetrics {
  bundleSize: number;
  renderTime: number;
  loadTime: number;
  memoryUsage: number;
  componentRenderTime: Record<string, number>;
}

// Performance thresholds (from task requirements)
export const PERFORMANCE_TARGETS = {
  DASHBOARD_LOAD_TIME: 2000, // <2 seconds
  COMPONENT_RENDER_TIME: 100, // <100ms
  MAX_BUNDLE_INCREASE: 0.15, // <15% increase
} as const;

/**
 * Performance monitoring class
 */
class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private componentTimers: Map<string, number> = new Map();

  /**
   * Initialize performance monitoring
   */
  init() {
    if (typeof window === 'undefined') return;

    // Monitor navigation timing
    this.trackNavigationTiming();
    
    // Monitor component render times
    this.trackComponentRenders();
    
    // Monitor memory usage
    this.trackMemoryUsage();
    
    // Monitor largest contentful paint
    this.trackLCP();
  }

  /**
   * Track navigation timing metrics
   */
  private trackNavigationTiming() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        
        // Log performance metrics
        console.info('📊 Navigation Performance:', {
          loadTime: `${this.metrics.loadTime}ms`,
          target: `<${PERFORMANCE_TARGETS.DASHBOARD_LOAD_TIME}ms`,
          status: this.metrics.loadTime < PERFORMANCE_TARGETS.DASHBOARD_LOAD_TIME ? '✅ PASS' : '❌ FAIL'
        });
      }
    }
  }

  /**
   * Track Largest Contentful Paint
   */
  private trackLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformancePaintTiming;
        
        console.info('🎨 LCP Performance:', {
          lcp: `${Math.round(lastEntry.startTime)}ms`,
          target: '<2500ms (Good)',
          status: lastEntry.startTime < 2500 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT'
        });
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(observer);
      } catch (e) {
        // LCP not supported
      }
    }
  }

  /**
   * Track component render performance
   */
  private trackComponentRenders() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure' && entry.name.startsWith('⚛️')) {
            const componentName = entry.name.replace('⚛️ ', '');
            const renderTime = entry.duration;
            
            this.metrics.componentRenderTime = {
              ...this.metrics.componentRenderTime,
              [componentName]: renderTime
            };

            if (renderTime > PERFORMANCE_TARGETS.COMPONENT_RENDER_TIME) {
              console.warn('🐌 Slow Component Render:', {
                component: componentName,
                renderTime: `${renderTime.toFixed(2)}ms`,
                target: `<${PERFORMANCE_TARGETS.COMPONENT_RENDER_TIME}ms`,
                status: '⚠️ SLOW'
              });
            }
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['measure'] });
        this.observers.push(observer);
      } catch (e) {
        // Performance Observer not supported
      }
    }
  }

  /**
   * Track memory usage
   */
  private trackMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      
      this.metrics.memoryUsage = memory.usedJSHeapSize;
      
      // Monitor memory usage every 30 seconds
      setInterval(() => {
        const currentMemory = memory.usedJSHeapSize;
        const memoryIncrease = currentMemory - this.metrics.memoryUsage!;
        
        if (memoryIncrease > 10 * 1024 * 1024) { // 10MB increase
          console.warn('🧠 Memory Usage Increase:', {
            current: `${(currentMemory / 1024 / 1024).toFixed(2)}MB`,
            increase: `+${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`,
            status: '⚠️ HIGH MEMORY USAGE'
          });
        }
        
        this.metrics.memoryUsage = currentMemory;
      }, 30000);
    }
  }

  /**
   * Start timing a component render
   */
  startComponentTimer(componentName: string) {
    if ('performance' in window && 'mark' in performance) {
      const markName = `${componentName}-start`;
      performance.mark(markName);
      this.componentTimers.set(componentName, Date.now());
    }
  }

  /**
   * End timing a component render
   */
  endComponentTimer(componentName: string) {
    if ('performance' in window && 'mark' in performance && 'measure' in performance) {
      const startMarkName = `${componentName}-start`;
      const endMarkName = `${componentName}-end`;
      const measureName = `⚛️ ${componentName}`;
      
      try {
        performance.mark(endMarkName);
        performance.measure(measureName, startMarkName, endMarkName);
        
        // Clean up marks
        performance.clearMarks(startMarkName);
        performance.clearMarks(endMarkName);
      } catch (e) {
        // Marks might not exist
      }
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const metrics = this.getMetrics();
    const report = [];
    
    report.push('🎯 PRISM Analytics Performance Report');
    report.push('═'.repeat(40));
    
    if (metrics.loadTime) {
      const loadStatus = metrics.loadTime < PERFORMANCE_TARGETS.DASHBOARD_LOAD_TIME ? '✅' : '❌';
      report.push(`${loadStatus} Load Time: ${metrics.loadTime}ms (target: <${PERFORMANCE_TARGETS.DASHBOARD_LOAD_TIME}ms)`);
    }
    
    if (metrics.componentRenderTime) {
      report.push('\n📊 Component Render Times:');
      Object.entries(metrics.componentRenderTime).forEach(([component, time]) => {
        const renderStatus = time < PERFORMANCE_TARGETS.COMPONENT_RENDER_TIME ? '✅' : '⚠️';
        report.push(`${renderStatus} ${component}: ${time.toFixed(2)}ms`);
      });
    }
    
    if (metrics.memoryUsage) {
      report.push(`\n🧠 Memory Usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }
    
    return report.join('\n');
  }

  /**
   * Clean up observers
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.componentTimers.clear();
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for component performance monitoring
 */
export const usePerformanceMonitor = (componentName: string) => {
  const startTimer = () => performanceMonitor.startComponentTimer(componentName);
  const endTimer = () => performanceMonitor.endComponentTimer(componentName);
  
  return { startTimer, endTimer };
};

/**
 * Higher-order component for automatic performance monitoring
 */
export function withPerformanceMonitor<T extends object>(
  Component: React.ComponentType<T>,
  componentName?: string
) {
  const displayName = componentName || Component.displayName || Component.name;
  
  return function PerformanceMonitoredComponent(props: T) {
    const { startTimer, endTimer } = usePerformanceMonitor(displayName);
    
    React.useEffect(() => {
      startTimer();
      return () => endTimer();
    });
    
    return React.createElement(Component, props);
  };
}

/**
 * Bundle size tracking utility
 */
export const bundleMetrics = {
  /**
   * Get estimated bundle size from resource timing
   */
  getBundleSize(): number {
    if ('performance' in window) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const scriptSizes = resources
        .filter(resource => resource.name.includes('.js'))
        .reduce((total, resource) => total + (resource.transferSize || 0), 0);
      
      return scriptSizes;
    }
    
    return 0;
  },

  /**
   * Log bundle size metrics
   */
  logBundleMetrics() {
    const bundleSize = this.getBundleSize();
    const bundleSizeMB = (bundleSize / 1024 / 1024).toFixed(2);
    
    console.info('📦 Bundle Size:', {
      size: `${bundleSizeMB}MB`,
      compressed: '(gzipped)',
      status: '📊 TRACKED'
    });
  }
};