/**
 * Test File Fixtures
 * Pre-generated test files for consistent testing
 */

import { test as base } from '@playwright/test';
import { generateInventoryTestFile, generateOSRTestFile, generateInvalidInventoryFile, generateLargeInventoryFile } from '../utils/file-generators';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface TestFiles {
  inventoryFile: string;
  osrFile: string;
  invalidFile: string;
  largeFile: string;
}

export const test = base.extend<{ testFiles: TestFiles }>({
  testFiles: async ({}, use) => {
    const tempDir = path.join(__dirname, '../temp');
    
    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generate test files
    const inventoryFile = path.join(tempDir, 'test-inventory.xlsx');
    const osrFile = path.join(tempDir, 'test-osr.xlsx');
    const invalidFile = path.join(tempDir, 'test-invalid.xlsx');
    const largeFile = path.join(tempDir, 'test-large.xlsx');

    fs.writeFileSync(inventoryFile, generateInventoryTestFile());
    fs.writeFileSync(osrFile, generateOSRTestFile());
    fs.writeFileSync(invalidFile, generateInvalidInventoryFile());
    fs.writeFileSync(largeFile, generateLargeInventoryFile(500));

    const testFiles = {
      inventoryFile,
      osrFile,
      invalidFile,
      largeFile
    };

    await use(testFiles);

    // Cleanup after tests
    try {
      fs.unlinkSync(inventoryFile);
      fs.unlinkSync(osrFile);
      fs.unlinkSync(invalidFile);
      fs.unlinkSync(largeFile);
      fs.rmdirSync(tempDir);
    } catch (error) {
      // Ignore cleanup errors
      console.warn('Failed to cleanup test files:', error);
    }
  }
});

export { expect } from '@playwright/test';