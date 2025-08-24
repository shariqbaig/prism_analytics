import type { ProcessedSheet } from '@/types/fileProcessing';
import { DataProcessor } from './businessCalculations';
import type { OSRMetrics } from './businessCalculations';

export type { OSRMetrics };

// OSR-specific data interfaces
interface OSRIssue {
  id: string;
  severity: 'critical' | 'major' | 'minor';
  category: string;
  impact: number; // 1-10 scale
  effort: number; // 1-10 scale (lower = easier to fix)
  timeline: 'immediate' | 'short' | 'medium' | 'long';
}

interface OSRHealthIndicator {
  category: string;
  score: number; // 0-100
  weight: number; // Importance weight
  trend: 'improving' | 'stable' | 'degrading';
}

// OSR Metrics Calculator
export class OSRCalculator {
  /**
   * Calculate health percentage based on various OSR indicators
   */
  static calculateHealthPercentage(sheets: ProcessedSheet[]): number {
    const osrSheets = sheets.filter(sheet => sheet.type === 'osr');
    
    if (osrSheets.length === 0) return 0;

    const healthIndicators: OSRHealthIndicator[] = [];

    osrSheets.forEach(sheet => {
      const validData = DataProcessor.filterValidData(sheet.data, ['category', 'score']);
      
      validData.forEach(row => {
        const category = DataProcessor.extractStringValue(row, 'category') ||
                        DataProcessor.extractStringValue(row, 'metric') ||
                        DataProcessor.extractStringValue(row, 'indicator');

        const score = DataProcessor.extractNumericValue(row, 'score') ||
                     DataProcessor.extractNumericValue(row, 'health') ||
                     DataProcessor.extractNumericValue(row, 'rating');

        const weight = DataProcessor.extractNumericValue(row, 'weight') ||
                      DataProcessor.extractNumericValue(row, 'importance') || 1;

        if (category && score >= 0 && score <= 100) {
          // Determine trend from additional columns
          let trend: 'improving' | 'stable' | 'degrading' = 'stable';
          const trendValue = DataProcessor.extractStringValue(row, 'trend').toLowerCase();
          if (trendValue.includes('improv') || trendValue.includes('better')) trend = 'improving';
          else if (trendValue.includes('degrad') || trendValue.includes('worse')) trend = 'degrading';

          healthIndicators.push({
            category,
            score: Math.min(100, Math.max(0, score)),
            weight: Math.max(0.1, weight),
            trend
          });
        }
      });
    });

    if (healthIndicators.length === 0) return 0;

    // Calculate weighted average health
    const totalWeight = healthIndicators.reduce((sum, indicator) => sum + indicator.weight, 0);
    const weightedScore = healthIndicators.reduce((sum, indicator) => 
      sum + (indicator.score * indicator.weight), 0
    );

    const baseHealth = weightedScore / totalWeight;

    // Apply trend adjustments
    const trendAdjustment = healthIndicators.reduce((adjustment, indicator) => {
      const weight = indicator.weight / totalWeight;
      if (indicator.trend === 'improving') return adjustment + (weight * 2);
      if (indicator.trend === 'degrading') return adjustment - (weight * 3);
      return adjustment;
    }, 0);

    const finalHealth = Math.max(0, Math.min(100, baseHealth + trendAdjustment));
    return Math.round(finalHealth * 100) / 100;
  }

