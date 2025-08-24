import React, { useState, useCallback } from 'react';
import { FileProcessorService } from '@/services/fileProcessorService';
import type { ProcessingResult } from '@/types/fileProcessing';

const TestUpload: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string>('');

  const handleFileUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setResult(null);
    setProgress(0);
    setMessage('Starting...');

    try {
      const service = new FileProcessorService();
      const processingResult = await service.processFile(file);
      
      setResult(processingResult);
    } catch (error) {
      setResult({
        success: false,
        error: {
          type: 'parsing',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Excel Worker Test</h1>
        <p className="text-muted-foreground">
          Simple test page for Excel file processing with fixed worker
        </p>
      </div>

      <div className="mb-6">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileInputChange}
          disabled={isProcessing}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {isProcessing && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <p className="font-medium text-blue-900">Processing File...</p>
              <p className="text-sm text-blue-700">{message}</p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-blue-600 mt-1">{progress.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className={`p-4 border rounded-lg ${
            result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <h3 className={`font-medium ${
              result.success ? 'text-green-900' : 'text-red-900'
            }`}>
              {result.success ? 'Success!' : 'Processing Failed'}
            </h3>
            
            {result.success && result.data && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-green-700">
                  <strong>File:</strong> {result.data.fileName} 
                  ({(result.data.fileSize / (1024 * 1024)).toFixed(1)} MB)
                </p>
                <p className="text-sm text-green-700">
                  <strong>Sheets:</strong> {result.data.sheets.length}
                </p>
                <p className="text-sm text-green-700">
                  <strong>Data Sources:</strong> {result.data.detectedDataSources.join(', ').toUpperCase()}
                </p>
                {result.stats && (
                  <p className="text-sm text-green-700">
                    <strong>Processing Time:</strong> {(result.stats.processingTime / 1000).toFixed(2)}s
                  </p>
                )}
                
                <div className="mt-4">
                  <h4 className="font-medium text-green-900 mb-2">Sheet Details:</h4>
                  {result.data.sheets.map((sheet, index) => (
                    <div key={index} className="bg-white p-3 rounded border border-green-200 mb-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{sheet.name}</span>
                        <span className="text-sm bg-green-100 px-2 py-1 rounded">
                          {sheet.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {sheet.rowCount} rows, {sheet.columnCount} columns
                      </p>
                      <p className="text-xs text-gray-500">
                        Columns: {sheet.columns.join(', ')}
                      </p>
                      {sheet.warnings && sheet.warnings.length > 0 && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-xs font-medium text-yellow-800">Warnings:</p>
                          {sheet.warnings.map((warning, wIndex) => (
                            <p key={wIndex} className="text-xs text-yellow-700">{warning}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.error && (
              <div className="mt-3">
                <p className="text-sm text-red-700">
                  <strong>Error:</strong> {result.error.message}
                </p>
                {result.error.details && (
                  <pre className="text-xs text-red-600 mt-2 bg-red-100 p-2 rounded overflow-auto">
                    {JSON.stringify(result.error.details, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {result.warnings && result.warnings.length > 0 && (
              <div className="mt-3">
                <h4 className="font-medium text-yellow-900 mb-1">Warnings:</h4>
                {result.warnings.map((warning, index) => (
                  <p key={index} className="text-sm text-yellow-700">{warning}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestUpload;