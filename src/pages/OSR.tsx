import React from 'react';
import { useOSRMetrics } from '@/hooks/useOSRMetrics';
import { OSRCharts } from '@/components/charts/OSRCharts';
import { DashboardCard } from '@/components/dashboard';

const OSR: React.FC = () => {
  const { metrics, loading, error } = useOSRMetrics();


  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '↗';
      case 'degrading': return '↘';
      case 'stable': return '→';
      default: return '—';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">OSR Command Center</h1>
        <p className="text-muted-foreground">
          Comprehensive over-stock and residuals analysis with risk assessment and recovery planning
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="OSR Health Score" className="text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              {loading ? '...' : metrics ? `${metrics.healthPercentage}%` : 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground">
              Overall stock health percentage
            </p>
          </div>
        </DashboardCard>

        <DashboardCard title="Critical Issues" className="text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-red-600">
              {loading ? '...' : metrics ? metrics.severityScore.criticalIssues : 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground">
              Require immediate attention
            </p>
          </div>
        </DashboardCard>

        <DashboardCard title="Recovery Potential" className="text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              {loading ? '...' : metrics ? `${Math.round(metrics.recoveryPotential.recoverabilityScore)}%` : 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground">
              Liquidation opportunities
            </p>
          </div>
        </DashboardCard>

        <DashboardCard title="Risk Trend" className="text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              {loading ? '...' : metrics ? 
                `${getRiskTrendIcon(metrics.riskAssessment.riskTrend)} ${metrics.riskAssessment.riskTrend.toUpperCase()}` : 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground">
              Current risk direction
            </p>
          </div>
        </DashboardCard>
      </div>

      {/* Severity Overview */}
      {metrics && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardCard title="Overall Severity" className="text-center">
            <div className="space-y-2">
              <div className={`text-2xl font-bold ${getSeverityColor(metrics.severityScore.overallSeverity)}`}>
                {metrics.severityScore.overallSeverity.toUpperCase()}
              </div>
              <p className="text-sm text-muted-foreground">
                Risk assessment level
              </p>
            </div>
          </DashboardCard>
          
          <DashboardCard title="Quick Wins Available" className="text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {metrics.recoveryPotential.quickWins}
              </div>
              <p className="text-sm text-muted-foreground">
                High impact, low effort actions
              </p>
            </div>
          </DashboardCard>

          <DashboardCard title="Immediate Risks" className="text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-red-600">
                {metrics.riskAssessment.immediateRisks}
              </div>
              <p className="text-sm text-muted-foreground">
                Require urgent action
              </p>
            </div>
          </DashboardCard>
        </div>
      )}

      {/* Error State */}
      {error && (
        <DashboardCard title="Error" className="border-destructive">
          <p className="text-destructive">Failed to load OSR metrics: {error}</p>
        </DashboardCard>
      )}

      {/* Charts Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Risk Analytics Dashboard</h2>
        <OSRCharts metrics={metrics} loading={loading} />
      </div>
    </div>
  );
};

export default OSR;