  /**
   * Calculate severity score and categorize issues
   */
  static calculateSeverityScore(sheets: ProcessedSheet[]): OSRMetrics['severityScore'] {
    const osrSheets = sheets.filter(sheet => sheet.type === 'osr');
    
    if (osrSheets.length === 0) {
      return {
        criticalIssues: 0,
        majorIssues: 0,
        minorIssues: 0,
        overallSeverity: 'low'
      };
    }

    const issues: OSRIssue[] = [];

    osrSheets.forEach(sheet => {
      sheet.data.forEach((row, index) => {
        const severity = DataProcessor.extractStringValue(row, 'severity') ||
                        DataProcessor.extractStringValue(row, 'priority') ||
                        DataProcessor.extractStringValue(row, 'level');

        const category = DataProcessor.extractStringValue(row, 'category') ||
                        DataProcessor.extractStringValue(row, 'type') ||
                        'General';

        const impact = DataProcessor.extractNumericValue(row, 'impact') ||
                      DataProcessor.extractNumericValue(row, 'score') ||
                      this.inferImpactFromSeverity(severity);

        const effort = DataProcessor.extractNumericValue(row, 'effort') ||
                      DataProcessor.extractNumericValue(row, 'complexity') ||
                      Math.floor(Math.random() * 5) + 3; // Random 3-7 if not specified

        // Normalize severity
        let normalizedSeverity: 'critical' | 'major' | 'minor' = 'minor';
        const severityLower = severity.toLowerCase();
        if (severityLower.includes('critical') || severityLower.includes('high') || impact >= 8) {
          normalizedSeverity = 'critical';
        } else if (severityLower.includes('major') || severityLower.includes('medium') || impact >= 5) {
          normalizedSeverity = 'major';
        }

        // Determine timeline based on severity and effort
        let timeline: 'immediate' | 'short' | 'medium' | 'long' = 'medium';
        if (normalizedSeverity === 'critical') timeline = 'immediate';
        else if (normalizedSeverity === 'major' && effort <= 5) timeline = 'short';
        else if (effort >= 8) timeline = 'long';

        issues.push({
          id: `${sheet.name}_${index}`,
          severity: normalizedSeverity,
          category,
          impact,
          effort,
          timeline
        });
      });
    });

    // Count issues by severity
    const criticalIssues = issues.filter(issue => issue.severity === 'critical').length;
    const majorIssues = issues.filter(issue => issue.severity === 'major').length;
    const minorIssues = issues.filter(issue => issue.severity === 'minor').length;

    // Determine overall severity
    let overallSeverity: 'low' | 'medium' | 'high' | 'critical';
    if (criticalIssues > 0) {
      overallSeverity = criticalIssues >= 3 ? 'critical' : 'high';
    } else if (majorIssues > 5) {
      overallSeverity = 'high';
    } else if (majorIssues > 0 || minorIssues > 10) {
      overallSeverity = 'medium';
    } else {
      overallSeverity = 'low';
    }

    return {
      criticalIssues,
      majorIssues,
      minorIssues,
      overallSeverity
    };
  }

  /**
   * Calculate recovery potential based on issue effort and impact
   */
  static calculateRecoveryPotential(sheets: ProcessedSheet[]): OSRMetrics['recoveryPotential'] {
    const osrSheets = sheets.filter(sheet => sheet.type === 'osr');
    
    if (osrSheets.length === 0) {
      return {
        quickWins: 0,
        mediumTermActions: 0,
        longTermStrategic: 0,
        recoverabilityScore: 0
      };
    }

    const issues: OSRIssue[] = [];

    // Extract issues (reusing logic from severity calculation but focusing on recovery)
    osrSheets.forEach(sheet => {
      sheet.data.forEach((row, index) => {
        const impact = DataProcessor.extractNumericValue(row, 'impact') ||
                      DataProcessor.extractNumericValue(row, 'benefit') ||
                      Math.floor(Math.random() * 5) + 3;

        const effort = DataProcessor.extractNumericValue(row, 'effort') ||
                      DataProcessor.extractNumericValue(row, 'complexity') ||
                      Math.floor(Math.random() * 5) + 3;

        const severity = DataProcessor.extractStringValue(row, 'severity') ||
                        DataProcessor.extractStringValue(row, 'priority') || 'minor';

        const category = DataProcessor.extractStringValue(row, 'category') || 'General';

        issues.push({
          id: `${sheet.name}_${index}`,
          severity: this.normalizeSeverity(severity),
          category,
          impact: Math.min(10, Math.max(1, impact)),
          effort: Math.min(10, Math.max(1, effort)),
          timeline: this.determineTimeline(impact, effort)
        });
      });
    });

    // Categorize recovery actions
    const quickWins = issues.filter(issue => 
      issue.impact >= 6 && issue.effort <= 4 // High impact, low effort
    ).length;

    const mediumTermActions = issues.filter(issue =>
      (issue.impact >= 5 && issue.effort >= 4 && issue.effort <= 7) || // Medium impact, medium effort
      (issue.impact >= 7 && issue.effort >= 5 && issue.effort <= 8)   // High impact, higher effort
    ).length;

    const longTermStrategic = issues.filter(issue =>
      issue.effort >= 8 || (issue.impact >= 8 && issue.effort >= 6) // High effort or strategic high-impact
    ).length;

    // Calculate recoverability score
    const totalIssues = issues.length;
    if (totalIssues === 0) {
      return {
        quickWins: 0,
        mediumTermActions: 0,
        longTermStrategic: 0,
        recoverabilityScore: 100 // No issues means perfect recovery potential
      };
    }

    // Weight quick wins more heavily in recoverability score
    const recoveryOpportunities = (quickWins * 3) + (mediumTermActions * 2) + (longTermStrategic * 1);
    const maxPossibleScore = totalIssues * 3; // If all were quick wins
    const recoverabilityScore = (recoveryOpportunities / maxPossibleScore) * 100;

    return {
      quickWins,
      mediumTermActions,
      longTermStrategic,
      recoverabilityScore: Math.round(recoverabilityScore * 100) / 100
    };
  }

