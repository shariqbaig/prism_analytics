import Dexie, { type Table } from 'dexie';
import type {
  FileMetadata,
  ProcessedFileRecord,
  ProcessedSheetRecord,
  ProcessingStatsRecord,
  UserPreferences,
  DataVersion,
  ApplicationState,
  DatabaseConfig,
  DataExportOptions
} from '@/types/database';
import type { ProcessedFileData } from '@/types/fileProcessing';

export class PrismDatabase extends Dexie {
  fileMetadata!: Table<FileMetadata, number>;
  processedFiles!: Table<ProcessedFileRecord, number>;
  processedSheets!: Table<ProcessedSheetRecord, number>;
  processingStats!: Table<ProcessingStatsRecord, number>;
  userPreferences!: Table<UserPreferences, number>;
  dataVersions!: Table<DataVersion, number>;
  applicationState!: Table<ApplicationState, number>;

  constructor(config: DatabaseConfig = { name: 'PrismAnalytics', version: 1 }) {
    super(config.name);

    // Database schema definition
    this.version(config.version).stores({
      fileMetadata: '++id, fileName, fileSize, uploadedAt, processedAt, fileHash, isActive, fileType, version, description',
      processedFiles: '++id, fileMetadataId, fileName, fileSize, processedAt, version, detectedDataSources',
      processedSheets: '++id, fileRecordId, name, type, rowCount, columnCount, processedAt',
      processingStats: '++id, fileRecordId, totalRows, totalColumns, processingTime, sheetsProcessed, validationErrors, warnings',
      userPreferences: '++id, key, value, updatedAt, version',
      dataVersions: '++id, fileMetadataId, version, createdAt, isActive',
      applicationState: '++id, activeFileId, lastActiveAt, version'
    });

    // Add hooks for automatic timestamps and version management
    this.fileMetadata.hook('creating', (_primKey, obj) => {
      obj.uploadedAt = obj.uploadedAt || new Date();
      obj.processedAt = obj.processedAt || new Date();
      obj.version = obj.version || 1;
    });

    this.userPreferences.hook('creating', (_primKey, obj) => {
      obj.updatedAt = new Date();
      obj.version = obj.version || 1;
    });

    this.dataVersions.hook('creating', (_primKey, obj) => {
      obj.createdAt = new Date();
    });
  }

