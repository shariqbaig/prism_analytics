import type { ProcessedSheet } from '@/types/fileProcessing';
import { InventoryCalculator, type InventoryMetrics } from './businessCalculations';
import { OSRCalculator, type OSRMetrics } from './osrCalculations';
import type { CombinedMetrics } from './businessCalculations';

// Strategic alignment categories
interface StrategyAlignment {
  inventoryOptimization: number;
  riskMitigation: number;
  operationalExcellence: number;
  growthReadiness: number;
}

// Business Intelligence Calculator for Combined Analysis
export class BusinessIntelligenceCalculator {
  /**
   * Calculate comprehensive metrics from both inventory and OSR data
   */
  static calculateCombinedMetrics(
    inventorySheets: ProcessedSheet[],
    osrSheets: ProcessedSheet[]
  ): CombinedMetrics {
    const inventoryMetrics = InventoryCalculator.calculateAllMetrics(inventorySheets);
    const osrMetrics = OSRCalculator.calculateAllMetrics(osrSheets);

    const overallPortfolioHealth = this.calculateOverallPortfolioHealth(inventoryMetrics, osrMetrics);
    const riskExposure = this.calculateRiskExposure(inventoryMetrics, osrMetrics);
    const operationalEfficiency = this.calculateOperationalEfficiency(inventoryMetrics, osrMetrics);
    const strategicAlignment = this.calculateStrategicAlignment(inventoryMetrics, osrMetrics);
    const recommendedActions = this.generateRecommendations(inventoryMetrics, osrMetrics);

    return {
      overallPortfolioHealth,
      riskExposure,
      operationalEfficiency,
      strategicAlignment,
      recommendedActions
    };
  }

  /**
   * Calculate overall portfolio health combining inventory and OSR health
   */
  private static calculateOverallPortfolioHealth(
    inventory: InventoryMetrics,
    osr: OSRMetrics
  ): number {
    // Weight inventory health at 60%, OSR health at 40%
    const inventoryWeight = 0.6;
    const osrWeight = 0.4;
    
    const combinedHealth = (inventory.overallHealth * inventoryWeight) + 
                          (osr.healthPercentage * osrWeight);
    
    // Apply penalty for critical OSR issues
    let criticalPenalty = 0;
    if (osr.severityScore.criticalIssues > 0) {
      criticalPenalty = Math.min(15, osr.severityScore.criticalIssues * 5);
    }
    
    return Math.max(0, Math.round((combinedHealth - criticalPenalty) * 100) / 100);
  }

  /**
   * Calculate overall risk exposure
   */
  private static calculateRiskExposure(
    inventory: InventoryMetrics,
    osr: OSRMetrics
  ): number {
    // Inventory risk factors
    let inventoryRisk = 0;
    
    // Concentration risk
    if (inventory.portfolioConcentration.concentrationRisk === 'high') inventoryRisk += 25;
    else if (inventory.portfolioConcentration.concentrationRisk === 'medium') inventoryRisk += 15;
    
    // Geographic risk
    if (inventory.geographicDistribution.riskSpread === 'concentrated') inventoryRisk += 20;
    else if (inventory.geographicDistribution.riskSpread === 'balanced') inventoryRisk += 10;
    
    // Efficiency risk
    if (['D', 'F'].includes(inventory.plantEfficiency.efficiencyGrade)) inventoryRisk += 15;
    else if (inventory.plantEfficiency.efficiencyGrade === 'C') inventoryRisk += 8;
    
    // OSR risk factors
    let osrRisk = 0;
    
    // Severity-based risk
    osrRisk += osr.severityScore.criticalIssues * 8;
    osrRisk += osr.severityScore.majorIssues * 3;
    osrRisk += osr.severityScore.minorIssues * 1;
    
    // Immediate risk exposure
    osrRisk += osr.riskAssessment.immediateRisks * 5;
    osrRisk += osr.riskAssessment.emergingRisks * 2;
    
    // Trend adjustment
    if (osr.riskAssessment.riskTrend === 'degrading') osrRisk *= 1.2;
    else if (osr.riskAssessment.riskTrend === 'improving') osrRisk *= 0.8;
    
    // Combine risks (60% OSR, 40% inventory for risk calculation)
    const combinedRisk = (osrRisk * 0.6) + (inventoryRisk * 0.4);
    
    return Math.min(100, Math.round(combinedRisk * 100) / 100);
  }

