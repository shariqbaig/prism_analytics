import React from 'react';
import {
  KPICard,
  MetricsGrid,
  DashboardCard,
  ExecutiveSummary,
  QuickActions,
  DataTable,
  type TableColumn,
  type TableRow
} from '@/components/dashboard';
import { 
  Package, 
  TrendingUp, 
  Users, 
  Upload, 
  Eye, 
  BarChart3,
  FileText,
  Download
} from 'lucide-react';

const Demo: React.FC = () => {
  // Dashboard Demo Data
  const summaryItems = [
    {
      metric: 'Portfolio Health',
      value: '87%',
      status: 'good' as const,
      change: {
        value: '+3%',
        direction: 'up' as const,
        isPositive: true
      }
    },
    {
      metric: 'Risk Exposure',
      value: '23%',
      status: 'warning' as const,
      change: {
        value: '-2%',
        direction: 'down' as const,
        isPositive: true
      }
    },
    {
      metric: 'Efficiency Score',
      value: '92%',
      status: 'good' as const,
      change: {
        value: '+5%',
        direction: 'up' as const,
        isPositive: true
      }
    }
  ];

  const quickActions = [
    {
      id: 'upload',
      label: 'Upload Data',
      description: 'Add inventory or OSR files',
      icon: Upload,
      onClick: () => console.log('Upload clicked')
    },
    {
      id: 'view-data',
      label: 'View Data',
      description: 'Browse uploaded datasets',
      icon: Eye,
      onClick: () => console.log('View clicked')
    },
    {
      id: 'generate-report',
      label: 'Generate Report',
      description: 'Create executive summary',
      icon: FileText,
      onClick: () => console.log('Report clicked')
    },
    {
      id: 'export',
      label: 'Export Analysis',
      description: 'Download results as PDF',
      icon: Download,
      onClick: () => console.log('Export clicked')
    }
  ];

  const tableColumns: TableColumn[] = [
    { key: 'material', header: 'Material', type: 'text' },
    { key: 'description', header: 'Description', type: 'text' },
    { key: 'value', header: 'Value', type: 'number', align: 'right' },
    { key: 'status', header: 'Status', type: 'status' }
  ];

  const tableData: TableRow[] = [
    { id: 1, material: 'MAT-001', description: 'Steel Components', value: 125000, status: 'success' },
    { id: 2, material: 'MAT-002', description: 'Electronic Parts', value: 87500, status: 'warning' },
    { id: 3, material: 'MAT-003', description: 'Raw Materials', value: 156000, status: 'success' },
    { id: 4, material: 'MAT-004', description: 'Packaging Supplies', value: 23000, status: 'error' }
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Component Demonstrations</h1>
        <p className="text-muted-foreground text-lg">
          Interactive showcase of dashboard components with sample data
        </p>
      </div>

      {/* Dashboard Components Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Executive Dashboard Components</h2>
        
        {/* KPI Cards */}
        <MetricsGrid columns={4} className="mb-8">
          <KPICard
            title="Total Revenue"
            value="$2.4M"
            description="Monthly recurring revenue"
            status="success"
            trend="up"
            trendValue="+12%"
            icon={Package}
          />
          <KPICard
            title="Active Users"
            value="12,847"
            description="Users in last 30 days"
            status="success"
            trend="up"
            trendValue="+8%"
            icon={Users}
          />
          <KPICard
            title="Conversion Rate"
            value="3.2%"
            description="Lead to customer conversion"
            status="warning"
            trend="down"
            trendValue="-0.3%"
            icon={TrendingUp}
          />
          <KPICard
            title="System Health"
            value="98.5%"
            description="Overall system uptime"
            status="success"
            trend="neutral"
            icon={BarChart3}
          />
        </MetricsGrid>

        {/* Executive Summary and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ExecutiveSummary
            title="Executive Summary"
            items={summaryItems}
          />
          <QuickActions
            title="Quick Actions"
            actions={quickActions}
            layout="grid"
          />
        </div>

        {/* Data Table */}
        <DataTable
          title="Sample Data Table"
          description="Material inventory with status indicators"
          columns={tableColumns}
          data={tableData}
        />

        {/* Sample Chart Display */}
        <DashboardCard
          title="Sample Chart"
          description="Demonstrating adaptive chart functionality"
        >
          <div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg">
            <div className="text-center space-y-2">
              <BarChart3 className="w-12 h-12 text-blue-500 mx-auto" />
              <p className="text-muted-foreground">
                Chart rendering is now functional
              </p>
              <p className="text-sm text-muted-foreground">
                Ready for adaptive chart implementation
              </p>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default Demo;