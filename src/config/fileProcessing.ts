import type { FileProcessingConfig, SheetConfig, ColumnConfig } from '@/types/fileProcessing';

// Inventory File Configuration
export const INVENTORY_FILE_CONFIG: FileProcessingConfig = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedExtensions: ['.xlsx', '.xls'],
  processingTimeout: 300000, // 5 minutes
  requiredSheets: [
    {
      name: 'FG value',
      aliases: ['FG value', 'FG Value', 'FG', 'fg', 'Finished Goods', 'FinishedGoods', 'finished goods'],
      type: 'inventory',
      requiredColumns: [
        {
          name: 'Pack Size(m.d.)',
          aliases: ['Pack Size(m.d.)', 'Pack Size', 'PackSize', 'Pack', 'Size'],
          type: 'string',
          required: true,
          validationRules: [
            {
              type: 'minLength',
              value: 1,
              message: 'Pack size cannot be empty'
            }
          ]
        },
        {
          name: 'Plant',
          aliases: ['Plant', 'Plant Code', 'Location', 'Site', 'Facility', 'Manufacturing Plant'],
          type: 'string',
          required: true,
          validationRules: [
            {
              type: 'minLength',
              value: 1,
              message: 'Plant cannot be empty'
            }
          ]
        },
        {
          name: 'location',
          aliases: ['location', 'Location', 'Distribution Center', 'DC', 'Warehouse', 'Storage'],
          type: 'string',
          required: true,
          validationRules: [
            {
              type: 'minLength',
              value: 1,
              message: 'Location cannot be empty'
            }
          ]
        },
        {
          name: 'Material',
          aliases: ['Material', 'Material Code', 'MaterialCode', 'Code', 'Item Code', 'SKU'],
          type: 'string',
          required: true,
          validationRules: [
            {
              type: 'minLength',
              value: 1,
              message: 'Material code cannot be empty'
            }
          ]
        },
        {
          name: 'Description',
          aliases: ['Description', 'Material Description', 'Item Description', 'Product Description', 'Desc'],
          type: 'string',
          required: true,
          validationRules: [
            {
              type: 'minLength',
              value: 1,
              message: 'Description cannot be empty'
            }
          ]
        },
        {
          name: 'Closing Stock Quantity',
          aliases: ['Closing Stock Quantity', 'Stock Quantity', 'Quantity', 'Qty', 'Stock Qty'],
          type: 'number',
          required: true,
          validationRules: [
            {
              type: 'min',
              value: 0,
              message: 'Quantity must be non-negative'
            }
          ]
        },
        {
          name: 'Closing Stock Value',
          aliases: ['Closing Stock Value', 'Stock Value', 'Value', 'Amount'],
          type: 'number',
          required: true,
          validationRules: [
            {
              type: 'min',
              value: 0,
              message: 'Value must be positive'
            }
          ]
        },
        {
          name: 'Per Unit Value Moti',
          aliases: ['Per Unit Value Moti', 'Unit Value', 'Per Unit Value', 'Unit Price', 'Price'],
          type: 'number',
          required: true,
          validationRules: [
            {
              type: 'min',
              value: 0,
              message: 'Unit value must be positive'
            }
          ]
        },
        {
          name: 'Total Value',
          aliases: ['Total Value', 'Total Amount', 'Final Value', 'Grand Total'],
          type: 'number',
          required: true,
          validationRules: [
            {
              type: 'min',
              value: 0,
              message: 'Total value must be positive'
            }
          ]
        }
      ]
    },
    {
      name: 'RPM',
      aliases: ['RPM', 'rpm', 'Raw Materials', 'RawMaterials', 'raw materials', 'Raw Materials & Production Materials'],
      type: 'inventory',
      requiredColumns: [
        {
          name: 'Material',
          aliases: ['Material', 'Material Code', 'MaterialCode', 'Code', 'Item Code', 'SKU'],
          type: 'string',
          required: true,
          validationRules: [
            {
              type: 'minLength',
              value: 1,
              message: 'Material code cannot be empty'
            }
          ]
        },
        {
          name: 'Description',
          aliases: ['Description', 'Material Description', 'Item Description', 'Product Description', 'Desc'],
          type: 'string',
          required: true,
          validationRules: [
            {
              type: 'minLength',
              value: 1,
              message: 'Description cannot be empty'
            }
          ]
        },
        {
          name: 'CAT',
          aliases: ['CAT', 'Cat', 'Category', 'Material Category', 'Type', 'Classification'],
          type: 'string',
          required: true,
          validationRules: [
            {
              type: 'minLength',
              value: 1,
              message: 'Category cannot be empty'
            }
          ]
        },
        {
          name: 'Plant',
          aliases: ['Plant', 'Plant Code', 'Location', 'Site', 'Facility', 'Manufacturing Plant'],
          type: 'string',
          required: true,
          validationRules: [
            {
              type: 'minLength',
              value: 1,
              message: 'Plant cannot be empty'
            }
          ]
        },
        {
          name: 'Material Type',
          aliases: ['Material Type', 'MaterialType', 'Type', 'Raw/Semi', 'Classification'],
          type: 'string',
          required: true,
          validationRules: [
            {
              type: 'minLength',
              value: 1,
              message: 'Material type cannot be empty'
            }
          ]
        },
        {
          name: 'Closing Stock Quantity',
          aliases: ['Closing Stock Quantity', 'Stock Quantity', 'Quantity', 'Qty', 'Stock Qty'],
          type: 'number',
          required: true,
          validationRules: [
            {
              type: 'min',
              value: 0,
              message: 'Quantity must be non-negative'
            }
          ]
        },
        {
          name: 'Closing Stock Value',
          aliases: ['Closing Stock Value', 'Stock Value', 'Value', 'Amount'],
          type: 'number',
          required: true,
          validationRules: [
            {
              type: 'min',
              value: 0,
              message: 'Value must be positive'
            }
          ]
        },
        {
          name: 'Unit of Measure',
          aliases: ['Unit of Measure', 'UoM', 'Unit', 'Measure', 'Measurement Unit'],
          type: 'string',
          required: true,
          validationRules: [
            {
              type: 'minLength',
              value: 1,
              message: 'Unit of measure cannot be empty'
            }
          ]
        },
        {
          name: 'Unit Price',
          aliases: ['Unit Price', 'Price', 'Cost per Unit', 'Per Unit Cost'],
          type: 'number',
          required: true,
          validationRules: [
            {
              type: 'min',
              value: 0,
              message: 'Unit price must be positive'
            }
          ]
        },
        {
          name: 'Total Value',
          aliases: ['Total Value', 'Total Amount', 'Final Value', 'Grand Total'],
          type: 'number',
          required: true,
          validationRules: [
            {
              type: 'min',
              value: 0,
              message: 'Total value must be positive'
            }
          ]
        }
      ]
    }
  ]
};

