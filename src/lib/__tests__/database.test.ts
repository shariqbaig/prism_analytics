import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PrismDatabase, db, initializeDatabase, generateFileHash } from '../database';
import type { ProcessedFileData } from '@/types/fileProcessing';

// Mock crypto.subtle for testing
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: vi.fn().mockImplementation(() => 
        Promise.resolve(new ArrayBuffer(32))
      )
    }
  }
});

// Mock FileReader
global.FileReader = vi.fn().mockImplementation(() => ({
  readAsArrayBuffer: vi.fn(),
  onload: null,
  onerror: null,
  result: new ArrayBuffer(8192)
})) as unknown as typeof FileReader;

describe('PrismDatabase', () => {
  let testDb: PrismDatabase;

  beforeEach(async () => {
    // Create a fresh database instance for each test
    testDb = new PrismDatabase({ name: 'TestPrismDB', version: 1 });
    await testDb.open();
  });

  afterEach(async () => {
    // Clean up after each test
    await testDb.clearAllData();
    await testDb.close();
    await testDb.delete();
  });

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

  describe('Database Initialization', () => {
    it('should create database with correct schema', async () => {
      expect(testDb.fileMetadata).toBeDefined();
      expect(testDb.processedFiles).toBeDefined();
      expect(testDb.processedSheets).toBeDefined();
      expect(testDb.processingStats).toBeDefined();
      expect(testDb.userPreferences).toBeDefined();
      expect(testDb.dataVersions).toBeDefined();
      expect(testDb.applicationState).toBeDefined();
    });

    it('should initialize application state on first run', async () => {
      const success = await initializeDatabase();
      expect(success).toBe(true);
      
      const appState = await db.getApplicationState();
      expect(appState).toBeDefined();
      expect(appState?.preferences).toBeDefined();
    });
  });

  describe('File Management', () => {
    it('should save processed file data', async () => {
      const fileHash = 'test-hash-123';
      const fileType = 'inventory';

      const fileId = await testDb.saveProcessedFile(mockProcessedFileData, fileHash, fileType);
      
      expect(fileId).toBeGreaterThan(0);
      
      // Verify file metadata was saved
      const metadata = await testDb.fileMetadata.get(fileId);
      expect(metadata).toBeDefined();
      expect(metadata?.fileName).toBe(mockProcessedFileData.fileName);
      expect(metadata?.fileType).toBe(fileType);
      expect(metadata?.isActive).toBe(true);
    });

    it('should deactivate other files of same type when saving new file', async () => {
      // Save first file
      const firstFileId = await testDb.saveProcessedFile(mockProcessedFileData, 'hash1', 'inventory');
      
      // Save second file of same type
      const secondFileData = { ...mockProcessedFileData, fileName: 'second-file.xlsx' };
      const secondFileId = await testDb.saveProcessedFile(secondFileData, 'hash2', 'inventory');
      
      // Check that first file is deactivated
      const firstFile = await testDb.fileMetadata.get(firstFileId);
      const secondFile = await testDb.fileMetadata.get(secondFileId);
      
      expect(firstFile?.isActive).toBe(false);
      expect(secondFile?.isActive).toBe(true);
    });

    it('should retrieve active file data', async () => {
      const fileId = await testDb.saveProcessedFile(mockProcessedFileData, 'test-hash', 'inventory');
      
      const activeFile = await testDb.getActiveFile('inventory');
      expect(activeFile).toBeDefined();
      expect(activeFile?.id).toBe(fileId);
      
      const activeFileData = await testDb.getActiveFileData('inventory');
      expect(activeFileData).toBeDefined();
      expect(activeFileData?.fileName).toBe(mockProcessedFileData.fileName);
      expect(activeFileData?.sheets).toHaveLength(1);
    });

    it('should switch active files', async () => {
      // Save two files
      const firstFileId = await testDb.saveProcessedFile(mockProcessedFileData, 'hash1', 'inventory');
      const secondFileData = { ...mockProcessedFileData, fileName: 'second-file.xlsx' };
      const secondFileId = await testDb.saveProcessedFile(secondFileData, 'hash2', 'inventory');
      
      // Switch back to first file
      const success = await testDb.switchActiveFile(firstFileId);
      expect(success).toBe(true);
      
      // Verify first file is now active
      const activeFile = await testDb.getActiveFile('inventory');
      expect(activeFile?.id).toBe(firstFileId);
    });

    it('should delete file and all related data', async () => {
      const fileId = await testDb.saveProcessedFile(mockProcessedFileData, 'test-hash', 'inventory');
      
      // Verify file exists
      const fileBeforeDelete = await testDb.fileMetadata.get(fileId);
      expect(fileBeforeDelete).toBeDefined();
      
      // Delete file
      const success = await testDb.deleteFile(fileId);
      expect(success).toBe(true);
      
      // Verify file is deleted
      const fileAfterDelete = await testDb.fileMetadata.get(fileId);
      expect(fileAfterDelete).toBeUndefined();
    });
  });

  describe('Version Management', () => {
    it('should create data versions', async () => {
      const fileId = await testDb.saveProcessedFile(mockProcessedFileData, 'test-hash', 'inventory');
      
      const versionId = await testDb.createDataVersion(
        fileId,
        'Updated inventory data',
        ['Added new items', 'Updated prices']
      );
      
      expect(versionId).toBeGreaterThan(0);
      
      const version = await testDb.dataVersions.get(versionId);
      expect(version).toBeDefined();
      expect(version?.description).toBe('Updated inventory data');
      expect(version?.changes).toHaveLength(2);
    });

    it('should retrieve version history', async () => {
      const fileId = await testDb.saveProcessedFile(mockProcessedFileData, 'test-hash', 'inventory');
      
      // Create additional versions
      await testDb.createDataVersion(fileId, 'Version 2', ['Change 1']);
      await testDb.createDataVersion(fileId, 'Version 3', ['Change 2']);
      
      const versions = await testDb.getDataVersions(fileId);
      expect(versions).toHaveLength(3); // Initial + 2 additional
      expect(versions[0].version).toBeGreaterThan(versions[1].version); // Ordered by version desc
    });
  });

  describe('User Preferences', () => {
    it('should set and get preferences', async () => {
      const key = 'theme';
      const value = 'dark';
      
      await testDb.setPreference(key, value);
      
      const retrievedValue = await testDb.getPreference(key);
      expect(retrievedValue).toBe(value);
    });

    it('should update existing preferences', async () => {
      const key = 'language';
      const initialValue = 'en';
      const updatedValue = 'es';
      
      await testDb.setPreference(key, initialValue);
      await testDb.setPreference(key, updatedValue);
      
      const retrievedValue = await testDb.getPreference(key);
      expect(retrievedValue).toBe(updatedValue);
      
      // Should only have one record
      const allPrefs = await testDb.userPreferences.where('key').equals(key).toArray();
      expect(allPrefs).toHaveLength(1);
    });

    it('should get all preferences', async () => {
      await testDb.setPreference('theme', 'dark');
      await testDb.setPreference('language', 'en');
      await testDb.setPreference('autoSave', true);
      
      const allPrefs = await testDb.getAllPreferences();
      expect(allPrefs).toEqual({
        theme: 'dark',
        language: 'en',
        autoSave: true
      });
    });
  });

  describe('Application State', () => {
    it('should update application state', async () => {
      const updates = {
        activeFileId: 123,
        preferences: { theme: 'dark' }
      };
      
      await testDb.updateApplicationState(updates);
      
      const state = await testDb.getApplicationState();
      expect(state?.activeFileId).toBe(123);
      expect(state?.preferences).toEqual({ theme: 'dark' });
    });

    it('should increment version on updates', async () => {
      await testDb.updateApplicationState({ activeFileId: 1 });
      const state1 = await testDb.getApplicationState();
      
      await testDb.updateApplicationState({ activeFileId: 2 });
      const state2 = await testDb.getApplicationState();
      
      expect(state2?.version).toBeGreaterThan(state1?.version || 0);
    });
  });

  describe('Data Export', () => {
    it('should export data in JSON format', async () => {
      await testDb.saveProcessedFile(mockProcessedFileData, 'test-hash', 'inventory');
      
      const exportData = await testDb.exportData({
        includeMetadata: true,
        includeProcessingStats: true,
        format: 'json'
      });
      
      expect(exportData).toBeDefined();
      const parsed = JSON.parse(exportData);
      expect(parsed.exportDate).toBeDefined();
      expect(parsed.files).toHaveLength(1);
      expect(parsed.files[0].metadata.fileName).toBe(mockProcessedFileData.fileName);
    });
  });

  describe('Database Statistics', () => {
    it('should calculate database statistics', async () => {
      await testDb.saveProcessedFile(mockProcessedFileData, 'test-hash', 'inventory');
      
      const stats = await testDb.getDatabaseStats();
      
      expect(stats.totalFiles).toBe(1);
      expect(stats.totalSheets).toBe(1);
      expect(stats.totalDataRows).toBe(10);
      expect(stats.totalStorageSize).toBe(1024);
    });
  });

  describe('Database Cleanup', () => {
    it('should clear all data', async () => {
      // Add some data
      await testDb.saveProcessedFile(mockProcessedFileData, 'test-hash', 'inventory');
      await testDb.setPreference('theme', 'dark');
      
      // Verify data exists
      const filesBefore = await testDb.fileMetadata.count();
      const prefsBefore = await testDb.userPreferences.count();
      expect(filesBefore).toBeGreaterThan(0);
      expect(prefsBefore).toBeGreaterThan(0);
      
      // Clear all data
      await testDb.clearAllData();
      
      // Verify data is cleared
      const filesAfter = await testDb.fileMetadata.count();
      const prefsAfter = await testDb.userPreferences.count();
      expect(filesAfter).toBe(0);
      expect(prefsAfter).toBe(0);
    });
  });
});

describe('Utility Functions', () => {
  describe('generateFileHash', () => {
    it('should generate hash for file', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      
      // Mock FileReader
      const mockFileReader = {
        onload: null as ((ev: ProgressEvent<FileReader>) => void) | null,
        onerror: null as ((ev: ProgressEvent<FileReader>) => void) | null,
        readAsArrayBuffer: vi.fn(),
        result: new ArrayBuffer(8)
      };
      
      global.FileReader = vi.fn(() => mockFileReader) as unknown as typeof FileReader;
      
      const hashPromise = generateFileHash(mockFile);
      
      // Simulate FileReader onload
      const arrayBuffer = new ArrayBuffer(8);
      mockFileReader.result = arrayBuffer;
      if (mockFileReader.onload) {
        mockFileReader.onload({ target: { result: arrayBuffer } } as ProgressEvent<FileReader>);
      }
      
      const hash = await hashPromise;
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });
  });
});