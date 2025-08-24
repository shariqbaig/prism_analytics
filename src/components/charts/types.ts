export type ChartLibrary = 'chartjs' | 'recharts';

export type DataSource = 'inventory' | 'osr' | 'combined';

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface RechartData {
  [key: string]: string | number;
}

export interface ChartConfig {
  title: string;
  type: 'bar' | 'line' | 'pie' | 'area';
  library: ChartLibrary;
  responsive?: boolean;
  height?: number;
  width?: number;
  dataSource: DataSource;
  data?: any[];
}

export interface AdaptiveChartProps {
  data: ChartData | RechartData[];
  config: ChartConfig;
  loading?: boolean;
  className?: string;
}