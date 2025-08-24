import type {
  FileProcessorOptions,
  WorkerProcessorOptions,
  ProcessingResult,
  ProcessingProgress,
  ProcessingError,
  WorkerProcessMessage,
  WorkerProgressMessage,
  WorkerResultMessage,
  WorkerErrorMessage,
  FileProcessingConfig
} from '@/types/fileProcessing';
import { DEFAULT_FILE_PROCESSING_CONFIG, validateFileSize, validateFileExtension, VALIDATION_MESSAGES } from '@/config/fileProcessing';

export class FileProcessorService {
  private worker: Worker | null = null;
  private currentProcessId: string | null = null;
  private progressCallback: ((progress: ProcessingProgress) => void) | null = null;
  private config: FileProcessingConfig;

  constructor(config?: Partial<FileProcessingConfig>) {
    this.config = {
      ...DEFAULT_FILE_PROCESSING_CONFIG,
      ...config
    };
  }

  async processFile(
    file: File,
    onProgress?: (progress: ProcessingProgress) => void,
    options?: Partial<FileProcessorOptions>
  ): Promise<ProcessingResult> {
    // Initial validation
    const validationResult = this.validateFile(file);
    if (!validationResult.isValid) {
      return {
        success: false,
        error: validationResult.error!
      };
    }

    // Setup processing options (exclude onProgress callback from worker message)
    const processingOptions: FileProcessorOptions = {
      config: this.config,
      validateColumns: true,
      validateData: true,
      skipEmptyRows: true,
      trimWhitespace: true,
      ...options
      // Note: onProgress callback is NOT sent to worker - worker sends progress messages instead
    };

    this.progressCallback = onProgress || null;

    try {
      // Initialize worker if not already created
      if (!this.worker) {
        this.initializeWorker();
      }

      // Generate unique process ID
      this.currentProcessId = this.generateProcessId();

      // Create worker-safe options (exclude callback functions)
      const workerOptions: WorkerProcessorOptions = {
        config: processingOptions.config,
        validateColumns: processingOptions.validateColumns,
        validateData: processingOptions.validateData,
        skipEmptyRows: processingOptions.skipEmptyRows,
        trimWhitespace: processingOptions.trimWhitespace
        // Note: onProgress callback is deliberately excluded - worker sends progress messages instead
      };

      // Send file to worker for processing
      const message: WorkerProcessMessage = {
        id: this.currentProcessId,
        type: 'process',
        payload: {
          file,
          options: workerOptions
        }
      };

      this.worker!.postMessage(message);

      // Wait for result with timeout
      return await this.waitForResult();

    } catch (error) {
      return {
        success: false,
        error: {
          type: 'parsing',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      };
    } finally {
      this.cleanup();
    }
  }

  private validateFile(file: File): { isValid: boolean; error?: ProcessingError } {
    // Check file size
    if (!validateFileSize(file, this.config.maxFileSize)) {
      return {
        isValid: false,
        error: {
          type: 'size',
          message: VALIDATION_MESSAGES.FILE_SIZE_EXCEEDED,
          details: { 
            fileSize: file.size, 
            maxSize: this.config.maxFileSize 
          }
        }
      };
    }

    // Check file extension
    if (!validateFileExtension(file, this.config.allowedExtensions)) {
      return {
        isValid: false,
        error: {
          type: 'format',
          message: VALIDATION_MESSAGES.INVALID_FILE_TYPE,
          details: { 
            fileName: file.name,
            allowedExtensions: this.config.allowedExtensions
          }
        }
      };
    }

    return { isValid: true };
  }

  private initializeWorker(): void {
    // Create worker from the worker file
    this.worker = new Worker(
      new URL('../workers/excelProcessor.worker.ts', import.meta.url),
      { type: 'module' }
    );

    this.worker.addEventListener('message', this.handleWorkerMessage.bind(this));
    this.worker.addEventListener('error', this.handleWorkerError.bind(this));
  }

  private handleWorkerMessage(event: MessageEvent): void {
    const message = event.data as WorkerProgressMessage | WorkerResultMessage | WorkerErrorMessage;

    if (message.id !== this.currentProcessId) {
      return; // Ignore messages from previous processes
    }

    switch (message.type) {
      case 'progress':
        this.handleProgressUpdate(message.payload);
        break;
      case 'result':
        this.handleResult(message.payload);
        break;
      case 'error':
        this.handleError(message.payload);
        break;
    }
  }

  private handleWorkerError(event: ErrorEvent): void {
    console.error('Worker error:', event);
    this.handleError({
      type: 'parsing',
      message: VALIDATION_MESSAGES.WORKER_ERROR
    });
  }

  private handleProgressUpdate(progress: ProcessingProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  private resultPromiseResolve: ((result: ProcessingResult) => void) | null = null;
  private resultPromiseReject: ((error: Error) => void) | null = null;

  private handleResult(result: ProcessingResult): void {
    if (this.resultPromiseResolve) {
      this.resultPromiseResolve(result);
    }
  }

  private handleError(error: ProcessingError): void {
    const result: ProcessingResult = {
      success: false,
      error
    };

    if (this.resultPromiseResolve) {
      this.resultPromiseResolve(result);
    }
  }

  private async waitForResult(): Promise<ProcessingResult> {
    return new Promise((resolve, reject) => {
      this.resultPromiseResolve = resolve;
      this.resultPromiseReject = reject;

      // Set timeout
      const timeout = setTimeout(() => {
        if (this.resultPromiseReject) {
          this.resultPromiseReject(new Error(VALIDATION_MESSAGES.FILE_PROCESSING_TIMEOUT));
        }
        this.cleanup();
      }, this.config.processingTimeout);

      // Override resolve to clear timeout
      const originalResolve = this.resultPromiseResolve;
      this.resultPromiseResolve = (result: ProcessingResult) => {
        clearTimeout(timeout);
        originalResolve!(result);
      };
    });
  }

  private generateProcessId(): string {
    return `process_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private cleanup(): void {
    this.currentProcessId = null;
    this.progressCallback = null;
    this.resultPromiseResolve = null;
    this.resultPromiseReject = null;
  }

  // Public methods for configuration management
  updateConfig(config: Partial<FileProcessingConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
  }

  getConfig(): FileProcessingConfig {
    return { ...this.config };
  }

  // Utility methods for sheet and column detection
  getExpectedSheetNames(): string[] {
    return this.config.requiredSheets.map(sheet => sheet.name);
  }

  getExpectedColumnsForSheet(sheetType: 'inventory' | 'osr'): string[] {
    const sheets = this.config.requiredSheets.filter(sheet => sheet.type === sheetType);
    const columns = new Set<string>();
    
    for (const sheet of sheets) {
      for (const column of sheet.requiredColumns) {
        columns.add(column.name);
      }
    }
    
    return Array.from(columns);
  }

  // Method to validate file without processing
  async validateFileOnly(file: File): Promise<{ isValid: boolean; error?: ProcessingError; warnings?: string[] }> {
    const fileValidation = this.validateFile(file);
    if (!fileValidation.isValid) {
      return fileValidation;
    }

    // For deeper validation, we'd need to partially process the file
    // This is a basic implementation that only checks file properties
    return { isValid: true };
  }

  // Cleanup method
  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.cleanup();
  }

  // Static method to create service with default config
  static create(config?: Partial<FileProcessingConfig>): FileProcessorService {
    return new FileProcessorService(config);
  }

  // Method to check if processing is supported
  static isSupported(): boolean {
    return typeof Worker !== 'undefined' && typeof FileReader !== 'undefined';
  }
}

// Export a default instance for convenience
export const defaultFileProcessor = new FileProcessorService();