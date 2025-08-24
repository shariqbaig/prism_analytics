import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DataService, dataService } from '../dataService';
import { db } from '@/lib/database';
import type { ProcessedFileData } from '@/types/fileProcessing';
import type { FileMetadata } from '@/types/database';

// Mock the database
vi.mock('@/lib/database', () => ({
  db: {
    saveProcessedFile: vi.fn(),
    getActiveFileData: vi.fn(),
    switchActiveFile: vi.fn(),
    deleteFile: vi.fn(),
    getFileHistory: vi.fn(),
    setPreference: vi.fn(),
    getPreference: vi.fn(),
    clearAllData: vi.fn(),
    exportData: vi.fn(),
    createDataVersion: vi.fn(),
    getDataVersions: vi.fn(),
    getDatabaseStats: vi.fn(),
    updateApplicationState: vi.fn(),
    getApplicationState: vi.fn()
  },
  initializeDatabase: vi.fn().mockResolvedValue(true),
  generateFileHash: vi.fn().mockResolvedValue('test-hash-123')
}));

// Mock crypto and FileReader
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: vi.fn().mockImplementation(() => 
        Promise.resolve(new ArrayBuffer(32))
      )
    }
  }
});

global.FileReader = vi.fn().mockImplementation(() => ({
  readAsArrayBuffer: vi.fn(),
  onload: null,
  onerror: null,
  result: new ArrayBuffer(8192)
})) as unknown as typeof FileReader;

// Mock navigator.storage
Object.defineProperty(global.navigator, 'storage', {
  value: {
    estimate: vi.fn().mockResolvedValue({
      usage: 1024 * 1024, // 1MB
      quota: 10 * 1024 * 1024 // 10MB
    })
  }
});