  /**
   * Calculate operational efficiency combining both data sources
   */
  private static calculateOperationalEfficiency(
    inventory: InventoryMetrics,
    osr: OSRMetrics
  ): number {
    // Base efficiency from inventory metrics
    let inventoryEfficiency = 0;
    switch (inventory.plantEfficiency.efficiencyGrade) {
      case 'A': inventoryEfficiency = 95; break;
      case 'B': inventoryEfficiency = 85; break;
      case 'C': inventoryEfficiency = 75; break;
      case 'D': inventoryEfficiency = 65; break;
      case 'F': inventoryEfficiency = 45; break;
    }
    
    // Adjust for utilization rate
    const utilizationAdjustment = (inventory.plantEfficiency.utilizationRate - 75) * 0.3;
    inventoryEfficiency += utilizationAdjustment;
    
    // OSR efficiency factors
    let osrEfficiencyImpact = 0;
    
    // Recovery potential indicates process efficiency
    osrEfficiencyImpact += osr.recoveryPotential.recoverabilityScore * 0.3;
    
    // Health percentage indicates system efficiency
    osrEfficiencyImpact += osr.healthPercentage * 0.4;
    
    // Critical issues severely impact efficiency
    const criticalImpact = osr.severityScore.criticalIssues * -8;
    const majorImpact = osr.severityScore.majorIssues * -3;
    
    osrEfficiencyImpact += criticalImpact + majorImpact;
    
    // Combine efficiency scores (70% inventory, 30% OSR impact)
    const combinedEfficiency = (inventoryEfficiency * 0.7) + (osrEfficiencyImpact * 0.3);
    
    return Math.max(0, Math.min(100, Math.round(combinedEfficiency * 100) / 100));
  }

  /**
   * Calculate strategic alignment score
   */
  private static calculateStrategicAlignment(
    inventory: InventoryMetrics,
    osr: OSRMetrics
  ): number {
    const alignment: StrategyAlignment = {
      inventoryOptimization: this.assessInventoryOptimization(inventory),
      riskMitigation: this.assessRiskMitigation(inventory, osr),
      operationalExcellence: this.assessOperationalExcellence(inventory, osr),
      growthReadiness: this.assessGrowthReadiness(inventory, osr)
    };
    
    // Equal weights for all strategic areas
    const overallAlignment = (
      alignment.inventoryOptimization +
      alignment.riskMitigation +
      alignment.operationalExcellence +
      alignment.growthReadiness
    ) / 4;
    
    return Math.round(overallAlignment * 100) / 100;
  }

