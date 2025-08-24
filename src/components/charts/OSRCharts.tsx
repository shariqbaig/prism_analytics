import React, { useMemo } from 'react';
import { AdaptiveChart } from './AdaptiveChart';
import type { ChartConfig, RechartData } from './types';
import type { OSRMetrics } from '@/services/businessCalculations';

interface OSRChartsProps {
  metrics: OSRMetrics | null;
  loading?: boolean;
}

export const HealthScoreChart: React.FC<{
  healthPercentage: number | null;
  loading?: boolean;
}> = ({ healthPercentage, loading }) => {
  const chartData = useMemo((): RechartData[] => {
    if (healthPercentage === null) return [];

    return [
      { name: 'Health Score', value: healthPercentage, fill: healthPercentage >= 80 ? '#10B981' : healthPercentage >= 60 ? '#F59E0B' : '#EF4444' },
      { name: 'Remaining', value: 100 - healthPercentage, fill: '#E5E7EB' }
    ];
  }, [healthPercentage]);

  const config: ChartConfig = {
    title: 'OSR Health Score',
    type: 'pie',
    library: 'recharts',
    responsive: true,
    height: 280,
    dataSource: 'osr'
  };

  return (
    <AdaptiveChart
      data={chartData}
      config={config}
      loading={loading}
      className="health-score-chart"
    />
  );
};

export const SeverityBreakdownChart: React.FC<{
  data: OSRMetrics['severityScore'] | null;
  loading?: boolean;
}> = ({ data, loading }) => {
  const chartData = useMemo((): RechartData[] => {
    if (!data) return [];

    return [
      { name: 'Critical', value: data.criticalIssues, fill: '#DC2626' },
      { name: 'Major', value: data.majorIssues, fill: '#F59E0B' },
      { name: 'Minor', value: data.minorIssues, fill: '#10B981' }
    ].filter(item => item.value > 0);
  }, [data]);

  const config: ChartConfig = {
    title: 'Issue Severity Breakdown',
    type: 'bar',
    library: 'recharts',
    responsive: true,
    height: 250,
    dataSource: 'osr'
  };

  return (
    <AdaptiveChart
      data={chartData}
      config={config}
      loading={loading}
      className="severity-breakdown-chart"
    />
  );
};

export const RecoveryPotentialChart: React.FC<{
  data: OSRMetrics['recoveryPotential'] | null;
  loading?: boolean;
}> = ({ data, loading }) => {
  const chartData = useMemo((): RechartData[] => {
    if (!data) return [];

    return [
      { 
        name: 'Quick Wins', 
        value: data.quickWins, 
        timeline: 'immediate',
        fill: '#10B981' 
      },
      { 
        name: 'Medium Term', 
        value: data.mediumTermActions, 
        timeline: 'short',
        fill: '#3B82F6' 
      },
      { 
        name: 'Strategic', 
        value: data.longTermStrategic, 
        timeline: 'long',
        fill: '#6366F1' 
      }
    ];
  }, [data]);

  const config: ChartConfig = {
    title: 'Recovery Potential by Timeline',
    type: 'bar',
    library: 'recharts',
    responsive: true,
    height: 280,
    dataSource: 'osr'
  };

  return (
    <AdaptiveChart
      data={chartData}
      config={config}
      loading={loading}
      className="recovery-potential-chart"
    />
  );
};

export const RiskTrendChart: React.FC<{
  data: OSRMetrics['riskAssessment'] | null;
  loading?: boolean;
}> = ({ data, loading }) => {
  const chartData = useMemo((): RechartData[] => {
    if (!data) return [];

    // Mock time series data based on current risk assessment
    const timePoints = ['3 months ago', '2 months ago', '1 month ago', 'Current'];
    const trendMultiplier = data.riskTrend === 'improving' ? 0.8 : 
                           data.riskTrend === 'degrading' ? 1.3 : 1.0;

    return timePoints.map((period, index) => {
      const baseRisk = data.immediateRisks + data.emergingRisks;
      const variance = (Math.random() - 0.5) * 10;
      const trendEffect = index === timePoints.length - 1 ? 
        baseRisk * trendMultiplier : 
        baseRisk + variance;

      return {
        name: period,
        immediate: Math.max(0, data.immediateRisks + (trendEffect - baseRisk) * 0.6),
        emerging: Math.max(0, data.emergingRisks + (trendEffect - baseRisk) * 0.4)
      };
    });
  }, [data]);

  const config: ChartConfig = {
    title: 'Risk Trend Analysis',
    type: 'area',
    library: 'recharts',
    responsive: true,
    height: 300,
    dataSource: 'osr'
  };

  return (
    <AdaptiveChart
      data={chartData}
      config={config}
      loading={loading}
      className="risk-trend-chart"
    />
  );
};

export const OSRCharts: React.FC<OSRChartsProps> = ({ metrics, loading }) => {
  if (!metrics && !loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Upload OSR data to view risk analytics charts</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container">
          <HealthScoreChart 
            healthPercentage={metrics?.healthPercentage || null}
            loading={loading}
          />
        </div>
        
        <div className="chart-container">
          <SeverityBreakdownChart 
            data={metrics?.severityScore || null}
            loading={loading}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container">
          <RecoveryPotentialChart 
            data={metrics?.recoveryPotential || null}
            loading={loading}
          />
        </div>
        
        <div className="chart-container">
          <RiskTrendChart 
            data={metrics?.riskAssessment || null}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};