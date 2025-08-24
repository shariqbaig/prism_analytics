import type { ProcessedSheet } from '@/types/fileProcessing';

// Core business calculation interfaces
export interface InventoryMetrics {
  portfolioConcentration: {
    topItemsPercentage: number;
    diversificationIndex: number;
    concentrationRisk: 'low' | 'medium' | 'high';
  };
  plantEfficiency: {
    utilizationRate: number;
    throughputScore: number;
    efficiencyGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  };
  geographicDistribution: {
    regionCount: number;
    distributionBalance: number;
    riskSpread: 'concentrated' | 'balanced' | 'distributed';
  };
  overallHealth: number; // 0-100 percentage
}

export interface OSRMetrics {
  healthPercentage: number;
  severityScore: {
    criticalIssues: number;
    majorIssues: number;
    minorIssues: number;
    overallSeverity: 'low' | 'medium' | 'high' | 'critical';
  };
  recoveryPotential: {
    quickWins: number;
    mediumTermActions: number;
    longTermStrategic: number;
    recoverabilityScore: number; // 0-100
  };
  riskAssessment: {
    immediateRisks: number;
    emergingRisks: number;
    riskTrend: 'improving' | 'stable' | 'degrading';
  };
}

export interface CombinedMetrics {
  overallPortfolioHealth: number;
  riskExposure: number;
  operationalEfficiency: number;
  strategicAlignment: number;
  recommendedActions: string[];
}

// Utility functions for data processing
export class DataProcessor {
  /**
   * Safely extract numeric values from data rows
   */
  static extractNumericValue(row: Record<string, unknown>, key: string): number {
    const value = row[key];
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[,$]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  /**
   * Extract string values with fallbacks
   */
  static extractStringValue(row: Record<string, unknown>, key: string, fallback = ''): string {
    const value = row[key];
    return typeof value === 'string' ? value.trim() : fallback;
  }

  /**
   * Calculate percentile for a dataset
   */
  static calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) return sorted[lower];
    
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  /**
   * Calculate Herfindahl-Hirschman Index for concentration
   */
  static calculateHHI(values: number[]): number {
    const total = values.reduce((sum, val) => sum + val, 0);
    if (total === 0) return 0;
    
    return values.reduce((hhi, val) => {
      const share = val / total;
      return hhi + (share * share);
    }, 0) * 10000; // Multiply by 10000 for standard HHI scale
  }

  /**
   * Handle partial datasets by filtering out invalid entries
   */
  static filterValidData<T extends Record<string, unknown>>(
    data: T[], 
    requiredFields: string[]
  ): T[] {
    return data.filter(row => 
      requiredFields.every(field => {
        const value = row[field];
        return value !== null && value !== undefined && value !== '';
      })
    );
  }
}

// Inventory Metrics Calculator
export class InventoryCalculator {
  /**
   * Calculate portfolio concentration metrics
   */
  static calculatePortfolioConcentration(sheets: ProcessedSheet[]): InventoryMetrics['portfolioConcentration'] {
    const inventorySheets = sheets.filter(sheet => sheet.type === 'inventory');
    
    if (inventorySheets.length === 0) {
      return {
        topItemsPercentage: 0,
        diversificationIndex: 0,
        concentrationRisk: 'low'
      };
    }

    const allItems: number[] = [];
    
    // Extract values from all inventory sheets
    inventorySheets.forEach(sheet => {
      const validData = DataProcessor.filterValidData(sheet.data, ['value', 'amount']);
      
      validData.forEach(row => {
        const value = DataProcessor.extractNumericValue(row, 'value') || 
                     DataProcessor.extractNumericValue(row, 'amount') ||
                     DataProcessor.extractNumericValue(row, 'total');
        
        if (value > 0) allItems.push(value);
      });
    });

    if (allItems.length === 0) {
      return {
        topItemsPercentage: 0,
        diversificationIndex: 0,
        concentrationRisk: 'low'
      };
    }

    // Sort items by value descending
    const sortedItems = allItems.sort((a, b) => b - a);
    const totalValue = sortedItems.reduce((sum, val) => sum + val, 0);
    
    // Calculate top 20% concentration
    const top20Count = Math.max(1, Math.ceil(sortedItems.length * 0.2));
    const top20Value = sortedItems.slice(0, top20Count).reduce((sum, val) => sum + val, 0);
    const topItemsPercentage = (top20Value / totalValue) * 100;

    // Calculate diversification using HHI
    const hhi = DataProcessor.calculateHHI(sortedItems);
    const diversificationIndex = Math.max(0, 100 - (hhi / 100)); // Invert HHI for diversification

    // Determine concentration risk
    let concentrationRisk: 'low' | 'medium' | 'high';
    if (topItemsPercentage > 80) concentrationRisk = 'high';
    else if (topItemsPercentage > 60) concentrationRisk = 'medium';
    else concentrationRisk = 'low';

    return {
      topItemsPercentage: Math.round(topItemsPercentage * 100) / 100,
      diversificationIndex: Math.round(diversificationIndex * 100) / 100,
      concentrationRisk
    };
  }

