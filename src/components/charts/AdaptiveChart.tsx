import React, { useMemo, useState } from 'react';
import { ChartWrapper } from './ChartWrapper';
import { ChartJSRenderer } from './ChartJSRenderer';
import { RechartsRenderer } from './RechartsRenderer';
import { ChartErrorBoundary } from './ChartErrorBoundary';
import type { AdaptiveChartProps, ChartData, RechartData } from './types';
import { useDataStorage } from '@/hooks/useDataStorage';

export const AdaptiveChart: React.FC<AdaptiveChartProps> = ({
  data,
  config,
  loading = false,
  className = ''
}) => {
  const { state } = useDataStorage();
  const [fallbackLibrary, setFallbackLibrary] = useState<'chartjs' | 'recharts' | null>(null);

  // Determine if data sources are available
  const availableDataSources = useMemo(() => {
    const sources: string[] = [];
    if (state.hasStoredData) {
      // This would need to be enhanced to detect specific data types
      sources.push('inventory', 'osr');
    }
    return sources;
  }, [state.hasStoredData]);

  // Adaptive logic based on available data
  const adaptedConfig = useMemo(() => {
    const adapted = { ...config };

    // Apply fallback library if needed
    if (fallbackLibrary) {
      adapted.library = fallbackLibrary;
    }

    // Adapt based on data source availability
    if (config.dataSource === 'combined' && availableDataSources.length < 2) {
      // Fall back to single data source if combined not available
      adapted.dataSource = availableDataSources[0] as 'inventory' | 'osr' || 'inventory';
    }

    // Adapt chart type based on data structure
    if (Array.isArray(data)) {
      const rechartData = data as RechartData[];
      if (rechartData.length > 20 && config.type === 'pie') {
        // Too many items for pie chart, use bar instead
        adapted.type = 'bar';
      }
    }

    return adapted;
  }, [config, availableDataSources, data, fallbackLibrary]);

  const handleChartError = (error: Error) => {
    console.warn(`Chart rendering failed with ${adaptedConfig.library}:`, error);
    
    // Try fallback library
    if (!fallbackLibrary) {
      const newFallback = adaptedConfig.library === 'chartjs' ? 'recharts' : 'chartjs';
      console.log(`Falling back to ${newFallback}`);
      setFallbackLibrary(newFallback);
    }
  };

  const renderChart = () => {
    // Validate data
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>No data available for this chart</p>
        </div>
      );
    }

    try {
      if (adaptedConfig.library === 'chartjs') {
        return (
          <ChartJSRenderer
            data={data as ChartData}
            config={adaptedConfig}
            height={config.height}
          />
        );
      } else {
        return (
          <RechartsRenderer
            data={data as RechartData[]}
            config={adaptedConfig}
            height={config.height}
          />
        );
      }
    } catch (error) {
      handleChartError(error as Error);
      throw error; // Let error boundary handle it
    }
  };

  return (
    <div className={`adaptive-chart ${className}`}>
      <ChartErrorBoundary onError={handleChartError}>
        <ChartWrapper
          loading={loading}
          height={config.height || 400}
          loadingMessage={`Processing ${config.title || 'chart'} data...`}
        >
          {renderChart()}
        </ChartWrapper>
      </ChartErrorBoundary>
    </div>
  );
};