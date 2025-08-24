import { useCallback, useEffect, useRef, useMemo } from 'react';
import { FileProcessorService } from '@/services/fileProcessorService';
import useFileProcessingStore, { 
  selectIsProcessing, 
  selectCurrentProgress, 
  selectProcessedData,
  selectHasErrors,
  selectHasData,
  selectDetectedDataSources 
} from '@/stores/fileProcessingStore';
import type { FileProcessingConfig, ProcessingResult, ProcessingProgress } from '@/types/fileProcessing';

interface UseFileProcessorOptions {
  config?: Partial<FileProcessingConfig>;
  onComplete?: (result: ProcessingResult) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: ProcessingProgress) => void;
}

export function useFileProcessor(options: UseFileProcessorOptions = {}) {
  const serviceRef = useRef<FileProcessorService | null>(null);
  const optionsRef = useRef(options);
  
  // Update options ref when they change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  
  // Use config directly to avoid memoization issues
  const config = options.config;
  
  // Get store state directly without complex selector
  const isProcessing = useFileProcessingStore(state => state.isProcessing);
  const progress = useFileProcessingStore(state => state.progress);
  const processedData = useFileProcessingStore(state => state.processedData);
  const errors = useFileProcessingStore(state => state.errors);
  const warnings = useFileProcessingStore(state => state.warnings);
  const processingHistory = useFileProcessingStore(state => state.processingHistory);
  const startProcessing = useFileProcessingStore(state => state.startProcessing);
  const updateProgress = useFileProcessingStore(state => state.updateProgress);
  const completeProcessing = useFileProcessingStore(state => state.completeProcessing);
  const clearErrors = useFileProcessingStore(state => state.clearErrors);
  const clearData = useFileProcessingStore(state => state.clearData);
  const reset = useFileProcessingStore(state => state.reset);

  // Compute derived values with useMemo to prevent re-renders
  const hasErrors = useMemo(() => errors.length > 0, [errors]);
  const hasData = useMemo(() => processedData !== null, [processedData]);
  const detectedDataSources = useMemo(() => processedData?.detectedDataSources || [], [processedData?.detectedDataSources]);

  // Initialize service once
  useEffect(() => {
    if (!serviceRef.current) {
      serviceRef.current = new FileProcessorService(config);
    }
    
    return () => {
      if (serviceRef.current) {
        serviceRef.current.destroy();
        serviceRef.current = null;
      }
    };
  }, []); // Empty dependency array - initialize once

  // Update service config when options change
  useEffect(() => {
    if (serviceRef.current && config) {
      serviceRef.current.updateConfig(config);
    }
  }, [config]);

  // Progress callback handler
  const handleProgress = useCallback((progressUpdate: ProcessingProgress) => {
    updateProgress(progressUpdate);
    optionsRef.current.onProgress?.(progressUpdate);
  }, [updateProgress]);

  // Main processing function
  const processFile = useCallback(async (file: File): Promise<ProcessingResult> => {
    if (!serviceRef.current) {
      throw new Error('File processor service not initialized');
    }

    try {
      // Start processing in store
      startProcessing(file);
      
      // Process file with service
      const result = await serviceRef.current.processFile(file, handleProgress);
      
      // Complete processing in store
      completeProcessing(result);
      
      // Call completion callback
      if (result.success) {
        optionsRef.current.onComplete?.(result);
      } else {
        optionsRef.current.onError?.(result.error?.message || 'Processing failed');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const failedResult: ProcessingResult = {
        success: false,
        error: {
          type: 'parsing',
          message: errorMessage
        }
      };
      
      completeProcessing(failedResult);
      optionsRef.current.onError?.(errorMessage);
      
      return failedResult;
    }
  }, [startProcessing, completeProcessing, handleProgress]);

  // Validate file without processing
  const validateFile = useCallback(async (file: File) => {
    if (!serviceRef.current) {
      throw new Error('File processor service not initialized');
    }
    
    return await serviceRef.current.validateFileOnly(file);
  }, []);

  // Get expected sheet names for current config
  const getExpectedSheetNames = useCallback(() => {
    if (!serviceRef.current) return [];
    return serviceRef.current.getExpectedSheetNames();
  }, []);

  // Get expected columns for sheet type
  const getExpectedColumnsForSheetType = useCallback((sheetType: 'inventory' | 'osr') => {
    if (!serviceRef.current) return [];
    return serviceRef.current.getExpectedColumnsForSheet(sheetType);
  }, []);

  // Check if file processing is supported
  const isSupported = FileProcessorService.isSupported();

  // Get processing statistics
  const getProcessingStats = useCallback(() => {
    if (!processedData) return null;
    
    return {
      totalFiles: processingHistory.length,
      successfulFiles: processingHistory.filter(item => item.success).length,
      totalRowsProcessed: processingHistory.reduce((sum, item) => sum + item.totalRows, 0),
      averageProcessingTime: processingHistory.length > 0 
        ? processingHistory.reduce((sum, item) => sum + item.processingTime, 0) / processingHistory.length 
        : 0,
      lastProcessedFile: processingHistory[0]
    };
  }, [processedData, processingHistory]);

  // Get sheets by type from current data
  const getSheetsByType = useCallback((type: 'inventory' | 'osr') => {
    return processedData?.sheets.filter(sheet => sheet.type === type) || [];
  }, [processedData]);

  // Get all unique columns from processed sheets
  const getAllColumns = useCallback(() => {
    if (!processedData) return [];
    
    const columns = new Set<string>();
    for (const sheet of processedData.sheets) {
      for (const column of sheet.columns) {
        columns.add(column);
      }
    }
    
    return Array.from(columns);
  }, [processedData]);

  // Cancel current processing (if supported in future)
  const cancelProcessing = useCallback(() => {
    if (isProcessing) {
      reset();
    }
  }, [isProcessing, reset]);

  return {
    // State
    isProcessing,
    progress,
    processedData,
    hasErrors,
    hasData,
    errors,
    warnings,
    processingHistory,
    detectedDataSources,
    isSupported,

    // Actions
    processFile,
    validateFile,
    clearErrors,
    clearData,
    reset,
    cancelProcessing,

    // Utility functions
    getExpectedSheetNames,
    getExpectedColumnsForSheetType,
    getProcessingStats,
    getSheetsByType,
    getAllColumns
  };
}