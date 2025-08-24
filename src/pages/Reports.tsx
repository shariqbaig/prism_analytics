import React, { useState } from 'react';
import { useExportPDF } from '@/hooks/useExportPDF';
import { Download, FileText, Settings, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const Reports: React.FC = () => {
  const {
    exportToPDF,
    canExport,
    isExporting,
    exportStatus,
    availableTemplates,
    activeDataSources,
    exportHistory,
    downloadLastExport,
    customFilename,
    setCustomFilename,
    exportErrors,
    clearExportErrors
  } = useExportPDF();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleExport = async (templateId: string, customTitle?: string) => {
    try {
      clearExportErrors();
      await exportToPDF(templateId, customTitle);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reports & Export</h1>
        <p className="text-muted-foreground">
          Generate comprehensive PDF reports from your dashboard data
        </p>
        
        {/* Data Source Status */}
        <div className="flex items-center gap-2 mt-4 p-3 bg-muted rounded-lg">
          <FileText className="w-4 h-4" />
          <span className="text-sm">
            Active data sources: {activeDataSources.length > 0 
              ? activeDataSources.join(', ').toUpperCase()
              : 'None'
            }
          </span>
        </div>
      </div>

      {/* Error Display */}
      {exportErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="font-medium text-red-800">Export Errors</span>
          </div>
          {exportErrors.map((error, index) => (
            <p key={index} className="text-sm text-red-600 mb-1">{error}</p>
          ))}
          <button 
            onClick={clearExportErrors}
            className="text-sm text-red-600 underline hover:no-underline mt-2"
          >
            Clear errors
          </button>
        </div>
      )}

      {/* Export Progress */}
      {isExporting && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <span className="font-medium text-blue-800">Generating Report</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${exportStatus.progress}%` }}
            />
          </div>
          <p className="text-sm text-blue-600">{exportStatus.message}</p>
        </div>
      )}

      {/* Template Selection */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Export Templates</h2>
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-4 h-4" />
            Advanced Options
          </button>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Custom Filename</label>
                <input
                  type="text"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  placeholder="Leave empty for auto-generated name"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                />
              </div>
            </div>
          </div>
        )}

        {/* Template Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableTemplates.map((template) => (
            <div key={template.id} className="kpi-card relative">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold">{template.name}</h3>
                <div className="text-xs text-muted-foreground">
                  {template.layout.pageOrientation}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 min-h-[2.5rem]">
                {template.description}
              </p>
              
              <div className="mb-4">
                <div className="text-xs text-muted-foreground mb-1">Sections included:</div>
                <div className="flex flex-wrap gap-1">
                  {template.sections.map((section) => (
                    <span 
                      key={section.id}
                      className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded"
                    >
                      {section.title}
                    </span>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => handleExport(template.id)}
                disabled={!canExport || isExporting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                Generate Report
              </button>
            </div>
          ))}
        </div>

        {!canExport && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">No Data Available</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Upload inventory or OSR files to enable report generation.
            </p>
          </div>
        )}
      </div>

      {/* Export History */}
      {exportHistory.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Exports</h2>
          <div className="space-y-3">
            {exportHistory.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  {getStatusIcon(record.status)}
                  <div>
                    <div className="font-medium">{record.filename}</div>
                    <div className="text-sm text-muted-foreground">
                      {record.template} • {formatFileSize(record.fileSize)} • {record.generatedAt.toLocaleString()}
                    </div>
                    {record.error && (
                      <div className="text-sm text-red-600 mt-1">{record.error}</div>
                    )}
                  </div>
                </div>
                
                {record.status === 'success' && (
                  <button 
                    onClick={downloadLastExport}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;