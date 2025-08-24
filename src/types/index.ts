// Central type exports for PRISM Analytics

// Excel data types
export type {
  ExcelFileData,
  ExcelSheets,
  FGValueData,
  RPMData,
  OSRMainData,
  OSRSummaryData,
  ValidationError,
  ValidationResult
} from './excel';

// Dashboard and analytics types
export type {
  KPIMetric,
  InventoryMetrics,
  OSRMetrics,
  CrossAnalytics,
  GeographicData,
  MaterialData,
  CategoryData,
  RiskCategoryData,
  AgingData,
  MarginData,
  CorrelationData,
  ValueChainData,
  // ChartConfig and ChartOptions moved to @/components/charts/types
} from './dashboard';

// File processing types
export type {
  FileProcessingConfig,
  SheetConfig,
  ColumnConfig,
  ValidationRule,
  ProcessingProgress,
  ProcessingResult,
  ProcessedFileData,
  ProcessedSheet,
  ProcessingError,
  ProcessingStats,
  FileProcessorOptions,
  WorkerProcessorOptions,
  WorkerMessage,
  WorkerProcessMessage,
  WorkerProgressMessage,
  WorkerResultMessage,
  WorkerErrorMessage
} from './fileProcessing';

// Database and storage types
export type {
  FileMetadata,
  ProcessedFileRecord,
  ProcessedSheetRecord,
  ProcessingStatsRecord,
  UserPreferences,
  DataVersion,
  ApplicationState,
  DatabaseConfig,
  FileQuery,
  DataExportOptions,
  MigrationStep
} from './database';