// OSR File Configuration  
export const OSR_FILE_CONFIG: FileProcessingConfig = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedExtensions: ['.xlsx', '.xls'],
  processingTimeout: 300000, // 5 minutes
  requiredSheets: [
    {
      name: 'OSR Main Sheet HC',
      aliases: ['OSR Main Sheet HC', 'OSR Main Sheet', 'Main Sheet HC', 'OSR Sheet', 'Main OSR'],
      type: 'osr',
      requiredColumns: [
        // Material Identification (4 core columns)
        {
          name: 'Material',
          aliases: ['Material', 'Material Code', 'MaterialCode', 'Code', 'Item Code', 'SKU'],
          type: 'string',
          required: true,
          validationRules: [
            {
              type: 'minLength',
              value: 1,
              message: 'Material code cannot be empty'
            }
          ]
        },
        {
          name: 'Material Description',
          aliases: ['Material Description', 'Description', 'Item Description', 'Product Description', 'Desc'],
          type: 'string',
          required: true,
          validationRules: [
            {
              type: 'minLength',
              value: 1,
              message: 'Material description cannot be empty'
            }
          ]
        },
        {
          name: 'Status',
          aliases: ['Status', 'Material Status', 'Active Status', 'State'],
          type: 'string',
          required: true,
          validationRules: [
            {
              type: 'minLength',
              value: 1,
              message: 'Status cannot be empty'
            }
          ]
        },
        {
          name: 'Avg Unit Price (Rs)',
          aliases: ['Avg Unit Price (Rs)', 'Unit Price', 'Average Price', 'Price', 'Cost'],
          type: 'number',
          required: true,
          validationRules: [
            {
              type: 'min',
              value: 0,
              message: 'Price must be positive'
            }
          ]
        },
        // Stock Position (5 columns) - Key OSR columns
        {
          name: 'Total OSR (Qty)',
          aliases: ['Total OSR (Qty)', 'OSR Qty', 'Total OSR', 'OSR Quantity', 'Overstock Qty'],
          type: 'number',
          required: true,
          validationRules: [
            {
              type: 'min',
              value: 0,
              message: 'OSR quantity must be non-negative'
            }
          ]
        },
        {
          name: 'Total OSR Value PKR',
          aliases: ['Total OSR Value PKR', 'OSR Value', 'Total OSR Value', 'Overstock Value'],
          type: 'number',
          required: true,
          validationRules: [
            {
              type: 'min',
              value: 0,
              message: 'OSR value must be positive'
            }
          ]
        },
        {
          name: 'Residual (Qnty) >26 weeks',
          aliases: ['Residual (Qnty) >26 weeks', 'Residual >26 weeks', 'Long Term Residual', 'Old Stock'],
          type: 'number',
          required: true,
          validationRules: [
            {
              type: 'min',
              value: 0,
              message: 'Residual quantity must be non-negative'
            }
          ]
        }
      ]
    },
    {
      name: 'OSR Summary',
      aliases: ['OSR Summary', 'Summary', 'Executive Summary', 'Dashboard'],
      type: 'osr',
      optional: false,
      requiredColumns: [
        {
          name: 'Total Book Stock',
          aliases: ['Total Book Stock', 'Book Stock', 'Total Stock', 'Inventory Value'],
          type: 'number',
          required: true,
          validationRules: [
            {
              type: 'min',
              value: 0,
              message: 'Stock value must be positive'
            }
          ]
        },
        {
          name: 'Over Stock',
          aliases: ['Over Stock', 'Overstock', 'Excess Stock', 'Surplus'],
          type: 'number',
          required: true,
          validationRules: [
            {
              type: 'min',
              value: 0,
              message: 'Overstock must be non-negative'
            }
          ]
        },
        {
          name: 'Excess Stock %',
          aliases: ['Excess Stock %', 'Overstock %', 'Excess %', 'OSR %'],
          type: 'number',
          required: true,
          validationRules: [
            {
              type: 'min',
              value: 0,
              message: 'Percentage must be non-negative'
            }
          ]
        }
      ]
    }
  ]
};

