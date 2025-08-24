import { useState, useEffect, useCallback } from 'react';
import { dataService } from '@/services/dataService';
import type { ProcessedFileData, ProcessingStats } from '@/types/fileProcessing';
import type { FileMetadata, DataExportOptions } from '@/types/database';

interface DataStorageState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  hasStoredData: boolean;
  activeFileId: number | null;
  storageQuota: { used: number; quota: number } | null;
}

export interface UseDataStorageReturn {
  // State
  state: DataStorageState;
  
  // File operations
  saveFile: (file: File, processedData: ProcessedFileData, fileType: 'inventory' | 'osr') => Promise<number | null>;
  getActiveFileData: (fileType?: 'inventory' | 'osr') => Promise<ProcessedFileData | null>;
  switchActiveFile: (fileId: number) => Promise<boolean>;
  deleteFile: (fileId: number) => Promise<boolean>;
  getFileHistory: (fileType?: 'inventory' | 'osr') => Promise<FileMetadata[]>;
  
  // Data analysis
  hasData: (fileType?: 'inventory' | 'osr') => Promise<boolean>;
  getDetectedDataSources: () => Promise<('inventory' | 'osr')[]>;
  getSheetsByType: (type: 'inventory' | 'osr') => Promise<unknown[]>;
  getProcessingStats: () => Promise<ProcessingStats | null>;
  
  // Preferences
  setPreference: (key: string, value: unknown) => Promise<void>;
  getPreference: <T = unknown>(key: string, defaultValue?: T) => Promise<T | undefined>;
  
  // Database management
  clearAllData: () => Promise<boolean>;
  exportData: (options?: DataExportOptions) => Promise<string | null>;
  
  // Version management
  createDataVersion: (fileId: number, description: string, changes: string[]) => Promise<number | null>;
  getDataVersions: (fileId: number) => Promise<unknown[]>;
  
  // Utility methods
  refreshState: () => Promise<void>;
  checkStorageQuota: () => Promise<void>;
}

