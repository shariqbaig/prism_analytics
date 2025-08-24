import React from 'react';
import { useDataStorage } from '@/hooks/useDataStorage';
import { useInventoryMetrics } from '@/hooks/useInventoryMetrics';
import { useOSRMetrics } from '@/hooks/useOSRMetrics';
import { DashboardCard, KPICard, QuickActions } from '@/components/dashboard';
import { PortfolioConcentrationChart } from '@/components/charts/InventoryCharts';
import { HealthScoreChart } from '@/components/charts/OSRCharts';
import { Package, AlertTriangle, TrendingUp, Upload, FileText } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { } = useDataStorage();
  const { metrics: inventoryMetrics, loading: inventoryLoading } = useInventoryMetrics();
  const { metrics: osrMetrics, loading: osrLoading } = useOSRMetrics();

  const hasInventoryData = Boolean(inventoryMetrics);
  const hasOSRData = Boolean(osrMetrics);
  const hasAnyData = hasInventoryData || hasOSRData;

  const quickActions = [
    {
      id: 'upload',
      label: 'Upload Data',
      description: 'Add inventory or OSR files',
      icon: Upload,
      onClick: () => window.location.href = '/upload'
    },
    {
      id: 'view-inventory',
      label: 'Inventory Analysis',
      description: 'View portfolio metrics',
      icon: Package,
      onClick: () => window.location.href = '/inventory'
    },
    {
      id: 'view-osr',
      label: 'OSR Command Center',
      description: 'Risk assessment dashboard',
      icon: AlertTriangle,
      onClick: () => window.location.href = '/osr'
    },
    {
      id: 'export',
      label: 'Generate Report',
      description: 'Export analysis as PDF',
      icon: FileText,
      onClick: () => window.location.href = '/reports'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">PRISM Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          {hasAnyData 
            ? 'Executive overview of your inventory and risk analytics' 
            : 'Upload Excel files to begin comprehensive inventory and risk analysis'}
        </p>
      </div>

      {/* Data Status Overview */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${hasInventoryData ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-sm font-medium">
            Inventory Data {hasInventoryData ? '✓' : 'Not Available'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${hasOSRData ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-sm font-medium">
            OSR Data {hasOSRData ? '✓' : 'Not Available'}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions
        title="Quick Actions"
        actions={quickActions}
        layout="grid"
      />

      {/* KPI Summary - Only show if we have data */}
      {hasAnyData && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Executive Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hasInventoryData && inventoryMetrics && (
              <>
                <KPICard
                  title="Portfolio Health"
                  value={`${inventoryMetrics.overallHealth}%`}
                  description="Overall inventory health"
                  status={inventoryMetrics.overallHealth >= 80 ? "success" : inventoryMetrics.overallHealth >= 60 ? "warning" : "error"}
                  icon={Package}
                />
                <KPICard
                  title="Concentration Risk"
                  value={inventoryMetrics.portfolioConcentration.concentrationRisk.toUpperCase()}
                  description="Portfolio diversification"
                  status={inventoryMetrics.portfolioConcentration.concentrationRisk === 'low' ? "success" : 
                          inventoryMetrics.portfolioConcentration.concentrationRisk === 'medium' ? "warning" : "error"}
                  icon={TrendingUp}
                />
              </>
            )}
            
            {hasOSRData && osrMetrics && (
              <>
                <KPICard
                  title="OSR Health"
                  value={`${osrMetrics.healthPercentage}%`}
                  description="Over-stock health score"
                  status={osrMetrics.healthPercentage >= 80 ? "success" : osrMetrics.healthPercentage >= 60 ? "warning" : "error"}
                  icon={AlertTriangle}
                />
                <KPICard
                  title="Critical Issues"
                  value={osrMetrics.severityScore.criticalIssues.toString()}
                  description="Require immediate action"
                  status={osrMetrics.severityScore.criticalIssues === 0 ? "success" : 
                          osrMetrics.severityScore.criticalIssues <= 2 ? "warning" : "error"}
                  icon={AlertTriangle}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Charts Section - Adaptive based on available data */}
      {hasAnyData && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Analytics Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hasInventoryData && inventoryMetrics && (
              <DashboardCard title="Portfolio Concentration" description="Top items by value percentage">
                <PortfolioConcentrationChart 
                  data={inventoryMetrics.portfolioConcentration}
                  loading={inventoryLoading}
                />
              </DashboardCard>
            )}
            
            {hasOSRData && osrMetrics && (
              <DashboardCard title="OSR Health Assessment" description="Overall risk and health metrics">
                <HealthScoreChart 
                  healthPercentage={osrMetrics.healthPercentage}
                  loading={osrLoading}
                />
              </DashboardCard>
            )}
          </div>
        </div>
      )}

      {/* Getting Started Section - Only show if no data */}
      {!hasAnyData && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardCard 
              title="Upload Inventory Files" 
              description="Excel files containing FG value and RPM sheets"
            >
              <div className="text-center py-4">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Upload your inventory Excel files to begin portfolio analysis
                </p>
              </div>
            </DashboardCard>
            
            <DashboardCard 
              title="Upload OSR Files" 
              description="Excel files with over-stock and residuals data"
            >
              <div className="text-center py-4">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Upload OSR files for comprehensive risk assessment
                </p>
              </div>
            </DashboardCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;