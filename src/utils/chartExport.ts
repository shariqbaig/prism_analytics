/**
 * Chart Export Utilities
 * Provides functionality to export charts as images (PNG) or include them in PDF reports
 */

export interface ExportOptions {
  filename?: string;
  format?: 'png' | 'pdf';
  quality?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
}

/**
 * Export a chart element as PNG image
 */
export const exportChartAsPNG = async (
  chartElement: HTMLElement,
  options: ExportOptions = {}
): Promise<void> => {
  const {
    filename = `chart-${Date.now()}`,
    quality = 1,
    width,
    height,
    backgroundColor = '#ffffff'
  } = options;

  try {
    // Use html2canvas for client-side image generation
    const { default: html2canvas } = await import('html2canvas');
    
    const canvas = await html2canvas(chartElement, {
      backgroundColor,
      width: width || chartElement.offsetWidth,
      height: height || chartElement.offsetHeight,
      scale: quality,
      useCORS: true,
      allowTaint: false
    });

    // Create download link
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png', quality);
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (error) {
    console.error('Failed to export chart as PNG:', error);
    throw new Error('Chart export failed. Please try again.');
  }
};

/**
 * Get chart as base64 data URL for inclusion in reports
 */
export const getChartDataURL = async (
  chartElement: HTMLElement,
  options: ExportOptions = {}
): Promise<string> => {
  const {
    quality = 0.9,
    width,
    height,
    backgroundColor = '#ffffff'
  } = options;

  try {
    const { default: html2canvas } = await import('html2canvas');
    
    const canvas = await html2canvas(chartElement, {
      backgroundColor,
      width: width || chartElement.offsetWidth,
      height: height || chartElement.offsetHeight,
      scale: quality,
      useCORS: true,
      allowTaint: false
    });

    return canvas.toDataURL('image/png', quality);
    
  } catch (error) {
    console.error('Failed to generate chart data URL:', error);
    throw new Error('Chart conversion failed.');
  }
};

/**
 * Export multiple charts for dashboard reporting
 */
export const exportDashboardCharts = async (
  charts: { element: HTMLElement; title: string }[],
  options: ExportOptions = {}
): Promise<{ title: string; dataURL: string }[]> => {
  const exportPromises = charts.map(async ({ element, title }) => {
    try {
      const dataURL = await getChartDataURL(element, options);
      return { title, dataURL };
    } catch (error) {
      console.warn(`Failed to export chart "${title}":`, error);
      return { title, dataURL: '' };
    }
  });

  return Promise.all(exportPromises);
};

/**
 * Utility to find all chart elements in a container
 */
export const findChartElements = (container: HTMLElement): HTMLElement[] => {
  const chartSelectors = [
    '.adaptive-chart',
    '.recharts-wrapper',
    '.chartjs-render-monitor',
    '[data-chart]'
  ];
  
  const elements: HTMLElement[] = [];
  chartSelectors.forEach(selector => {
    const found = container.querySelectorAll<HTMLElement>(selector);
    elements.push(...Array.from(found));
  });
  
  return elements;
};

/**
 * Add export button to chart containers
 */
export const addExportButton = (
  chartContainer: HTMLElement,
  onExport: () => Promise<void>
): void => {
  // Check if export button already exists
  if (chartContainer.querySelector('.chart-export-btn')) {
    return;
  }

  const exportButton = document.createElement('button');
  exportButton.className = 'chart-export-btn absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-md shadow-sm border opacity-0 group-hover:opacity-100 transition-opacity';
  exportButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7,10 12,15 17,10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  `;
  exportButton.title = 'Export chart as PNG';
  
  exportButton.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      exportButton.disabled = true;
      exportButton.innerHTML = 'Exporting...';
      await onExport();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      exportButton.disabled = false;
      exportButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      `;
    }
  });

  // Make chart container relative positioned and add group class
  chartContainer.style.position = 'relative';
  chartContainer.classList.add('group');
  chartContainer.appendChild(exportButton);
};