export function useDataStorage(): UseDataStorageReturn {
  const [state, setState] = useState<DataStorageState>({
    isInitialized: false,
    isLoading: true,
    error: null,
    hasStoredData: false,
    activeFileId: null,
    storageQuota: null
  });

  // Initialize the data service
  const initialize = useCallback(async () => {
    try {
      console.log('[useDataStorage] Starting initialization...');
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const success = await dataService.initialize();
      if (!success) {
        throw new Error('Failed to initialize database');
      }

      // Check if we have stored data
      const hasInventory = await dataService.hasData('inventory');
      const hasOSR = await dataService.hasData('osr');
      const hasStoredData = hasInventory || hasOSR;
      
      console.log('[useDataStorage] Initialize - hasInventory:', hasInventory, 'hasOSR:', hasOSR, 'hasStoredData:', hasStoredData);

      // Get storage quota
      const quota = await dataService.getStorageQuota();

      setState(prev => {
        console.log('[useDataStorage] Setting initial state - hasStoredData:', hasStoredData);
        return {
          ...prev,
          isInitialized: true,
          isLoading: false,
          hasStoredData,
          storageQuota: quota
        };
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, []);

  // Refresh state from database
  const refreshState = useCallback(async () => {
    console.log('[useDataStorage] refreshState called, isInitialized:', state.isInitialized);
    if (!state.isInitialized) return;
    
    try {
      setState(prev => ({ ...prev, error: null }));
      
      const hasInventory = await dataService.hasData('inventory');
      const hasOSR = await dataService.hasData('osr');
      const hasStoredData = hasInventory || hasOSR;
      
      console.log('[useDataStorage] refreshState - hasInventory:', hasInventory, 'hasOSR:', hasOSR, 'hasStoredData:', hasStoredData);
      
      const quota = await dataService.getStorageQuota();

      setState(prev => {
        console.log('[useDataStorage] refreshState updating state - prev hasStoredData:', prev.hasStoredData, 'new hasStoredData:', hasStoredData);
        return {
          ...prev,
          hasStoredData,
          storageQuota: quota
        };
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, [state.isInitialized]);

  // Check storage quota and warn if needed
  const checkStorageQuota = useCallback(async () => {
    try {
      const isExceeded = await dataService.isStorageQuotaExceeded();
      if (isExceeded) {
        console.warn('Storage quota is nearly exceeded. Consider cleaning up old files.');
      }
    } catch (error) {
      console.error('Failed to check storage quota:', error);
    }
  }, []);

  // File operations
  const saveFile = useCallback(async (file: File, processedData: ProcessedFileData, fileType: 'inventory' | 'osr'): Promise<number | null> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      const fileId = await dataService.saveFile(file, processedData, fileType);
      
      if (fileId) {
        console.log('[useDataStorage] File saved with ID:', fileId);
        
        // Force a small delay to ensure database writes are complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Update state and check if we have data
        const hasInventory = await dataService.hasData('inventory');
        const hasOSR = await dataService.hasData('osr');
        const hasStoredData = hasInventory || hasOSR;
        
        console.log('[useDataStorage] Data check - hasInventory:', hasInventory, 'hasOSR:', hasOSR);
        
        setState(prev => { 
          console.log('[useDataStorage] Updating state - previous hasStoredData:', prev.hasStoredData, 'new hasStoredData:', hasStoredData);
          return {
            ...prev, 
            hasStoredData, 
            activeFileId: fileId 
          };
        });
        
        await checkStorageQuota();
      }
      
      return fileId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage }));
      return null;
    }
  }, [checkStorageQuota]);

  const getActiveFileData = useCallback(async (fileType?: 'inventory' | 'osr'): Promise<ProcessedFileData | null> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      return await dataService.getActiveFileData(fileType);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage }));
      return null;
    }
  }, []);

  const switchActiveFile = useCallback(async (fileId: number): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      const success = await dataService.switchActiveFile(fileId);
      
      if (success) {
        setState(prev => ({ ...prev, activeFileId: fileId }));
      }
      
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage }));
      return false;
    }
  }, []);

  const deleteFile = useCallback(async (fileId: number): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      const success = await dataService.deleteFile(fileId);
      
      if (success) {
        await refreshState();
        
        // If we deleted the active file, clear the active file ID
        if (state.activeFileId === fileId) {
          setState(prev => ({ ...prev, activeFileId: null }));
        }
      }
      
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage }));
      return false;
    }
  }, [refreshState, state.activeFileId]);

  const getFileHistory = useCallback(async (fileType?: 'inventory' | 'osr'): Promise<FileMetadata[]> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      return await dataService.getFileHistory(fileType);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage }));
      return [];
    }
  }, []);

  // Data analysis methods
  const hasData = useCallback(async (fileType?: 'inventory' | 'osr'): Promise<boolean> => {
    try {
      return await dataService.hasData(fileType);
    } catch (error) {
      console.error('Failed to check if data exists:', error);
      return false;
    }
  }, []);

  const getDetectedDataSources = useCallback(async (): Promise<('inventory' | 'osr')[]> => {
    try {
      return await dataService.getDetectedDataSources();
    } catch (error) {
      console.error('Failed to get detected data sources:', error);
      return [];
    }
  }, []);

  const getSheetsByType = useCallback(async (type: 'inventory' | 'osr'): Promise<unknown[]> => {
    try {
      return await dataService.getSheetsByType(type);
    } catch (error) {
      console.error('Failed to get sheets by type:', error);
      return [];
    }
  }, []);

  const getProcessingStats = useCallback(async (): Promise<ProcessingStats | null> => {
    try {
      const stats = await dataService.getProcessingStats();
      if (!stats) return null;

      // Convert to ProcessingStats format
      return {
        totalRows: stats.totalDataRows,
        totalColumns: 0, // Not tracked in database stats
        processingTime: stats.averageProcessingTime,
        sheetsProcessed: stats.totalSheets,
        validationErrors: 0, // Could be tracked in future
        warnings: 0 // Could be tracked in future
      };
    } catch (error) {
      console.error('Failed to get processing stats:', error);
      return null;
    }
  }, []);

  // Preferences
  const setPreference = useCallback(async (key: string, value: unknown): Promise<void> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      await dataService.setUserPreference(key, value);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  }, []);

  const getPreference = useCallback(async <T = unknown>(key: string, defaultValue?: T): Promise<T | undefined> => {
    try {
      return await dataService.getUserPreference(key, defaultValue);
    } catch (error) {
      console.error('Failed to get preference:', error);
      return defaultValue;
    }
  }, []);

  // Database management
  const clearAllData = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      const success = await dataService.clearAllData();
      
      if (success) {
        setState(prev => ({
          ...prev,
          hasStoredData: false,
          activeFileId: null
        }));
      }
      
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage }));
      return false;
    }
  }, []);

  const exportData = useCallback(async (options?: DataExportOptions): Promise<string | null> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      return await dataService.exportData(options);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage }));
      return null;
    }
  }, []);

  // Version management
  const createDataVersion = useCallback(async (fileId: number, description: string, changes: string[]): Promise<number | null> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      return await dataService.createDataVersion(fileId, description, changes);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage }));
      return null;
    }
  }, []);

  const getDataVersions = useCallback(async (fileId: number): Promise<unknown[]> => {
    try {
      return await dataService.getDataVersions(fileId);
    } catch (error) {
      console.error('Failed to get data versions:', error);
      return [];
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    state,
    saveFile,
    getActiveFileData,
    switchActiveFile,
    deleteFile,
    getFileHistory,
    hasData,
    getDetectedDataSources,
    getSheetsByType,
    getProcessingStats,
    setPreference,
    getPreference,
    clearAllData,
    exportData,
    createDataVersion,
    getDataVersions,
    refreshState,
    checkStorageQuota
  };
}