  /**
   * Assess overall risk based on current state and trends
   */
  static calculateRiskAssessment(sheets: ProcessedSheet[]): OSRMetrics['riskAssessment'] {
    const osrSheets = sheets.filter(sheet => sheet.type === 'osr');
    
    if (osrSheets.length === 0) {
      return {
        immediateRisks: 0,
        emergingRisks: 0,
        riskTrend: 'stable'
      };
    }

    let immediateRisks = 0;
    let emergingRisks = 0;
    const riskTrends: string[] = [];

    osrSheets.forEach(sheet => {
      sheet.data.forEach(row => {
        const urgency = DataProcessor.extractStringValue(row, 'urgency') ||
                       DataProcessor.extractStringValue(row, 'timeline') ||
                       DataProcessor.extractStringValue(row, 'priority');

        const riskLevel = DataProcessor.extractNumericValue(row, 'risk') ||
                         DataProcessor.extractNumericValue(row, 'probability') ||
                         this.inferRiskLevel(urgency);

        const trend = DataProcessor.extractStringValue(row, 'trend') ||
                     DataProcessor.extractStringValue(row, 'direction');

        // Count immediate risks (urgent or high probability)
        if (urgency.toLowerCase().includes('immediate') || 
            urgency.toLowerCase().includes('urgent') || 
            riskLevel >= 7) {
          immediateRisks++;
        }

        // Count emerging risks (medium timeline, moderate probability)
        if (urgency.toLowerCase().includes('emerging') ||
            urgency.toLowerCase().includes('medium') ||
            (riskLevel >= 4 && riskLevel < 7)) {
          emergingRisks++;
        }

        // Collect trend indicators
        if (trend) {
          riskTrends.push(trend.toLowerCase());
        }
      });
    });

    // Analyze overall risk trend
    let riskTrend: 'improving' | 'stable' | 'degrading' = 'stable';
    const improvingCount = riskTrends.filter(trend => 
      trend.includes('improv') || trend.includes('better') || trend.includes('reduc')
    ).length;
    
    const degradingCount = riskTrends.filter(trend =>
      trend.includes('wors') || trend.includes('increas') || trend.includes('degrad')
    ).length;

    if (improvingCount > degradingCount * 1.5) {
      riskTrend = 'improving';
    } else if (degradingCount > improvingCount * 1.2) {
      riskTrend = 'degrading';
    }

    return {
      immediateRisks,
      emergingRisks,
      riskTrend
    };
  }

  /**
   * Calculate all OSR metrics
   */
  static calculateAllMetrics(sheets: ProcessedSheet[]): OSRMetrics {
    const healthPercentage = this.calculateHealthPercentage(sheets);
    const severityScore = this.calculateSeverityScore(sheets);
    const recoveryPotential = this.calculateRecoveryPotential(sheets);
    const riskAssessment = this.calculateRiskAssessment(sheets);

    return {
      healthPercentage,
      severityScore,
      recoveryPotential,
      riskAssessment
    };
  }

  // Helper methods
  private static inferImpactFromSeverity(severity: string): number {
    const severityLower = severity.toLowerCase();
    if (severityLower.includes('critical') || severityLower.includes('high')) return 8;
    if (severityLower.includes('major') || severityLower.includes('medium')) return 5;
    return 2;
  }

  private static normalizeSeverity(severity: string): 'critical' | 'major' | 'minor' {
    const severityLower = severity.toLowerCase();
    if (severityLower.includes('critical') || severityLower.includes('high')) return 'critical';
    if (severityLower.includes('major') || severityLower.includes('medium')) return 'major';
    return 'minor';
  }

  private static determineTimeline(impact: number, effort: number): 'immediate' | 'short' | 'medium' | 'long' {
    if (impact >= 8 && effort <= 3) return 'immediate';
    if (impact >= 6 && effort <= 5) return 'short';
    if (effort <= 7) return 'medium';
    return 'long';
  }

  private static inferRiskLevel(urgency: string): number {
    const urgencyLower = urgency.toLowerCase();
    if (urgencyLower.includes('immediate') || urgencyLower.includes('urgent')) return 8;
    if (urgencyLower.includes('high')) return 7;
    if (urgencyLower.includes('medium')) return 5;
    if (urgencyLower.includes('low')) return 2;
    return 4; // Default medium-low risk
  }
}