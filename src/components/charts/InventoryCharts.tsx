import React, { useMemo } from 'react';
import { AdaptiveChart } from './AdaptiveChart';
import type { ChartConfig, ChartData, RechartData } from './types';
import type { InventoryMetrics } from '@/services/businessCalculations';

interface InventoryChartsProps {
  metrics: InventoryMetrics | null;
  loading?: boolean;
}

export const PortfolioConcentrationChart: React.FC<{ 
  data: InventoryMetrics['portfolioConcentration'] | null;
  loading?: boolean;
}> = ({ data, loading }) => {
  const chartData = useMemo((): RechartData[] => {
    if (!data) return [];
    
    return [
      { name: 'Top Items', value: data.topItemsPercentage, fill: '#3B82F6' },
      { name: 'Other Items', value: 100 - data.topItemsPercentage, fill: '#E5E7EB' }
    ];
  }, [data]);

  const config: ChartConfig = {
    title: 'Portfolio Concentration',
    type: 'pie',
    library: 'recharts',
    responsive: true,
    height: 300,
    dataSource: 'inventory'
  };

  return (
    <AdaptiveChart
      data={chartData}
      config={config}
      loading={loading}
      className="portfolio-concentration-chart"
    />
  );
};

export const PlantEfficiencyChart: React.FC<{
  data: InventoryMetrics['plantEfficiency'] | null;
  loading?: boolean;
}> = ({ data, loading }) => {
  const chartData = useMemo((): RechartData[] => {
    if (!data) return [];

    return [
      { 
        name: 'Plant Efficiency',
        utilization: data.utilizationRate,
        throughput: data.throughputScore,
        target: 85 // Target efficiency
      }
    ];
  }, [data]);

  const config: ChartConfig = {
    title: 'Plant Efficiency Metrics',
    type: 'bar',
    library: 'recharts',
    responsive: true,
    height: 250,
    dataSource: 'inventory'
  };

  return (
    <AdaptiveChart
      data={chartData}
      config={config}
      loading={loading}
      className="plant-efficiency-chart"
    />
  );
};

export const GeographicDistributionChart: React.FC<{
  data: InventoryMetrics['geographicDistribution'] | null;
  loading?: boolean;
}> = ({ data, loading }) => {
  const chartData = useMemo((): RechartData[] => {
    if (!data) return [];

    // Mock geographic data based on distribution balance
    const regions = ['North', 'South', 'East', 'West', 'Central'];
    const baseValue = 100 / regions.length;
    
    return regions.slice(0, data.regionCount).map((region, index) => ({
      name: region,
      value: baseValue + (Math.random() - 0.5) * 20, // Add some variance
      risk: data.riskSpread === 'concentrated' ? 'high' : 'medium'
    }));
  }, [data]);

  const config: ChartConfig = {
    title: 'Geographic Distribution',
    type: 'bar',
    library: 'recharts',
    responsive: true,
    height: 280,
    dataSource: 'inventory'
  };

  return (
    <AdaptiveChart
      data={chartData}
      config={config}
      loading={loading}
      className="geographic-distribution-chart"
    />
  );
};

export const InventoryCharts: React.FC<InventoryChartsProps> = ({ metrics, loading }) => {
  if (!metrics && !loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Upload inventory data to view analytics charts</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="chart-container">
        <PortfolioConcentrationChart 
          data={metrics?.portfolioConcentration || null}
          loading={loading}
        />
      </div>
      
      <div className="chart-container">
        <PlantEfficiencyChart 
          data={metrics?.plantEfficiency || null}
          loading={loading}
        />
      </div>
      
      <div className="chart-container lg:col-span-2">
        <GeographicDistributionChart 
          data={metrics?.geographicDistribution || null}
          loading={loading}
        />
      </div>
    </div>
  );
};