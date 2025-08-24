import React from 'react';
import { Info, CheckCircle, FileText, Database } from 'lucide-react';
import { INVENTORY_FILE_CONFIG, OSR_FILE_CONFIG } from '@/config/fileProcessing';
import type { FileType } from './FileTypeSelector';

interface ValidationRulesDisplayProps {
  fileType?: FileType;
  className?: string;
}

export const ValidationRulesDisplay: React.FC<ValidationRulesDisplayProps> = ({
  fileType,
  className = ''
}) => {
  if (!fileType) {
    return (
      <div className={`p-4 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 text-gray-600">
          <Info className="w-5 h-5" />
          <span className="font-medium">Select a file type to see validation requirements</span>
        </div>
      </div>
    );
  }

  const config = fileType === 'inventory' ? INVENTORY_FILE_CONFIG : OSR_FILE_CONFIG;
  const isInventory = fileType === 'inventory';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Requirements Header */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <FileText className={`w-5 h-5 ${isInventory ? 'text-blue-600' : 'text-orange-600'}`} />
          <h3 className="font-semibold text-gray-900">
            {isInventory ? 'Inventory File' : 'OSR File'} Validation Requirements
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Max File Size:</span>
            <p className="font-medium">{(config.maxFileSize / (1024 * 1024)).toFixed(0)}MB</p>
          </div>
          <div>
            <span className="text-gray-600">File Format:</span>
            <p className="font-medium">{config.allowedExtensions.join(', ')}</p>
          </div>
          <div>
            <span className="text-gray-600">Required Sheets:</span>
            <p className="font-medium">{config.requiredSheets.length}</p>
          </div>
        </div>
      </div>

      {/* Data Processing Rules */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold text-amber-900">Data Processing Rules</h3>
        </div>
        <div className="space-y-2 text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 flex-shrink-0"></div>
            <p><strong>Extra sheets will be ignored:</strong> Only the required sheets will be processed. Any additional sheets in your file will be safely discarded.</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 flex-shrink-0"></div>
            <p><strong>Extra columns will be ignored:</strong> Only the mandatory columns listed below will be processed. Additional columns will be safely discarded.</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 flex-shrink-0"></div>
            <p><strong>All mandatory columns must be present:</strong> Missing any required column will cause validation to fail.</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 flex-shrink-0"></div>
            <p><strong>Column order doesn't matter:</strong> Required columns can be in any order within the sheet.</p>
          </div>
        </div>
      </div>

      {/* Sheet Requirements */}
      <div className="space-y-3">
        {config.requiredSheets.map((sheet, sheetIndex) => (
          <div key={sheetIndex} className="border border-gray-200 rounded-lg">
            <div className="p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-gray-600" />
                <h4 className="font-medium text-gray-900">Sheet: {sheet.name}</h4>
                {sheet.optional && (
                  <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">
                    Optional
                  </span>
                )}
              </div>
              
              {/* Sheet Aliases */}
              {sheet.aliases && sheet.aliases.length > 1 && (
                <div className="mb-3">
                  <span className="text-xs text-gray-600 block mb-1">Accepted sheet names:</span>
                  <div className="flex flex-wrap gap-1">
                    {sheet.aliases.map((alias, aliasIndex) => (
                      <span 
                        key={aliasIndex}
                        className="text-xs px-2 py-1 bg-white border rounded text-gray-700"
                      >
                        {alias}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-sm text-gray-600">
                <strong>{sheet.requiredColumns.length}</strong> required columns
              </div>
            </div>
            
            {/* Required Columns */}
            <div className="p-4 space-y-2">
              <h5 className="text-sm font-medium text-gray-800 mb-3">Required Columns</h5>
              <div className="grid grid-cols-1 gap-2">
                {sheet.requiredColumns.map((column, columnIndex) => (
                  <div key={columnIndex} className="flex items-start gap-2 p-2 bg-green-50 border border-green-200 rounded">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-green-800 text-sm">
                          {column.name}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                          {column.type}
                        </span>
                        {column.required && (
                          <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      
                      {/* Column Aliases */}
                      {column.aliases && column.aliases.length > 1 && (
                        <div className="mt-1">
                          <span className="text-xs text-gray-600">Accepted names: </span>
                          <span className="text-xs text-gray-700">
                            {column.aliases.slice(1).join(', ')}
                          </span>
                        </div>
                      )}
                      
                      {/* Validation Rules */}
                      {column.validationRules && column.validationRules.length > 0 && (
                        <div className="mt-1">
                          {column.validationRules.map((rule, ruleIndex) => (
                            <div key={ruleIndex} className="text-xs text-gray-600">
                              {rule.type === 'minLength' && `Minimum length: ${rule.value}`}
                              {rule.type === 'min' && `Minimum value: ${rule.value}`}
                              {rule.message && ` - ${rule.message}`}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mandatory Columns Summary */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h4 className="font-semibold text-green-800">Mandatory Columns Summary</h4>
        </div>
        <div className="text-sm text-green-700">
          <p className="mb-3">Your Excel file must contain these <strong>exact columns</strong> (names can vary using aliases):</p>
          {config.requiredSheets.map((sheet, sheetIndex) => (
            <div key={sheetIndex} className="mb-4">
              <h5 className="font-semibold text-green-800 mb-2">
                {sheet.name} Sheet ({sheet.requiredColumns.length} mandatory columns):
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 ml-4">
                {sheet.requiredColumns.map((column, colIndex) => (
                  <div key={colIndex} className="flex items-center gap-2 p-2 bg-green-100 rounded">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-600 flex-shrink-0"></div>
                    <span className="font-medium text-green-800 text-xs">{column.name}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-green-200 text-green-700 rounded">
                      {column.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Format Info */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-5 h-5 text-yellow-600" />
          <h4 className="font-medium text-yellow-800">Sample File Format</h4>
        </div>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>Your Excel file should contain:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            {config.requiredSheets.map((sheet, index) => (
              <li key={index}>
                <strong>{sheet.name}</strong> sheet with {sheet.requiredColumns.length} required columns
              </li>
            ))}
          </ul>
          <p className="mt-2">
            Column headers should match exactly or use any of the accepted alternative names listed above.
          </p>
          <p className="mt-2 font-medium">
            Remember: Extra sheets and columns will be safely ignored - only mandatory data is processed.
          </p>
        </div>
      </div>
    </div>
  );
};