  /**
   * Calculate plant efficiency metrics
   */
  static calculatePlantEfficiency(sheets: ProcessedSheet[]): InventoryMetrics['plantEfficiency'] {
    const inventorySheets = sheets.filter(sheet => sheet.type === 'inventory');
    
    if (inventorySheets.length === 0) {
      return {
        utilizationRate: 0,
        throughputScore: 0,
        efficiencyGrade: 'F'
      };
    }

    let totalUtilization = 0;
    let totalThroughput = 0;
    let validPlantCount = 0;

    inventorySheets.forEach(sheet => {
      const validData = DataProcessor.filterValidData(sheet.data, ['plant', 'utilization']);
      
      // Group by plant/location
      const plantData = new Map<string, { utilization: number[], throughput: number[] }>();
      
      validData.forEach(row => {
        const plant = DataProcessor.extractStringValue(row, 'plant') || 
                     DataProcessor.extractStringValue(row, 'location') ||
                     DataProcessor.extractStringValue(row, 'facility');
        
        const utilization = DataProcessor.extractNumericValue(row, 'utilization') ||
                           DataProcessor.extractNumericValue(row, 'efficiency') ||
                           DataProcessor.extractNumericValue(row, 'capacity_used');

        const throughput = DataProcessor.extractNumericValue(row, 'throughput') ||
                          DataProcessor.extractNumericValue(row, 'output') ||
                          DataProcessor.extractNumericValue(row, 'production');

        if (plant && (utilization > 0 || throughput > 0)) {
          if (!plantData.has(plant)) {
            plantData.set(plant, { utilization: [], throughput: [] });
          }
          
          if (utilization > 0) plantData.get(plant)!.utilization.push(utilization);
          if (throughput > 0) plantData.get(plant)!.throughput.push(throughput);
        }
      });

      // Calculate averages per plant
      plantData.forEach(data => {
        if (data.utilization.length > 0) {
          const avgUtilization = data.utilization.reduce((sum, val) => sum + val, 0) / data.utilization.length;
          totalUtilization += Math.min(100, avgUtilization); // Cap at 100%
        }
        
        if (data.throughput.length > 0) {
          const avgThroughput = data.throughput.reduce((sum, val) => sum + val, 0) / data.throughput.length;
          totalThroughput += avgThroughput;
        }
        
        validPlantCount++;
      });
    });

    if (validPlantCount === 0) {
      return {
        utilizationRate: 0,
        throughputScore: 0,
        efficiencyGrade: 'F'
      };
    }

    const utilizationRate = totalUtilization / validPlantCount;
    const throughputScore = Math.min(100, (totalThroughput / validPlantCount) / 10); // Scale throughput to 0-100

    // Calculate efficiency grade
    const overallEfficiency = (utilizationRate + throughputScore) / 2;
    let efficiencyGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    
    if (overallEfficiency >= 90) efficiencyGrade = 'A';
    else if (overallEfficiency >= 80) efficiencyGrade = 'B';
    else if (overallEfficiency >= 70) efficiencyGrade = 'C';
    else if (overallEfficiency >= 60) efficiencyGrade = 'D';
    else efficiencyGrade = 'F';

    return {
      utilizationRate: Math.round(utilizationRate * 100) / 100,
      throughputScore: Math.round(throughputScore * 100) / 100,
      efficiencyGrade
    };
  }

