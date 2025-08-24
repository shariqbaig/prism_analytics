import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  ProcessingResult,
  ProcessingProgress,
  ProcessedFileData,
  ProcessingError
} from '@/types/fileProcessing';

interface FileProcessingState {
  // Current processing state
  isProcessing: boolean;
  currentFile: File | null;
  progress: ProcessingProgress | null;
  
  // Results
  lastResult: ProcessingResult | null;
  processedData: ProcessedFileData | null;
  
  // Error handling
  errors: ProcessingError[];
  warnings: string[];
  
  // Processing history
  processingHistory: ProcessingHistoryItem[];
  
  // Actions
  startProcessing: (file: File) => void;
  updateProgress: (progress: ProcessingProgress) => void;
  completeProcessing: (result: ProcessingResult) => void;
  addError: (error: ProcessingError) => void;
  clearErrors: () => void;
  clearData: () => void;
  reset: () => void;
}

interface ProcessingHistoryItem {
  id: string;
  fileName: string;
  fileSize: number;
  processedAt: string | Date;
  success: boolean;
  processingTime: number;
  error?: string;
  sheetsProcessed: number;
  totalRows: number;
}

const useFileProcessingStore = create<FileProcessingState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isProcessing: false,
    currentFile: null,
    progress: null,
    lastResult: null,
    processedData: null,
    errors: [],
    warnings: [],
    processingHistory: [],

    // Actions
    startProcessing: (file: File) => {
      set({
        isProcessing: true,
        currentFile: file,
        progress: {
          phase: 'reading',
          progress: 0,
          message: 'Starting file processing...'
        },
        lastResult: null,
        errors: [],
        warnings: []
      });
    },

    updateProgress: (progress: ProcessingProgress) => {
      set({ progress });
    },

    completeProcessing: (result: ProcessingResult) => {
      const currentFile = get().currentFile;
      
      // Create history item
      const historyItem: ProcessingHistoryItem = {
        id: `processing_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        fileName: currentFile?.name || 'unknown',
        fileSize: currentFile?.size || 0,
        processedAt: new Date().toISOString(),
        success: result.success,
        processingTime: result.stats?.processingTime || 0,
        error: result.error?.message,
        sheetsProcessed: result.stats?.sheetsProcessed || 0,
        totalRows: result.stats?.totalRows || 0
      };

      set(state => ({
        isProcessing: false,
        currentFile: null,
        progress: null,
        lastResult: result,
        processedData: result.success ? result.data || null : null,
        errors: result.error ? [...state.errors, result.error] : state.errors,
        warnings: result.warnings || [],
        processingHistory: [historyItem, ...state.processingHistory.slice(0, 9)] // Keep last 10 items
      }));
    },

    addError: (error: ProcessingError) => {
      set(state => ({
        errors: [...state.errors, error]
      }));
    },

    clearErrors: () => {
      set({ errors: [], warnings: [] });
    },

    clearData: () => {
      set({
        processedData: null,
        lastResult: null,
        warnings: []
      });
    },

    reset: () => {
      set({
        isProcessing: false,
        currentFile: null,
        progress: null,
        lastResult: null,
        processedData: null,
        errors: [],
        warnings: []
      });
    }
  }))
);

// Selectors for computed values
export const selectIsProcessing = (state: FileProcessingState) => state.isProcessing;
export const selectCurrentProgress = (state: FileProcessingState) => state.progress;
export const selectProcessedData = (state: FileProcessingState) => state.processedData;
export const selectHasErrors = (state: FileProcessingState) => state.errors.length > 0;
export const selectHasData = (state: FileProcessingState) => state.processedData !== null;
export const selectProcessingStats = (state: FileProcessingState) => state.lastResult?.stats;
export const selectDetectedDataSources = (state: FileProcessingState) => 
  state.processedData?.detectedDataSources || [];

// Selector for sheets by type
export const selectSheetsByType = (type: 'inventory' | 'osr') => (state: FileProcessingState) =>
  state.processedData?.sheets.filter(sheet => sheet.type === type) || [];

// Selector for successful processing history
export const selectSuccessfulProcessingHistory = (state: FileProcessingState) =>
  state.processingHistory.filter(item => item.success);

export default useFileProcessingStore;