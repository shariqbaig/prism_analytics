/**
 * Basic File Upload E2E Tests
 * Tests fundamental file upload functionality
 */

import { test, expect } from '../fixtures/test-files';
import { clearIndexedDB, getFileMetadata, waitForDatabaseData, verifyDatabaseStructure } from '../utils/database-helpers';

test.describe('Basic File Upload', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to upload page first
    await page.goto('/upload');
    await expect(page).toHaveURL('/upload');
    
    // Clear IndexedDB after navigation (when security context is available)
    await page.evaluate(clearIndexedDB);
  });

  test('should display upload page correctly', async ({ page }) => {
    // Verify page elements
    await expect(page.locator('h1')).toContainText('File Upload');
    await expect(page.locator('text=Upload your Excel files')).toBeVisible();
    
    // Check for file upload component
    await expect(page.locator('[data-testid="file-upload-dropzone"]')).toBeVisible();
  });

  test('should upload inventory file successfully', async ({ page, testFiles }) => {
    // Upload inventory file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles.inventoryFile);
    
    // Wait for processing to complete
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 10000 });
    
    // Check for success toast
    await expect(page.locator('text=File uploaded successfully!')).toBeVisible();
    
    // Verify database was populated
    const hasData = await page.evaluate(waitForDatabaseData);
    expect(hasData).toBe(true);
    
    // Verify file metadata in database
    const metadata = await page.evaluate(getFileMetadata);
    expect(metadata).toHaveLength(1);
    expect(metadata[0].fileName).toContain('test-inventory');
    expect(metadata[0].fileType).toBe('inventory');
    expect(metadata[0].isActive).toBe(true);
  });

  test('should upload OSR file successfully', async ({ page, testFiles }) => {
    // Upload OSR file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles.osrFile);
    
    // Wait for processing to complete
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 10000 });
    
    // Check for success toast
    await expect(page.locator('text=File uploaded successfully!')).toBeVisible();
    
    // Verify database was populated
    const hasData = await page.evaluate(waitForDatabaseData);
    expect(hasData).toBe(true);
    
    // Verify file metadata in database
    const metadata = await page.evaluate(getFileMetadata);
    expect(metadata).toHaveLength(1);
    expect(metadata[0].fileName).toContain('test-osr');
    expect(metadata[0].fileType).toBe('osr');
    expect(metadata[0].isActive).toBe(true);
  });

  test('should display processing results on page', async ({ page, testFiles }) => {
    // Upload inventory file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles.inventoryFile);
    
    // Wait for processing to complete
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 10000 });
    
    // Verify processing results are displayed
    await expect(page.locator('text=File Processed')).toBeVisible();
    await expect(page.locator('text=Total Sheets')).toBeVisible();
    await expect(page.locator('text=Data Sources')).toBeVisible();
    
    // Check sheet details are shown
    await expect(page.locator('text=Sheet Details')).toBeVisible();
    await expect(page.locator('text=Inventory Main')).toBeVisible();
    
    // Verify data source breakdown
    await expect(page.locator('text=Inventory Data')).toBeVisible();
    await expect(page.locator('text=3 items')).toBeVisible();
  });

  test('should handle invalid file gracefully', async ({ page, testFiles }) => {
    // Upload invalid file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles.invalidFile);
    
    // Should show error or warning about missing columns
    await expect(page.locator('text=Required column').or(page.locator('text=Invalid file'))).toBeVisible({ timeout: 10000 });
    
    // Database should not contain invalid data
    const metadata = await page.evaluate(getFileMetadata);
    expect(metadata).toHaveLength(0);
  });

  test('should verify database structure is created', async ({ page }) => {
    // Just navigate to trigger database initialization
    await page.goto('/upload');
    
    // Wait a bit for initialization
    await page.waitForTimeout(1000);
    
    // Check database structure
    const dbInfo = await page.evaluate(verifyDatabaseStructure);
    expect(dbInfo.exists).toBe(true);
    expect(dbInfo.tables).toContain('fileMetadata');
    expect(dbInfo.tables).toContain('processedFiles');
    expect(dbInfo.tables).toContain('processedSheets');
    expect(dbInfo.tables).toContain('applicationState');
  });
});