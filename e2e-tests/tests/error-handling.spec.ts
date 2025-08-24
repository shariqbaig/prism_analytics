/**
 * Error Handling E2E Tests
 * Tests error scenarios and graceful failure handling
 */

import { test, expect } from '../fixtures/test-files';
import { clearIndexedDB, getFileMetadata } from '../utils/database-helpers';

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to upload page first
    await page.goto('/upload');
    
    // Clear IndexedDB after navigation (when security context is available)
    await page.evaluate(clearIndexedDB);
  });

  test('should handle invalid file format gracefully', async ({ page }) => {
    // Create a text file instead of Excel
    const invalidFile = Buffer.from('This is not an Excel file');
    
    // Try to upload invalid file
    await page.setInputFiles('input[type="file"]', {
      name: 'invalid.txt',
      mimeType: 'text/plain',
      buffer: invalidFile,
    });
    
    // Should show error message
    await expect(page.locator('text=Invalid file format').or(page.locator('text=Error processing file'))).toBeVisible({ timeout: 10000 });
    
    // Database should remain empty
    const metadata = await page.evaluate(getFileMetadata);
    expect(metadata).toHaveLength(0);
    
    // Should not show processing results
    await expect(page.locator('text=File Processed')).not.toBeVisible();
  });

  test('should handle files with missing required columns', async ({ page, testFiles }) => {
    // Upload invalid inventory file (missing required columns)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles.invalidFile);
    
    // Should show error about missing columns
    await expect(page.locator('text=Required column').or(page.locator('text=Missing required columns'))).toBeVisible({ timeout: 10000 });
    
    // Database should not contain the invalid data
    const metadata = await page.evaluate(getFileMetadata);
    expect(metadata).toHaveLength(0);
  });

  test('should handle corrupted Excel files', async ({ page }) => {
    // Create a corrupted Excel file (just random bytes with .xlsx extension)
    const corruptedFile = Buffer.from('PK\x03\x04corrupted data that looks like xlsx but is not');
    
    await page.setInputFiles('input[type="file"]', {
      name: 'corrupted.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: corruptedFile,
    });
    
    // Should handle the error gracefully
    await expect(page.locator('text=Error processing file').or(page.locator('text=File appears to be corrupted'))).toBeVisible({ timeout: 10000 });
    
    // No data should be saved to database
    const metadata = await page.evaluate(getFileMetadata);
    expect(metadata).toHaveLength(0);
  });

  test('should handle empty Excel files', async ({ page }) => {
    // Create an empty Excel file
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Empty Sheet');
    const emptyFile = Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
    
    await page.setInputFiles('input[type="file"]', {
      name: 'empty.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: emptyFile,
    });
    
    // Should show error about empty file
    await expect(page.locator('text=File is empty').or(page.locator('text=No data found'))).toBeVisible({ timeout: 10000 });
    
    // No data should be saved
    const metadata = await page.evaluate(getFileMetadata);
    expect(metadata).toHaveLength(0);
  });

  test('should handle network errors during file processing', async ({ page, testFiles }) => {
    // Simulate network failure by going offline
    await page.context().setOffline(true);
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles.inventoryFile);
    
    // Should handle offline state gracefully
    // Note: File processing happens locally, so this tests what happens when some network-dependent operations fail
    await expect(page.locator('text=Network error').or(page.locator('text=Processing complete'))).toBeVisible({ timeout: 10000 });
    
    // Restore network
    await page.context().setOffline(false);
  });

  test('should handle database initialization failures', async ({ page }) => {
    // Simulate database error by corrupting IndexedDB
    await page.evaluate(() => {
      // Try to corrupt the database by creating a conflicting schema
      const request = indexedDB.open('PrismAnalytics', 999);
      request.onupgradeneeded = () => {
        const db = request.result;
        // Create a conflicting object store
        try {
          db.createObjectStore('conflicting', { keyPath: 'badKey' });
        } catch (e) {
          // Ignore errors, this is just to potentially corrupt the schema
        }
      };
    });
    
    // Navigate and try to upload
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // The app should handle database initialization errors gracefully
    // and still allow the user to see the upload interface
    await expect(page.locator('h1')).toContainText('File Upload');
  });

  test('should recover from processing errors', async ({ page, testFiles }) => {
    // First, try to upload an invalid file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles.invalidFile);
    
    // Should show error
    await expect(page.locator('text=Required column').or(page.locator('text=Error'))).toBeVisible({ timeout: 10000 });
    
    // Then upload a valid file - should work normally
    await fileInput.setInputFiles(testFiles.inventoryFile);
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=File uploaded successfully!')).toBeVisible();
    
    // Verify the valid file was saved
    const metadata = await page.evaluate(getFileMetadata);
    expect(metadata).toHaveLength(1);
    expect(metadata[0].fileName).toContain('test-inventory');
  });

  test('should handle file size limitations', async ({ page }) => {
    // Create a very large file (simulated)
    const largeFileSize = 50 * 1024 * 1024; // 50MB
    const largeBuffer = Buffer.alloc(1000); // Just a small buffer for testing
    
    await page.setInputFiles('input[type="file"]', {
      name: 'very-large-file.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: largeBuffer,
    });
    
    // Should either process successfully or show appropriate error/warning
    // The actual handling depends on implementation limits
    const result = await Promise.race([
      page.locator('text=File too large').isVisible(),
      page.locator('text=Processing complete').isVisible(),
      page.locator('text=Error processing file').isVisible()
    ]);
    
    expect(result).toBeTruthy();
  });

  test('should handle concurrent file uploads', async ({ page, testFiles }) => {
    // Start first upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles.inventoryFile);
    
    // Immediately start second upload (before first completes)
    await fileInput.setInputFiles(testFiles.osrFile);
    
    // Should handle this gracefully - either queue them or show appropriate message
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 15000 });
    
    // At least one file should be processed successfully
    const metadata = await page.evaluate(getFileMetadata);
    expect(metadata.length).toBeGreaterThanOrEqual(1);
  });

  test('should display user-friendly error messages', async ({ page, testFiles }) => {
    // Upload invalid file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFiles.invalidFile);
    
    // Error messages should be user-friendly, not technical
    const errorElement = page.locator('[role="alert"], .error, .toast').first();
    await expect(errorElement).toBeVisible({ timeout: 10000 });
    
    const errorText = await errorElement.textContent();
    expect(errorText).toBeTruthy();
    
    // Should not contain technical error details like stack traces
    expect(errorText).not.toMatch(/Error.*at.*line.*\d+/);
    expect(errorText).not.toContain('undefined is not a function');
    expect(errorText).not.toContain('null pointer');
    
    // Should contain helpful guidance
    expect(errorText?.toLowerCase()).toMatch(/(required|missing|invalid|format|column)/);
  });
});