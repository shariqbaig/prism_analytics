/**
 * Database Persistence Verification E2E Tests
 * Specifically tests that uploaded files are properly saved to IndexedDB
 * and can be used by the data viewer - addresses user concern about empty IndexedDB
 */

import { test, expect } from '../fixtures/test-files';
import { clearIndexedDB, getFileMetadata, getAllProcessedData } from '../utils/database-helpers';

test.describe('Database Persistence Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/upload');
    await page.evaluate(clearIndexedDB);
  });

  test('should save inventory file to IndexedDB and display in data viewer', async ({ page, testFiles }) => {
    // Step 1: Upload inventory file
    console.log('Step 1: Uploading inventory file...');
    const fileInput = page.locator('input[type="file"]');
    
    // First select file type
    await page.click('[data-testid="file-type-selector"]');
    await page.click('text=INVENTORY File');
    
    await fileInput.setInputFiles(testFiles.inventoryFile);
    
    // Wait for processing to complete
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=File uploaded successfully!')).toBeVisible({ timeout: 5000 });
    
    // Step 2: Verify data exists in IndexedDB
    console.log('Step 2: Verifying data in IndexedDB...');
    
    // Wait for database to be populated
    await page.waitForTimeout(2000);
    
    const metadata = await page.evaluate(getFileMetadata);
    console.log('File metadata found:', metadata.length);
    expect(metadata).toHaveLength(1);
    expect(metadata[0].fileName).toContain('test-inventory');
    expect(metadata[0].fileType).toBe('inventory');
    
    const allProcessedData = await page.evaluate(getAllProcessedData);
    console.log('Processed data records found:', allProcessedData.length);
    expect(allProcessedData).toHaveLength(1);
    
    // Step 3: Navigate to data viewer and verify data shows up
    console.log('Step 3: Testing data viewer integration...');
    await page.click('a[href="/data"]');
    await expect(page).toHaveURL('/data');
    await page.waitForLoadState('networkidle');
    
    // Verify file type selector is enabled and has options
    const fileTypeSelect = page.locator('select').first();
    await expect(fileTypeSelect).toBeEnabled();
    
    // Select inventory file type
    await fileTypeSelect.selectOption('inventory');
    
    // Verify sheet selector becomes enabled
    const sheetSelect = page.locator('select').nth(1);
    await expect(sheetSelect).toBeEnabled({ timeout: 5000 });
    
    // Select the inventory sheet
    await sheetSelect.selectOption('Inventory Main');
    
    // Verify data table is displayed with actual data
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Material")')).toBeVisible();
    await expect(page.locator('td:has-text("MAT-1001")')).toBeVisible();
    
    console.log('✅ SUCCESS: File uploaded, saved to IndexedDB, and displayed in data viewer');
  });

  test('should save OSR file to IndexedDB and display in data viewer', async ({ page, testFiles }) => {
    // Step 1: Upload OSR file
    console.log('Step 1: Uploading OSR file...');
    const fileInput = page.locator('input[type="file"]');
    
    // First select file type
    await page.click('[data-testid="file-type-selector"]');
    await page.click('text=OSR File');
    
    await fileInput.setInputFiles(testFiles.osrFile);
    
    // Wait for processing to complete
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=File uploaded successfully!')).toBeVisible({ timeout: 5000 });
    
    // Step 2: Verify data exists in IndexedDB
    console.log('Step 2: Verifying OSR data in IndexedDB...');
    await page.waitForTimeout(2000);
    
    const metadata = await page.evaluate(getFileMetadata);
    console.log('OSR metadata found:', metadata.length);
    expect(metadata).toHaveLength(1);
    expect(metadata[0].fileName).toContain('test-osr');
    expect(metadata[0].fileType).toBe('osr');
    
    const allProcessedData = await page.evaluate(getAllProcessedData);
    console.log('OSR processed data records:', allProcessedData.length);
    expect(allProcessedData).toHaveLength(1);
    
    // Step 3: Navigate to data viewer and verify OSR data
    console.log('Step 3: Testing OSR data viewer integration...');
    await page.click('a[href="/data"]');
    await expect(page).toHaveURL('/data');
    await page.waitForLoadState('networkidle');
    
    const fileTypeSelect = page.locator('select').first();
    await fileTypeSelect.selectOption('osr');
    
    const sheetSelect = page.locator('select').nth(1);
    await expect(sheetSelect).toBeEnabled({ timeout: 5000 });
    
    // Test both OSR sheets
    await sheetSelect.selectOption('OSR Main Sheet HC');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    await expect(page.locator('td:has-text("MAT-2001")')).toBeVisible();
    
    // Switch to summary sheet
    await sheetSelect.selectOption('OSR Summary');
    await expect(page.locator('th:has-text("Summary Category")')).toBeVisible();
    
    console.log('✅ SUCCESS: OSR file uploaded, saved to IndexedDB, and displayed in data viewer');
  });

  test('should handle multiple files and maintain data persistence', async ({ page, testFiles }) => {
    // Upload multiple files and verify they're all saved
    console.log('Testing multiple file persistence...');
    
    // Upload inventory file
    const fileInput = page.locator('input[type="file"]');
    await page.click('[data-testid="file-type-selector"]');
    await page.click('text=INVENTORY File');
    await fileInput.setInputFiles(testFiles.inventoryFile);
    await expect(page.locator('text=File uploaded successfully!')).toBeVisible({ timeout: 10000 });
    
    // Upload OSR file
    await page.click('[data-testid="file-type-selector"]');
    await page.click('text=OSR File');
    await fileInput.setInputFiles(testFiles.osrFile);
    await expect(page.locator('text=File uploaded successfully!')).toBeVisible({ timeout: 10000 });
    
    // Verify both files are in database
    await page.waitForTimeout(2000);
    const metadata = await page.evaluate(getFileMetadata);
    expect(metadata).toHaveLength(2);
    
    const fileTypes = metadata.map(m => m.fileType).sort();
    expect(fileTypes).toEqual(['inventory', 'osr']);
    
    // Verify both can be accessed in data viewer
    await page.click('a[href="/data"]');
    await page.waitForLoadState('networkidle');
    
    // Test inventory data
    const fileTypeSelect = page.locator('select').first();
    await fileTypeSelect.selectOption('inventory');
    
    const sheetSelect = page.locator('select').nth(1);
    await expect(sheetSelect).toBeEnabled({ timeout: 5000 });
    await sheetSelect.selectOption('Inventory Main');
    await expect(page.locator('td:has-text("MAT-1001")')).toBeVisible();
    
    // Switch to OSR data
    await fileTypeSelect.selectOption('osr');
    await expect(sheetSelect).toBeEnabled({ timeout: 5000 });
    await sheetSelect.selectOption('OSR Main Sheet HC');
    await expect(page.locator('td:has-text("MAT-2001")')).toBeVisible();
    
    console.log('✅ SUCCESS: Multiple files persist and can be accessed in data viewer');
  });

  test('should persist data across browser page refreshes', async ({ page, testFiles }) => {
    // Upload file and verify persistence after refresh
    console.log('Testing data persistence across page refreshes...');
    
    const fileInput = page.locator('input[type="file"]');
    await page.click('[data-testid="file-type-selector"]');
    await page.click('text=INVENTORY File');
    await fileInput.setInputFiles(testFiles.inventoryFile);
    await expect(page.locator('text=File uploaded successfully!')).toBeVisible({ timeout: 10000 });
    
    // Verify initial data
    await page.waitForTimeout(2000);
    const initialMetadata = await page.evaluate(getFileMetadata);
    expect(initialMetadata).toHaveLength(1);
    
    // Refresh the page
    console.log('Refreshing page to test persistence...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify data still exists after refresh
    const afterRefreshMetadata = await page.evaluate(getFileMetadata);
    expect(afterRefreshMetadata).toHaveLength(1);
    expect(afterRefreshMetadata[0].fileName).toBe(initialMetadata[0].fileName);
    
    // Verify data viewer still works
    await page.click('a[href="/data"]');
    await page.waitForLoadState('networkidle');
    
    const fileTypeSelect = page.locator('select').first();
    await fileTypeSelect.selectOption('inventory');
    
    const sheetSelect = page.locator('select').nth(1);
    await expect(sheetSelect).toBeEnabled({ timeout: 5000 });
    await sheetSelect.selectOption('Inventory Main');
    await expect(page.locator('td:has-text("MAT-1001")')).toBeVisible();
    
    console.log('✅ SUCCESS: Data persists across page refreshes');
  });

  test('should show empty state when no data exists', async ({ page }) => {
    // Test the no data state in data viewer
    console.log('Testing no data state...');
    
    await page.click('a[href="/data"]');
    await expect(page).toHaveURL('/data');
    await page.waitForLoadState('networkidle');
    
    // Should show no data message
    await expect(page.locator('text=No Data Available')).toBeVisible();
    
    // File selectors should be disabled
    const fileTypeSelect = page.locator('select').first();
    await expect(fileTypeSelect).toBeDisabled();
    
    console.log('✅ SUCCESS: No data state displays correctly');
  });
});