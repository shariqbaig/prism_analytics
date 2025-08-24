import React, { useCallback, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFileProcessor } from '@/hooks/useFileProcessor';
import { Upload, AlertCircle, Loader2, Info, FileX, AlertTriangle, ExternalLink, Download } from 'lucide-react';
import { FileTypeSelector, type FileType } from './FileTypeSelector';
import { getConfigForFileType } from '@/config/fileProcessing';
import type { ProcessingResult } from '@/types/fileProcessing';

interface FileUploadProps {
  onFileProcessed?: (result: ProcessingResult) => void;
  onError?: (error: string) => void;
  onFileSelected?: (file: File) => void;
  className?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileProcessed,
  onError,
  onFileSelected,
  className = '',
  disabled = false
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState<FileType | undefined>();
  
  // Memoize the options to prevent unnecessary re-renders
  const processorOptions = useMemo(() => ({
    config: selectedFileType ? getConfigForFileType(selectedFileType) : undefined,
    onComplete: onFileProcessed,
    onError
  }), [selectedFileType, onFileProcessed, onError]);
  
  const {
    processFile,
    validateFile,
    isProcessing,
    progress,
    hasErrors,
    errors,
    warnings,
    clearErrors,
    getExpectedSheetNames,
    isSupported
  } = useFileProcessor(processorOptions);

  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const file = fileArray[0]; // Process only the first file
    clearErrors();

    // Notify parent component about file selection
    onFileSelected?.(file);

