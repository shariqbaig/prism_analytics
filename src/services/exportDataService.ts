import type { 
  ExportData, 
  ExecutiveSummary, 
  ChartExportData, 
  TableExportData 
} from '@/types/export';
import type { InventoryMetrics, OSRMetrics } from '@/types/dashboard';
import type { KPIMetric } from '@/types/export';

export class ExportDataService {
  static prepareExportData(
    inventoryMetrics: InventoryMetrics | null,
    osrMetrics: OSRMetrics | null,
    activeDataSources: ('inventory' | 'osr')[]
  ): ExportData {
    const title = this.generateReportTitle(activeDataSources);
    const summary = this.generateExecutiveSummary(inventoryMetrics, osrMetrics, activeDataSources);
    const kpiMetrics = this.generateKPIMetrics(inventoryMetrics, osrMetrics);
    const charts = this.generateChartData(inventoryMetrics, osrMetrics);
    const tables = this.generateTableData(inventoryMetrics, osrMetrics);

    return {
      title,
      generatedDate: new Date(),
      dataSource: activeDataSources,
      summary,
      kpiMetrics,
      charts,
      tables
    };
  }

  private static generateReportTitle(dataSources: ('inventory' | 'osr')[]): string {
    const hasInventory = dataSources.includes('inventory');
    const hasOSR = dataSources.includes('osr');

    if (hasInventory && hasOSR) {
      return 'Executive Dashboard Report - Complete Analysis';
    } else if (hasInventory) {
      return 'Inventory Portfolio Analysis Report';
    } else if (hasOSR) {
      return 'OSR Health Assessment Report';
    } else {
      return 'Dashboard Report';
    }
  }

  private static generateExecutiveSummary(
    inventoryMetrics: InventoryMetrics | null,
    osrMetrics: OSRMetrics | null,
    dataSources: ('inventory' | 'osr')[]
  ): ExecutiveSummary {
    const hasInventory = dataSources.includes('inventory');
    const hasOSR = dataSources.includes('osr');

    let overview = '';
    const keyFindings: string[] = [];
    const recommendations: string[] = [];
    let healthScore: number | undefined;
    let totalValue: number | undefined;
    let riskLevel: 'low' | 'medium' | 'high' | undefined;

    // Generate overview
    if (hasInventory && hasOSR) {
      overview = 'This comprehensive report analyzes both inventory portfolio performance and operational system risks (OSR). ';
      overview += 'The analysis provides insights into asset utilization, geographic distribution, and system health metrics ';
      overview += 'to support strategic decision-making and risk management initiatives.';
    } else if (hasInventory) {
      overview = 'This report focuses on inventory portfolio analysis, examining asset distribution, utilization patterns, ';
      overview += 'and performance metrics across different facilities and geographic regions.';
    } else if (hasOSR) {
      overview = 'This report provides a comprehensive assessment of Operational System Risks (OSR), analyzing system health, ';
      overview += 'severity levels, and recovery potential across all monitored systems.';
    }

    // Extract key findings
    if (inventoryMetrics) {
      totalValue = Number(inventoryMetrics.totalInventoryValue.value);
      
      // Portfolio concentration insights
      const concentration = Number(inventoryMetrics.portfolioConcentration.value);
      if (concentration > 70) {
        keyFindings.push('High portfolio concentration identified - diversification recommended');
        recommendations.push('Implement diversification strategy to reduce concentration risk');
      } else if (concentration < 30) {
        keyFindings.push('Well-diversified portfolio with balanced asset distribution');
      }
      
      // Geographic distribution insights
      if (inventoryMetrics.geographicDistribution && inventoryMetrics.geographicDistribution.length > 0) {
        const topLocation = inventoryMetrics.geographicDistribution[0];
        if (topLocation.percentage > 50) {
          keyFindings.push(`High geographic concentration in ${topLocation.location} (${topLocation.percentage}%)`);
        }
      }
      
      // Plant efficiency insights
      if (inventoryMetrics.plantEfficiency && inventoryMetrics.plantEfficiency.length > 0) {
        const avgEfficiency = inventoryMetrics.plantEfficiency.reduce((sum, plant) => sum + Number(plant.value), 0) / inventoryMetrics.plantEfficiency.length;
        if (avgEfficiency > 80) {
          keyFindings.push(`Strong operational efficiency across facilities (${avgEfficiency.toFixed(1)}% average)`);
        } else if (avgEfficiency < 60) {
          recommendations.push('Focus on operational efficiency improvements across facilities');
        }
      }
    }

    if (osrMetrics) {
      healthScore = Number(osrMetrics.healthScore.value);
      
      // Health score insights
      const health = Number(osrMetrics.healthScore.value);
      if (health > 80) {
        keyFindings.push(`Strong overall system health at ${health}% indicates robust operational state`);
        riskLevel = 'low';
      } else if (health > 60) {
        keyFindings.push(`Moderate system health at ${health}% requires attention to prevent degradation`);
        riskLevel = 'medium';
        recommendations.push('Implement preventive maintenance schedule for moderate-risk systems');
      } else {
        keyFindings.push(`Low system health at ${health}% indicates significant operational risks`);
        riskLevel = 'high';
        recommendations.push('Immediate intervention required for critical systems');
      }
      
      // Recovery potential insights
      const recovery = Number(osrMetrics.recoveryPotential.value);
      if (recovery > 80) {
        keyFindings.push('High recovery potential suggests resilient system architecture');
      } else if (recovery < 50) {
        recommendations.push('Improve system redundancy and backup capabilities');
      }
      
      // Severity insights
      const severity = Number(osrMetrics.severityScore.value);
      if (severity > 70) {
        keyFindings.push(`High severity score (${severity}%) indicates significant risk exposure`);
        recommendations.push('Address high-severity risks as immediate priority');
      }
    }

    // Combined analysis insights
    if (hasInventory && hasOSR && inventoryMetrics && osrMetrics) {
      const invValue = Number(inventoryMetrics.totalInventoryValue.value);
      const osrValue = Number(osrMetrics.totalOSRValue.value);
      const healthScore = Number(osrMetrics.healthScore.value);
      
      // Value correlation insights
      if (invValue > 1000000 && osrValue > 100000) {
        keyFindings.push('High-value portfolio requires enhanced risk monitoring');
      }
      
      // Performance correlation
      if (healthScore > 80 && invValue > 500000) {
        keyFindings.push('Strong system health supporting high-value inventory management');
      } else if (healthScore < 60 && invValue > 500000) {
        recommendations.push('System health improvements needed to support high-value inventory');
      }
    }

    // Default recommendations if none generated
    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring key metrics and maintain current performance levels');
      recommendations.push('Schedule regular reviews to identify optimization opportunities');
    }

