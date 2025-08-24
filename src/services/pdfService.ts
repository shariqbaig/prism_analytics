import { jsPDF } from 'jspdf';
import type { 
  ExportData, 
  ExportTemplate, 
  ExportResult, 
  ExportProgress,
  ChartExportData,
  TableExportData,
  KPIMetric 
} from '@/types/export';

export class PDFService {
  private doc: jsPDF;
  private currentY: number;
  private pageHeight: number;
  private margins: { top: number; right: number; bottom: number; left: number };
  
  constructor() {
    this.doc = new jsPDF();
    this.currentY = 20;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.margins = { top: 20, right: 20, bottom: 20, left: 20 };
  }

  async generateReport(
    data: ExportData, 
    template: ExportTemplate,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<ExportResult> {
    try {
      this.updateProgress(onProgress, 'preparing', 10, 'Initializing PDF document...');
      
      this.initializeDocument(template);
      
      this.updateProgress(onProgress, 'generating', 20, 'Adding header and title...');
      
      this.addHeader(data);
      this.addTitle(data.title);
      
      if (data.summary) {
        this.updateProgress(onProgress, 'generating', 30, 'Adding executive summary...');
        this.addExecutiveSummary(data.summary);
      }
      
      if (data.kpiMetrics.length > 0) {
        this.updateProgress(onProgress, 'generating', 45, 'Adding KPI metrics...');
        this.addKPISection(data.kpiMetrics);
      }
      
      if (data.charts.length > 0) {
        this.updateProgress(onProgress, 'charts', 60, 'Adding charts...');
        await this.addChartsSection(data.charts);
      }
      
      if (data.tables.length > 0) {
        this.updateProgress(onProgress, 'generating', 80, 'Adding data tables...');
        this.addTablesSection(data.tables);
      }
      
      this.updateProgress(onProgress, 'finalizing', 90, 'Adding footer...');
      this.addFooter(data);
      
      const pdfBlob = this.doc.output('blob');
      const filename = this.generateFilename(data.title, data.dataSource);
      
      this.updateProgress(onProgress, 'complete', 100, 'PDF generated successfully!');
      
      return {
        success: true,
        filename,
        size: pdfBlob.size,
        generatedAt: new Date(),
        dataUrl: URL.createObjectURL(pdfBlob)
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.updateProgress(onProgress, 'error', 0, `Error: ${errorMessage}`, errorMessage);
      
      return {
        success: false,
        filename: '',
        size: 0,
        generatedAt: new Date(),
        error: errorMessage
      };
    }
  }

  private updateProgress(
    onProgress?: (progress: ExportProgress) => void,
    stage: ExportProgress['stage'] = 'preparing',
    progress: number = 0,
    message: string = '',
    error?: string
  ) {
    if (onProgress) {
      onProgress({ stage, progress, message, error });
    }
  }

  private initializeDocument(template: ExportTemplate) {
    const { pageOrientation, pageSize, margins } = template.layout;
    
    this.doc = new jsPDF({
      orientation: pageOrientation,
      unit: 'mm',
      format: pageSize
    });
    
    this.margins = margins;
    this.currentY = margins.top;
    this.pageHeight = this.doc.internal.pageSize.height;
  }

  private addHeader(data: ExportData) {
    const pageWidth = this.doc.internal.pageSize.width;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('PRISM Analytics', this.margins.left, 15);
    
    const dateStr = data.generatedDate.toLocaleDateString();
    const dateWidth = this.doc.getTextWidth(dateStr);
    this.doc.text(dateStr, pageWidth - this.margins.right - dateWidth, 15);
    
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margins.left, 18, pageWidth - this.margins.right, 18);
    
    this.currentY = 25;
  }

  private addTitle(title: string) {
    this.checkPageBreak(15);
    
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margins.left, this.currentY);
    
    this.currentY += 12;
  }

