import * as XLSX from 'xlsx';
import type {
  WorkerProcessMessage,
  ProcessingResult,
  ProcessingProgress,
  ProcessingError,
  WorkerProcessorOptions,
  ProcessedFileData,
  ProcessedSheet,
  SheetConfig,
  ColumnConfig,
  ValidationRule,
  FileProcessingConfig
} from '@/types/fileProcessing';

// Inline getColumnConfigByName to avoid import issues
function getColumnConfigByName(columnName: string, sheetConfig: SheetConfig): ColumnConfig | undefined {
  return sheetConfig.requiredColumns.find((column: ColumnConfig) =>
    column.name.toLowerCase() === columnName.toLowerCase() ||
    column.aliases.some((alias: string) => alias.toLowerCase() === columnName.toLowerCase())
  );
}


// Global variables for worker state
let currentProcessId: string | null = null;
let startTime: number = 0;

// Standard worker message handler
self.addEventListener('message', function(event: MessageEvent<WorkerProcessMessage>) {
  const { id, type, payload } = event.data;
  
  if (type === 'process') {
    currentProcessId = id;
    processFile(payload.file, payload.options)
      .then(result => sendResult(id, result))
      .catch(error => sendError(id, createProcessingError('parsing', error.message)));
  }
});

function sendProgress(phase: ProcessingProgress['phase'], progress: number, message: string, additionalData?: Partial<ProcessingProgress>) {
  if (!currentProcessId) return;
  
  const progressData: ProcessingProgress = {
    phase,
    progress,
    message,
    ...additionalData
  };

  self.postMessage({
    id: currentProcessId,
    type: 'progress',
    payload: progressData
  });
}

function sendResult(id: string, result: ProcessingResult) {
  self.postMessage({
    id,
    type: 'result',
    payload: result
  });
}

function sendError(id: string, error: ProcessingError) {
  self.postMessage({
    id,
    type: 'error',
    payload: error
  });
}

async function processFile(file: File, options: WorkerProcessorOptions): Promise<ProcessingResult> {
  startTime = Date.now();
  
  try {
    // Phase 1: Reading file - Use FileReaderSync for worker
    sendProgress('reading', 10, 'Reading Excel file...');
    const arrayBuffer = readFileSync(file);
    
    // Phase 2: Parsing workbook
    sendProgress('parsing', 25, 'Parsing Excel workbook...');
    const workbook = XLSX.read(arrayBuffer, { 
      type: 'array',
      dense: true,
      cellDates: true,
      cellNF: false,
      cellText: false
    });

    // Phase 3: Validating structure
    sendProgress('validating', 40, 'Validating file structure...');
    const sheetValidation = validateWorkbookStructure(workbook, options.config);
    
    if (!sheetValidation.isValid) {
      return {
        success: false,
        error: sheetValidation.error,
        warnings: sheetValidation.warnings
      };
    }

    // Phase 4: Processing sheets
    sendProgress('processing', 60, 'Processing sheet data...');
    const processedSheets = await processSheets(workbook, options);
    
    // Phase 5: Complete
    sendProgress('complete', 100, 'File processing complete');
    
    const result: ProcessedFileData = {
      fileName: file.name,
      fileSize: file.size,
      processedAt: new Date().toISOString(),
      sheets: processedSheets,
      detectedDataSources: detectDataSources(processedSheets)
    };

    return {
      success: true,
      data: result,
      stats: {
        totalRows: processedSheets.reduce((sum, sheet) => sum + sheet.rowCount, 0),
        totalColumns: processedSheets.reduce((sum, sheet) => sum + sheet.columnCount, 0),
        processingTime: Date.now() - startTime,
        sheetsProcessed: processedSheets.length,
        validationErrors: 0,
        warnings: processedSheets.reduce((sum, sheet) => sum + (sheet.warnings?.length || 0), 0)
      }
    };

  } catch (error) {
    return {
      success: false,
      error: createProcessingError('parsing', error instanceof Error ? error.message : 'Unknown error occurred')
    };
  }
}

// Use FileReaderSync for synchronous file reading in worker
function readFileSync(file: File): ArrayBuffer {
  const reader = new (self as any).FileReaderSync();
  return reader.readAsArrayBuffer(file);
}