  // File Management Methods
  async saveProcessedFile(data: ProcessedFileData, fileHash: string, fileType: 'inventory' | 'osr'): Promise<number> {

    // Ensure database is open
    if (!this.isOpen()) {
      console.log('[DATABASE] Database not open, opening now...');
      await this.open();
      console.log('[DATABASE] Database opened');
    }

    return this.transaction('rw', [this.fileMetadata, this.processedFiles, this.processedSheets, this.processingStats, this.dataVersions], async () => {
      
      // IMPORTANT: Clear existing data OF THE SAME TYPE (one file per type)
      // This allows one inventory file and one OSR file
      console.log(`[DATABASE] Clearing existing ${fileType} data before saving new file...`);
      
      // Get existing files of the same type to delete
      const existingFiles = await this.fileMetadata.where('fileType').equals(fileType).toArray();
      for (const file of existingFiles) {
        if (file.id) {
          // Delete all related data for this file
          const processedFiles = await this.processedFiles.where('fileMetadataId').equals(file.id).toArray();
          for (const pf of processedFiles) {
            if (pf.id) {
              await this.processedSheets.where('fileRecordId').equals(pf.id).delete();
              await this.processingStats.where('fileRecordId').equals(pf.id).delete();
            }
          }
          await this.processedFiles.where('fileMetadataId').equals(file.id).delete();
          await this.dataVersions.where('fileMetadataId').equals(file.id).delete();
        }
      }
      
      // Delete file metadata of the same type
      await this.fileMetadata.where('fileType').equals(fileType).delete();
      console.log(`[DATABASE] Existing ${fileType} data cleared`);

      // Create file metadata
      const metadataId = await this.fileMetadata.add({
        fileName: data.fileName,
        fileSize: data.fileSize,
        uploadedAt: new Date().toISOString(),
        processedAt: data.processedAt instanceof Date ? data.processedAt.toISOString() : data.processedAt,
        fileHash,
        isActive: true,
        fileType,
        version: 1
      });
      
      console.log('[DATABASE] Created file metadata with ID:', metadataId, 'fileType:', fileType, 'isActive: true');

      // Create processed file record
      const fileRecordId = await this.processedFiles.add({
        fileMetadataId: metadataId,
        fileName: data.fileName,
        fileSize: data.fileSize,
        processedAt: data.processedAt instanceof Date ? data.processedAt.toISOString() : data.processedAt,
        sheets: [], // Will be populated separately
        detectedDataSources: data.detectedDataSources,
        processingStats: {} as ProcessingStatsRecord,
        version: 1
      });

      // Save sheets
      for (const sheet of data.sheets) {
        const sheetId = await this.processedSheets.add({
          fileRecordId,
          name: sheet.name,
          type: sheet.type,
          rowCount: sheet.rowCount,
          columnCount: sheet.columnCount,
          columns: sheet.columns,
          data: sheet.data,
          warnings: sheet.warnings || [],
          processedAt: data.processedAt instanceof Date ? data.processedAt.toISOString() : data.processedAt
        });
      }

      // Save processing stats
      const totalRows = data.sheets.reduce((sum, sheet) => sum + sheet.rowCount, 0);
      const totalColumns = data.sheets.reduce((max, sheet) => Math.max(max, sheet.columnCount), 0);
      
      const statsId = await this.processingStats.add({
        fileRecordId,
        totalRows,
        totalColumns,
        processingTime: 0, // Will be updated if available
        sheetsProcessed: data.sheets.length,
        validationErrors: 0,
        warnings: data.sheets.reduce((sum, sheet) => sum + (sheet.warnings?.length || 0), 0)
      });

      // Create initial data version
      const versionId = await this.dataVersions.add({
        fileMetadataId: metadataId,
        version: 1,
        createdAt: new Date().toISOString(),
        description: `Initial version of ${data.fileName}`,
        changes: ['File uploaded and processed'],
        isActive: true
      });
      
      console.log('[DATABASE] Transaction complete! File saved successfully with metadataId:', metadataId);
      
      // Verify the file was saved
      const savedFile = await this.fileMetadata.get(metadataId);
      console.log('[DATABASE] Verification - saved file:', savedFile);

      return metadataId;
    }).catch(error => {
      console.error('[DATABASE] saveProcessedFile transaction failed:', error);
      throw error;
    });
  }

  async getActiveFile(fileType?: 'inventory' | 'osr'): Promise<FileMetadata | undefined> {
    // Ensure database is open
    if (!this.isOpen()) {
      await this.open();
    }
    
    console.log('[DATABASE] getActiveFile called with fileType:', fileType);
    
    try {
      // First, let's see all files in the database
      const allFiles = await this.fileMetadata.toArray();
      console.log('[DATABASE] All files in database:', allFiles);
      
      const query = this.fileMetadata.where('isActive').equals(true);
      
      if (fileType) {
        const result = await query.and(file => file.fileType === fileType).first();
        console.log('[DATABASE] getActiveFile result for type', fileType, ':', result);
        return result;
      }
      
      const result = await query.first();
      console.log('[DATABASE] getActiveFile result (no type filter):', result);
      return result;
    } catch (error) {
      console.log('[DATABASE] getActiveFile query failed, using fallback:', error);
      // Fallback to simple filter if indexing fails
      const allFiles = await this.fileMetadata.toArray();
      const activeFiles = allFiles.filter(f => f.isActive);
      
      if (fileType) {
        const result = activeFiles.find(f => f.fileType === fileType);
        console.log('[DATABASE] getActiveFile fallback result for type', fileType, ':', result);
        return result;
      }
      
      const result = activeFiles[0];
      console.log('[DATABASE] getActiveFile fallback result (no type filter):', result);
      return result;
    }
  }

