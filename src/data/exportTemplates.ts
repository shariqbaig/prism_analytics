import type { ExportTemplate } from '@/types/export';

export const defaultTemplates: ExportTemplate[] = [
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    description: 'Comprehensive executive report with summary, KPIs, and key charts',
    layout: {
      pageOrientation: 'portrait',
      pageSize: 'a4',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      headerHeight: 15,
      footerHeight: 10
    },
    sections: [
      {
        id: 'summary',
        title: 'Executive Summary',
        type: 'summary',
        required: true,
        dataSource: 'both',
        order: 1
      },
      {
        id: 'kpis',
        title: 'Key Performance Indicators',
        type: 'kpi',
        required: true,
        dataSource: 'both',
        order: 2
      },
      {
        id: 'charts',
        title: 'Data Visualization',
        type: 'chart',
        required: true,
        dataSource: 'both',
        order: 3
      },
      {
        id: 'tables',
        title: 'Data Tables',
        type: 'table',
        required: false,
        dataSource: 'both',
        order: 4
      }
    ]
  },
  {
    id: 'inventory-focus',
    name: 'Inventory Analysis',
    description: 'Detailed inventory metrics and analysis report',
    layout: {
      pageOrientation: 'portrait',
      pageSize: 'a4',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      headerHeight: 15,
      footerHeight: 10
    },
    sections: [
      {
        id: 'inventory-summary',
        title: 'Inventory Overview',
        type: 'summary',
        required: true,
        dataSource: 'inventory',
        order: 1
      },
      {
        id: 'inventory-kpis',
        title: 'Inventory Metrics',
        type: 'kpi',
        required: true,
        dataSource: 'inventory',
        order: 2
      },
      {
        id: 'inventory-charts',
        title: 'Portfolio Analysis',
        type: 'chart',
        required: true,
        dataSource: 'inventory',
        order: 3
      },
      {
        id: 'inventory-tables',
        title: 'Detailed Inventory Data',
        type: 'table',
        required: true,
        dataSource: 'inventory',
        order: 4
      }
    ]
  },
  {
    id: 'osr-focus',
    name: 'OSR Analysis',
    description: 'Focused OSR risk assessment and health analysis',
    layout: {
      pageOrientation: 'portrait',
      pageSize: 'a4',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      headerHeight: 15,
      footerHeight: 10
    },
    sections: [
      {
        id: 'osr-summary',
        title: 'OSR Health Assessment',
        type: 'summary',
        required: true,
        dataSource: 'osr',
        order: 1
      },
      {
        id: 'osr-kpis',
        title: 'Risk Metrics',
        type: 'kpi',
        required: true,
        dataSource: 'osr',
        order: 2
      },
      {
        id: 'osr-charts',
        title: 'Risk Visualization',
        type: 'chart',
        required: true,
        dataSource: 'osr',
        order: 3
      },
      {
        id: 'osr-tables',
        title: 'Detailed Risk Data',
        type: 'table',
        required: true,
        dataSource: 'osr',
        order: 4
      }
    ]
  },
  {
    id: 'quick-summary',
    name: 'Quick Summary',
    description: 'Brief 1-page overview with essential metrics',
    layout: {
      pageOrientation: 'portrait',
      pageSize: 'a4',
      margins: { top: 15, right: 15, bottom: 15, left: 15 },
      headerHeight: 12,
      footerHeight: 8
    },
    sections: [
      {
        id: 'quick-kpis',
        title: 'Essential Metrics',
        type: 'kpi',
        required: true,
        dataSource: 'both',
        order: 1
      },
      {
        id: 'quick-chart',
        title: 'Key Chart',
        type: 'chart',
        required: true,
        dataSource: 'both',
        order: 2
      }
    ]
  },
  {
    id: 'detailed-landscape',
    name: 'Detailed Analysis (Landscape)',
    description: 'Comprehensive landscape report with all available data',
    layout: {
      pageOrientation: 'landscape',
      pageSize: 'a4',
      margins: { top: 20, right: 15, bottom: 20, left: 15 },
      headerHeight: 15,
      footerHeight: 10
    },
    sections: [
      {
        id: 'detail-summary',
        title: 'Comprehensive Analysis',
        type: 'summary',
        required: true,
        dataSource: 'both',
        order: 1
      },
      {
        id: 'detail-kpis',
        title: 'All Metrics',
        type: 'kpi',
        required: true,
        dataSource: 'both',
        order: 2
      },
      {
        id: 'detail-charts',
        title: 'Complete Visualization Suite',
        type: 'chart',
        required: true,
        dataSource: 'both',
        order: 3
      },
      {
        id: 'detail-tables',
        title: 'Complete Data Tables',
        type: 'table',
        required: true,
        dataSource: 'both',
        order: 4
      }
    ]
  }
];

export function getTemplateById(id: string): ExportTemplate | undefined {
  return defaultTemplates.find(template => template.id === id);
}

export function getTemplatesForDataSource(dataSources: ('inventory' | 'osr')[]): ExportTemplate[] {
  return defaultTemplates.filter(template => {
    const hasInventory = dataSources.includes('inventory');
    const hasOSR = dataSources.includes('osr');
    const hasBoth = hasInventory && hasOSR;
    
    const templateRequiresInventory = template.sections.some(s => s.dataSource === 'inventory');
    const templateRequiresOSR = template.sections.some(s => s.dataSource === 'osr');
    const templateRequiresBoth = template.sections.some(s => s.dataSource === 'both');
    
    if (templateRequiresBoth && !hasBoth) return false;
    if (templateRequiresInventory && !hasInventory) return false;
    if (templateRequiresOSR && !hasOSR) return false;
    
    return true;
  });
}