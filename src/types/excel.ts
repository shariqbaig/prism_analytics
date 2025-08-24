// Excel File Data Types for PRISM Analytics

export interface ExcelFileData {
  id: string;
  name: string;
  type: 'inventory' | 'osr';
  size: number;
  uploadDate: Date;
  lastModified: Date;
  sheets: ExcelSheets;
  isValid: boolean;
  validationErrors?: ValidationError[];
}

export interface ExcelSheets {
  // Inventory file sheets
  fg?: FGValueData[];
  rpm?: RPMData[];
  
  // OSR file sheets
  osrMain?: OSRMainData[];
  osrSummary?: OSRSummaryData[];
}

// Inventory File Types
export interface FGValueData {
  packSize: string;
  plant: string;
  location: string;
  material: number;
  description: string;
  closingStockQuantity: number;
  closingStockValue: number;
  perUnitValueMoti: number;
  totalValue: number;
}

export interface RPMData {
  material: number;
  description: string;
  category: string;
  plant: string;
  materialType: string;
  closingStockQuantity: number;
  closingStockValue: number;
  unitOfMeasure: string;
  unitPrice: number;
  totalValue: number;
}

// OSR File Types
export interface OSRMainData {
  material: number;
  materialDescription: string;
  status: string;
  avgUnitPrice: number;
  totalOSRValue: number;
  residualQty26Weeks: number;
  slowMovingValue: number;
  nonMovingValue: number;
  plant: string;
  category: string;
}

export interface OSRSummaryData {
  totalBookStock: number;
  overStock: number;
  totalExcessStock: number;
  excessStockPercentage: number;
  unhealthyStocksPercentage: number;
  healthyStocksPercentage: number;
  plant: string;
  category: string;
}

export interface ValidationError {
  type: 'missing_column' | 'invalid_data' | 'format_error';
  message: string;
  sheet?: string;
  row?: number;
  column?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  fileType: 'inventory' | 'osr';
  sheetsFound: string[];
  rowsProcessed: number;
}