    return {
      overview,
      keyFindings,
      recommendations,
      healthScore,
      totalValue,
      riskLevel
    };
  }

  private static generateKPIMetrics(
    inventoryMetrics: InventoryMetrics | null,
    osrMetrics: OSRMetrics | null
  ): KPIMetric[] {
    const kpis: KPIMetric[] = [];

    if (inventoryMetrics) {
      // Convert dashboard KPIs to export format
      const totalValue = inventoryMetrics.totalInventoryValue;
      const concentration = inventoryMetrics.portfolioConcentration;
      
      kpis.push(
        {
          id: 'total-value',
          title: totalValue.title,
          value: totalValue.value,
          format: totalValue.format,
          status: totalValue.status,
          trend: totalValue.trend
        },
        {
          id: 'concentration',
          title: concentration.title,
          value: concentration.value,
          format: concentration.format,
          status: concentration.status,
          trend: concentration.trend
        }
      );

      // Add average plant efficiency if available
      if (inventoryMetrics.plantEfficiency && inventoryMetrics.plantEfficiency.length > 0) {
        const avgEfficiency = inventoryMetrics.plantEfficiency.reduce((sum, plant) => 
          sum + Number(plant.value), 0) / inventoryMetrics.plantEfficiency.length;
        
        kpis.push({
          id: 'avg-efficiency',
          title: 'Average Plant Efficiency',
          value: Math.round(avgEfficiency),
          format: 'percentage',
          status: avgEfficiency > 80 ? 'healthy' : avgEfficiency > 60 ? 'warning' : 'critical'
        });
      }
    }

    if (osrMetrics) {
      // Convert dashboard KPIs to export format
      const healthScore = osrMetrics.healthScore;
      const totalOSR = osrMetrics.totalOSRValue;
      const recovery = osrMetrics.recoveryPotential;
      const severity = osrMetrics.severityScore;
      
      kpis.push(
        {
          id: 'health-score',
          title: healthScore.title,
          value: healthScore.value,
          format: healthScore.format,
          status: healthScore.status,
          trend: healthScore.trend
        },
        {
          id: 'total-osr-value',
          title: totalOSR.title,
          value: totalOSR.value,
          format: totalOSR.format,
          status: totalOSR.status,
          trend: totalOSR.trend
        },
        {
          id: 'recovery-potential',
          title: recovery.title,
          value: recovery.value,
          format: recovery.format,
          status: recovery.status,
          trend: recovery.trend
        },
        {
          id: 'severity-score',
          title: severity.title,
          value: severity.value,
          format: severity.format,
          status: severity.status,
          trend: severity.trend
        }
      );
    }

    return kpis;
  }

  private static generateChartData(
    inventoryMetrics: InventoryMetrics | null,
    osrMetrics: OSRMetrics | null
  ): ChartExportData[] {
    const charts: ChartExportData[] = [];

    if (inventoryMetrics) {
      // Geographic distribution chart
      if (inventoryMetrics.geographicDistribution && inventoryMetrics.geographicDistribution.length > 0) {
        charts.push({
          id: 'geographic-distribution',
          title: 'Geographic Distribution',
          type: 'pie',
          data: inventoryMetrics.geographicDistribution,
          width: 120,
          height: 80
        });
      }

      // Plant efficiency chart
      if (inventoryMetrics.plantEfficiency && inventoryMetrics.plantEfficiency.length > 0) {
        charts.push({
          id: 'plant-efficiency',
          title: 'Plant Efficiency Comparison',
          type: 'bar',
          data: inventoryMetrics.plantEfficiency,
          width: 140,
          height: 90
        });
      }

      // Category breakdown chart
      if (inventoryMetrics.categoryBreakdown && inventoryMetrics.categoryBreakdown.length > 0) {
        charts.push({
          id: 'category-breakdown',
          title: 'Category Breakdown',
          type: 'doughnut',
          data: inventoryMetrics.categoryBreakdown,
          width: 120,
          height: 80
        });
      }
    }

    if (osrMetrics) {
      // Risk distribution
      if (osrMetrics.riskDistribution && osrMetrics.riskDistribution.length > 0) {
        charts.push({
          id: 'risk-distribution',
          title: 'Risk Distribution',
          type: 'doughnut',
          data: osrMetrics.riskDistribution,
          width: 120,
          height: 80
        });
      }

      // Aging analysis
      if (osrMetrics.agingAnalysis && osrMetrics.agingAnalysis.length > 0) {
        charts.push({
          id: 'aging-analysis',
          title: 'Aging Analysis',
          type: 'bar',
          data: osrMetrics.agingAnalysis,
          width: 140,
          height: 90
        });
      }
    }

    return charts;
  }

  private static generateTableData(
    inventoryMetrics: InventoryMetrics | null,
    osrMetrics: OSRMetrics | null
  ): TableExportData[] {
    const tables: TableExportData[] = [];

    if (inventoryMetrics) {
      // Top materials by value
      if (inventoryMetrics.topMaterialsByValue && inventoryMetrics.topMaterialsByValue.length > 0) {
        const materialRows = inventoryMetrics.topMaterialsByValue.slice(0, 10).map(material => [
          material.material.toString(),
          material.description,
          material.value.toLocaleString(),
          `${material.percentage.toFixed(1)}%`,
          material.plant
        ]);

        tables.push({
          id: 'top-materials',
          title: 'Top Materials by Value',
          headers: ['Material', 'Description', 'Value', 'Percentage', 'Plant'],
          rows: materialRows,
          totalRows: materialRows.length
        });
      }

      // Geographic distribution table
      if (inventoryMetrics.geographicDistribution && inventoryMetrics.geographicDistribution.length > 0) {
        const geoRows = inventoryMetrics.geographicDistribution.map(region => [
          region.location,
          region.value.toLocaleString(),
          `${region.percentage.toFixed(1)}%`,
          region.status.charAt(0).toUpperCase() + region.status.slice(1)
        ]);

        tables.push({
          id: 'geographic-distribution',
          title: 'Geographic Distribution',
          headers: ['Location', 'Value', 'Percentage', 'Status'],
          rows: geoRows,
          totalRows: geoRows.length
        });
      }

      // Category breakdown table
      if (inventoryMetrics.categoryBreakdown && inventoryMetrics.categoryBreakdown.length > 0) {
        const categoryRows = inventoryMetrics.categoryBreakdown.map(category => [
          category.category,
          category.value.toLocaleString(),
          `${category.percentage.toFixed(1)}%`,
          category.count.toString()
        ]);

        tables.push({
          id: 'category-breakdown',
          title: 'Category Breakdown',
          headers: ['Category', 'Value', 'Percentage', 'Item Count'],
          rows: categoryRows,
          totalRows: categoryRows.length
        });
      }
    }

    if (osrMetrics) {
      // Risk distribution table
      if (osrMetrics.riskDistribution && osrMetrics.riskDistribution.length > 0) {
        const riskRows = osrMetrics.riskDistribution.map(risk => [
          risk.category.replace('_', ' ').toUpperCase(),
          risk.value.toLocaleString(),
          `${risk.percentage.toFixed(1)}%`,
          risk.count.toString()
        ]);

        tables.push({
          id: 'risk-distribution',
          title: 'Risk Distribution',
          headers: ['Risk Category', 'Value', 'Percentage', 'Item Count'],
          rows: riskRows,
          totalRows: riskRows.length
        });
      }

      // Aging analysis table
      if (osrMetrics.agingAnalysis && osrMetrics.agingAnalysis.length > 0) {
        const agingRows = osrMetrics.agingAnalysis.map(aging => [
          aging.ageGroup,
          aging.value.toLocaleString(),
          `${aging.percentage.toFixed(1)}%`,
          `${aging.trend > 0 ? '+' : ''}${aging.trend.toFixed(1)}%`
        ]);

        tables.push({
          id: 'aging-analysis',
          title: 'Aging Analysis',
          headers: ['Age Group', 'Value', 'Percentage', 'Trend'],
          rows: agingRows,
          totalRows: agingRows.length
        });
      }
    }

    return tables;
  }

  static async generateChartImages(charts: ChartExportData[]): Promise<ChartExportData[]> {
    // This would integrate with Chart.js to generate actual chart images
    // For now, we'll return the charts as-is without dataUrl
    // In a real implementation, you'd render charts to canvas and convert to dataURL
    
    return charts.map(chart => ({
      ...chart,
      // dataUrl would be generated here from actual chart rendering
      dataUrl: undefined
    }));
  }
}