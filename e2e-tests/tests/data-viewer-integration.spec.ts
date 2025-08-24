/**
 * Data Viewer Integration E2E Tests
 * Tests integration between file upload and data viewer functionality
 */

import { test, expect } from '../fixtures/test-files';
import { clearIndexedDB, waitForDatabaseData } from '../utils/database-helpers';

test.describe('Data Viewer Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to upload page first
    await page.goto('/upload');
    
    // Clear IndexedDB after navigation (when security context is available)
    await page.evaluate(clearIndexedDB);
  });

  test('should display uploaded data in data viewer', async ({ page, testFiles }) => {
    // Upload inventory file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles.inventoryFile);
    
    // Wait for processing
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 10000 });
    await page.evaluate(waitForDatabaseData);
    
    // Navigate to data viewer
    await page.click('a[href="/data"]');
    await expect(page).toHaveURL('/data');
    
    // Wait for data viewer to load
    await page.waitForLoadState('networkidle');
    
    // Check that file type selector is enabled and populated
    const fileTypeSelect = page.locator('select').first();
    await expect(fileTypeSelect).toBeEnabled();
    
    // Select inventory file type
    await fileTypeSelect.selectOption('inventory');
    
    // Check that sheet selector becomes enabled
    const sheetSelect = page.locator('select').nth(1);
    await expect(sheetSelect).toBeEnabled();
    
    // Select the inventory sheet
    await sheetSelect.selectOption('Inventory Main');
    
    // Verify data table is displayed
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Material")')).toBeVisible();
    await expect(page.locator('th:has-text("Material Description")')).toBeVisible();
    await expect(page.locator('th:has-text("Stock")')).toBeVisible();
    
    // Check that actual data rows are displayed
    await expect(page.locator('td:has-text("MAT-1001")')).toBeVisible();
    await expect(page.locator('td:has-text("High-Performance Bearings")')).toBeVisible();
    await expect(page.locator('td:has-text("150")')).toBeVisible();
    
    // Verify row count
    const rows = await page.locator('tbody tr').count();
    expect(rows).toBe(3);
  });

  test('should display OSR data correctly in data viewer', async ({ page, testFiles }) => {
    // Upload OSR file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles.osrFile);
    
    // Wait for processing
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 10000 });
    await page.evaluate(waitForDatabaseData);
    
    // Navigate to data viewer
    await page.click('a[href="/data"]');
    await expect(page).toHaveURL('/data');
    await page.waitForLoadState('networkidle');
    
    // Select OSR file type
    const fileTypeSelect = page.locator('select').first();
    await fileTypeSelect.selectOption('osr');
    
    // Select OSR Main sheet
    const sheetSelect = page.locator('select').nth(1);
    await expect(sheetSelect).toBeEnabled();
    await sheetSelect.selectOption('OSR Main Sheet HC');
    
    // Verify OSR-specific columns
    await expect(page.locator('th:has-text("Material")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Avg Unit Price (Rs)")')).toBeVisible();
    await expect(page.locator('th:has-text("Total OSR Value PKR")')).toBeVisible();
    
    // Check OSR data
    await expect(page.locator('td:has-text("MAT-2001")')).toBeVisible();
    await expect(page.locator('td:has-text("Active")')).toBeVisible();
    await expect(page.locator('td:has-text("450000")')).toBeVisible();
    
    // Switch to summary sheet
    await sheetSelect.selectOption('OSR Summary');
    
    // Verify summary columns
    await expect(page.locator('th:has-text("Summary Category")')).toBeVisible();
    await expect(page.locator('th:has-text("Total Book Stock")')).toBeVisible();
    await expect(page.locator('th:has-text("Excess Stock %")')).toBeVisible();
    
    // Check summary data
    await expect(page.locator('td:has-text("Electronics")')).toBeVisible();
    await expect(page.locator('td:has-text("82.2")')).toBeVisible();
  });

  test('should handle multiple files in data viewer', async ({ page, testFiles }) => {
    // Upload inventory file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles.inventoryFile);
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 10000 });
    await page.evaluate(waitForDatabaseData);
    
    // Upload OSR file
    await fileInput.setInputFiles(testFiles.osrFile);
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Navigate to data viewer
    await page.click('a[href="/data"]');
    await page.waitForLoadState('networkidle');
    
    // Check that both file types are available
    const fileTypeSelect = page.locator('select').first();
    const options = await fileTypeSelect.locator('option').allTextContents();
    expect(options).toContain('Inventory');
    expect(options).toContain('OSR');
    
    // Test switching between file types
    await fileTypeSelect.selectOption('inventory');
    let sheetSelect = page.locator('select').nth(1);
    await expect(sheetSelect).toBeEnabled();
    await sheetSelect.selectOption('Inventory Main');
    await expect(page.locator('td:has-text("MAT-1001")')).toBeVisible();
    
    // Switch to OSR
    await fileTypeSelect.selectOption('osr');
    sheetSelect = page.locator('select').nth(1);
    await expect(sheetSelect).toBeEnabled();
    await sheetSelect.selectOption('OSR Main Sheet HC');
    await expect(page.locator('td:has-text("MAT-2001")')).toBeVisible(); // Different MAT-2001 from OSR
    await expect(page.locator('td:has-text("Active")')).toBeVisible();
  });

  test('should display no data message when no files uploaded', async ({ page }) => {
    // Navigate to data viewer without uploading any files
    await page.goto('/data');
    await page.waitForLoadState('networkidle');
    
    // Should show no data state
    await expect(page.locator('text=No Data Available')).toBeVisible();
    await expect(page.locator('select').first()).toBeDisabled();
  });

  test('should maintain data viewer state after navigation', async ({ page, testFiles }) => {
    // Upload and navigate to data viewer
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles.inventoryFile);
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 10000 });
    await page.evaluate(waitForDatabaseData);
    
    await page.click('a[href="/data"]');
    await page.waitForLoadState('networkidle');
    
    // Select data
    const fileTypeSelect = page.locator('select').first();
    await fileTypeSelect.selectOption('inventory');
    const sheetSelect = page.locator('select').nth(1);
    await sheetSelect.selectOption('Inventory Main');
    
    // Verify data is displayed
    await expect(page.locator('td:has-text("MAT-1001")')).toBeVisible();
    
    // Navigate away and back
    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/');
    
    await page.click('a[href="/data"]');
    await page.waitForLoadState('networkidle');
    
    // Data should still be available (persistence check)
    await fileTypeSelect.selectOption('inventory');
    await sheetSelect.selectOption('Inventory Main');
    await expect(page.locator('td:has-text("MAT-1001")')).toBeVisible();
  });

  test('should handle data viewer after page refresh', async ({ page, testFiles }) => {
    // Upload file and view data
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles.inventoryFile);
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 10000 });
    await page.evaluate(waitForDatabaseData);
    
    // Navigate to data viewer and select data
    await page.click('a[href="/data"]');
    await page.waitForLoadState('networkidle');
    
    const fileTypeSelect = page.locator('select').first();
    await fileTypeSelect.selectOption('inventory');
    const sheetSelect = page.locator('select').nth(1);
    await sheetSelect.selectOption('Inventory Main');
    await expect(page.locator('td:has-text("MAT-1001")')).toBeVisible();
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Data should still be accessible after refresh
    await fileTypeSelect.selectOption('inventory');
    await sheetSelect.selectOption('Inventory Main');
    await expect(page.locator('td:has-text("MAT-1001")')).toBeVisible();
  });
});