  /**
   * Generate actionable recommendations based on analysis
   */
  private static generateRecommendations(
    inventory: InventoryMetrics,
    osr: OSRMetrics
  ): string[] {
    const recommendations: string[] = [];
    
    // Inventory-based recommendations
    if (inventory.portfolioConcentration.concentrationRisk === 'high') {
      recommendations.push('Diversify portfolio to reduce concentration risk - top 20% of items represent over 80% of value');
    }
    
    if (inventory.geographicDistribution.riskSpread === 'concentrated') {
      recommendations.push('Expand geographic distribution to mitigate regional risk exposure');
    }
    
    if (['D', 'F'].includes(inventory.plantEfficiency.efficiencyGrade)) {
      recommendations.push('Immediate attention required for plant efficiency - current grade indicates significant optimization opportunity');
    }
    
    if (inventory.plantEfficiency.utilizationRate < 70) {
      recommendations.push('Improve plant utilization rates - current rate below optimal threshold');
    }
    
    // OSR-based recommendations
    if (osr.severityScore.criticalIssues > 0) {
      recommendations.push(`Address ${osr.severityScore.criticalIssues} critical issues immediately - these pose significant operational risk`);
    }
    
    if (osr.recoveryPotential.quickWins > 0) {
      recommendations.push(`Prioritize ${osr.recoveryPotential.quickWins} quick wins - high impact, low effort improvements available`);
    }
    
    if (osr.riskAssessment.immediateRisks > 2) {
      recommendations.push('Develop immediate risk mitigation plan - multiple urgent risks identified');
    }
    
    if (osr.riskAssessment.riskTrend === 'degrading') {
      recommendations.push('Investigate root causes of degrading risk trend - early intervention critical');
    }
    
    // Combined recommendations
    if (inventory.overallHealth < 70 && osr.healthPercentage < 70) {
      recommendations.push('Comprehensive operational review recommended - both inventory and OSR metrics indicate systemic issues');
    }
    
    if (osr.recoveryPotential.recoverabilityScore > 70 && inventory.overallHealth > 80) {
      recommendations.push('Good foundation for growth - focus on executing recovery plan while maintaining inventory performance');
    }
    
    // Strategic recommendations
    const riskExposure = this.calculateRiskExposure(inventory, osr);
    if (riskExposure > 60) {
      recommendations.push('Develop comprehensive risk management strategy - exposure levels require immediate attention');
    }
    
    // Ensure we have at least some recommendations
    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring current performance levels and maintain established processes');
    }
    
