import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  ExportTemplate, 
  ExportProgress, 
  ExportResult, 
  ExportRecord 
} from '@/types/export';

interface ExportState {
  // Export status
  isExporting: boolean;
  exportProgress: ExportProgress | null;
  lastExportResult: ExportResult | null;
  
  // Export configuration
  selectedTemplate: ExportTemplate | null;
  customFilename: string;
  
  // Export history
  exportHistory: ExportRecord[];
  
  // Error handling
  exportErrors: string[];
  lastExportSuccess: boolean;
  
  // Actions
  setExporting: (exporting: boolean) => void;
  setExportProgress: (progress: ExportProgress | null) => void;
  setLastExportResult: (result: ExportResult | null) => void;
  
  // Configuration
  setSelectedTemplate: (template: ExportTemplate | null) => void;
  setCustomFilename: (filename: string) => void;
  
  // History and errors
  addExportToHistory: (record: Omit<ExportRecord, 'id'>) => void;
  addExportError: (error: string) => void;
  clearExportErrors: () => void;
  setLastExportSuccess: (success: boolean) => void;
  
  // Export actions
  startExport: () => void;
  completeExport: (result: ExportResult) => void;
  failExport: (error: string) => void;
  
  // Utilities
  resetExportSettings: () => void;
}


export const useExportStore = create<ExportState>()(
  devtools(
    (set, get) => ({
      // Initial state
      isExporting: false,
      exportProgress: null,
      lastExportResult: null,
      selectedTemplate: null,
      customFilename: '',
      exportHistory: [],
      exportErrors: [],
      lastExportSuccess: false,
      
      // Actions
      setExporting: (exporting) => 
        set({ 
          isExporting: exporting,
          exportProgress: exporting ? { stage: 'preparing', progress: 0, message: 'Starting export...' } : null
        }, false, 'setExporting'),
      
      setExportProgress: (progress) => 
        set({ exportProgress: progress }, false, 'setExportProgress'),
      
      setLastExportResult: (result) => 
        set({ lastExportResult: result }, false, 'setLastExportResult'),
      
      // Configuration
      setSelectedTemplate: (template) => 
        set({ selectedTemplate: template }, false, 'setSelectedTemplate'),
      
      setCustomFilename: (filename) => 
        set({ customFilename: filename }, false, 'setCustomFilename'),
      
      // History and errors
      addExportToHistory: (record) => {
        const id = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const exportRecord: ExportRecord = {
          ...record,
          id
        };
        
        set((state) => ({
          exportHistory: [exportRecord, ...state.exportHistory].slice(0, 10) // Keep only last 10
        }), false, 'addExportToHistory');
      },
      
      addExportError: (error) => 
        set((state) => ({
          exportErrors: [...state.exportErrors, error]
        }), false, 'addExportError'),
      
      clearExportErrors: () => 
        set({ exportErrors: [] }, false, 'clearExportErrors'),
      
      setLastExportSuccess: (success) => 
        set({ lastExportSuccess: success }, false, 'setLastExportSuccess'),
      
      // Export actions
      startExport: () => {
        set({
          isExporting: true,
          exportProgress: { stage: 'preparing', progress: 0, message: 'Initializing export...' },
          lastExportResult: null,
          exportErrors: []
        }, false, 'startExport');
      },
      
      completeExport: (result) => {
        const state = get();
        
        set({
          isExporting: false,
          exportProgress: null,
          lastExportResult: result,
          lastExportSuccess: result.success
        }, false, 'completeExport');
        
        // Add to history
        state.addExportToHistory({
          filename: result.filename,
          template: state.selectedTemplate?.name || 'Unknown',
          dataSource: [], // This should be passed from the export call
          generatedAt: result.generatedAt,
          fileSize: result.size,
          status: result.success ? 'success' : 'error',
          error: result.error
        });
      },
      
      failExport: (error) => {
        set({
          isExporting: false,
          exportProgress: null,
          lastExportResult: {
            success: false,
            filename: '',
            size: 0,
            generatedAt: new Date(),
            error
          },
          lastExportSuccess: false
        }, false, 'failExport');
        
        get().addExportError(error);
      },
      
      // Utilities
      resetExportSettings: () => 
        set({
          selectedTemplate: null,
          customFilename: '',
          exportProgress: null,
          lastExportResult: null,
          exportErrors: []
        }, false, 'resetExportSettings')
    }),
    {
      name: 'export-store'
    }
  )
);