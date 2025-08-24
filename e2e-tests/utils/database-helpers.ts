/**
 * Database Helper Utilities for E2E Tests
 * Provides functions to interact with IndexedDB in browser context
 */

export interface DBFileMetadata {
  id?: number;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: 'inventory' | 'osr';
  fileHash: string;
  uploadedAt: Date;
  isActive: boolean;
}

export interface DBProcessedData {
  id?: number;
  fileId: number;
  fileName: string;
  fileSize: number;
  processingTime: number;
  sheets: Array<{
    name: string;
    type: 'inventory' | 'osr';
    rowCount: number;
    columnCount: number;
    columns: string[];
    data: Record<string, unknown>[];
    warnings?: string[];
  }>;
  detectedDataSources: string[];
  createdAt: Date;
}

/**
 * Clear all data from IndexedDB
 */
export async function clearIndexedDB(): Promise<void> {
  const dbName = 'PrismAnalytics';
  
  return new Promise((resolve, reject) => {
    try {
      const deleteRequest = indexedDB.deleteDatabase(dbName);
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => resolve(); // Resolve even on error to prevent test failures
      deleteRequest.onblocked = () => resolve(); // Resolve if blocked
    } catch (error) {
      // If IndexedDB is not available or throws security error, just resolve
      resolve();
    }
  });
}

/**
 * Get all file metadata from IndexedDB
 */
export async function getFileMetadata(): Promise<DBFileMetadata[]> {
  const dbName = 'PrismAnalytics';
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['fileMetadata'], 'readonly');
      const store = transaction.objectStore('fileMetadata');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
      
      getAllRequest.onerror = () => {
        reject(getAllRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Get processed data for a specific file from IndexedDB
 */
export async function getProcessedData(fileId: number): Promise<DBProcessedData | null> {
  const dbName = 'PrismAnalytics';
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);
    
    request.onsuccess = () => {
      const db = request.result;
      try {
        // Get processed files data
        const transaction = db.transaction(['processedFiles', 'processedSheets'], 'readonly');
        const processedFilesStore = transaction.objectStore('processedFiles');
        const processedSheetsStore = transaction.objectStore('processedSheets');
        
        // Find processed file record for this file ID
        const getFileRequest = processedFilesStore.getAll();
        
        getFileRequest.onsuccess = () => {
          const processedFiles = getFileRequest.result;
          const fileRecord = processedFiles.find(f => f.fileMetadataId === fileId);
          
          if (!fileRecord) {
            resolve(null);
            return;
          }
          
          // Get sheets for this file
          const getSheetsRequest = processedSheetsStore.getAll();
          
          getSheetsRequest.onsuccess = () => {
            const allSheets = getSheetsRequest.result;
            const fileSheets = allSheets.filter(s => s.fileRecordId === fileRecord.id);
            
            const result: DBProcessedData = {
              id: fileRecord.id,
              fileId: fileId,
              fileName: fileRecord.fileName,
              fileSize: fileRecord.fileSize,
              processingTime: 2000, // Mock processing time
              sheets: fileSheets.map(sheet => ({
                name: sheet.name,
                type: sheet.type,
                rowCount: sheet.rowCount,
                columnCount: sheet.columnCount,
                columns: sheet.columns || [],
                data: sheet.data || [],
                warnings: sheet.warnings
              })),
              detectedDataSources: fileRecord.detectedDataSources || [],
              createdAt: fileRecord.processedAt || new Date()
            };
            
            resolve(result);
          };
          
          getSheetsRequest.onerror = () => {
            resolve(null);
          };
        };
        
        getFileRequest.onerror = () => {
          resolve(null);
        };
      } catch (error) {
        resolve(null);
      }
    };
    
    request.onerror = () => {
      resolve(null);
    };
  });
}

/**
 * Get all processed data from IndexedDB
 */
export async function getAllProcessedData(): Promise<DBProcessedData[]> {
  const dbName = 'PrismAnalytics';
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);
    
    request.onsuccess = () => {
      const db = request.result;
      try {
        const transaction = db.transaction(['processedFiles', 'processedSheets'], 'readonly');
        const processedFilesStore = transaction.objectStore('processedFiles');
        const processedSheetsStore = transaction.objectStore('processedSheets');
        
        const getFilesRequest = processedFilesStore.getAll();
        
        getFilesRequest.onsuccess = () => {
          const processedFiles = getFilesRequest.result;
          const getSheetsRequest = processedSheetsStore.getAll();
          
          getSheetsRequest.onsuccess = () => {
            const allSheets = getSheetsRequest.result;
            
            const results: DBProcessedData[] = processedFiles.map(fileRecord => {
              const fileSheets = allSheets.filter(s => s.fileRecordId === fileRecord.id);
              
              return {
                id: fileRecord.id,
                fileId: fileRecord.fileMetadataId,
                fileName: fileRecord.fileName,
                fileSize: fileRecord.fileSize,
                processingTime: 2000,
                sheets: fileSheets.map(sheet => ({
                  name: sheet.name,
                  type: sheet.type,
                  rowCount: sheet.rowCount,
                  columnCount: sheet.columnCount,
                  columns: sheet.columns || [],
                  data: sheet.data || [],
                  warnings: sheet.warnings
                })),
                detectedDataSources: fileRecord.detectedDataSources || [],
                createdAt: fileRecord.processedAt || new Date()
              };
            });
            
            resolve(results);
          };
          
          getSheetsRequest.onerror = () => {
            resolve([]);
          };
        };
        
        getFilesRequest.onerror = () => {
          resolve([]);
        };
      } catch (error) {
        resolve([]);
      }
    };
    
    request.onerror = () => {
      resolve([]);
    };
  });
}

/**
 * Verify database structure and tables exist
 */
export async function verifyDatabaseStructure(): Promise<{
  exists: boolean;
  tables: string[];
}> {
  const dbName = 'PrismAnalytics';
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);
    
    request.onsuccess = () => {
      const db = request.result;
      const tables = Array.from(db.objectStoreNames);
      resolve({
        exists: true,
        tables
      });
    };
    
    request.onerror = () => {
      resolve({
        exists: false,
        tables: []
      });
    };
  });
}

/**
 * Wait for database to be populated with data
 */
export async function waitForDatabaseData(
  maxWaitMs: number = 10000,
  pollIntervalMs: number = 100
): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    const metadata = await getFileMetadata();
    if (metadata.length > 0) {
      return true;
    }
    
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }
  
  return false;
}