    // Limit to top 8 recommendations
    return recommendations.slice(0, 8);
  }

  // Strategic assessment helper methods
  private static assessInventoryOptimization(inventory: InventoryMetrics): number {
    let score = 0;
    
    // Portfolio diversification
    score += inventory.portfolioConcentration.diversificationIndex * 0.4;
    
    // Geographic distribution
    score += inventory.geographicDistribution.distributionBalance * 0.3;
    
    // Plant efficiency
    const efficiencyScore = this.gradeToScore(inventory.plantEfficiency.efficiencyGrade);
    score += efficiencyScore * 0.3;
    
    return Math.min(100, score);
  }

  private static assessRiskMitigation(inventory: InventoryMetrics, osr: OSRMetrics): number {
    let score = 100;
    
    // Deduct for concentration risk
    if (inventory.portfolioConcentration.concentrationRisk === 'high') score -= 30;
    else if (inventory.portfolioConcentration.concentrationRisk === 'medium') score -= 15;
    
    // Deduct for geographic concentration
    if (inventory.geographicDistribution.riskSpread === 'concentrated') score -= 20;
    
    // Deduct for OSR issues
    score -= osr.severityScore.criticalIssues * 10;
    score -= osr.severityScore.majorIssues * 5;
    score -= osr.riskAssessment.immediateRisks * 8;
    
    return Math.max(0, score);
  }

  private static assessOperationalExcellence(inventory: InventoryMetrics, osr: OSRMetrics): number {
    const inventoryScore = this.gradeToScore(inventory.plantEfficiency.efficiencyGrade);
    const osrScore = osr.healthPercentage;
    const recoveryScore = osr.recoveryPotential.recoverabilityScore;
    
    return (inventoryScore * 0.5) + (osrScore * 0.3) + (recoveryScore * 0.2);
  }

  private static assessGrowthReadiness(inventory: InventoryMetrics, osr: OSRMetrics): number {
    let score = inventory.overallHealth * 0.4;
    score += osr.healthPercentage * 0.3;
    score += osr.recoveryPotential.recoverabilityScore * 0.3;
    
    // Penalty for critical issues that would block growth
    score -= osr.severityScore.criticalIssues * 15;
    
    return Math.max(0, Math.min(100, score));
  }

  private static gradeToScore(grade: string): number {
    switch (grade) {
      case 'A': return 95;
      case 'B': return 85;
      case 'C': return 75;
      case 'D': return 65;
      case 'F': return 45;
      default: return 50;
    }
  }

  /**
   * Calculate metrics with partial datasets - handles missing inventory or OSR data
   */
  static calculateWithPartialData(
    inventorySheets: ProcessedSheet[] = [],
    osrSheets: ProcessedSheet[] = []
  ): Partial<CombinedMetrics> {
    const hasInventory = inventorySheets.length > 0;
    const hasOSR = osrSheets.length > 0;

    if (!hasInventory && !hasOSR) {
      return {
        overallPortfolioHealth: 0,
        riskExposure: 0,
        operationalEfficiency: 0,
        strategicAlignment: 0,
        recommendedActions: ['No data available for analysis']
      };
    }

    if (hasInventory && hasOSR) {
      // Full analysis available
      return this.calculateCombinedMetrics(inventorySheets, osrSheets);
    }

    // Partial analysis
    if (hasInventory) {
      const inventoryMetrics = InventoryCalculator.calculateAllMetrics(inventorySheets);
      return {
        overallPortfolioHealth: inventoryMetrics.overallHealth,
        riskExposure: this.calculateInventoryOnlyRisk(inventoryMetrics),
        operationalEfficiency: this.gradeToScore(inventoryMetrics.plantEfficiency.efficiencyGrade),
        strategicAlignment: this.assessInventoryOptimization(inventoryMetrics),
        recommendedActions: this.generateInventoryOnlyRecommendations(inventoryMetrics)
      };
    }

    if (hasOSR) {
      const osrMetrics = OSRCalculator.calculateAllMetrics(osrSheets);
      return {
        overallPortfolioHealth: osrMetrics.healthPercentage,
        riskExposure: this.calculateOSROnlyRisk(osrMetrics),
        operationalEfficiency: osrMetrics.healthPercentage,
        strategicAlignment: osrMetrics.recoveryPotential.recoverabilityScore,
        recommendedActions: this.generateOSROnlyRecommendations(osrMetrics)
      };
    }

    return {};
  }

  // Helper methods for partial data scenarios
  private static calculateInventoryOnlyRisk(inventory: InventoryMetrics): number {
    let risk = 0;
    if (inventory.portfolioConcentration.concentrationRisk === 'high') risk += 30;
    else if (inventory.portfolioConcentration.concentrationRisk === 'medium') risk += 15;
    
    if (inventory.geographicDistribution.riskSpread === 'concentrated') risk += 25;
    
    if (['D', 'F'].includes(inventory.plantEfficiency.efficiencyGrade)) risk += 20;
    
    return Math.min(100, risk);
  }

  private static calculateOSROnlyRisk(osr: OSRMetrics): number {
    let risk = osr.severityScore.criticalIssues * 15;
    risk += osr.severityScore.majorIssues * 5;
    risk += osr.riskAssessment.immediateRisks * 10;
    
    return Math.min(100, risk);
  }

  private static generateInventoryOnlyRecommendations(inventory: InventoryMetrics): string[] {
    const recommendations: string[] = ['Analysis based on inventory data only - OSR data recommended for comprehensive assessment'];
    
    if (inventory.portfolioConcentration.concentrationRisk === 'high') {
      recommendations.push('Diversify portfolio to reduce concentration risk');
    }
    if (inventory.geographicDistribution.riskSpread === 'concentrated') {
      recommendations.push('Consider geographic expansion to mitigate risk');
    }
    if (['D', 'F'].includes(inventory.plantEfficiency.efficiencyGrade)) {
      recommendations.push('Focus on plant efficiency improvements');
    }
    
    return recommendations;
  }

  private static generateOSROnlyRecommendations(osr: OSRMetrics): string[] {
    const recommendations: string[] = ['Analysis based on OSR data only - inventory data recommended for complete business view'];
    
    if (osr.severityScore.criticalIssues > 0) {
      recommendations.push(`Address ${osr.severityScore.criticalIssues} critical issues immediately`);
    }
    if (osr.recoveryPotential.quickWins > 0) {
      recommendations.push(`Execute ${osr.recoveryPotential.quickWins} quick wins for immediate impact`);
    }
    
    return recommendations;
  }
}