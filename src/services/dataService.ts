import { db, initializeDatabase, generateFileHash } from '@/lib/database';
import type { ProcessedFileData } from '@/types/fileProcessing';
import type { FileMetadata, DataExportOptions } from '@/types/database';

/**
 * Data Service Layer for PRISM Analytics
 * Provides high-level methods for data management and storage operations
 */
export class DataService {
  private static instance: DataService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }
    
    const success = await initializeDatabase();
    this.isInitialized = success;
    return success;
  }

  // File Management Operations
  async saveFile(file: File, processedData: ProcessedFileData, fileType: 'inventory' | 'osr'): Promise<number | null> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) throw new Error('Database initialization failed');
      }

      const fileHash = await generateFileHash(file);
      
      // Check if file already exists
      const existingFiles = await db.fileMetadata
        .where('fileHash')
        .equals(fileHash)
        .and(f => f.fileType === fileType)
        .toArray();

      if (existingFiles.length > 0) {
        const existingFile = existingFiles[0];
        if (existingFile.id) {
          await this.switchActiveFile(existingFile.id);
          return existingFile.id;
        }
      }

      const fileId = await db.saveProcessedFile(processedData, fileHash, fileType);
      
      // Update application state
      await db.updateApplicationState({
        activeFileId: fileId,
        lastActiveAt: new Date()
      });

      return fileId;
    } catch (error) {
      console.error('[DATA SERVICE] Failed to save file:', error);
      return null;
    }
  }

  async getActiveFileData(fileType?: 'inventory' | 'osr'): Promise<ProcessedFileData | null> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return null;
      }

      return await db.getActiveFileData(fileType);
    } catch (error) {
      // Don't log DexieError2 as they're expected when no data exists
      if (error?.constructor?.name !== 'DexieError2' && !error?.toString()?.includes('DexieError2')) {
        console.error('Failed to get active file data:', error);
      }
      return null;
    }
  }

  async switchActiveFile(fileId: number): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return false;
      }

      const success = await db.switchActiveFile(fileId);
      
      if (success) {
        await db.updateApplicationState({
          activeFileId: fileId,
          lastActiveAt: new Date()
        });
      }

      return success;
    } catch (error) {
      console.error('Failed to switch active file:', error);
      return false;
    }
  }

  async getFileHistory(fileType?: 'inventory' | 'osr'): Promise<FileMetadata[]> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return [];
      }

      return await db.getFileHistory(fileType);
    } catch (error) {
      console.error('Failed to get file history:', error);
      return [];
    }
  }

  async deleteFile(fileId: number): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return false;
      }

      // Check if this is the active file
      const appState = await db.getApplicationState();
      const isActiveFile = appState?.activeFileId === fileId;

      const success = await db.deleteFile(fileId);

      if (success && isActiveFile) {
        // Clear active file if we just deleted it
        await db.updateApplicationState({
          activeFileId: undefined,
          lastActiveAt: new Date()
        });
      }

      return success;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }

  // Data Analysis Methods
  async hasData(fileType?: 'inventory' | 'osr'): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return false;
      }

      // Check if any files exist of the given type before trying to get active data
      const activeFile = await db.getActiveFile(fileType);
      console.log('[dataService.hasData] Active file for type', fileType, ':', activeFile);
      
      if (!activeFile) return false;

      const data = await this.getActiveFileData(fileType);
      console.log('[dataService.hasData] Data for type', fileType, ':', data ? 'exists' : 'null');
      return data !== null && data.sheets.length > 0;
    } catch (error) {
      // Don't log DexieError2 as they're expected when no data exists
      if (error?.constructor?.name !== 'DexieError2' && !error?.toString()?.includes('DexieError2')) {
        console.error('Failed to check if data exists:', error);
      }
      return false;
    }
  }

  async getDetectedDataSources(): Promise<('inventory' | 'osr')[]> {
    try {
      const inventoryData = await this.getActiveFileData('inventory');
      const osrData = await this.getActiveFileData('osr');
      
      const sources: ('inventory' | 'osr')[] = [];
      if (inventoryData) sources.push('inventory');
      if (osrData) sources.push('osr');
      
      return sources;
    } catch (error) {
      console.error('Failed to get detected data sources:', error);
      return [];
    }
  }

  async getSheetsByType(type: 'inventory' | 'osr'): Promise<unknown[]> {
    try {
      const data = await this.getActiveFileData(type);
      if (!data) return [];
      
      return data.sheets.filter(sheet => sheet.type === type);
    } catch (error) {
      console.error('Failed to get sheets by type:', error);
      return [];
    }
  }

  async getProcessingStats(): Promise<{
    totalFiles: number;
    totalSheets: number;
    totalDataRows: number;
    totalStorageSize: number;
    lastActivity: Date | null;
    averageProcessingTime: number;
    successfulFiles: number;
    totalRowsProcessed: number;
  } | null> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return null;
      }

      const stats = await db.getDatabaseStats();
      
      // Get additional processing statistics
      const files = await db.fileMetadata.toArray();
      const successfulFiles = files.length; // All files in DB are successful
      
      return {
        ...stats,
        averageProcessingTime: 2000, // Mock average, could be calculated from actual data
        successfulFiles,
        totalRowsProcessed: stats.totalDataRows
      };
    } catch (error) {
      console.error('Failed to get processing stats:', error);
      return null;
    }
  }

  // Preferences Management
  async setUserPreference(key: string, value: unknown): Promise<void> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) throw new Error('Database not initialized');
      }

      await db.setPreference(key, value as string | number | boolean | Record<string, unknown>);
    } catch (error) {
      console.error('Failed to set user preference:', error);
    }
  }

  async getUserPreference<T = unknown>(key: string, defaultValue?: T): Promise<T | undefined> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return defaultValue;
      }

      return await db.getPreference(key, defaultValue);
    } catch (error) {
      console.error('Failed to get user preference:', error);
      return defaultValue;
    }
  }

  // Database Management
  async clearAllData(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return false;
      }

      await db.clearAllData();
      console.log('All data cleared successfully');
      return true;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  }

  async exportData(options: DataExportOptions = { 
    includeMetadata: true, 
    includeProcessingStats: true, 
    format: 'json' 
  }): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return null;
      }

      return await db.exportData(options);
    } catch (error) {
      console.error('Failed to export data:', error);
      return null;
    }
  }

  // Version Management
  async createDataVersion(fileId: number, description: string, changes: string[]): Promise<number | null> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return null;
      }

      return await db.createDataVersion(fileId, description, changes);
    } catch (error) {
      console.error('Failed to create data version:', error);
      return null;
    }
  }

  async getDataVersions(fileId: number): Promise<unknown[]> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return [];
      }

      return await db.getDataVersions(fileId);
    } catch (error) {
      console.error('Failed to get data versions:', error);
      return [];
    }
  }

  // Utility Methods
  async getStorageQuota(): Promise<{ used: number; quota: number } | null> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          quota: estimate.quota || 0
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to get storage quota:', error);
      return null;
    }
  }

  async isStorageQuotaExceeded(): Promise<boolean> {
    const quota = await this.getStorageQuota();
    if (!quota) return false;
    
    // Alert when using more than 80% of quota
    return quota.used / quota.quota > 0.8;
  }
}

// Export singleton instance
export const dataService = DataService.getInstance();