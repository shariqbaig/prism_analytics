// Dashboard and Analytics Types for PRISM Analytics

export interface KPIMetric {
  id: string;
  title: string;
  value: number | string;
  format: 'currency' | 'percentage' | 'number' | 'text';
  trend?: number; // Percentage change
  status: 'healthy' | 'warning' | 'critical' | 'neutral';
  description?: string;
  lastUpdated: Date;
}

// Inventory Metrics
export interface InventoryMetrics {
  totalInventoryValue: KPIMetric;
  portfolioConcentration: KPIMetric;
  plantEfficiency: KPIMetric[];
  geographicDistribution: GeographicData[];
  topMaterialsByValue: MaterialData[];
  categoryBreakdown: CategoryData[];
}

// OSR Metrics
export interface OSRMetrics {
  healthScore: KPIMetric;
  totalOSRValue: KPIMetric;
  recoveryPotential: KPIMetric;
  severityScore: KPIMetric;
  riskDistribution: RiskCategoryData[];
  agingAnalysis: AgingData[];
}

// Cross-file Analytics
export interface CrossAnalytics {
  marginAnalysis: MarginData[];
  riskCorrelation: CorrelationData[];
  valueChainFlow: ValueChainData[];
}

// Supporting Data Types
export interface GeographicData {
  location: string;
  value: number;
  percentage: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface MaterialData {
  material: number;
  description: string;
  value: number;
  percentage: number;
  category: string;
  plant: string;
}

export interface CategoryData {
  category: string;
  value: number;
  percentage: number;
  count: number;
}

export interface RiskCategoryData {
  category: 'healthy' | 'slow_moving' | 'non_moving' | 'excess';
  value: number;
  percentage: number;
  count: number;
}

export interface AgingData {
  ageGroup: string;
  value: number;
  percentage: number;
  trend: number;
}

export interface MarginData {
  material: number;
  description: string;
  fgPrice: number;
  rpmCost: number;
  margin: number;
  marginPercentage: number;
}

export interface CorrelationData {
  plant: string;
  inventoryValue: number;
  osrValue: number;
  riskScore: number;
}

export interface ValueChainData {
  stage: string;
  value: number;
  efficiency: number;
}

// Chart Configuration Types - Moved to @/components/charts/types
// Import ChartConfig from @/components/charts/types instead