  private addExecutiveSummary(summary: any) {
    this.addSectionTitle('Executive Summary');
    
    if (summary.overview) {
      this.addParagraph(summary.overview);
    }
    
    if (summary.keyFindings && summary.keyFindings.length > 0) {
      this.addSubtitle('Key Findings');
      summary.keyFindings.forEach((finding: string) => {
        this.addBulletPoint(finding);
      });
    }
    
    if (summary.recommendations && summary.recommendations.length > 0) {
      this.addSubtitle('Recommendations');
      summary.recommendations.forEach((recommendation: string) => {
        this.addBulletPoint(recommendation);
      });
    }
    
    if (summary.healthScore !== undefined) {
      this.currentY += 5;
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      const healthText = `Overall Health Score: ${summary.healthScore}%`;
      this.doc.text(healthText, this.margins.left, this.currentY);
      this.currentY += 8;
    }
    
    this.currentY += 10;
  }

  private addKPISection(metrics: KPIMetric[]) {
    this.addSectionTitle('Key Performance Indicators');
    
    const pageWidth = this.doc.internal.pageSize.width - this.margins.left - this.margins.right;
    const cardWidth = pageWidth / 2 - 5;
    const cardHeight = 25;
    
    metrics.forEach((metric, index) => {
      const x = this.margins.left + (index % 2) * (cardWidth + 10);
      const y = this.currentY;
      
      if (index % 2 === 0 && index > 0) {
        this.currentY += cardHeight + 5;
        this.checkPageBreak(cardHeight + 10);
      }
      
      this.addKPICard(metric, x, y, cardWidth, cardHeight);
    });
    
    this.currentY += cardHeight + 15;
  }

  private addKPICard(metric: KPIMetric, x: number, y: number, width: number, height: number) {
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.5);
    this.doc.rect(x, y, width, height);
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(metric.title, x + 3, y + 6);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    
    const statusColors = {
      healthy: [34, 197, 94],
      warning: [251, 191, 36],
      critical: [239, 68, 68],
      neutral: [107, 114, 128]
    };
    
    const color = statusColors[metric.status] || statusColors.neutral;
    this.doc.setTextColor(color[0], color[1], color[2]);
    
    const valueText = this.formatKPIValue(metric);
    this.doc.text(valueText, x + 3, y + 16);
    
    this.doc.setTextColor(0, 0, 0);
    
