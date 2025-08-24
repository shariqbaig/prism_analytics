# E2E Tests for PRISM Analytics

This directory contains comprehensive end-to-end tests for the PRISM Analytics file upload and IndexedDB data persistence functionality.

## Overview

The E2E test suite verifies that uploaded Excel files (inventory and OSR) are correctly processed, saved to IndexedDB database, and can be retrieved through the data viewer interface.

## Test Structure

### Test Categories

1. **Basic File Upload** (`file-upload-basic.spec.ts`)
   - File upload interface functionality
   - Successful file processing
   - UI feedback and notifications
   - Database initialization

2. **Database Persistence** (`database-persistence.spec.ts`)
   - IndexedDB data storage verification
   - File metadata persistence
   - Processed data integrity
   - Multi-file handling
   - Data persistence across page refreshes

3. **Data Viewer Integration** (`data-viewer-integration.spec.ts`)
   - Integration between upload and viewer
   - Data display functionality
   - File type and sheet selection
   - Navigation and state management

4. **Error Handling** (`error-handling.spec.ts`)
   - Invalid file format handling
   - Missing column validation
   - Corrupted file recovery
   - Network error resilience
   - User-friendly error messages

### Utilities

- **Database Helpers** (`utils/database-helpers.ts`)
  - IndexedDB interaction functions
  - Database verification utilities
  - Data extraction and validation

- **File Generators** (`utils/file-generators.ts`)
  - Programmatic Excel file creation
  - Test data generation
  - Various file size and complexity scenarios

- **Test Fixtures** (`fixtures/test-files.ts`)
  - Consistent test file management
  - Automatic cleanup
  - File path handling

## Setup and Installation

### Prerequisites

- Node.js 18+
- Parent application running on `http://localhost:5173`

### Installation

```bash
cd e2e-tests
npm install
```

### Install Playwright Browsers

```bash
npx playwright install
```

## Running Tests

### All Tests

```bash
npm test
```

### Headed Mode (with browser UI)

```bash
npm run test:headed
```

### Interactive Mode

```bash
npm run test:ui
```

### Debug Mode

```bash
npm run test:debug
```

### Specific Test File

```bash
npx playwright test file-upload-basic.spec.ts
```

### Specific Test

```bash
npx playwright test --grep "should upload inventory file successfully"
```

## Test Files Generated

The test suite automatically generates these test files:

### Inventory Test File
- **Material**: MAT-1001, MAT-1002, MAT-1003
- **Columns**: Material, Material Description, Plant, Storage Location, Batch, Stock, Base Unit of Measure, Currency, Total Stock Value
- **Rows**: 3 test items

### OSR Test File
- **Main Sheet**: OSR Main Sheet HC
  - **Material**: MAT-2001, MAT-2002, MAT-2003
  - **Columns**: Material, Material Description, Status, Avg Unit Price (Rs), Total OSR (Qty), Total OSR Value PKR, Residual (Qnty) >26 weeks
- **Summary Sheet**: OSR Summary
  - **Columns**: Summary Category, Total Book Stock, Over Stock, Excess Stock %

### Invalid Test File
- Missing required columns for testing error handling

### Large Test File
- 500 rows of generated inventory data for performance testing

## Database Verification

The tests verify the following IndexedDB structure:

### Database Name
`PrismAnalytics`

### Object Stores
- `fileMetadata`: File upload metadata
- `processedData`: Processed Excel data
- `applicationState`: Application state
- `userPreferences`: User settings

### Verified Data Structure

#### File Metadata
```typescript
{
  id: number;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: 'inventory' | 'osr';
  fileHash: string;
  uploadedAt: Date;
  isActive: boolean;
}
```

#### Processed Data
```typescript
{
  id: number;
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
```

## Test Scenarios Covered

### Happy Path Scenarios
- ✅ Upload valid inventory Excel file
- ✅ Upload valid OSR Excel file with multiple sheets
- ✅ Process multiple files sequentially
- ✅ Display processed data in data viewer
- ✅ Navigate between different data views
- ✅ Maintain data persistence across page refreshes

### Error Scenarios
- ✅ Handle invalid file formats gracefully
- ✅ Validate required columns and show helpful errors
- ✅ Handle corrupted Excel files
- ✅ Manage empty files appropriately
- ✅ Recover from processing errors
- ✅ Display user-friendly error messages

### Performance Scenarios
- ✅ Process large files (500+ rows)
- ✅ Handle concurrent upload attempts
- ✅ Maintain responsive UI during processing

### Data Integrity Scenarios
- ✅ Verify exact data preservation in database
- ✅ Validate file metadata accuracy
- ✅ Check duplicate file handling
- ✅ Ensure proper data type preservation
- ✅ Verify sheet structure and content

## Continuous Integration

The tests are configured for CI environments:

- Retry failed tests up to 2 times
- Use single worker in CI mode
- Generate HTML reports
- Take screenshots on failure
- Capture execution traces on retry

## Debugging Tests

### View Test Results
```bash
npx playwright show-report
```

### Debug Specific Test
```bash
npx playwright test --debug --grep "specific test name"
```

### Inspect Test Files
Generated test files are temporarily stored in `e2e-tests/temp/` during test execution.

## Contributing

When adding new tests:

1. Follow the existing test structure and naming conventions
2. Use the provided utilities for database interaction
3. Clean up test data in `beforeEach` hooks
4. Add meaningful assertions with clear error messages
5. Include both positive and negative test scenarios
6. Update this README with any new test categories

## Maintenance

### Regular Tasks
- Update Playwright version periodically
- Review and update test data as application evolves
- Monitor test execution time and optimize slow tests
- Update browser versions used for testing

### Troubleshooting
- Ensure parent application is running on port 5173
- Check that IndexedDB is supported in test browser
- Verify test file generation is working correctly
- Confirm database cleanup is happening between tests