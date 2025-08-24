import React from 'react';
import { useInventoryMetrics } from '@/hooks/useInventoryMetrics';
import { InventoryCharts } from '@/components/charts/InventoryCharts';
import { DashboardCard } from '@/components/dashboard';

const Inventory: React.FC = () => {
  const { metrics, loading, error } = useInventoryMetrics();


  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Inventory Analysis</h1>
        <p className="text-muted-foreground">
          Comprehensive analysis of your inventory portfolio, concentration, and efficiency metrics
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Portfolio Health" className="text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              {loading ? '...' : metrics ? `${metrics.overallHealth}%` : 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground">
              Overall inventory health score
            </p>
          </div>
        </DashboardCard>

        <DashboardCard title="Concentration Risk" className="text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              {loading ? '...' : metrics ? 
                metrics.portfolioConcentration.concentrationRisk.toUpperCase() : 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground">
              Top materials concentration
            </p>
          </div>
        </DashboardCard>

        <DashboardCard title="Plant Efficiency" className="text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              {loading ? '...' : metrics ? 
                metrics.plantEfficiency.efficiencyGrade : 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground">
              Overall efficiency grade
            </p>
          </div>
        </DashboardCard>

        <DashboardCard title="Geographic Spread" className="text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              {loading ? '...' : metrics ? 
                metrics.geographicDistribution.regionCount : 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground">
              Active regions
            </p>
          </div>
        </DashboardCard>
      </div>

      {/* Error State */}
      {error && (
        <DashboardCard title="Error" className="border-destructive">
          <p className="text-destructive">Failed to load inventory metrics: {error}</p>
        </DashboardCard>
      )}

      {/* Charts Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
        <InventoryCharts metrics={metrics} loading={loading} />
      </div>
    </div>
  );
};

export default Inventory;