describe('DataService', () => {
  let service: DataService;

  const mockProcessedFileData: ProcessedFileData = {
    fileName: 'test-file.xlsx',
    fileSize: 1024,
    processedAt: new Date(),
    sheets: [
      {
        name: 'FG value',
        type: 'inventory',
        rowCount: 10,
        columnCount: 5,
        columns: ['Item Code', 'Description', 'UOM', 'Stock', 'Price'],
        data: [
          { 'Item Code': 'INV001', Description: 'Test Item', UOM: 'PCS', Stock: 100, Price: 25.5 }
        ],
        warnings: []
      }
    ],
    detectedDataSources: ['inventory']
  };

  const mockFile = new File(['test content'], 'test.xlsx', { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });

  beforeEach(() => {
    service = DataService.getInstance();
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = DataService.getInstance();
      const instance2 = DataService.getInstance();
      expect(instance1).toBe(instance2);
      expect(instance1).toBe(dataService);
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const success = await service.initialize();
      expect(success).toBe(true);
    });

    it('should handle initialization failure', async () => {
      const { initializeDatabase } = await import('@/lib/database');
      vi.mocked(initializeDatabase).mockResolvedValueOnce(false);
      
      const success = await service.initialize();
      expect(success).toBe(false);
    });
  });

  describe('File Management', () => {
    it('should save file successfully', async () => {
      vi.mocked(db.saveProcessedFile).mockResolvedValueOnce(123);
      vi.mocked(db.updateApplicationState).mockResolvedValueOnce(undefined);
      
      const fileId = await service.saveFile(mockFile, mockProcessedFileData, 'inventory');
      
      expect(fileId).toBe(123);
      expect(db.saveProcessedFile).toHaveBeenCalledWith(mockProcessedFileData, 'test-hash-123', 'inventory');
    });

    it('should handle duplicate files', async () => {
      // Mock database to return existing file
      vi.mocked(db.saveProcessedFile).mockImplementationOnce(async () => {
        // Simulate finding existing file logic
        throw new Error('File already exists');
      });
      
      const fileId = await service.saveFile(mockFile, mockProcessedFileData, 'inventory');
      expect(fileId).toBeNull();
    });

    it('should get active file data', async () => {
      vi.mocked(db.getActiveFileData).mockResolvedValueOnce(mockProcessedFileData);
      
      const data = await service.getActiveFileData('inventory');
      
      expect(data).toEqual(mockProcessedFileData);
      expect(db.getActiveFileData).toHaveBeenCalledWith('inventory');
    });

    it('should switch active file', async () => {
      vi.mocked(db.switchActiveFile).mockResolvedValueOnce(true);
      vi.mocked(db.updateApplicationState).mockResolvedValueOnce(undefined);
      
      const success = await service.switchActiveFile(123);
      
      expect(success).toBe(true);
      expect(db.switchActiveFile).toHaveBeenCalledWith(123);
    });

    it('should delete file', async () => {
      vi.mocked(db.deleteFile).mockResolvedValueOnce(true);
      vi.mocked(db.getApplicationState).mockResolvedValueOnce({ 
        activeFileId: 123, 
        lastActiveAt: new Date(),
        preferences: {},
        version: 1 
      });
      vi.mocked(db.updateApplicationState).mockResolvedValueOnce(undefined);
      
      const success = await service.deleteFile(123);
      
      expect(success).toBe(true);
      expect(db.deleteFile).toHaveBeenCalledWith(123);
    });

    it('should get file history', async () => {
      const mockHistory = [
        { id: 1, fileName: 'file1.xlsx', fileType: 'inventory' as const, isActive: true, 
          uploadedAt: new Date(), processedAt: new Date(), fileSize: 1024, 
          fileHash: 'hash1', version: 1 },
        { id: 2, fileName: 'file2.xlsx', fileType: 'inventory' as const, isActive: false, 
          uploadedAt: new Date(), processedAt: new Date(), fileSize: 2048, 
          fileHash: 'hash2', version: 1 }
      ];
      
      vi.mocked(db.getFileHistory).mockResolvedValueOnce(mockHistory);
      
      const history = await service.getFileHistory('inventory');
      
      expect(history).toEqual(mockHistory);
      expect(db.getFileHistory).toHaveBeenCalledWith('inventory');
    });
  });

  describe('Data Analysis', () => {
    it('should check if data exists', async () => {
      vi.mocked(db.getActiveFileData).mockResolvedValueOnce(mockProcessedFileData);
      
      const hasData = await service.hasData('inventory');
      
      expect(hasData).toBe(true);
    });

    it('should return false when no data exists', async () => {
      vi.mocked(db.getActiveFileData).mockResolvedValueOnce(null);
      
      const hasData = await service.hasData('inventory');
      
      expect(hasData).toBe(false);
    });

    it('should get detected data sources', async () => {
      vi.mocked(db.getActiveFileData)
        .mockResolvedValueOnce(mockProcessedFileData) // inventory
        .mockResolvedValueOnce(null); // osr
      
      const sources = await service.getDetectedDataSources();
      
      expect(sources).toEqual(['inventory']);
    });

    it('should get sheets by type', async () => {
      vi.mocked(db.getActiveFileData).mockResolvedValueOnce(mockProcessedFileData);
      
      const sheets = await service.getSheetsByType('inventory');
      
      expect(sheets).toEqual(mockProcessedFileData.sheets.filter(s => s.type === 'inventory'));
    });

    it('should get processing stats', async () => {
      const mockStats = {
        totalFiles: 2,
        totalSheets: 3,
        totalDataRows: 100,
        totalStorageSize: 2048,
        lastActivity: new Date()
      };
      
      vi.mocked(db.getDatabaseStats).mockResolvedValueOnce(mockStats);
      vi.mocked(db.fileMetadata.toArray).mockResolvedValueOnce([
        { id: 1, fileName: 'file1', fileType: 'inventory' as const, isActive: true },
        { id: 2, fileName: 'file2', fileType: 'osr' as const, isActive: true }
      ] as FileMetadata[]);
      
      const stats = await service.getProcessingStats();
      
      expect(stats).toBeDefined();
      expect(stats?.totalFiles).toBe(2);
      expect(stats?.totalDataRows).toBe(100);
    });
  });

  describe('User Preferences', () => {
    it('should set user preference', async () => {
      vi.mocked(db.setPreference).mockResolvedValueOnce(undefined);
      
      await service.setUserPreference('theme', 'dark');
      
      expect(db.setPreference).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should get user preference', async () => {
      vi.mocked(db.getPreference).mockResolvedValueOnce('dark');
      
      const value = await service.getUserPreference('theme', 'light');
      
      expect(value).toBe('dark');
      expect(db.getPreference).toHaveBeenCalledWith('theme', 'light');
    });

    it('should return default value when preference not found', async () => {
      vi.mocked(db.getPreference).mockResolvedValueOnce(undefined);
      
      const value = await service.getUserPreference('theme', 'light');
      
      expect(value).toBe('light');
    });
  });

  describe('Database Management', () => {
    it('should clear all data', async () => {
      vi.mocked(db.clearAllData).mockResolvedValueOnce(undefined);
      
      const success = await service.clearAllData();
      
      expect(success).toBe(true);
      expect(db.clearAllData).toHaveBeenCalled();
    });

    it('should export data', async () => {
      const mockExportData = JSON.stringify({ exportDate: new Date(), files: [] });
      vi.mocked(db.exportData).mockResolvedValueOnce(mockExportData);
      
      const exportData = await service.exportData();
      
      expect(exportData).toBe(mockExportData);
      expect(db.exportData).toHaveBeenCalled();
    });
  });

  describe('Version Management', () => {
    it('should create data version', async () => {
      vi.mocked(db.createDataVersion).mockResolvedValueOnce(456);
      
      const versionId = await service.createDataVersion(123, 'Version 2', ['Updated data']);
      
      expect(versionId).toBe(456);
      expect(db.createDataVersion).toHaveBeenCalledWith(123, 'Version 2', ['Updated data']);
    });

    it('should get data versions', async () => {
      const mockVersions = [
        { id: 1, fileMetadataId: 123, version: 2, createdAt: new Date(), isActive: true, changes: [] },
        { id: 2, fileMetadataId: 123, version: 1, createdAt: new Date(), isActive: false, changes: [] }
      ];
      
      vi.mocked(db.getDataVersions).mockResolvedValueOnce(mockVersions);
      
      const versions = await service.getDataVersions(123);
      
      expect(versions).toEqual(mockVersions);
      expect(db.getDataVersions).toHaveBeenCalledWith(123);
    });
  });

  describe('Utility Methods', () => {
    it('should get storage quota', async () => {
      const quota = await service.getStorageQuota();
      
      expect(quota).toEqual({
        used: 1024 * 1024,
        quota: 10 * 1024 * 1024
      });
    });

    it('should check if storage quota is exceeded', async () => {
      // Mock storage usage at 90% (exceeded threshold of 80%)
      Object.defineProperty(global.navigator, 'storage', {
        value: {
          estimate: vi.fn().mockResolvedValue({
            usage: 9 * 1024 * 1024, // 9MB
            quota: 10 * 1024 * 1024 // 10MB
          })
        }
      });
      
      const isExceeded = await service.isStorageQuotaExceeded();
      
      expect(isExceeded).toBe(true);
    });

    it('should return false when storage quota is not exceeded', async () => {
      // Mock storage usage at 50% (below threshold)
      Object.defineProperty(global.navigator, 'storage', {
        value: {
          estimate: vi.fn().mockResolvedValue({
            usage: 5 * 1024 * 1024, // 5MB
            quota: 10 * 1024 * 1024 // 10MB
          })
        }
      });
      
      const isExceeded = await service.isStorageQuotaExceeded();
      
      expect(isExceeded).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      vi.mocked(db.saveProcessedFile).mockRejectedValueOnce(new Error('Database error'));
      
      const fileId = await service.saveFile(mockFile, mockProcessedFileData, 'inventory');
      
      expect(fileId).toBeNull();
    });

    it('should handle initialization errors', async () => {
      const { initializeDatabase } = await import('@/lib/database');
      vi.mocked(initializeDatabase).mockRejectedValueOnce(new Error('Init error'));
      
      const success = await service.initialize();
      
      expect(success).toBe(false);
    });

    it('should return empty arrays on errors', async () => {
      vi.mocked(db.getFileHistory).mockRejectedValueOnce(new Error('Database error'));
      
      const history = await service.getFileHistory();
      
      expect(history).toEqual([]);
    });
  });
});