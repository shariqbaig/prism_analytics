# Data Viewer Page Documentation

## Overview

The Data Viewer page provides users with a comprehensive interface to view, search, and navigate through their uploaded Excel data. This feature allows users to verify that their data was correctly processed and stored in the system.

## Features

### File Type Selection
- **Dropdown selector** for choosing between Inventory and OSR file types
- **Dynamic sheet loading** based on selected file type
- **Automatic sheet detection** from uploaded files

### Sheet Selection
- **Dynamic sheet dropdown** populated based on available sheets
- **Sheet metadata display** showing row and column counts
- **Auto-selection** of first available sheet

### Data Table
- **Responsive design** with horizontal scrolling for large datasets
- **Clean table layout** with proper header and row styling
- **Column-based display** showing all available columns from the sheet
- **Hover effects** for better user interaction

### Search Functionality
- **Real-time search** across all columns
- **Case-insensitive matching** for better user experience
- **Instant filtering** with immediate results
- **Search reset** when changing file types or sheets

### Pagination System
- **Configurable records per page** (10, 15, 25, 50 options)
- **Default 15 records** per page as requested
- **Smart pagination controls** with page numbers
- **Previous/Next navigation** buttons
- **Page information display** showing current page and total pages
- **Record range display** (e.g., "Showing 1-15 of 150 records")

### Loading & Empty States
- **Loading spinners** during data fetching operations
- **Empty state messages** when no data is available
- **No results state** when search returns no matches
- **Informative messaging** to guide user actions

## Technical Implementation

### Component Structure
```typescript
DataViewer
├── File Type Selection (FileTypeSelector component)
├── Sheet Selection (Native select dropdown)
├── Search Input (with Search icon)
├── Records Per Page Selector
├── Data Table (Native table element)
├── Pagination Controls
└── Loading/Empty State Components
```

### State Management
- **selectedFileType**: Current file type selection
- **selectedSheet**: Currently selected sheet name
- **searchQuery**: Current search term
- **currentPage**: Active page number
- **recordsPerPage**: Number of records to display per page
- **isLoading**: Loading state indicator
- **availableSheets**: Available sheets for current file type
- **currentSheetData**: Data for the currently selected sheet

### Data Flow
1. User selects file type → Fetch available sheets
2. User selects sheet → Fetch sheet data
3. User enters search query → Filter data client-side
4. User changes page → Update displayed records
5. User changes records per page → Recalculate pagination

### Integration Points

#### useDataStorage Hook
- **getActiveFileData()** - Retrieves processed file data
- **state.hasStoredData** - Checks if any data exists
- **Error handling** for failed data retrieval

#### FileTypeSelector Component
- **Reused component** from upload page
- **Consistent UI/UX** across the application
- **Type safety** with FileType union type

## User Interface

### Layout Structure
- **Header section** with page title and description
- **Controls section** with file type, sheet, and search controls
- **Data section** with table and pagination
- **Responsive design** for mobile and desktop

### Visual Design
- **Consistent styling** with existing application theme
- **shadcn/ui components** for form controls
- **Lucide icons** for visual enhancement
- **Hover states** for interactive elements

### Color Scheme
- **Blue accents** for primary actions and highlights
- **Muted colors** for secondary text and borders
- **Gray backgrounds** for table headers
- **Hover effects** for better interaction feedback

## Code Structure

### Main Component (`/src/pages/DataViewer.tsx`)
```typescript
// State management with React hooks
const [selectedFileType, setSelectedFileType] = useState<FileType>('inventory');
const [selectedSheet, setSelectedSheet] = useState<string>('');
const [searchQuery, setSearchQuery] = useState('');
const [currentPage, setCurrentPage] = useState(1);

// Data fetching and processing
const fetchAvailableSheets = useCallback(async (fileType: FileType) => {
  // Fetch and process available sheets
});

const fetchSheetData = useCallback(async (fileType: FileType, sheetName: string) => {
  // Fetch specific sheet data
});

// Data filtering and pagination
const { filteredData, paginationInfo } = useMemo(() => {
  // Client-side filtering and pagination logic
}, [currentSheetData, searchQuery, currentPage, recordsPerPage]);
```

### Navigation Integration (`/src/lib/router.tsx`)
- **Lazy loaded component** for code splitting
- **Route path**: `/data-viewer`
- **Suspense wrapper** with loading spinner

### Sidebar Integration (`/src/components/layout/Sidebar.tsx`)
- **Eye icon** for the navigation menu
- **Menu item**: "Data Viewer"
- **Positioned** between Upload and Inventory Analysis

## Performance Considerations

### Client-Side Processing
- **Local filtering** for fast search results
- **Local pagination** for smooth navigation
- **Minimal API calls** by caching sheet data

### Memory Management
- **Lazy loading** of sheet data
- **Efficient filtering** with native JavaScript methods
- **Minimal re-renders** with proper dependency arrays

### Loading Optimization
- **Progressive loading** with loading states
- **Error boundaries** to prevent crashes
- **Graceful fallbacks** for missing data

## User Experience Features

### Responsive Design
- **Mobile-friendly** table with horizontal scrolling
- **Flexible layout** that adapts to screen size
- **Touch-friendly** pagination controls

### Accessibility
- **Keyboard navigation** support
- **Screen reader friendly** labels and descriptions
- **High contrast** colors for better visibility
- **Focus indicators** for interactive elements

### Error Handling
- **Graceful degradation** when data is unavailable
- **Clear error messages** for user understanding
- **Recovery suggestions** when appropriate

## Usage Examples

### Viewing Inventory Data
1. Navigate to Data Viewer page
2. Select "Inventory" from file type dropdown
3. Choose specific sheet (e.g., "FG value")
4. Browse through paginated data
5. Use search to find specific items

### Searching OSR Data
1. Select "OSR" file type
2. Choose "OSR Main Sheet HC"
3. Enter search term in search box
4. View filtered results
5. Navigate through search results with pagination

### Changing Page Size
1. Select different records per page option
2. Pagination automatically recalculates
3. Table updates to show new page size
4. Page numbers adjust accordingly

## Future Enhancements

### Planned Features
- **Column sorting** for better data organization
- **Export filtered data** to CSV/Excel
- **Column filtering** for specific column searches
- **Data visualization** integration
- **Bookmark specific views** for quick access

### Performance Optimizations
- **Virtual scrolling** for very large datasets
- **Server-side pagination** for better performance
- **Caching strategies** for frequently accessed data
- **Background data loading** for improved UX

## Browser Compatibility
- **Modern browsers** with ES6+ support
- **Chrome, Firefox, Safari, Edge** latest versions
- **Mobile browsers** with touch support
- **Progressive enhancement** for older browsers

## Testing Strategy
- **Unit tests** for data filtering and pagination logic
- **Integration tests** for component interactions
- **E2E tests** for complete user workflows
- **Performance testing** for large datasets

## Related Documentation
- [Data Layer Documentation](./DATA_LAYER.md) - Database and storage implementation
- [FileTypeSelector Component](../src/components/FileTypeSelector.tsx) - Reused component
- [useDataStorage Hook](../src/hooks/useDataStorage.ts) - Data access layer