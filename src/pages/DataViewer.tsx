import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Database, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { FileTypeSelector, type FileType } from '@/components/FileTypeSelector';
import { useDataStorage } from '@/hooks/useDataStorage';
import type { ProcessedSheet } from '@/types/fileProcessing';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  recordsPerPage: number;
  startRecord: number;
  endRecord: number;
}

interface SheetOption {
  name: string;
  type: 'inventory' | 'osr';
  rowCount: number;
  columnCount: number;
}

const DataViewer: React.FC = () => {
  const { getActiveFileData, state, getDetectedDataSources } = useDataStorage();
  
  // State management
  const [availableFileTypes, setAvailableFileTypes] = useState<FileType[]>([]);
  const [selectedFileType, setSelectedFileType] = useState<FileType | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [availableSheets, setAvailableSheets] = useState<SheetOption[]>([]);
  const [currentSheetData, setCurrentSheetData] = useState<ProcessedSheet | null>(null);

  // Fetch available sheets when file type changes
  const fetchAvailableSheets = useCallback(async (fileType: FileType) => {
    setIsLoading(true);
    try {
      const fileData = await getActiveFileData(fileType);
      if (fileData?.sheets) {
        const sheets = fileData.sheets
          .filter(sheet => sheet.type === fileType)
          .map(sheet => ({
            name: sheet.name,
            type: sheet.type,
            rowCount: sheet.rowCount,
            columnCount: sheet.columnCount
          }));
        setAvailableSheets(sheets);
        
        // Auto-select first sheet if available
        if (sheets.length > 0 && !selectedSheet) {
          setSelectedSheet(sheets[0].name);
        }
      } else {
        setAvailableSheets([]);
        setSelectedSheet('');
      }
    } catch (error) {
      console.error('Failed to fetch sheets:', error);
      setAvailableSheets([]);
    } finally {
      setIsLoading(false);
    }
  }, [getActiveFileData, selectedSheet]);

  // Fetch current sheet data
  const fetchSheetData = useCallback(async (fileType: FileType, sheetName: string) => {
    if (!sheetName) return;
    
    setIsLoading(true);
    try {
      const fileData = await getActiveFileData(fileType);
      const sheet = fileData?.sheets.find(s => s.name === sheetName);
      setCurrentSheetData(sheet || null);
    } catch (error) {
      console.error('Failed to fetch sheet data:', error);
      setCurrentSheetData(null);
    } finally {
      setIsLoading(false);
    }
  }, [getActiveFileData]);

  // Effect to check available file types on mount
  useEffect(() => {
    const checkAvailableFileTypes = async () => {
      const sources = await getDetectedDataSources();
      setAvailableFileTypes(sources as FileType[]);
      
      // Auto-select first available file type
      if (sources.length > 0 && !selectedFileType) {
        setSelectedFileType(sources[0] as FileType);
      }
    };
    
    checkAvailableFileTypes();
  }, [getDetectedDataSources, selectedFileType, state]);

  // Effect to fetch sheets when file type changes
  useEffect(() => {
    if (selectedFileType) {
      fetchAvailableSheets(selectedFileType);
    }
  }, [selectedFileType, fetchAvailableSheets]);

  // Effect to fetch sheet data when selection changes
  useEffect(() => {
    if (selectedSheet) {
      if (selectedFileType) {
        fetchSheetData(selectedFileType, selectedSheet);
      }
      setCurrentPage(1); // Reset to first page when changing sheets
    }
  }, [selectedFileType, selectedSheet, fetchSheetData]);

  // Filtered and paginated data
  const { filteredData, paginationInfo } = useMemo(() => {
    if (!currentSheetData?.data) {
      return {
        filteredData: [],
        paginationInfo: {
          currentPage: 1,
          totalPages: 0,
          totalRecords: 0,
          recordsPerPage,
          startRecord: 0,
          endRecord: 0
        } as PaginationInfo
      };
    }

    // Filter data based on search query
    let filtered = currentSheetData.data;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = currentSheetData.data.filter(row => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(query)
        )
      );
    }

    // Calculate pagination
    const totalRecords = filtered.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
      filteredData: paginatedData,
      paginationInfo: {
        currentPage,
        totalPages,
        totalRecords,
        recordsPerPage,
        startRecord: startIndex + 1,
        endRecord: Math.min(endIndex, totalRecords)
      }
    };
  }, [currentSheetData, searchQuery, currentPage, recordsPerPage]);

  // Handle file type change
  const handleFileTypeChange = (fileType: FileType) => {
    setSelectedFileType(fileType);
    setSelectedSheet('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Handle sheet selection change
  const handleSheetChange = (sheetName: string) => {
    setSelectedSheet(sheetName);
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle records per page change
  const handleRecordsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRecordsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Get table columns
  const columns = currentSheetData?.columns || [];

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Eye className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Data Viewer</h1>
        </div>
        <p className="text-muted-foreground">
          View and search through your uploaded data to verify correct processing
        </p>
      </div>

      {/* Controls Section */}
      {availableFileTypes.length > 0 && selectedFileType && (
        <div className="mb-6 space-y-4">
          {/* File Type and Sheet Selection */}
          <div className="flex flex-col md:flex-row gap-4">
            {availableFileTypes.length > 1 ? (
              <div className="flex-1">
                <FileTypeSelector
                  value={selectedFileType}
                  onChange={handleFileTypeChange}
                  className="w-full"
                />
              </div>
            ) : (
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">File Type</label>
                <div className="px-3 py-2 border border-input rounded-md bg-background">
                  {selectedFileType === 'inventory' ? 'Inventory' : 'OSR'}
                </div>
              </div>
            )}
            
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Sheet</label>
              <select
                value={selectedSheet}
                onChange={(e) => handleSheetChange(e.target.value)}
                disabled={isLoading || availableSheets.length === 0}
                className="w-full px-3 py-2 border border-input rounded-md bg-background disabled:opacity-50"
              >
                <option value="">Select a sheet...</option>
                {availableSheets.map((sheet) => (
                  <option key={sheet.name} value={sheet.name}>
                    {sheet.name} ({sheet.rowCount} rows, {sheet.columnCount} columns)
                  </option>
                ))}
              </select>
            </div>
          </div>

        {/* Search and Controls */}
        {selectedSheet && (
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Search Data</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search across all columns..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Records per page</label>
              <select
                value={recordsPerPage}
                onChange={handleRecordsPerPageChange}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        )}
        </div>
      )}

      {/* Data Display Section */}
      {!state.hasStoredData && (
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-500 mb-4">
            Upload some files first to view their data here
          </p>
        </div>
      )}

      {state.hasStoredData && availableFileTypes.length > 0 && availableSheets.length === 0 && !isLoading && selectedFileType && (
        <div className="text-center py-12">
          <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Sheets Available</h3>
          <p className="text-gray-500">
            No sheets found for the selected file type. Try switching to a different file type.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && currentSheetData && (
        <div className="space-y-4">
          {/* Table Info */}
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              Showing {paginationInfo.startRecord}-{paginationInfo.endRecord} of {paginationInfo.totalRecords} records
              {searchQuery && ` (filtered from ${currentSheetData.rowCount} total)`}
            </span>
            <span>
              Sheet: {selectedSheet} • {columns.length} columns
            </span>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    {columns.map((column, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-r border-muted-foreground/20 last:border-r-0"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t hover:bg-muted/50">
                        {columns.map((column, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-4 py-3 text-sm border-r border-muted-foreground/10 last:border-r-0"
                          >
                            {String(row[column] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                        {searchQuery ? 'No records match your search criteria' : 'No data available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {paginationInfo.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1 px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(
                      paginationInfo.totalPages - 4,
                      paginationInfo.currentPage - 2
                    )) + i;
                    
                    if (pageNum > paginationInfo.totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 text-sm rounded ${
                          pageNum === currentPage
                            ? 'bg-primary text-primary-foreground'
                            : 'border hover:bg-muted'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= paginationInfo.totalPages}
                  className="flex items-center gap-1 px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataViewer;