import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  InventoryMetrics, 
  OSRMetrics, 
  CrossAnalytics 
} from '@/types/dashboard';

interface DataState {
  // Processed metrics
  inventoryMetrics: InventoryMetrics | null;
  osrMetrics: OSRMetrics | null;
  crossAnalytics: CrossAnalytics | null;
  
  // Processing state
  isProcessing: boolean;
  processingStep: string;
  processingProgress: number;
  lastProcessed: Date | null;
  
  // Error state
  processingErrors: string[];
  
  // Data refresh state
  isRefreshing: boolean;
  
  // Actions
  setInventoryMetrics: (metrics: InventoryMetrics) => void;
  setOSRMetrics: (metrics: OSRMetrics) => void;
  setCrossAnalytics: (analytics: CrossAnalytics) => void;
  
  setProcessing: (processing: boolean) => void;
  setProcessingStep: (step: string) => void;
  setProcessingProgress: (progress: number) => void;
  
  addProcessingError: (error: string) => void;
  clearProcessingErrors: () => void;
  
  setRefreshing: (refreshing: boolean) => void;
  clearAllData: () => void;
  
  // Computed getters
  hasInventoryMetrics: () => boolean;
  hasOSRMetrics: () => boolean;
  hasCrossAnalytics: () => boolean;
  getOverallHealth: () => 'healthy' | 'warning' | 'critical';
}

export const useDataStore = create<DataState>()(
  devtools(
    (set, get) => ({
      // Initial state
      inventoryMetrics: null,
      osrMetrics: null,
      crossAnalytics: null,
      isProcessing: false,
      processingStep: '',
      processingProgress: 0,
      lastProcessed: null,
      processingErrors: [],
      isRefreshing: false,
      
      // Actions
      setInventoryMetrics: (metrics) => 
        set({ 
          inventoryMetrics: metrics,
          lastProcessed: new Date()
        }, false, 'setInventoryMetrics'),
      
      setOSRMetrics: (metrics) => 
        set({ 
          osrMetrics: metrics,
          lastProcessed: new Date()
        }, false, 'setOSRMetrics'),
      
      setCrossAnalytics: (analytics) => 
        set({ 
          crossAnalytics: analytics,
          lastProcessed: new Date()
        }, false, 'setCrossAnalytics'),
      
      setProcessing: (processing) => 
        set({ 
          isProcessing: processing,
          processingProgress: processing ? 0 : 100
        }, false, 'setProcessing'),
      
      setProcessingStep: (step) => 
        set({ processingStep: step }, false, 'setProcessingStep'),
      
      setProcessingProgress: (progress) => 
        set({ processingProgress: progress }, false, 'setProcessingProgress'),
      
      addProcessingError: (error) => 
        set((state) => ({ 
          processingErrors: [...state.processingErrors, error] 
        }), false, 'addProcessingError'),
      
      clearProcessingErrors: () => 
        set({ processingErrors: [] }, false, 'clearProcessingErrors'),
      
      setRefreshing: (refreshing) => 
        set({ isRefreshing: refreshing }, false, 'setRefreshing'),
      
      clearAllData: () => 
        set({
          inventoryMetrics: null,
          osrMetrics: null,
          crossAnalytics: null,
          processingErrors: [],
          processingProgress: 0,
          processingStep: '',
          lastProcessed: null
        }, false, 'clearAllData'),
      
      // Computed getters
      hasInventoryMetrics: () => get().inventoryMetrics !== null,
      hasOSRMetrics: () => get().osrMetrics !== null,
      hasCrossAnalytics: () => get().crossAnalytics !== null,
      
      getOverallHealth: () => {
        const { inventoryMetrics, osrMetrics } = get();
        
        // If we have OSR data, use its health score as primary indicator
        if (osrMetrics?.healthScore) {
          const healthValue = typeof osrMetrics.healthScore.value === 'number' 
            ? osrMetrics.healthScore.value 
            : 0;
          
          if (healthValue >= 80) return 'healthy';
          if (healthValue >= 60) return 'warning';
          return 'critical';
        }
        
        // Fallback to inventory status if available
        if (inventoryMetrics?.totalInventoryValue?.status) {
          return inventoryMetrics.totalInventoryValue.status === 'healthy' 
            ? 'healthy' 
            : 'warning';
        }
        
        return 'warning';
      }
    }),
    {
      name: 'data-store'
    }
  )
);