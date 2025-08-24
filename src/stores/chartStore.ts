import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ChartConfig } from '@/components/charts/types';

interface ChartState {
  // Chart configurations
  chartConfigs: Record<string, ChartConfig>;
  
  // Chart visibility and layout
  visibleCharts: string[];
  chartLayout: 'grid' | 'list' | 'custom';
  chartsPerRow: number;
  
  // Chart interaction state
  selectedChart: string | null;
  hoveredDataPoint: {
    chartId: string;
    dataIndex: number;
    value: any;
  } | null;
  
  // Chart data refresh
  lastRefresh: Record<string, Date>;
  autoRefreshEnabled: boolean;
  refreshInterval: number; // in milliseconds
  
  // Chart export state
  exportInProgress: boolean;
  exportFormat: 'png' | 'pdf' | 'svg';
  
  // Actions
  setChartConfig: (chartId: string, config: ChartConfig) => void;
  removeChartConfig: (chartId: string) => void;
  updateChartData: (chartId: string, data: any[]) => void;
  
  // Visibility and layout
  setVisibleCharts: (chartIds: string[]) => void;
  toggleChartVisibility: (chartId: string) => void;
  setChartLayout: (layout: 'grid' | 'list' | 'custom') => void;
  setChartsPerRow: (count: number) => void;
  
  // Interaction
  setSelectedChart: (chartId: string | null) => void;
  setHoveredDataPoint: (data: { chartId: string; dataIndex: number; value: any } | null) => void;
  
  // Refresh
  markChartRefreshed: (chartId: string) => void;
  setAutoRefreshEnabled: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  
  // Export
  setExportInProgress: (inProgress: boolean) => void;
  setExportFormat: (format: 'png' | 'pdf' | 'svg') => void;
  
  // Utilities
  isChartVisible: (chartId: string) => boolean;
  getChartConfig: (chartId: string) => ChartConfig | null;
  getChartsForFeature: (feature: 'inventory' | 'osr' | 'cross') => ChartConfig[];
  clearAllCharts: () => void;
}

export const useChartStore = create<ChartState>()(
  devtools(
    (set, get) => ({
      // Initial state
      chartConfigs: {},
      visibleCharts: [],
      chartLayout: 'grid',
      chartsPerRow: 3,
      selectedChart: null,
      hoveredDataPoint: null,
      lastRefresh: {},
      autoRefreshEnabled: false,
      refreshInterval: 30000, // 30 seconds
      exportInProgress: false,
      exportFormat: 'png',
      
      // Actions
      setChartConfig: (chartId, config) => 
        set((state) => ({
          chartConfigs: {
            ...state.chartConfigs,
            [chartId]: config
          }
        }), false, 'setChartConfig'),
      
      removeChartConfig: (chartId) => 
        set((state) => {
          const { [chartId]: removed, ...remaining } = state.chartConfigs;
          return {
            chartConfigs: remaining,
            visibleCharts: state.visibleCharts.filter(id => id !== chartId)
          };
        }, false, 'removeChartConfig'),
      
      updateChartData: (chartId, data) => 
        set((state) => {
          const existingConfig = state.chartConfigs[chartId];
          if (!existingConfig) return state;
          
          return {
            chartConfigs: {
              ...state.chartConfigs,
              [chartId]: {
                ...existingConfig,
                data
              }
            }
          };
        }, false, 'updateChartData'),
      
      // Visibility and layout
      setVisibleCharts: (chartIds) => 
        set({ visibleCharts: chartIds }, false, 'setVisibleCharts'),
      
      toggleChartVisibility: (chartId) => 
        set((state) => ({
          visibleCharts: state.visibleCharts.includes(chartId)
            ? state.visibleCharts.filter(id => id !== chartId)
            : [...state.visibleCharts, chartId]
        }), false, 'toggleChartVisibility'),
      
      setChartLayout: (layout) => 
        set({ chartLayout: layout }, false, 'setChartLayout'),
      
      setChartsPerRow: (count) => 
        set({ chartsPerRow: count }, false, 'setChartsPerRow'),
      
      // Interaction
      setSelectedChart: (chartId) => 
        set({ selectedChart: chartId }, false, 'setSelectedChart'),
      
      setHoveredDataPoint: (data) => 
        set({ hoveredDataPoint: data }, false, 'setHoveredDataPoint'),
      
      // Refresh
      markChartRefreshed: (chartId) => 
        set((state) => ({
          lastRefresh: {
            ...state.lastRefresh,
            [chartId]: new Date()
          }
        }), false, 'markChartRefreshed'),
      
      setAutoRefreshEnabled: (enabled) => 
        set({ autoRefreshEnabled: enabled }, false, 'setAutoRefreshEnabled'),
      
      setRefreshInterval: (interval) => 
        set({ refreshInterval: interval }, false, 'setRefreshInterval'),
      
      // Export
      setExportInProgress: (inProgress) => 
        set({ exportInProgress: inProgress }, false, 'setExportInProgress'),
      
      setExportFormat: (format) => 
        set({ exportFormat: format }, false, 'setExportFormat'),
      
      // Utilities
      isChartVisible: (chartId) => 
        get().visibleCharts.includes(chartId),
      
      getChartConfig: (chartId) => 
        get().chartConfigs[chartId] || null,
      
      getChartsForFeature: (feature) => {
        const configs = get().chartConfigs;
        return Object.values(configs).filter(config => {
          // Simple feature detection based on chart title/id
          const title = config.title.toLowerCase();
          switch (feature) {
            case 'inventory':
              return title.includes('inventory') || title.includes('stock') || title.includes('material');
            case 'osr':
              return title.includes('osr') || title.includes('over stock') || title.includes('residual');
            case 'cross':
              return title.includes('cross') || title.includes('combined') || title.includes('correlation');
            default:
              return false;
          }
        });
      },
      
      clearAllCharts: () => 
        set({
          chartConfigs: {},
          visibleCharts: [],
          selectedChart: null,
          hoveredDataPoint: null,
          lastRefresh: {}
        }, false, 'clearAllCharts')
    }),
    {
      name: 'chart-store'
    }
  )
);