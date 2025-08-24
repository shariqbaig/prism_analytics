// IndexedDB types for offline data storage using Dexie.js
import type Dexie from 'dexie';

export interface FileMetadata {
  id?: number;
  fileName: string;
  fileSize: number;
  uploadedAt: string | Date;
  processedAt: string | Date;
  fileHash: string;
  isActive: boolean;
  fileType: 'inventory' | 'osr';
  version: number;
  description?: string;
}

export interface ProcessedFileRecord {
  id?: number;
  fileMetadataId: number;
  fileName: string;
  fileSize: number;
  processedAt: string | Date;
  sheets: ProcessedSheetRecord[];
  detectedDataSources: ('inventory' | 'osr')[];
  processingStats: ProcessingStatsRecord;
  version: number;
}

export interface ProcessedSheetRecord {
  id?: number;
  fileRecordId: number;
  name: string;
  type: 'inventory' | 'osr';
  rowCount: number;
  columnCount: number;
  columns: string[];
  data: Record<string, unknown>[];
  warnings: string[];
  processedAt: string | Date;
}

export interface ProcessingStatsRecord {
  id?: number;
  fileRecordId: number;
  totalRows: number;
  totalColumns: number;
  processingTime: number;
  sheetsProcessed: number;
  validationErrors: number;
  warnings: number;
}

export interface UserPreferences {
  id?: number;
  key: string;
  value: string | number | boolean | Record<string, unknown>;
  updatedAt: string | Date;
  version: number;
}

export interface DataVersion {
  id?: number;
  fileMetadataId: number;
  version: number;
  createdAt: string | Date;
  description?: string;
  changes: string[];
  isActive: boolean;
}

export interface ApplicationState {
  id?: number;
  activeFileId?: number;
  lastActiveAt: string | Date;
  preferences: Record<string, unknown>;
  version: number;
}

// Database configuration interface
export interface DatabaseConfig {
  name: string;
  version: number;
  description?: string;
}

// Query interfaces
export interface FileQuery {
  isActive?: boolean;
  fileType?: 'inventory' | 'osr';
  version?: number;
  limit?: number;
  offset?: number;
}

export interface DataExportOptions {
  includeMetadata: boolean;
  includeProcessingStats: boolean;
  format: 'json' | 'csv';
  dateRange?: {
    start: string | Date;
    end: string | Date;
  };
}

// Migration interfaces
export interface MigrationStep {
  version: number;
  description: string;
  up: (db: Dexie) => Promise<void>;
  down: (db: Dexie) => Promise<void>;
}