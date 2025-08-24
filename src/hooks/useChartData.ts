import { useState, useEffect, useMemo } from 'react';
import { useDataStorage } from './useDataStorage';
import type { ChartData, RechartData, DataSource } from '@/components/charts/types';

interface UseChartDataOptions {
  dataSource: DataSource;
  chartType: 'bar' | 'line' | 'pie' | 'area';
  aggregationType?: 'sum' | 'average' | 'count';
  limit?: number;
}

interface UseChartDataReturn {
  chartJSData: ChartData | null;
  rechartsData: RechartData[] | null;
  loading: boolean;
  error: string | null;
  availableDataSources: DataSource[];
}

export const useChartData = (options: UseChartDataOptions): UseChartDataReturn => {
  const { getActiveFileData, state } = useDataStorage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<any>(null);

  // Determine available data sources
  const availableDataSources = useMemo((): DataSource[] => {
    const sources: DataSource[] = [];
    if (state.hasStoredData) {
      // This would be enhanced to actually check what data types are available
      sources.push('inventory', 'osr');
      if (sources.length >= 2) {
        sources.push('combined');
      }
    }
    return sources;
  }, [state.hasStoredData]);

  // Fetch data based on source type
  useEffect(() => {
    const fetchData = async () => {
      if (!availableDataSources.includes(options.dataSource)) {
        setError(`Data source "${options.dataSource}" is not available`);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let data = null;

        if (options.dataSource === 'combined') {
          // Fetch both inventory and OSR data
          const [inventoryData, osrData] = await Promise.all([
            getActiveFileData('inventory'),
            getActiveFileData('osr')
          ]);
          data = { inventory: inventoryData, osr: osrData };
        } else {
          // Fetch specific data source
          data = await getActiveFileData(options.dataSource);
        }

        setRawData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [options.dataSource, getActiveFileData, availableDataSources]);

  // Transform data for Chart.js format
  const chartJSData = useMemo((): ChartData | null => {
    if (!rawData) return null;

    try {
      // This is a simplified transformation - would be enhanced based on actual data structure
      const sampleData = generateSampleChartJSData(options.chartType);
      return sampleData;
    } catch (err) {
      setError('Failed to transform data for Chart.js');
      return null;
    }
  }, [rawData, options.chartType]);

  // Transform data for Recharts format
  const rechartsData = useMemo((): RechartData[] | null => {
    if (!rawData) return null;

    try {
      // This is a simplified transformation - would be enhanced based on actual data structure
      const sampleData = generateSampleRechartsData(options.chartType);
      return sampleData;
    } catch (err) {
      setError('Failed to transform data for Recharts');
      return null;
    }
  }, [rawData, options.chartType]);

  return {
    chartJSData,
    rechartsData,
    loading,
    error,
    availableDataSources
  };
};

// Sample data generators - these would be replaced with actual data transformation logic
function generateSampleChartJSData(chartType: string): ChartData {
  const labels = ['Q1', 'Q2', 'Q3', 'Q4'];
  const datasets = [
    {
      label: 'Inventory Value',
      data: [12000, 15000, 18000, 22000],
      backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'],
      borderColor: '#3B82F6',
      borderWidth: 2
    }
  ];

  if (chartType === 'line') {
    datasets[0].backgroundColor = '#3B82F6';
  }

  return { labels, datasets };
}

function generateSampleRechartsData(chartType: string): RechartData[] {
  return [
    { name: 'Q1', value: 12000, category: 'Inventory' },
    { name: 'Q2', value: 15000, category: 'Inventory' },
    { name: 'Q3', value: 18000, category: 'Inventory' },
    { name: 'Q4', value: 22000, category: 'Inventory' }
  ];
}