  async getActiveFileData(fileType?: 'inventory' | 'osr'): Promise<ProcessedFileData | null> {
    try {
      const fileMetadata = await this.getActiveFile(fileType);
      if (!fileMetadata?.id) return null;

      const processedFile = await this.processedFiles.where('fileMetadataId').equals(fileMetadata.id).first();
      if (!processedFile?.id) return null;

      const sheets = await this.processedSheets.where('fileRecordId').equals(processedFile.id).toArray();

    return {
      fileName: processedFile.fileName,
      fileSize: processedFile.fileSize,
      processedAt: processedFile.processedAt,
      sheets: sheets.map(sheet => ({
        name: sheet.name,
        type: sheet.type,
        rowCount: sheet.rowCount,
        columnCount: sheet.columnCount,
        columns: sheet.columns,
        data: sheet.data,
        warnings: sheet.warnings
      })),
      detectedDataSources: processedFile.detectedDataSources
    };
    } catch (error) {
      console.error('Failed to get active file data:', error);
      return null;
    }
  }

  async switchActiveFile(fileId: number): Promise<boolean> {
    return this.transaction('rw', this.fileMetadata, this.applicationState, async () => {
      const targetFile = await this.fileMetadata.get(fileId);
      if (!targetFile) return false;

      // Deactivate all files of the same type
      await this.fileMetadata.where('fileType').equals(targetFile.fileType).modify({ isActive: false });
      
      // Activate target file
      await this.fileMetadata.update(fileId, { isActive: true });

      // Update application state
      await this.updateApplicationState({ activeFileId: fileId });

      return true;
    });
  }

  async getFileHistory(fileType?: 'inventory' | 'osr'): Promise<FileMetadata[]> {
    const query = this.fileMetadata.orderBy('processedAt').reverse();
    
    if (fileType) {
      return query.filter(file => file.fileType === fileType).toArray();
    }
    
    return query.toArray();
  }

  // Version Management
  async createDataVersion(fileId: number, description: string, changes: string[]): Promise<number> {
    return this.transaction('rw', this.dataVersions, async () => {
      // Deactivate current active version for this file
      await this.dataVersions.where('fileMetadataId').equals(fileId).modify({ isActive: false });

      // Get next version number
      const lastVersion = await this.dataVersions
        .where('fileMetadataId')
        .equals(fileId)
        .last();
      
      const nextVersion = (lastVersion?.version || 0) + 1;

      // Create new version
      return this.dataVersions.add({
        fileMetadataId: fileId,
        version: nextVersion,
        createdAt: new Date().toISOString(),
        description,
        changes,
        isActive: true
      });
    });
  }

  async getDataVersions(fileId: number): Promise<DataVersion[]> {
    return this.dataVersions
      .where('fileMetadataId')
      .equals(fileId)
      .orderBy('version')
      .reverse()
      .toArray();
  }

  // User Preferences
  async setPreference(key: string, value: string | number | boolean | object): Promise<void> {
    const existing = await this.userPreferences.where('key').equals(key).first();
    
    if (existing?.id) {
      await this.userPreferences.update(existing.id, { 
        value, 
        updatedAt: new Date(),
        version: (existing.version || 1) + 1
      });
    } else {
      await this.userPreferences.add({
        key,
        value,
        updatedAt: new Date(),
        version: 1
      });
    }
  }

  async getPreference<T = unknown>(key: string, defaultValue?: T): Promise<T | undefined> {
    const pref = await this.userPreferences.where('key').equals(key).first();
    return pref ? (pref.value as T) : defaultValue;
  }

  async getAllPreferences(): Promise<Record<string, unknown>> {
    const prefs = await this.userPreferences.toArray();
    const result: Record<string, unknown> = {};
    
    prefs.forEach(pref => {
      result[pref.key] = pref.value;
    });
    
    return result;
  }

  // Application State
  async updateApplicationState(updates: Partial<Omit<ApplicationState, 'id'>>): Promise<void> {
    const existing = await this.applicationState.limit(1).first();
    
    if (existing?.id) {
      await this.applicationState.update(existing.id, {
        ...updates,
        lastActiveAt: new Date(),
        version: (existing.version || 1) + 1
      });
    } else {
      await this.applicationState.add({
        ...updates,
        lastActiveAt: new Date(),
        preferences: updates.preferences || {},
        version: 1
      });
    }
  }

  async getApplicationState(): Promise<ApplicationState | undefined> {
    return this.applicationState.limit(1).first();
  }

  // Database Management
  async clearAllData(): Promise<void> {
    return this.transaction('rw', [
      this.fileMetadata,
      this.processedFiles,
      this.processedSheets,
      this.processingStats,
      this.userPreferences,
      this.dataVersions,
      this.applicationState
    ], async () => {
      await Promise.all([
        this.fileMetadata.clear(),
        this.processedFiles.clear(),
        this.processedSheets.clear(),
        this.processingStats.clear(),
        this.userPreferences.clear(),
        this.dataVersions.clear(),
        this.applicationState.clear()
      ]);
    });
  }

  async deleteFile(fileId: number): Promise<boolean> {
    return this.transaction('rw', [
      this.fileMetadata,
      this.processedFiles,
      this.processedSheets,
      this.processingStats,
      this.dataVersions
    ], async () => {
      const file = await this.fileMetadata.get(fileId);
      if (!file) return false;

      // Find processed file record
      const processedFile = await this.processedFiles.where('fileMetadataId').equals(fileId).first();
      
      if (processedFile?.id) {
        // Delete related sheets
        await this.processedSheets.where('fileRecordId').equals(processedFile.id).delete();
        // Delete processing stats
        await this.processingStats.where('fileRecordId').equals(processedFile.id).delete();
        // Delete processed file record
        await this.processedFiles.delete(processedFile.id);
      }

      // Delete versions
      await this.dataVersions.where('fileMetadataId').equals(fileId).delete();
      
      // Delete file metadata
      await this.fileMetadata.delete(fileId);

      return true;
    });
  }

  async exportData(options: DataExportOptions): Promise<string> {
    const files = await this.fileMetadata.toArray();
    const result: { exportDate: string; files: unknown[] } = {
      exportDate: new Date().toISOString(),
      files: []
    };

    for (const file of files) {
      const fileData: { metadata: unknown; sheets: unknown[]; processingStats?: unknown } = {
        metadata: options.includeMetadata ? file : { fileName: file.fileName, fileType: file.fileType },
        sheets: []
      };

      if (file.id) {
        const processedFile = await this.processedFiles.where('fileMetadataId').equals(file.id).first();
        if (processedFile?.id) {
          const sheets = await this.processedSheets.where('fileRecordId').equals(processedFile.id).toArray();
          fileData.sheets = sheets;

          if (options.includeProcessingStats) {
            const stats = await this.processingStats.where('fileRecordId').equals(processedFile.id).first();
            fileData.processingStats = stats;
          }
        }
      }

      result.files.push(fileData);
    }

    return JSON.stringify(result, null, 2);
  }

  // Database statistics
  async getDatabaseStats(): Promise<{
    totalFiles: number;
    totalSheets: number;
    totalDataRows: number;
    totalStorageSize: number;
    lastActivity: Date | null;
  }> {
    const [files, sheets, appState] = await Promise.all([
      this.fileMetadata.toArray(),
      this.processedSheets.toArray(),
      this.getApplicationState()
    ]);

    const totalDataRows = sheets.reduce((sum, sheet) => sum + sheet.rowCount, 0);
    const totalStorageSize = files.reduce((sum, file) => sum + file.fileSize, 0);

    return {
      totalFiles: files.length,
      totalSheets: sheets.length,
      totalDataRows,
      totalStorageSize,
      lastActivity: appState?.lastActiveAt || null
    };
  }
}

// Singleton instance
export const db = new PrismDatabase();

// Database initialization and error handling
export async function initializeDatabase(): Promise<boolean> {
  try {
    await db.open();
    
    // Ensure application state exists
    const appState = await db.getApplicationState();
    if (!appState) {
      await db.updateApplicationState({
        preferences: {},
        lastActiveAt: new Date()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}

// Utility function to generate file hash
export function generateFileHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        resolve(hashHex);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file.slice(0, 8192)); // Hash first 8KB for performance
  });
}