import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ValidationRulesDisplay } from '@/components/ValidationRulesDisplay';
import { FileTypeSelector, type FileType } from '@/components/FileTypeSelector';
import { ArrowLeft, FileText, Database } from 'lucide-react';

const ValidationRequirements: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialFileType = (searchParams.get('type') as FileType) || undefined;
  const [selectedFileType, setSelectedFileType] = useState<FileType | undefined>(initialFileType);

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to File Upload
        </Link>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600" />
            File Validation Requirements
          </h1>
          <p className="text-muted-foreground">
            Detailed specifications for Excel file formats and validation rules
          </p>
        </div>
      </div>

      {/* File Type Selection */}
      <div className="mb-8">
        <FileTypeSelector
          value={selectedFileType}
          onChange={setSelectedFileType}
          className="max-w-md"
        />
      </div>

      {/* Overview Cards */}
      {!selectedFileType && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border rounded-lg p-6 bg-blue-50">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">INVENTORY Files</h3>
            </div>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>Required Sheets:</strong> FG value, RPM</p>
              <p><strong>Total Columns:</strong> 19 (9 + 10)</p>
              <p><strong>File Size:</strong> Up to 100MB</p>
              <p><strong>Format:</strong> .xlsx, .xls</p>
              <button 
                onClick={() => setSelectedFileType('inventory')}
                className="mt-4 text-blue-600 hover:text-blue-800 underline"
              >
                View detailed requirements →
              </button>
            </div>
          </div>

          <div className="border rounded-lg p-6 bg-orange-50">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-orange-900">OSR Files</h3>
            </div>
            <div className="space-y-2 text-sm text-orange-800">
              <p><strong>Required Sheets:</strong> OSR Main Sheet HC, OSR Summary</p>
              <p><strong>Total Columns:</strong> 10 (7 + 3)</p>
              <p><strong>File Size:</strong> Up to 100MB</p>
              <p><strong>Format:</strong> .xlsx, .xls</p>
              <button 
                onClick={() => setSelectedFileType('osr')}
                className="mt-4 text-orange-600 hover:text-orange-800 underline"
              >
                View detailed requirements →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Validation Rules */}
      {selectedFileType && (
        <div className="space-y-6">
          <ValidationRulesDisplay fileType={selectedFileType} />
          
          <div className="border-t pt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Ensure all required sheets are present with correct names</li>
                <li>• Column headers must match exactly or use accepted aliases</li>
                <li>• Check data types: numbers should be numeric, text should be text</li>
                <li>• Remove any merged cells or complex formatting</li>
                <li>• Save your file in .xlsx or .xls format</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationRequirements;