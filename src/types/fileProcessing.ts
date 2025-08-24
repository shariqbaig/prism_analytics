export interface FileProcessingConfig {
  maxFileSize: number;
  allowedExtensions: string[];
  requiredSheets: SheetConfig[];
  processingTimeout: number;
}

export interface SheetConfig {
  name: string;
  aliases: string[];
  type: 'inventory' | 'osr';
  requiredColumns: ColumnConfig[];
  optional?: boolean;
}

export interface ColumnConfig {
  name: string;
  aliases: string[];
  type: 'string' | 'number' | 'date';
  required: boolean;
  validationRules?: ValidationRule[];
}

export interface ValidationRule {
  type: 'minLength' | 'maxLength' | 'min' | 'max' | 'regex' | 'oneOf';
  value: string | number | string[];
  message: string;
}

export interface ProcessingProgress {
  phase: 'reading' | 'parsing' | 'validating' | 'processing' | 'complete' | 'error';
  progress: number;
  message: string;
  currentSheet?: string;
  totalSheets?: number;
  processedSheets?: number;
}

export interface ProcessingResult {
  success: boolean;
  data?: ProcessedFileData;
  error?: ProcessingError;
  warnings?: string[];
  stats?: ProcessingStats;
}

export interface ProcessedFileData {
  fileName: string;
  fileSize: number;
  processedAt: string | Date;
  sheets: ProcessedSheet[];
  detectedDataSources: ('inventory' | 'osr')[];
}

export interface ProcessedSheet {
  name: string;
  type: 'inventory' | 'osr';
  rowCount: number;
  columnCount: number;
  columns: string[];
  data: Record<string, unknown>[];
  warnings?: string[];
}

export interface ProcessingError {
  type: 'validation' | 'parsing' | 'timeout' | 'size' | 'format' | 'sheets' | 'columns';
  message: string;
  details?: Record<string, unknown>;
  sheet?: string;
  column?: string;
}

export interface ProcessingStats {
  totalRows: number;
  totalColumns: number;
  processingTime: number;
  sheetsProcessed: number;
  validationErrors: number;
  warnings: number;
}

export interface FileProcessorOptions {
  config: FileProcessingConfig;
  onProgress?: (progress: ProcessingProgress) => void;
  validateColumns?: boolean;
  validateData?: boolean;
  skipEmptyRows?: boolean;
  trimWhitespace?: boolean;
}

// Worker-safe options that exclude callback functions
export interface WorkerProcessorOptions {
  config: FileProcessingConfig;
  validateColumns?: boolean;
  validateData?: boolean;
  skipEmptyRows?: boolean;
  trimWhitespace?: boolean;
}

export interface WorkerMessage {
  id: string;
  type: 'process' | 'progress' | 'result' | 'error';
  payload: unknown;
}

export interface WorkerProcessMessage extends WorkerMessage {
  type: 'process';
  payload: {
    file: File;
    options: WorkerProcessorOptions;
  };
}

export interface WorkerProgressMessage extends WorkerMessage {
  type: 'progress';
  payload: ProcessingProgress;
}

export interface WorkerResultMessage extends WorkerMessage {
  type: 'result';
  payload: ProcessingResult;
}

export interface WorkerErrorMessage extends WorkerMessage {
  type: 'error';
  payload: ProcessingError;
}