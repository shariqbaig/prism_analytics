export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  sections: ExportSection[];
  layout: ExportLayout;
}

export interface ExportSection {
  id: string;
  title: string;
  type: 'summary' | 'kpi' | 'chart' | 'table' | 'text';
  required: boolean;
  dataSource: 'inventory' | 'osr' | 'both' | 'none';
  order: number;
}

export interface ExportLayout {
  pageOrientation: 'portrait' | 'landscape';
  pageSize: 'a4' | 'letter';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  headerHeight: number;
  footerHeight: number;
}

export interface ExportData {
  title: string;
  generatedDate: Date;
  dataSource: ('inventory' | 'osr')[];
  summary?: ExecutiveSummary;
  kpiMetrics: KPIMetric[];
  charts: ChartExportData[];
  tables: TableExportData[];
}

export interface ExecutiveSummary {
  overview: string;
  keyFindings: string[];
  recommendations: string[];
  healthScore?: number;
  totalValue?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

export interface ChartExportData {
  id: string;
  title: string;
  type: 'bar' | 'pie' | 'line' | 'doughnut';
  dataUrl?: string;
  data: any;
  width: number;
  height: number;
}

export interface TableExportData {
  id: string;
  title: string;
  headers: string[];
  rows: (string | number)[][];
  totalRows?: number;
  showTotal?: boolean;
}

export interface KPIMetric {
  id: string;
  title: string;
  value: number | string;
  format: 'currency' | 'percentage' | 'number' | 'text';
  trend?: number;
  status: 'healthy' | 'warning' | 'critical' | 'neutral';
}

export interface ExportProgress {
  stage: 'preparing' | 'generating' | 'charts' | 'finalizing' | 'complete' | 'error';
  progress: number;
  message: string;
  error?: string;
}

export interface ExportResult {
  success: boolean;
  filename: string;
  size: number;
  generatedAt: Date;
  dataUrl?: string;
  error?: string;
}

export interface ExportRecord {
  id: string;
  filename: string;
  template: string;
  dataSource: ('inventory' | 'osr')[];
  generatedAt: Date;
  fileSize: number;
  status: 'success' | 'error';
  error?: string;
}