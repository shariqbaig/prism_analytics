import { useCallback } from 'react';
import { useExportStore } from '@/stores/exportStore';
import { useFileStore } from '@/stores/fileStore';
import { useDataStore } from '@/stores/dataStore';
import { PDFService } from '@/services/pdfService';
import { ExportDataService } from '@/services/exportDataService';
import { getTemplateById, getTemplatesForDataSource } from '@/data/exportTemplates';

export function useExportPDF() {
  const exportStore = useExportStore();
  const { activeDataSources } = useFileStore();
  const { inventoryMetrics, osrMetrics } = useDataStore();

  const availableTemplates = getTemplatesForDataSource(activeDataSources);

  const exportToPDF = useCallback(async (templateId: string, customTitle?: string) => {
    try {
      exportStore.startExport();
      
      // Get template
      const template = getTemplateById(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      exportStore.setSelectedTemplate(template);
      
      // Prepare export data
      const exportData = ExportDataService.prepareExportData(
        inventoryMetrics,
        osrMetrics,
        activeDataSources
      );

      // Override title if provided
      if (customTitle) {
        exportData.title = customTitle;
      }

      // Generate charts with images
      exportStore.setExportProgress({
        stage: 'charts',
        progress: 40,
        message: 'Preparing chart images...'
      });

      const chartsWithImages = await ExportDataService.generateChartImages(exportData.charts);
      exportData.charts = chartsWithImages;

      // Generate PDF
      const pdfService = new PDFService();
      const result = await pdfService.generateReport(
        exportData, 
        template,
        (progress) => {
          exportStore.setExportProgress(progress);
        }
      );

      if (result.success) {
        exportStore.completeExport(result);
        
        // Trigger download
        if (result.dataUrl) {
          const link = document.createElement('a');
          link.href = result.dataUrl;
          link.download = result.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
        return result;
      } else {
        throw new Error(result.error || 'PDF generation failed');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      exportStore.failExport(errorMessage);
      throw error;
    }
  }, [exportStore, inventoryMetrics, osrMetrics, activeDataSources]);

  const canExport = useCallback(() => {
    return activeDataSources.length > 0 && (inventoryMetrics || osrMetrics);
  }, [activeDataSources, inventoryMetrics, osrMetrics]);

  const getExportStatus = useCallback(() => {
    const { isExporting, exportProgress, lastExportResult } = exportStore;
    
    return {
      isExporting,
      progress: exportProgress?.progress || 0,
      stage: exportProgress?.stage || 'preparing',
      message: exportProgress?.message || '',
      error: exportProgress?.error,
      lastResult: lastExportResult
    };
  }, [exportStore]);

  const downloadLastExport = useCallback(() => {
    const { lastExportResult } = exportStore;
    
    if (lastExportResult?.success && lastExportResult.dataUrl) {
      const link = document.createElement('a');
      link.href = lastExportResult.dataUrl;
      link.download = lastExportResult.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [exportStore]);

  const clearExportHistory = useCallback(() => {
    exportStore.resetExportSettings();
  }, [exportStore]);

  return {
    // Export functions
    exportToPDF,
    
    // Status and capabilities
    canExport: canExport(),
    isExporting: exportStore.isExporting,
    exportStatus: getExportStatus(),
    
    // Available options
    availableTemplates,
    activeDataSources,
    
    // History management
    exportHistory: exportStore.exportHistory,
    downloadLastExport,
    clearExportHistory,
    
    // Configuration
    selectedTemplate: exportStore.selectedTemplate,
    setSelectedTemplate: exportStore.setSelectedTemplate,
    customFilename: exportStore.customFilename,
    setCustomFilename: exportStore.setCustomFilename,
    
    // Error handling
    exportErrors: exportStore.exportErrors,
    clearExportErrors: exportStore.clearExportErrors
  };
}