  /**
   * Calculate geographic distribution metrics
   */
  static calculateGeographicDistribution(sheets: ProcessedSheet[]): InventoryMetrics['geographicDistribution'] {
    const inventorySheets = sheets.filter(sheet => sheet.type === 'inventory');
    
    if (inventorySheets.length === 0) {
      return {
        regionCount: 0,
        distributionBalance: 0,
        riskSpread: 'concentrated'
      };
    }

    const regionValues = new Map<string, number>();

    inventorySheets.forEach(sheet => {
      const validData = DataProcessor.filterValidData(sheet.data, ['region']);
      
      validData.forEach(row => {
        const region = DataProcessor.extractStringValue(row, 'region') ||
                      DataProcessor.extractStringValue(row, 'location') ||
                      DataProcessor.extractStringValue(row, 'country') ||
                      DataProcessor.extractStringValue(row, 'state');

        const value = DataProcessor.extractNumericValue(row, 'value') ||
                     DataProcessor.extractNumericValue(row, 'amount') ||
                     1; // Default count if no value

        if (region) {
          regionValues.set(region, (regionValues.get(region) || 0) + value);
        }
      });
    });

    const regionCount = regionValues.size;
    
    if (regionCount === 0) {
      return {
        regionCount: 0,
        distributionBalance: 0,
        riskSpread: 'concentrated'
      };
    }

    // Calculate distribution balance using coefficient of variation
    const values = Array.from(regionValues.values());
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 0;
    
    // Convert to balance score (lower variation = higher balance)
    const distributionBalance = Math.max(0, 100 - (coefficientOfVariation * 100));

    // Determine risk spread
    let riskSpread: 'concentrated' | 'balanced' | 'distributed';
    if (regionCount === 1 || distributionBalance < 40) riskSpread = 'concentrated';
    else if (regionCount <= 3 || distributionBalance < 70) riskSpread = 'balanced';
    else riskSpread = 'distributed';

    return {
      regionCount,
      distributionBalance: Math.round(distributionBalance * 100) / 100,
      riskSpread
    };
  }

  /**
   * Calculate overall inventory health
   */
  static calculateOverallHealth(metrics: Omit<InventoryMetrics, 'overallHealth'>): number {
    const concentrationScore = metrics.portfolioConcentration.diversificationIndex;
    
    let efficiencyScore = 0;
    switch (metrics.plantEfficiency.efficiencyGrade) {
      case 'A': efficiencyScore = 95; break;
      case 'B': efficiencyScore = 85; break;
      case 'C': efficiencyScore = 75; break;
      case 'D': efficiencyScore = 65; break;
      case 'F': efficiencyScore = 45; break;
    }

    const distributionScore = metrics.geographicDistribution.distributionBalance;

    // Weighted average: 40% efficiency, 30% distribution, 30% concentration
    const overallHealth = (efficiencyScore * 0.4) + (distributionScore * 0.3) + (concentrationScore * 0.3);
    
    return Math.round(overallHealth * 100) / 100;
  }

  /**
   * Calculate all inventory metrics
   */
  static calculateAllMetrics(sheets: ProcessedSheet[]): InventoryMetrics {
    const portfolioConcentration = this.calculatePortfolioConcentration(sheets);
    const plantEfficiency = this.calculatePlantEfficiency(sheets);
    const geographicDistribution = this.calculateGeographicDistribution(sheets);
    
    const overallHealth = this.calculateOverallHealth({
      portfolioConcentration,
      plantEfficiency,
      geographicDistribution
    });

    return {
      portfolioConcentration,
      plantEfficiency,
      geographicDistribution,
      overallHealth
    };
  }
}