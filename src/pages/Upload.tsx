import React, { useCallback, useEffect, useState } from "react";
import { FileUpload as FileUploadComponent } from "@/components/FileUpload";
import { useDataStorage } from "@/hooks/useDataStorage";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  FileText,
  AlertTriangle,
  Database,
  Shield,
  ChevronDown,
  ChevronUp,
  Check,
  FileSpreadsheet,
  Layers,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { ProcessingResult, ProcessedFileData } from "@/types/fileProcessing";

const Upload: React.FC = () => {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [inventoryFileData, setInventoryFileData] = useState<ProcessedFileData | null>(null);
  const [osrFileData, setOsrFileData] = useState<ProcessedFileData | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const { saveFile, getActiveFileData, getDetectedDataSources, clearAllData, state, refreshState } = useDataStorage();

  // Fetch active file data on mount and after uploads
  useEffect(() => {
    console.log('[Upload] useEffect triggered, state:', {
      isInitialized: state.isInitialized,
      hasStoredData: state.hasStoredData
    });
    
    const fetchActiveData = async () => {
      const sources = await getDetectedDataSources();
      console.log('[Upload] Sources from getDetectedDataSources:', sources);
      
      // Get data for both file types
      const inventoryData = await getActiveFileData('inventory');
      const osrData = await getActiveFileData('osr');
      
      console.log('[Upload] Inventory data:', inventoryData);
      console.log('[Upload] OSR data:', osrData);
      
      setInventoryFileData(inventoryData);
      setOsrFileData(osrData);
    };
    
    if (state.isInitialized) {
      fetchActiveData();
    } else {
      console.log('[Upload] State not initialized yet');
    }
  }, [getActiveFileData, getDetectedDataSources, state.hasStoredData, state.isInitialized]);

  const handleFileProcessed = useCallback(
    async (result: ProcessingResult) => {
      console.log('[Upload] handleFileProcessed called, result:', result);
      console.log('[Upload] currentFile:', currentFile);
      console.log('[Upload] Initial state:', state);
      
      if (result.success && result.data && currentFile) {
        setIsProcessing(true);
        try {
          const fileType = result.data.detectedDataSources[0] || "inventory";
          console.log('[Upload] Saving file with type:', fileType);
          
          const fileId = await saveFile(currentFile, result.data, fileType);
          console.log('[Upload] File saved with ID:', fileId);

          if (fileId) {
            toast.success("File uploaded successfully!", {
              description: "Data has been processed and saved.",
            });
            
            // Add a small delay to ensure database write is complete
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Force refresh the data
            console.log('[Upload] Refreshing data after save...');
            
            // Update the appropriate file data based on type
            if (fileType === 'inventory') {
              const data = await getActiveFileData('inventory');
              console.log('[Upload] Inventory data after save:', data);
              setInventoryFileData(data);
            } else if (fileType === 'osr') {
              const data = await getActiveFileData('osr');
              console.log('[Upload] OSR data after save:', data);
              setOsrFileData(data);
            }
            
            const sources = await getDetectedDataSources();
            console.log('[Upload] Detected sources after save:', sources);
            
            // Force state refresh
            await refreshState();
            
            // Log the state to see if it updated
            console.log('[Upload] Current state after save:', state);
          } else {
            throw new Error("Failed to save file to database");
          }

          setCurrentFile(null);
        } catch (error) {
          console.error("Failed to save data to database:", error);
          toast.error("Failed to save data", {
            description: "File was processed but could not be saved to database.",
          });
        } finally {
          setIsProcessing(false);
        }
      }
    },
    [currentFile, saveFile, getActiveFileData, getDetectedDataSources, refreshState, state],
  );

  const handleError = useCallback((error: string) => {
    console.error("File processing error:", error);
    toast.error("Processing failed", { description: error });
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleResetDatabase = useCallback(async () => {
    try {
      const success = await clearAllData();
      if (success) {
        setInventoryFileData(null);
        setOsrFileData(null);
        setShowResetConfirm(false);
        toast.success('Database reset successfully', {
          description: 'All data has been cleared. You can now upload new files.'
        });
      } else {
        throw new Error('Failed to reset database');
      }
    } catch (error) {
      console.error('Failed to reset database:', error);
      toast.error('Failed to reset database', {
        description: 'An error occurred while clearing the data.'
      });
    }
  }, [clearAllData]);

  // Group sheets by type from both files
  const inventorySheets = inventoryFileData?.sheets || [];
  const osrSheets = osrFileData?.sheets || [];
  const totalRows = [...inventorySheets, ...osrSheets].reduce((sum, sheet) => sum + sheet.rowCount, 0);

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">File Upload</h1>
        <p className="text-muted-foreground">
          Upload your Excel files containing inventory and OSR data for analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upload Area */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <FileUploadComponent
              onFileProcessed={handleFileProcessed}
              onError={handleError}
              onFileSelected={setCurrentFile}
              disabled={isProcessing}
            />
          </div>

          {/* Active Sheets Section */}
          {state.hasStoredData && (inventoryFileData || osrFileData) && (
            <div className="border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold">Active Sheets</h2>
                </div>
                <span className="text-sm text-muted-foreground">
                  {inventorySheets.length + osrSheets.length} sheets • {totalRows} total rows
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Inventory Sheets */}
                {inventorySheets.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                      <FileSpreadsheet className="w-4 h-4" />
                      Inventory ({inventorySheets.length})
                    </div>
                    {inventorySheets.map((sheet, idx) => (
                      <div key={idx} className="pl-6 py-1.5 text-sm border-l-2 border-blue-200">
                        <div className="flex justify-between">
                          <span>{sheet.name}</span>
                          <span className="text-muted-foreground">
                            {sheet.rowCount} rows
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* OSR Sheets */}
                {osrSheets.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
                      <Shield className="w-4 h-4" />
                      OSR ({osrSheets.length})
                    </div>
                    {osrSheets.map((sheet, idx) => (
                      <div key={idx} className="pl-6 py-1.5 text-sm border-l-2 border-orange-200">
                        <div className="flex justify-between">
                          <span>{sheet.name}</span>
                          <span className="text-muted-foreground">
                            {sheet.rowCount} rows
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expandable Details Section */}
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => toggleSection('details')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expandedSection === 'details' ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  View detailed sheet information
                </button>

                {expandedSection === 'details' && (
                  <div className="mt-4 space-y-3">
                    {[...inventorySheets, ...osrSheets].map((sheet, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                sheet.type === "inventory"
                                  ? "bg-blue-500"
                                  : "bg-orange-500"
                              }`}
                            />
                            <span className="font-medium text-sm">{sheet.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {sheet.columnCount} columns
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {sheet.columns.slice(0, 5).map((col, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-1.5 py-0.5 bg-background rounded"
                            >
                              {col}
                            </span>
                          ))}
                          {sheet.columns.length > 5 && (
                            <span className="text-xs text-muted-foreground">
                              +{sheet.columns.length - 5} more
                            </span>
                          )}
                        </div>

                        {sheet.warnings && sheet.warnings.length > 0 && (
                          <div className="mt-2 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-yellow-600" />
                            <span className="text-xs text-yellow-600">
                              {sheet.warnings.length} warning{sheet.warnings.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Status Cards */}
        <div className="space-y-4">
          {/* Upload Status Card */}
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-3 mb-3">
              <Database className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold">Database Status</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active Files</span>
                <span className="font-medium">
                  {inventoryFileData && osrFileData ? '2 files' : 
                   inventoryFileData || osrFileData ? '1 file' : 'None'}
                </span>
              </div>
              {inventoryFileData && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Inventory</span>
                  <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                    {inventoryFileData.sheets.length} sheets
                  </span>
                </div>
              )}
              {osrFileData && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">OSR</span>
                  <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded">
                    {osrFileData.sheets.length} sheets
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Card */}
          {state.hasStoredData && (inventoryFileData || osrFileData) && (
            <div className="border rounded-lg p-4 bg-card">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Quick Stats</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Sheets</span>
                  <span className="font-medium">{inventorySheets.length + osrSheets.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Rows</span>
                  <span className="font-medium">{totalRows.toLocaleString()}</span>
                </div>
                {inventorySheets.length > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Inventory Items</span>
                    <span className="font-medium">
                      {inventorySheets.reduce((sum, s) => sum + s.rowCount, 0).toLocaleString()}
                    </span>
                  </div>
                )}
                {osrSheets.length > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">OSR Records</span>
                    <span className="font-medium">
                      {osrSheets.reduce((sum, s) => sum + s.rowCount, 0).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Tips */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="font-medium text-sm mb-2">Upload Tips</h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-1.5">
                <Check className="w-3 h-3 mt-0.5 text-green-600 flex-shrink-0" />
                <span>Supports .xlsx and .xls Excel files</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3 h-3 mt-0.5 text-green-600 flex-shrink-0" />
                <span>Automatically detects inventory and OSR sheets</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3 h-3 mt-0.5 text-green-600 flex-shrink-0" />
                <span>Data is saved locally for offline access</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3 h-3 mt-0.5 text-green-600 flex-shrink-0" />
                <span>New uploads replace all existing data</span>
              </li>
            </ul>
          </div>

          {/* Reset Database Button */}
          {state.hasStoredData && (
            <div className="border rounded-lg p-4 bg-card">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Reset Database
              </button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                This will delete all uploaded files and data
              </p>
            </div>
          )}
        </div>
      </div>

      {/* No Data State */}
      {!state.hasStoredData && !currentFile && !isProcessing && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Files Uploaded
          </h3>
          <p className="text-gray-500">
            Upload an Excel file to see detailed processing results and data analysis
          </p>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        open={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetDatabase}
        title="Reset Database"
        description="Are you sure you want to reset the database? This action will permanently delete all uploaded files and processed data. This action cannot be undone."
        confirmText="Reset Database"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
};

export default Upload;