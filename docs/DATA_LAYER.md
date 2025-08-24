# IndexedDB Data Layer Documentation

## Overview

The PRISM Analytics application now includes a comprehensive offline data storage solution built with Dexie.js (a wrapper around IndexedDB). This data layer provides persistent storage for processed Excel files, user preferences, and application state.

## Architecture

### Database Schema

The database consists of 7 main tables:

1. **fileMetadata** - File upload metadata and status tracking
2. **processedFiles** - Processed file data and structure  
3. **processedSheets** - Individual sheet data and content
4. **processingStats** - Performance and processing statistics
5. **userPreferences** - User settings and configuration
6. **dataVersions** - Version history and change tracking
7. **applicationState** - Current app state and active files

### Key Components

#### 1. Database Layer (`/src/lib/database.ts`)
- **PrismDatabase class** - Main database interface extending Dexie
- **Schema management** - Automatic versioning and migrations
- **Relationship management** - Foreign key relationships between tables
- **Transaction safety** - Atomic operations for data consistency

#### 2. Service Layer (`/src/services/dataService.ts`)  
- **DataService class** - High-level API for data operations
- **Singleton pattern** - Single instance across the application
- **Error handling** - Graceful error recovery and logging
- **Storage quotas** - Monitor and manage browser storage limits

#### 3. React Integration (`/src/hooks/useDataStorage.ts`)
- **useDataStorage hook** - React integration for components
- **State management** - Reactive updates for UI components
- **Loading states** - Progress tracking for async operations
- **Error reporting** - User-friendly error messages

## Core Features

### File Management
- **Upload Processing** - Store processed Excel file data
- **Active File Switching** - Switch between uploaded files
- **File Deduplication** - Prevent duplicate file uploads
- **File History** - Track all uploaded files with metadata
- **File Deletion** - Clean removal of files and related data

### Data Versioning
- **Version Creation** - Create snapshots of data changes
- **Version History** - Track all versions for each file
- **Change Tracking** - Record what changed in each version
- **Version Restoration** - Roll back to previous versions

### Preferences Management  
- **User Settings** - Store user preferences persistently
- **Type Safety** - Generic types for strongly typed preferences
- **Default Values** - Fallback to defaults when preferences missing

### Offline Support
- **Complete Offline** - No server required for data operations
- **IndexedDB Storage** - Browser-native persistent storage
- **Storage Quotas** - Monitor browser storage limits
- **Data Export** - Export data for backup or transfer

## Usage Examples

### Basic File Operations

```typescript
import { useDataStorage } from '@/hooks/useDataStorage';

function MyComponent() {
  const { saveFile, getActiveFileData, switchActiveFile } = useDataStorage();
  
  // Save processed file data
  const handleFileSave = async (file: File, processedData: ProcessedFileData) => {
    const fileId = await saveFile(file, processedData, 'inventory');
    if (fileId) {
      console.log('File saved with ID:', fileId);
    }
  };
  
  // Get current active file data
  const handleGetData = async () => {
    const data = await getActiveFileData('inventory');
    if (data) {
      console.log('Active file:', data.fileName);
    }
  };
  
  // Switch to different file
  const handleSwitch = async (fileId: number) => {
    const success = await switchActiveFile(fileId);
    if (success) {
      console.log('Switched to file:', fileId);
    }
  };
}
```

### User Preferences

```typescript
import { useDataStorage } from '@/hooks/useDataStorage';

function SettingsComponent() {
  const { setPreference, getPreference } = useDataStorage();
  
  // Save user theme preference
  const saveTheme = async (theme: string) => {
    await setPreference('theme', theme);
  };
  
  // Load theme preference with default
  const loadTheme = async () => {
    const theme = await getPreference<string>('theme', 'light');
    return theme;
  };
}
```

### Version Management

