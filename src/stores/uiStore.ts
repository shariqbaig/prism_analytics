import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  // Theme and appearance
  theme: 'light' | 'dark';
  
  // Dashboard view preferences
  selectedDashboardView: 'overview' | 'inventory' | 'osr' | 'combined';
  showAdvancedMetrics: boolean;
  
  // Chart preferences
  defaultChartType: 'bar' | 'pie' | 'line';
  chartAnimationsEnabled: boolean;
  
  // Filters and selections
  selectedPlants: string[];
  selectedCategories: string[];
  selectedDateRange: {
    start: Date | null;
    end: Date | null;
  };
  
  // UI state
  sidebarCollapsed: boolean;
  activeModal: string | null;
  notifications: UINotification[];
  
  // Loading and error states for UI components
  componentLoadingStates: Record<string, boolean>;
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  setDashboardView: (view: 'overview' | 'inventory' | 'osr' | 'combined') => void;
  setShowAdvancedMetrics: (show: boolean) => void;
  setDefaultChartType: (type: 'bar' | 'pie' | 'line') => void;
  setChartAnimationsEnabled: (enabled: boolean) => void;
  
  // Filter actions
  setSelectedPlants: (plants: string[]) => void;
  setSelectedCategories: (categories: string[]) => void;
  setSelectedDateRange: (range: { start: Date | null; end: Date | null }) => void;
  clearAllFilters: () => void;
  
  // UI actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveModal: (modal: string | null) => void;
  
  // Notification actions
  addNotification: (notification: Omit<UINotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Component loading states
  setComponentLoading: (component: string, loading: boolean) => void;
  isComponentLoading: (component: string) => boolean;
}

interface UINotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  autoHide?: boolean;
  duration?: number; // in milliseconds
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Initial state
      theme: 'light',
      selectedDashboardView: 'overview',
      showAdvancedMetrics: false,
      defaultChartType: 'bar',
      chartAnimationsEnabled: true,
      selectedPlants: [],
      selectedCategories: [],
      selectedDateRange: {
        start: null,
        end: null
      },
      sidebarCollapsed: false,
      activeModal: null,
      notifications: [],
      componentLoadingStates: {},
      
      // Actions
      setTheme: (theme) => 
        set({ theme }, false, 'setTheme'),
      
      setDashboardView: (view) => 
        set({ selectedDashboardView: view }, false, 'setDashboardView'),
      
      setShowAdvancedMetrics: (show) => 
        set({ showAdvancedMetrics: show }, false, 'setShowAdvancedMetrics'),
      
      setDefaultChartType: (type) => 
        set({ defaultChartType: type }, false, 'setDefaultChartType'),
      
      setChartAnimationsEnabled: (enabled) => 
        set({ chartAnimationsEnabled: enabled }, false, 'setChartAnimationsEnabled'),
      
      // Filter actions
      setSelectedPlants: (plants) => 
        set({ selectedPlants: plants }, false, 'setSelectedPlants'),
      
      setSelectedCategories: (categories) => 
        set({ selectedCategories: categories }, false, 'setSelectedCategories'),
      
      setSelectedDateRange: (range) => 
        set({ selectedDateRange: range }, false, 'setSelectedDateRange'),
      
      clearAllFilters: () => 
        set({
          selectedPlants: [],
          selectedCategories: [],
          selectedDateRange: { start: null, end: null }
        }, false, 'clearAllFilters'),
      
      // UI actions
      toggleSidebar: () => 
        set((state) => ({ 
          sidebarCollapsed: !state.sidebarCollapsed 
        }), false, 'toggleSidebar'),
      
      setSidebarCollapsed: (collapsed) => 
        set({ sidebarCollapsed: collapsed }, false, 'setSidebarCollapsed'),
      
      setActiveModal: (modal) => 
        set({ activeModal: modal }, false, 'setActiveModal'),
      
      // Notification actions
      addNotification: (notification) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newNotification: UINotification = {
          ...notification,
          id,
          timestamp: new Date(),
          autoHide: notification.autoHide ?? true,
          duration: notification.duration ?? 5000
        };
        
        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }), false, 'addNotification');
        
        // Auto-remove notification if autoHide is enabled
        if (newNotification.autoHide) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }
      },
      
      removeNotification: (id) => 
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }), false, 'removeNotification'),
      
      clearAllNotifications: () => 
        set({ notifications: [] }, false, 'clearAllNotifications'),
      
      // Component loading states
      setComponentLoading: (component, loading) => 
        set((state) => ({
          componentLoadingStates: {
            ...state.componentLoadingStates,
            [component]: loading
          }
        }), false, 'setComponentLoading'),
      
      isComponentLoading: (component) => 
        get().componentLoadingStates[component] || false,
    }),
    {
      name: 'ui-store'
    }
  )
);