    if (metric.trend !== undefined) {
      this.doc.setFontSize(8);
      const trendText = metric.trend > 0 ? `↗ +${metric.trend}%` : `↘ ${metric.trend}%`;
      const trendColor = metric.trend > 0 ? [34, 197, 94] : [239, 68, 68];
      this.doc.setTextColor(trendColor[0], trendColor[1], trendColor[2]);
      this.doc.text(trendText, x + 3, y + 22);
      this.doc.setTextColor(0, 0, 0);
    }
  }

  private async addChartsSection(charts: ChartExportData[]) {
    this.addSectionTitle('Data Visualization');
    
    for (const chart of charts) {
      await this.addChart(chart);
    }
  }

  private async addChart(chart: ChartExportData) {
    this.checkPageBreak(chart.height + 20);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(chart.title, this.margins.left, this.currentY);
    this.currentY += 8;
    
    if (chart.dataUrl) {
      try {
        this.doc.addImage(
          chart.dataUrl,
          'PNG',
          this.margins.left,
          this.currentY,
          chart.width,
          chart.height
        );
        this.currentY += chart.height + 10;
      } catch (error) {
        console.error('Failed to add chart image:', error);
        this.addParagraph(`[Chart: ${chart.title} - Image could not be loaded]`);
      }
    } else {
      this.addParagraph(`[Chart: ${chart.title} - No data available]`);
    }
  }

  private addTablesSection(tables: TableExportData[]) {
    this.addSectionTitle('Data Tables');
    
    tables.forEach(table => {
      this.addTable(table);
    });
  }

  private addTable(table: TableExportData) {
    this.checkPageBreak(30);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(table.title, this.margins.left, this.currentY);
    this.currentY += 8;
    
    const pageWidth = this.doc.internal.pageSize.width - this.margins.left - this.margins.right;
    const colWidth = pageWidth / table.headers.length;
    const rowHeight = 8;
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    
    table.headers.forEach((header, index) => {
      const x = this.margins.left + index * colWidth;
      this.doc.text(header, x + 2, this.currentY);
    });
    
    this.currentY += rowHeight;
    
    this.doc.setFont('helvetica', 'normal');
    
    const maxRows = Math.min(table.rows.length, 20);
    
    for (let i = 0; i < maxRows; i++) {
      this.checkPageBreak(rowHeight + 5);
      
      table.rows[i].forEach((cell, colIndex) => {
        const x = this.margins.left + colIndex * colWidth;
        this.doc.text(String(cell), x + 2, this.currentY);
      });
      
      this.currentY += rowHeight;
    }
    
    if (table.rows.length > maxRows) {
      this.doc.setFont('helvetica', 'italic');
      this.doc.text(
        `... and ${table.rows.length - maxRows} more rows`,
        this.margins.left,
        this.currentY
      );
      this.currentY += rowHeight;
    }
    
    this.currentY += 10;
  }

  private addFooter(_data: ExportData) {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      const pageWidth = this.doc.internal.pageSize.width;
      const footerY = this.pageHeight - 10;
      
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      
      this.doc.text('PRISM Analytics - Executive Report', this.margins.left, footerY);
      
      const pageText = `Page ${i} of ${pageCount}`;
      const pageWidth_text = this.doc.getTextWidth(pageText);
      this.doc.text(pageText, pageWidth - this.margins.right - pageWidth_text, footerY);
    }
  }

  private addSectionTitle(title: string) {
    this.checkPageBreak(20);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margins.left, this.currentY);
    this.currentY += 12;
  }

  private addSubtitle(title: string) {
    this.checkPageBreak(15);
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margins.left, this.currentY);
    this.currentY += 8;
  }

  private addParagraph(text: string) {
    this.checkPageBreak(20);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    const pageWidth = this.doc.internal.pageSize.width - this.margins.left - this.margins.right;
    const lines = this.doc.splitTextToSize(text, pageWidth);
    
    lines.forEach((line: string) => {
      this.checkPageBreak(5);
      this.doc.text(line, this.margins.left, this.currentY);
      this.currentY += 5;
    });
    
    this.currentY += 5;
  }

  private addBulletPoint(text: string) {
    this.checkPageBreak(15);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    const pageWidth = this.doc.internal.pageSize.width - this.margins.left - this.margins.right - 10;
    const lines = this.doc.splitTextToSize(text, pageWidth);
    
    this.doc.text('•', this.margins.left, this.currentY);
    this.doc.text(lines[0], this.margins.left + 5, this.currentY);
    this.currentY += 5;
    
    if (lines.length > 1) {
      for (let i = 1; i < lines.length; i++) {
        this.checkPageBreak(5);
        this.doc.text(lines[i], this.margins.left + 5, this.currentY);
        this.currentY += 5;
      }
    }
    
    this.currentY += 2;
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margins.bottom) {
      this.doc.addPage();
      this.currentY = this.margins.top + 10;
    }
  }

  private formatKPIValue(metric: KPIMetric): string {
    switch (metric.format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(Number(metric.value));
      case 'percentage':
        return `${metric.value}%`;
      case 'number':
        return new Intl.NumberFormat('en-US').format(Number(metric.value));
      default:
        return String(metric.value);
    }
  }

  private generateFilename(title: string, dataSources: ('inventory' | 'osr')[]): string {
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const sourceStr = dataSources.join('_');
    const timestamp = new Date().toISOString().split('T')[0];
    
    return `${sanitizedTitle}_${sourceStr}_${timestamp}.pdf`;
  }
}