    try {
      // First validate the file
      const validation = await validateFile(file);
      if (!validation.isValid) {
        onError?.(validation.error?.message || 'File validation failed');
        return;
      }

      // Process the file
      await processFile(file);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
      onError?.(errorMessage);
    }
  }, [processFile, validateFile, clearErrors, onError, onFileSelected]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled || isProcessing) return;
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect, disabled, isProcessing]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isProcessing) {
      setDragOver(true);
    }
  }, [disabled, isProcessing]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  if (!isSupported) {
    return (
      <div className={`p-6 border border-red-200 rounded-lg bg-red-50 ${className}`}>
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">File processing not supported</span>
        </div>
        <p className="text-sm text-red-600 mt-1">
          Your browser does not support the required features for file processing.
        </p>
      </div>
    );
  }

  const expectedSheets = useMemo(() => getExpectedSheetNames(), [getExpectedSheetNames]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* File Type Selection */}
      <div className="space-y-4">
        <FileTypeSelector
          value={selectedFileType}
          onChange={(fileType) => {
            setSelectedFileType(fileType);
            clearErrors();
          }}
          disabled={disabled || isProcessing}
        />
        
        {selectedFileType && (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Link
                to={`/validation-requirements?type=${selectedFileType}`}
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                View validation requirements
                <ExternalLink className="w-3 h-3" />
              </Link>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = `/samples/${selectedFileType}-sample.xlsx`;
                    link.download = `${selectedFileType}-sample.xlsx`;
                    link.click();
                  }}
                  className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-800 underline cursor-pointer"
                >
                  Download sample file
                  <Download className="w-3 h-3" />
                </button>
                <Info className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600">
                Download the sample {selectedFileType.toUpperCase()} file with dummy data to see the exact format required
              </div>
              <button
                onClick={async () => {
                  try {
                    // Fetch the sample file and process it automatically
                    const response = await fetch(`/samples/${selectedFileType}-sample.xlsx`);
                    const blob = await response.blob();
                    const file = new File([blob], `${selectedFileType}-sample.xlsx`, {
                      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    });
                    
                    // Create FileList-like object
                    const fileList = [file];
                    await handleFileSelect(fileList);
                  } catch (error) {
                    onError?.('Failed to load sample data');
                  }
                }}
                disabled={disabled || isProcessing}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <Upload className="w-3 h-3" />
                Load sample data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Area */}
      <div
        data-testid="file-upload-dropzone"
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragOver ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
          ${disabled || isProcessing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${hasErrors ? 'border-red-300 bg-red-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !isProcessing && selectedFileType && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled || isProcessing || !selectedFileType}
        />
        
        <div className="flex flex-col items-center gap-4">
          {isProcessing ? (
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          ) : (
            <Upload className={`w-12 h-12 ${hasErrors ? 'text-red-400' : 'text-gray-400'}`} />
          )}
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isProcessing ? 'Processing File...' : !selectedFileType ? 'Select File Type First' : 'Upload Excel File'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isProcessing 
                ? progress?.message || 'Processing...' 
                : !selectedFileType
                ? 'Please select whether you\'re uploading an Inventory or OSR file'
                : `Drag and drop your ${selectedFileType.toUpperCase()} Excel file here, or click to browse`
              }
            </p>
          </div>

          {!isProcessing && (
            <div className="text-xs text-gray-400">
              Supported formats: .xlsx, .xls • Max size: 100MB
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isProcessing && progress && (
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{progress.phase.toUpperCase()}</span>
              <span>{progress.progress.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Expected Sheets Info */}
      {!isProcessing && expectedSheets.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Expected Sheet Names</h4>
              <p className="text-sm text-blue-700 mt-1">
                Your Excel file should contain sheets named: <strong>{expectedSheets.join(', ')}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Errors Display */}
      {hasErrors && errors.length > 0 && (
        <div className="space-y-3">
          {errors.map((error, index) => {
            const errorIcon = error.type === 'validation' ? AlertTriangle : 
                            error.type === 'format' ? FileX : AlertCircle;
            const ErrorIcon = errorIcon;
            
            return (
              <div key={index} className="border border-red-200 rounded-lg bg-red-50">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <ErrorIcon className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-red-900">
                          {error.type === 'validation' ? 'Validation Error' :
                           error.type === 'format' ? 'File Format Error' :
                           error.type === 'sheets' ? 'Sheet Structure Error' :
                           error.type === 'columns' ? 'Column Error' :
                           error.type === 'size' ? 'File Size Error' :
                           error.type === 'parsing' ? 'File Parsing Error' :
                           'Processing Error'}
                        </h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          {error.type.toUpperCase()}
                        </span>
                      </div>
                      
                      {/* Enhanced message display for sheet structure errors */}
                      {error.type === 'sheets' ? (
                        <div className="mb-3">
                          {(() => {
                            // Parse the error message to extract required and available sheets
                            const match = error.message.match(/Required sheet "([^"]+)" not found\. Available sheets: (.+)/);
                            if (match) {
                              const requiredSheet = match[1];
                              const availableSheets = match[2].split(', ').map(s => s.trim());
                              
                              return (
                                <div className="space-y-3">
                                  <div className="p-3 bg-red-100 border border-red-200 rounded">
                                    <p className="text-sm text-red-800 font-medium mb-2">
                                      Missing Required Sheet: <span className="font-mono bg-red-200 px-2 py-1 rounded">{requiredSheet}</span>
                                    </p>
                                  </div>
                                  
                                  <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                                    <p className="text-sm text-gray-800 font-medium mb-2">
                                      Available sheets in your file ({availableSheets.length} total):
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-1 max-h-32 overflow-y-auto">
                                      {availableSheets.map((sheet, idx) => (
                                        <span 
                                          key={idx} 
                                          className={`text-xs px-2 py-1 rounded font-mono ${
                                            sheet.toLowerCase().includes(requiredSheet.toLowerCase()) ||
                                            requiredSheet.toLowerCase().includes(sheet.toLowerCase())
                                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                              : 'bg-gray-100 text-gray-700'
                                          }`}
                                          title={sheet}
                                        >
                                          {sheet.length > 15 ? `${sheet.substring(0, 15)}...` : sheet}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            // Fallback to original message if parsing fails
                            return (
                              <p className="text-sm text-red-800 font-medium">
                                {error.message}
                              </p>
                            );
                          })()}
                        </div>
                      ) : (
                        <p className="text-sm text-red-800 mb-3 font-medium">
                          {error.message}
                        </p>
                      )}
                      
                      {(error.sheet || error.column) && (
                        <div className="mb-3 space-y-1">
                          {error.sheet && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-red-700 font-medium">Sheet:</span>
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded font-mono">
                                {error.sheet}
                              </span>
                            </div>
                          )}
                          {error.column && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-red-700 font-medium">Column:</span>
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded font-mono">
                                {error.column}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {error.details && (
                        <details className="mb-3">
                          <summary className="text-xs text-red-700 cursor-pointer hover:text-red-900">
                            Show technical details
                          </summary>
                          <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono text-red-800 overflow-auto">
                            <pre>{JSON.stringify(error.details, null, 2)}</pre>
                          </div>
                        </details>
                      )}
                      
                      {/* Suggested Actions */}
                      {error.type === 'validation' && (
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                          <p className="text-blue-800 font-medium mb-1">Suggested Actions:</p>
                          <ul className="text-blue-700 space-y-1 list-disc list-inside">
                            <li>Check if all required sheets are present in your file</li>
                            <li>Verify column names match the expected format</li>
                            <li>Review the validation requirements above</li>
                          </ul>
                        </div>
                      )}
                      
                      {error.type === 'format' && (
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                          <p className="text-blue-800 font-medium mb-1">Suggested Actions:</p>
                          <ul className="text-blue-700 space-y-1 list-disc list-inside">
                            <li>Ensure your file is in .xlsx or .xls format</li>
                            <li>Try saving your file again from Excel</li>
                            <li>Check if the file is corrupted</li>
                          </ul>
                        </div>
                      )}
                      
                      {error.type === 'size' && (
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                          <p className="text-blue-800 font-medium mb-1">Suggested Actions:</p>
                          <ul className="text-blue-700 space-y-1 list-disc list-inside">
                            <li>Reduce file size to under 100MB</li>
                            <li>Remove unnecessary sheets or data</li>
                            <li>Compress images or charts in the Excel file</li>
                          </ul>
                        </div>
                      )}
                      
                      {error.type === 'sheets' && (
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                          <p className="text-blue-800 font-medium mb-1">Suggested Actions:</p>
                          <ul className="text-blue-700 space-y-1 list-disc list-inside">
                            <li>Check if you have a sheet that might be named differently (highlighted in yellow above)</li>
                            <li>Rename the closest matching sheet to the exact required name</li>
                            <li>Ensure you're uploading the correct file type (Inventory vs OSR)</li>
                            <li>Review the validation requirements to see all expected sheet names</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="px-4 py-2 bg-red-100 border-t border-red-200 rounded-b-lg">
                  <button
                    onClick={clearErrors}
                    className="text-xs text-red-700 hover:text-red-900 font-medium underline hover:no-underline"
                  >
                    Clear this error
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-900">Warnings</h4>
              <div className="mt-1 space-y-1">
                {warnings.map((warning, index) => (
                  <p key={index} className="text-sm text-yellow-700">{warning}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};