function validateWorkbookStructure(workbook: XLSX.WorkBook, config: FileProcessingConfig) {
    const warnings: string[] = [];
    const availableSheets = workbook.SheetNames;
    const detectedSheets: SheetConfig[] = [];

    // Check for required sheets
    for (const sheetConfig of config.requiredSheets) {
      const foundSheet = availableSheets.find(sheetName => 
        sheetConfig.name.toLowerCase() === sheetName.toLowerCase() ||
        sheetConfig.aliases.some((alias: string) => alias.toLowerCase() === sheetName.toLowerCase())
      );

      if (foundSheet) {
        detectedSheets.push(sheetConfig);
      } else if (!sheetConfig.optional) {
        return {
          isValid: false,
          error: createProcessingError('sheets', `Required sheet "${sheetConfig.name}" not found. Available sheets: ${availableSheets.join(', ')}`),
          warnings
        };
      } else {
        warnings.push(`Optional sheet "${sheetConfig.name}" not found`);
      }
    }

    if (detectedSheets.length === 0) {
      return {
        isValid: false,
        error: createProcessingError('sheets', 'No valid sheets detected in the file'),
        warnings
      };
    }

    return {
      isValid: true,
      detectedSheets,
      warnings
    };
  }

async function processSheets(workbook: XLSX.WorkBook, options: WorkerProcessorOptions): Promise<ProcessedSheet[]> {
    const processedSheets: ProcessedSheet[] = [];
    const availableSheets = workbook.SheetNames;
    
    let processedCount = 0;
    const totalSheets = options.config.requiredSheets.filter(sheet => 
      availableSheets.some(available => 
        sheet.name.toLowerCase() === available.toLowerCase() ||
        sheet.aliases.some(alias => alias.toLowerCase() === available.toLowerCase())
      )
    ).length;

    for (const sheetConfig of options.config.requiredSheets) {
      const actualSheetName = availableSheets.find(sheetName => 
        sheetConfig.name.toLowerCase() === sheetName.toLowerCase() ||
        sheetConfig.aliases.some((alias: string) => alias.toLowerCase() === sheetName.toLowerCase())
      );

      if (!actualSheetName) {
        if (!sheetConfig.optional) {
          throw new Error(`Required sheet "${sheetConfig.name}" not found`);
        }
        continue;
      }

      sendProgress('processing', 60 + (processedCount / totalSheets) * 30, 
        `Processing sheet: ${actualSheetName}...`, 
        { currentSheet: actualSheetName, totalSheets, processedSheets: processedCount });

      const worksheet = workbook.Sheets[actualSheetName];
      const processedSheet = await processSheet(worksheet, sheetConfig, options);
      
      if (processedSheet) {
        processedSheets.push({
          ...processedSheet,
          name: actualSheetName
        });
      }

      processedCount++;
    }

    return processedSheets;
  }

