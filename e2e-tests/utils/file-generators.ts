/**
 * File Generator Utilities for E2E Tests
 * Creates test Excel files programmatically for testing
 */

import * as XLSX from 'xlsx';

export interface InventoryDataRow {
  'Material': string;
  'Material Description': string;
  'Plant': string;
  'Storage Location': string;
  'Batch': string;
  'Stock': number;
  'Base Unit of Measure': string;
  'Currency': string;
  'Total Stock Value': number;
}

export interface OSRDataRow {
  'Material': string;
  'Material Description': string;
  'Status': string;
  'Avg Unit Price (Rs)': number;
  'Total OSR (Qty)': number;
  'Total OSR Value PKR': number;
  'Residual (Qnty) >26 weeks': number;
}

export interface OSRSummaryRow {
  'Summary Category': string;
  'Total Book Stock': number;
  'Over Stock': number;
  'Excess Stock %': number;
}

/**
 * Generate test inventory Excel file
 */
export function generateInventoryTestFile(): Buffer {
  const inventoryData: InventoryDataRow[] = [
    {
      'Material': 'MAT-1001',
      'Material Description': 'High-Performance Bearings',
      'Plant': 'P001',
      'Storage Location': 'WH-A1',
      'Batch': 'B2024001',
      'Stock': 150,
      'Base Unit of Measure': 'EA',
      'Currency': 'PKR',
      'Total Stock Value': 125000
    },
    {
      'Material': 'MAT-1002',
      'Material Description': 'Industrial Lubricants',
      'Plant': 'P002',
      'Storage Location': 'WH-B2',
      'Batch': 'B2024002',
      'Stock': 75,
      'Base Unit of Measure': 'LTR',
      'Currency': 'PKR',
      'Total Stock Value': 85000
    },
    {
      'Material': 'MAT-1003',
      'Material Description': 'Safety Equipment Bundle',
      'Plant': 'P001',
      'Storage Location': 'WH-C3',
      'Batch': 'B2024003',
      'Stock': 200,
      'Base Unit of Measure': 'SET',
      'Currency': 'PKR',
      'Total Stock Value': 65000
    }
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(inventoryData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory Main');
  
  return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
}

/**
 * Generate test OSR Excel file
 */
export function generateOSRTestFile(): Buffer {
  const osrMainData: OSRDataRow[] = [
    {
      'Material': 'MAT-2001',
      'Material Description': 'Obsolete Control Modules',
      'Status': 'Active',
      'Avg Unit Price (Rs)': 4500.00,
      'Total OSR (Qty)': 100,
      'Total OSR Value PKR': 450000,
      'Residual (Qnty) >26 weeks': 80
    },
    {
      'Material': 'MAT-2002',
      'Material Description': 'Legacy Circuit Boards',
      'Status': 'Inactive',
      'Avg Unit Price (Rs)': 2800.00,
      'Total OSR (Qty)': 50,
      'Total OSR Value PKR': 140000,
      'Residual (Qnty) >26 weeks': 45
    },
    {
      'Material': 'MAT-2003',
      'Material Description': 'Discontinued Sensors',
      'Status': 'Active',
      'Avg Unit Price (Rs)': 3200.00,
      'Total OSR (Qty)': 75,
      'Total OSR Value PKR': 240000,
      'Residual (Qnty) >26 weeks': 60
    }
  ];

  const osrSummaryData: OSRSummaryRow[] = [
    {
      'Summary Category': 'Electronics',
      'Total Book Stock': 225,
      'Over Stock': 185,
      'Excess Stock %': 82.2
    },
    {
      'Summary Category': 'Mechanical',
      'Total Book Stock': 150,
      'Over Stock': 120,
      'Excess Stock %': 80.0
    }
  ];

  const workbook = XLSX.utils.book_new();
  
  const mainSheet = XLSX.utils.json_to_sheet(osrMainData);
  XLSX.utils.book_append_sheet(workbook, mainSheet, 'OSR Main Sheet HC');
  
  const summarySheet = XLSX.utils.json_to_sheet(osrSummaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'OSR Summary');
  
  return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
}

/**
 * Generate invalid Excel file (missing required columns)
 */
export function generateInvalidInventoryFile(): Buffer {
  const invalidData = [
    {
      'Item': 'Test Item 1',
      'Quantity': 100,
      'Price': 50.00
    },
    {
      'Item': 'Test Item 2', 
      'Quantity': 200,
      'Price': 75.00
    }
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(invalidData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Invalid Data');
  
  return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
}

/**
 * Generate large test file for performance testing
 */
export function generateLargeInventoryFile(rowCount: number = 1000): Buffer {
  const largeData: InventoryDataRow[] = [];
  
  for (let i = 1; i <= rowCount; i++) {
    largeData.push({
      'Material': `MAT-${i.toString().padStart(4, '0')}`,
      'Material Description': `Test Material ${i}`,
      'Plant': `P${(i % 3) + 1}`,
      'Storage Location': `WH-${String.fromCharCode(65 + (i % 26))}${(i % 10) + 1}`,
      'Batch': `B2024${i.toString().padStart(3, '0')}`,
      'Stock': Math.floor(Math.random() * 1000) + 1,
      'Base Unit of Measure': ['EA', 'KG', 'LTR', 'SET'][i % 4],
      'Currency': 'PKR',
      'Total Stock Value': Math.floor(Math.random() * 100000) + 1000
    });
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(largeData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Large Inventory');
  
  return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
}