```typescript
import { useDataStorage } from '@/hooks/useDataStorage';

function VersioningComponent() {
  const { createDataVersion, getDataVersions } = useDataStorage();
  
  // Create new version
  const createVersion = async (fileId: number) => {
    const versionId = await createDataVersion(
      fileId,
      'Updated inventory data',
      ['Added new items', 'Updated prices']
    );
    console.log('Created version:', versionId);
  };
  
  // Get version history
  const getVersions = async (fileId: number) => {
    const versions = await getDataVersions(fileId);
    console.log('Version history:', versions);
  };
}
```

## Database Schema Details

### FileMetadata Table
```typescript
interface FileMetadata {
  id?: number;                    // Primary key
  fileName: string;               // Original file name
  fileSize: number;               // File size in bytes
  uploadedAt: Date;               // Upload timestamp
  processedAt: Date;              // Processing completion time
  fileHash: string;               // SHA-256 hash for deduplication
  isActive: boolean;              // Currently active file flag
  fileType: 'inventory' | 'osr';  // File type classification
  version: number;                // Schema version
  description?: string;           // Optional description
}
```

### ProcessedFileRecord Table
```typescript
interface ProcessedFileRecord {
  id?: number;                           // Primary key
  fileMetadataId: number;                // Foreign key to FileMetadata
  fileName: string;                      // File name
  fileSize: number;                      // File size
  processedAt: Date;                     // Processing time
  sheets: ProcessedSheetRecord[];        // Related sheets
  detectedDataSources: ('inventory' | 'osr')[]; // Data source types
  processingStats: ProcessingStatsRecord; // Processing statistics
  version: number;                        // Schema version
}
```

### ProcessedSheetRecord Table
```typescript
interface ProcessedSheetRecord {
  id?: number;                      // Primary key
  fileRecordId: number;             // Foreign key to ProcessedFileRecord
  name: string;                     // Sheet name
  type: 'inventory' | 'osr';        // Sheet type
  rowCount: number;                 // Number of rows
  columnCount: number;              // Number of columns
  columns: string[];                // Column names
  data: Record<string, unknown>[]; // Actual data rows
  warnings: string[];               // Processing warnings
  processedAt: Date;                // Processing timestamp
}
```

## Performance Considerations

### Indexing Strategy
- Primary keys auto-indexed for fast lookups
- Foreign keys indexed for relationship queries
- isActive field indexed for quick active file queries
- fileHash indexed for deduplication checks

### Memory Management
- Lazy loading of sheet data to reduce memory usage
- Batch operations for bulk data processing  
- Cleanup of temporary data after processing
- Storage quota monitoring to prevent overflow

### Query Optimization
- Use compound indexes for multi-column queries
- Batch database operations to reduce transaction overhead
- Cache frequently accessed data in memory
- Use transactions for related operations

## Testing

The data layer includes comprehensive test coverage:

- **Unit Tests** - Individual component testing
- **Integration Tests** - End-to-end workflow testing  
- **Mock Implementation** - Isolated testing environment
- **Performance Tests** - Storage and retrieval benchmarks

### Running Tests
```bash
# Run all tests
npm test

# Run specific test files
npm test database.test.ts
npm test dataService.test.ts
```

## Migration Strategy

Future schema changes will be handled through Dexie's migration system:

```typescript
// Example migration for version 2
this.version(2).stores({
  // Updated schema
}).upgrade(tx => {
  // Migration logic
});
```

## Browser Compatibility

- **Chrome/Edge** - Full IndexedDB support
- **Firefox** - Full IndexedDB support  
- **Safari** - Full IndexedDB support
- **Mobile browsers** - Generally supported

## Storage Limits

- **Chrome** - ~60% of available disk space
- **Firefox** - ~60% of available disk space
- **Safari** - ~1GB initially, can request more
- **Storage quota API** - Monitor usage and request increases

## Security Considerations

- **No sensitive data storage** - Only processed business data
- **Client-side only** - No server synchronization
- **Browser security model** - Protected by same-origin policy
- **No encryption** - Data stored in plain text (add encryption if needed)

## Future Enhancements

- **Data encryption** - Encrypt sensitive data at rest
- **Cloud synchronization** - Sync data across devices
- **Data compression** - Reduce storage footprint
- **Background sync** - Sync when connectivity restored
- **Schema migrations** - Automated database upgrades