async function processSheet(
  worksheet: XLSX.WorkSheet, 
  sheetConfig: SheetConfig, 
  options: WorkerProcessorOptions
): Promise<Omit<ProcessedSheet, 'name'> | null> {
    const warnings: string[] = [];
    
    // Convert sheet to JSON with header detection
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
      blankrows: !options.skipEmptyRows
    }) as unknown[][];

    if (jsonData.length === 0) {
      warnings.push('Sheet contains no data');
      return null;
    }

    // Find header row (usually first non-empty row)
    let headerRowIndex = 0;
    while (headerRowIndex < jsonData.length && (!jsonData[headerRowIndex] || jsonData[headerRowIndex].every(cell => !cell))) {
      headerRowIndex++;
    }

    if (headerRowIndex >= jsonData.length) {
      warnings.push('No header row found');
      return null;
    }

    const headers = jsonData[headerRowIndex] as (string | unknown)[];
    const dataRows = jsonData.slice(headerRowIndex + 1);

    // Validate columns
    if (options.validateColumns) {
      const columnValidation = validateColumns(headers, sheetConfig);
      if (!columnValidation.isValid) {
        throw new Error(columnValidation.error);
      }
      warnings.push(...columnValidation.warnings);
    }

    // Process data rows
    const processedData: Record<string, unknown>[] = [];
    const columnMappings = createColumnMappings(headers, sheetConfig);

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i] as unknown[];
      
      if (options.skipEmptyRows && (!row || row.every(cell => !cell))) {
        continue;
      }

      const processedRow: Record<string, unknown> = {};
      
      for (let j = 0; j < headers.length && j < row.length; j++) {
        const header = headers[j];
        if (typeof header !== 'string') continue;
        
        const mappedColumn = columnMappings.get(header);
        
        if (mappedColumn) {
          let value = row[j];
          
          if (options.trimWhitespace && typeof value === 'string') {
            value = value.trim();
          }

          // Type conversion and validation
          if (options.validateData && value !== null && value !== undefined) {
            const validationResult = validateCellValue(value, mappedColumn, i + headerRowIndex + 2);
            if (!validationResult.isValid) {
              warnings.push(validationResult.error!);
              continue;
            }
            value = validationResult.value;
          }

          processedRow[mappedColumn.name] = value;
        }
      }

      if (Object.keys(processedRow).length > 0) {
        processedData.push(processedRow);
      }
    }

    return {
      type: sheetConfig.type,
      rowCount: processedData.length,
      columnCount: headers.length,
      columns: Array.from(columnMappings.values()).map(col => col.name),
      data: processedData,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

function validateColumns(headers: (string | unknown)[], sheetConfig: SheetConfig) {
    const warnings: string[] = [];
    const foundColumns = new Set<string>();

    // Check each required column
    for (const columnConfig of sheetConfig.requiredColumns.filter(col => col.required)) {
      const foundHeader = headers.find(header => 
        typeof header === 'string' && (
          columnConfig.name.toLowerCase() === header.toLowerCase() ||
          columnConfig.aliases.some(alias => alias.toLowerCase() === header.toLowerCase())
        )
      );

      if (foundHeader) {
        foundColumns.add(columnConfig.name);
      } else {
        return {
          isValid: false,
          error: `Required column "${columnConfig.name}" not found in sheet. Available columns: ${headers.filter(h => typeof h === 'string').join(', ')}`,
          warnings
        };
      }
    }

    // Check for optional columns
    for (const columnConfig of sheetConfig.requiredColumns.filter(col => !col.required)) {
      const foundHeader = headers.find(header => 
        typeof header === 'string' && (
          columnConfig.name.toLowerCase() === header.toLowerCase() ||
          columnConfig.aliases.some(alias => alias.toLowerCase() === header.toLowerCase())
        )
      );

      if (!foundHeader) {
        warnings.push(`Optional column "${columnConfig.name}" not found`);
      }
    }

    return {
      isValid: true,
      warnings
    };
  }

function createColumnMappings(headers: (string | unknown)[], sheetConfig: SheetConfig): Map<string, ColumnConfig> {
    const mappings = new Map<string, ColumnConfig>();

    for (const header of headers) {
      if (!header || typeof header !== 'string') continue;
      
      const columnConfig = getColumnConfigByName(header, sheetConfig);
      if (columnConfig) {
        mappings.set(header, columnConfig);
      }
    }

    return mappings;
  }

function validateCellValue(value: unknown, columnConfig: ColumnConfig, rowNumber: number) {
    // Type conversion
    let convertedValue: unknown = value;
    
    try {
      switch (columnConfig.type) {
        case 'number':
          if (typeof value === 'string') {
            convertedValue = parseFloat(value.replace(/,/g, ''));
          } else if (typeof value === 'number') {
            convertedValue = value;
          } else {
            throw new Error('Invalid number format');
          }
          break;
        case 'string':
          convertedValue = String(value || '');
          break;
        case 'date':
          if (value instanceof Date) {
            convertedValue = value;
          } else if (typeof value === 'string' || typeof value === 'number') {
            convertedValue = new Date(value);
          } else {
            throw new Error('Invalid date format');
          }
          break;
      }
    } catch (error) {
      return {
        isValid: false,
        error: `Invalid data type in column "${columnConfig.name}", row ${rowNumber}: Expected ${columnConfig.type}`,
        value
      };
    }

    // Apply validation rules
    if (columnConfig.validationRules) {
      for (const rule of columnConfig.validationRules) {
        const ruleResult = applyValidationRule(convertedValue, rule);
        if (!ruleResult.isValid) {
          return {
            isValid: false,
            error: `Validation failed for column "${columnConfig.name}", row ${rowNumber}: ${rule.message}`,
            value: convertedValue
          };
        }
      }
    }

    return {
      isValid: true,
      value: convertedValue
    };
  }

function applyValidationRule(value: unknown, rule: ValidationRule) {
    switch (rule.type) {
      case 'minLength':
        return {
          isValid: typeof value === 'string' && value.length >= (rule.value as number)
        };
      case 'maxLength':
        return {
          isValid: typeof value === 'string' && value.length <= (rule.value as number)
        };
      case 'min':
        return {
          isValid: typeof value === 'number' && value >= (rule.value as number)
        };
      case 'max':
        return {
          isValid: typeof value === 'number' && value <= (rule.value as number)
        };
      case 'regex':
        return {
          isValid: typeof value === 'string' && new RegExp(rule.value as string).test(value)
        };
      case 'oneOf':
        return {
          isValid: (rule.value as string[]).includes(String(value))
        };
      default:
        return { isValid: true };
    }
  }

function detectDataSources(sheets: ProcessedSheet[]): ('inventory' | 'osr')[] {
    const sources = new Set<'inventory' | 'osr'>();
    
    for (const sheet of sheets) {
      sources.add(sheet.type);
    }
    
    return Array.from(sources);
  }

function createProcessingError(type: ProcessingError['type'], message: string, details?: Record<string, unknown>): ProcessingError {
    return {
      type,
      message,
      details
    };
}