// Default configuration (backward compatibility)
export const DEFAULT_FILE_PROCESSING_CONFIG = INVENTORY_FILE_CONFIG;

export const VALIDATION_MESSAGES = {
  FILE_SIZE_EXCEEDED: 'File size exceeds maximum allowed size',
  INVALID_FILE_TYPE: 'File type not supported. Please upload an Excel file (.xlsx or .xls)',
  FILE_PROCESSING_TIMEOUT: 'File processing timed out. Please try with a smaller file',
  REQUIRED_SHEET_MISSING: 'Required sheet "{sheetName}" not found in file',
  REQUIRED_COLUMN_MISSING: 'Required column "{columnName}" not found in sheet "{sheetName}"',
  INVALID_DATA_TYPE: 'Invalid data type in column "{columnName}", row {rowNumber}',
  VALIDATION_RULE_FAILED: 'Validation failed for column "{columnName}", row {rowNumber}: {message}',
  NO_DATA_FOUND: 'No valid data found in any sheets',
  PROCESSING_CANCELLED: 'File processing was cancelled',
  WORKER_ERROR: 'An error occurred during file processing',
  SHEET_DETECTION_FAILED: 'Could not detect valid sheets in the uploaded file'
} as const;

export function createCustomConfig(overrides: Partial<FileProcessingConfig>): FileProcessingConfig {
  return {
    ...DEFAULT_FILE_PROCESSING_CONFIG,
    ...overrides,
    requiredSheets: overrides.requiredSheets || DEFAULT_FILE_PROCESSING_CONFIG.requiredSheets
  };
}

export function getConfigForFileType(fileType: 'inventory' | 'osr'): FileProcessingConfig {
  return fileType === 'osr' ? OSR_FILE_CONFIG : INVENTORY_FILE_CONFIG;
}

export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

export function validateFileExtension(file: File, allowedExtensions: string[]): boolean {
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  return allowedExtensions.includes(extension);
}

export function getSheetConfigByName(name: string, config: FileProcessingConfig): SheetConfig | undefined {
  return config.requiredSheets.find(sheet => 
    sheet.name.toLowerCase() === name.toLowerCase() || 
    sheet.aliases.some((alias: string) => alias.toLowerCase() === name.toLowerCase())
  );
}

export function getColumnConfigByName(columnName: string, sheetConfig: SheetConfig): ColumnConfig | undefined {
  return sheetConfig.requiredColumns.find((column: ColumnConfig) =>
    column.name.toLowerCase() === columnName.toLowerCase() ||
    column.aliases.some((alias: string) => alias.toLowerCase() === columnName.toLowerCase())
  );
}