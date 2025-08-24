/**
 * Database Persistence E2E Tests
 * Tests IndexedDB data persistence and integrity
 */

import { test, expect } from '../fixtures/test-files';
import { 
  clearIndexedDB, 
  getFileMetadata, 
  getProcessedData, 
  getAllProcessedData, 
  waitForDatabaseData,
  type DBFileMetadata,
  type DBProcessedData
} from '../utils/database-helpers';

test.describe('Database Persistence', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to upload page first
    await page.goto('/upload');
    
    // Clear IndexedDB after navigation (when security context is available)
    await page.evaluate(clearIndexedDB);
  });

  test('should persist file metadata correctly', async ({ page, testFiles }) => {
    // Upload inventory file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles.inventoryFile);
    
    // Wait for processing to complete
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 10000 });
    
    // Wait for database to be populated
    const hasData = await page.evaluate(waitForDatabaseData);
    expect(hasData).toBe(true);
    
    // Get file metadata from database
    const metadata = await page.evaluate(getFileMetadata);
    expect(metadata).toHaveLength(1);
    
    const fileMetadata: DBFileMetadata = metadata[0];
    expect(fileMetadata.fileName).toContain('test-inventory');
    expect(fileMetadata.originalName).toContain('test-inventory.xlsx');
    expect(fileMetadata.fileType).toBe('inventory');
    expect(fileMetadata.fileSize).toBeGreaterThan(0);
    expect(fileMetadata.fileHash).toBeDefined();
    expect(fileMetadata.uploadedAt).toBeInstanceOf(Date);
    expect(fileMetadata.isActive).toBe(true);
    expect(fileMetadata.id).toBeDefined();
  });

  test('should persist processed data correctly', async ({ page, testFiles }) => {
    // Upload inventory file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles.inventoryFile);
    
    // Wait for processing
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 10000 });
    await page.evaluate(waitForDatabaseData);
    
    // Get file metadata to find file ID
    const metadata = await page.evaluate(getFileMetadata);
    expect(metadata).toHaveLength(1);
    const fileId = metadata[0].id!;
    
    // Get processed data from database
    const processedData = await page.evaluate((id) => getProcessedData(id), fileId);
    expect(processedData).toBeTruthy();
    
    const data: DBProcessedData = processedData!;
    expect(data.fileId).toBe(fileId);
    expect(data.fileName).toContain('test-inventory');
    expect(data.fileSize).toBeGreaterThan(0);
    expect(data.processingTime).toBeGreaterThan(0);
    expect(data.sheets).toHaveLength(1);
    expect(data.detectedDataSources).toContain('inventory');
    expect(data.createdAt).toBeInstanceOf(Date);
    
    // Verify sheet data structure
    const sheet = data.sheets[0];
    expect(sheet.name).toBe('Inventory Main');
    expect(sheet.type).toBe('inventory');
    expect(sheet.rowCount).toBe(3);
    expect(sheet.columnCount).toBe(9);
    expect(sheet.columns).toContain('Material');
    expect(sheet.columns).toContain('Material Description');
    expect(sheet.columns).toContain('Stock');
    expect(sheet.data).toHaveLength(3);
    
    // Verify actual data content
    const firstRow = sheet.data[0];
    expect(firstRow['Material']).toBe('MAT-1001');
    expect(firstRow['Material Description']).toBe('High-Performance Bearings');
    expect(firstRow['Stock']).toBe(150);
  });

  test('should persist OSR data with correct structure', async ({ page, testFiles }) => {
    // Upload OSR file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles.osrFile);
    
    // Wait for processing
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 10000 });
    await page.evaluate(waitForDatabaseData);
    
    // Get file metadata
    const metadata = await page.evaluate(getFileMetadata);
    const fileId = metadata[0].id!;
    
    // Get processed data
    const processedData = await page.evaluate((id) => getProcessedData(id), fileId);
    const data: DBProcessedData = processedData!;
    
    expect(data.sheets).toHaveLength(2);
    expect(data.detectedDataSources).toContain('osr');
    
    // Check OSR Main sheet
    const mainSheet = data.sheets.find(s => s.name === 'OSR Main Sheet HC');
    expect(mainSheet).toBeTruthy();
    expect(mainSheet!.type).toBe('osr');
    expect(mainSheet!.rowCount).toBe(3);
    expect(mainSheet!.columns).toContain('Material');
    expect(mainSheet!.columns).toContain('Status');
    expect(mainSheet!.columns).toContain('Avg Unit Price (Rs)');
    
    // Check OSR Summary sheet
    const summarySheet = data.sheets.find(s => s.name === 'OSR Summary');
    expect(summarySheet).toBeTruthy();
    expect(summarySheet!.columns).toContain('Total Book Stock');
    expect(summarySheet!.columns).toContain('Over Stock');
    expect(summarySheet!.columns).toContain('Excess Stock %');
  });

  test('should handle multiple file uploads correctly', async ({ page, testFiles }) => {
    // Upload inventory file first
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles.inventoryFile);
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 10000 });
    await page.evaluate(waitForDatabaseData);
    
    // Upload OSR file second
    await fileInput.setInputFiles(testFiles.osrFile);
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 10000 });
    
    // Wait a bit for second file to be processed
    await page.waitForTimeout(2000);
    
    // Check that both files are in database
    const metadata = await page.evaluate(getFileMetadata);
    expect(metadata).toHaveLength(2);
    
    // Check file types
    const fileTypes = metadata.map(m => m.fileType).sort();
    expect(fileTypes).toEqual(['inventory', 'osr']);
    
    // Verify both have processed data
    const allProcessedData = await page.evaluate(getAllProcessedData);
    expect(allProcessedData).toHaveLength(2);
    
    // Check that the second file is now active (latest upload)
    const activeFiles = metadata.filter(m => m.isActive);
    expect(activeFiles).toHaveLength(1);
    expect(activeFiles[0].fileType).toBe('osr');
  });

  test('should maintain data integrity after page refresh', async ({ page, testFiles }) => {
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles.inventoryFile);
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 10000 });
    await page.evaluate(waitForDatabaseData);
    
    // Get initial data
    const initialMetadata = await page.evaluate(getFileMetadata);
    const initialProcessedData = await page.evaluate(getAllProcessedData);
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify data still exists
    const afterRefreshMetadata = await page.evaluate(getFileMetadata);
    const afterRefreshProcessedData = await page.evaluate(getAllProcessedData);
    
    expect(afterRefreshMetadata).toEqual(initialMetadata);
    expect(afterRefreshProcessedData).toEqual(initialProcessedData);
  });

  test('should handle duplicate file uploads correctly', async ({ page, testFiles }) => {
    // Upload same file twice
    const fileInput = page.locator('input[type="file"]');
    
    // First upload
    await fileInput.setInputFiles(testFiles.inventoryFile);
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 10000 });
    await page.evaluate(waitForDatabaseData);
    
    // Second upload of same file
    await fileInput.setInputFiles(testFiles.inventoryFile);
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 10000 });
    
    // Should only have one file in database (duplicate handling)
    const metadata = await page.evaluate(getFileMetadata);
    expect(metadata).toHaveLength(1);
    
    const processedData = await page.evaluate(getAllProcessedData);
    expect(processedData).toHaveLength(1);
  });

  test('should persist large files correctly', async ({ page, testFiles }) => {
    // Upload large file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles.largeFile);
    
    // Wait for processing (may take longer)
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 30000 });
    await page.evaluate(waitForDatabaseData);
    
    // Verify large file is stored correctly
    const metadata = await page.evaluate(getFileMetadata);
    expect(metadata).toHaveLength(1);
    expect(metadata[0].fileSize).toBeGreaterThan(10000); // Large file should be > 10KB
    
    const fileId = metadata[0].id!;
    const processedData = await page.evaluate((id) => getProcessedData(id), fileId);
    
    expect(processedData!.sheets[0].rowCount).toBe(500);
    expect(processedData!.sheets[0].data).toHaveLength(500);
  });
});