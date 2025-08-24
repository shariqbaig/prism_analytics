# Business Logic and Metrics Calculation Documentation

## Overview

The Business Logic and Metrics Calculation system provides comprehensive analytical capabilities for inventory and OSR (Operational Status Report) data. This system implements sophisticated algorithms to calculate key performance indicators, assess risk exposure, and generate actionable business intelligence for executive decision-making.

## Architecture

### Core Components

1. **Data Processor** (`DataProcessor` class) - Utility functions for data extraction and validation
2. **Inventory Calculator** (`InventoryCalculator` class) - Comprehensive inventory metrics
3. **OSR Calculator** (`OSRCalculator` class) - Operational status and risk metrics  
4. **Business Intelligence Calculator** (`BusinessIntelligenceCalculator` class) - Combined analysis

### File Structure
```
/src/services/
├── businessCalculations.ts     # Core calculations and inventory metrics
├── osrCalculations.ts         # OSR-specific calculations
└── combinedMetrics.ts         # Combined analysis and strategic insights
```

## Inventory Metrics System

### Portfolio Concentration Analysis

**Purpose**: Assess diversification and concentration risk in inventory holdings.

**Key Metrics**:
- `topItemsPercentage`: Percentage of value held in top 20% of items
- `diversificationIndex`: Measure of portfolio diversification (0-100)
- `concentrationRisk`: Risk level categorization (low/medium/high)

**Calculation Methodology**:
```typescript
// 1. Extract all item values from inventory sheets
// 2. Calculate top 20% concentration
const top20Count = Math.ceil(sortedItems.length * 0.2);
const topItemsPercentage = (top20Value / totalValue) * 100;

// 3. Calculate Herfindahl-Hirschman Index (HHI) for diversification
const hhi = calculateHHI(sortedItems);
const diversificationIndex = Math.max(0, 100 - (hhi / 100));

// 4. Determine risk levels
if (topItemsPercentage > 80) concentrationRisk = 'high';
else if (topItemsPercentage > 60) concentrationRisk = 'medium';
else concentrationRisk = 'low';
```

**Risk Thresholds**:
- **High Risk**: >80% value in top 20% of items
- **Medium Risk**: 60-80% value in top 20% of items  
- **Low Risk**: <60% value in top 20% of items

### Plant Efficiency Metrics

**Purpose**: Evaluate operational efficiency across manufacturing facilities.

**Key Metrics**:
- `utilizationRate`: Average capacity utilization across plants (0-100%)
- `throughputScore`: Normalized throughput performance (0-100)
- `efficiencyGrade`: Letter grade assessment (A/B/C/D/F)

**Calculation Methodology**:
```typescript
// 1. Group data by plant/facility
// 2. Calculate average utilization and throughput per plant
const avgUtilization = plantUtilization.reduce((sum, val) => sum + val, 0) / plantCount;
const throughputScore = Math.min(100, (avgThroughput / plantCount) / 10);

// 3. Assign efficiency grades
const overallEfficiency = (utilizationRate + throughputScore) / 2;
if (overallEfficiency >= 90) efficiencyGrade = 'A';
else if (overallEfficiency >= 80) efficiencyGrade = 'B';
// ... etc
```

**Grading Scale**:
- **A Grade**: ≥90% overall efficiency
- **B Grade**: 80-89% overall efficiency
- **C Grade**: 70-79% overall efficiency
- **D Grade**: 60-69% overall efficiency
- **F Grade**: <60% overall efficiency

### Geographic Distribution Analysis

**Purpose**: Assess geographic risk diversification and regional exposure.

**Key Metrics**:
- `regionCount`: Number of distinct geographic regions
- `distributionBalance`: Measure of even distribution across regions (0-100)
- `riskSpread`: Categorization of geographic risk (concentrated/balanced/distributed)

**Calculation Methodology**:
```typescript
// 1. Group inventory by region/location
// 2. Calculate coefficient of variation for distribution balance
const mean = regionValues.reduce((sum, val) => sum + val, 0) / regionCount;
const variance = regionValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / regionCount;
const coefficientOfVariation = Math.sqrt(variance) / mean;
const distributionBalance = Math.max(0, 100 - (coefficientOfVariation * 100));

// 3. Categorize risk spread
if (regionCount === 1 || distributionBalance < 40) riskSpread = 'concentrated';
else if (regionCount <= 3 || distributionBalance < 70) riskSpread = 'balanced';
else riskSpread = 'distributed';
```

## OSR Metrics System

### Health Percentage Calculation

**Purpose**: Aggregate health assessment from multiple operational indicators.

**Calculation Methodology**:
```typescript
// 1. Extract health indicators from OSR data
// 2. Calculate weighted average
const weightedScore = indicators.reduce((sum, indicator) => 
  sum + (indicator.score * indicator.weight), 0
);
const baseHealth = weightedScore / totalWeight;

// 3. Apply trend adjustments
const trendAdjustment = indicators.reduce((adj, indicator) => {
  if (indicator.trend === 'improving') return adj + (weight * 2);
  if (indicator.trend === 'degrading') return adj - (weight * 3);
  return adj;
}, 0);

const finalHealth = Math.max(0, Math.min(100, baseHealth + trendAdjustment));
```

### Severity Score Assessment

**Purpose**: Categorize and quantify operational issues by severity level.

**Issue Classification**:
- **Critical**: High impact (≥8/10), immediate attention required
- **Major**: Medium-high impact (5-7/10), significant business impact
- **Minor**: Low impact (<5/10), routine operational items

**Severity Determination Logic**:
```typescript
// Automatic classification based on impact score and keywords
if (severityText.includes('critical') || impact >= 8) severity = 'critical';
else if (severityText.includes('major') || impact >= 5) severity = 'major';
else severity = 'minor';

// Overall severity assessment
if (criticalIssues > 0) overallSeverity = criticalIssues >= 3 ? 'critical' : 'high';
else if (majorIssues > 5) overallSeverity = 'high';
else if (majorIssues > 0 || minorIssues > 10) overallSeverity = 'medium';
else overallSeverity = 'low';
```

### Recovery Potential Analysis

**Purpose**: Assess opportunity for operational improvement based on effort/impact analysis.

**Recovery Categories**:
- **Quick Wins**: High impact (≥6), low effort (≤4)
- **Medium Term**: Medium impact/effort (4-7 range)
- **Long Term Strategic**: High effort (≥8) or strategic high-impact initiatives

**Recoverability Score**:
```typescript
// Weight recovery opportunities by achievability
const recoveryOpportunities = (quickWins * 3) + (mediumTerm * 2) + (longTerm * 1);
const maxPossibleScore = totalIssues * 3; // If all were quick wins
const recoverabilityScore = (recoveryOpportunities / maxPossibleScore) * 100;
```

### Risk Assessment Framework

**Purpose**: Evaluate immediate and emerging operational risks.

**Risk Categories**:
- **Immediate Risks**: Urgent/critical issues requiring immediate action
- **Emerging Risks**: Medium-term risks that need monitoring and planning

**Risk Trend Analysis**:
```typescript
// Analyze trend indicators from data
const improvingCount = trends.filter(trend => 
  trend.includes('improv') || trend.includes('better')
).length;

const degradingCount = trends.filter(trend =>
  trend.includes('wors') || trend.includes('degrad')
).length;

// Determine overall trend with confidence thresholds
if (improvingCount > degradingCount * 1.5) riskTrend = 'improving';
else if (degradingCount > improvingCount * 1.2) riskTrend = 'degrading';
else riskTrend = 'stable';
```

## Combined Metrics System

### Overall Portfolio Health

**Calculation**: Weighted combination of inventory health (60%) and OSR health (40%).

```typescript
const combinedHealth = (inventoryHealth * 0.6) + (osrHealth * 0.4);

// Apply critical issue penalty
const criticalPenalty = Math.min(15, criticalIssues * 5);
const finalHealth = Math.max(0, combinedHealth - criticalPenalty);
```

**Rationale**: Inventory health reflects fundamental business strength, while OSR health indicates operational resilience.

### Risk Exposure Assessment

**Components**:
- **Inventory Risk** (40%): Concentration, geographic, efficiency risks
- **OSR Risk** (60%): Issue severity, immediate risks, trend impact

**Risk Calculation Logic**:
```typescript
// Inventory risk factors
if (concentrationRisk === 'high') inventoryRisk += 25;
if (riskSpread === 'concentrated') inventoryRisk += 20;
if (efficiencyGrade === 'F') inventoryRisk += 15;

// OSR risk factors  
osrRisk += criticalIssues * 8 + majorIssues * 3 + minorIssues * 1;
osrRisk += immediateRisks * 5 + emergingRisks * 2;

// Apply trend multiplier
if (riskTrend === 'degrading') osrRisk *= 1.2;
else if (riskTrend === 'improving') osrRisk *= 0.8;

// Combined risk
const totalRisk = (osrRisk * 0.6) + (inventoryRisk * 0.4);
```

### Operational Efficiency Score

**Methodology**: Combines plant efficiency metrics with OSR health indicators.

```typescript
// Base efficiency from inventory
const inventoryEfficiency = gradeToScore(efficiencyGrade);
const utilizationAdjustment = (utilizationRate - 75) * 0.3;

// OSR efficiency impact
const osrImpact = (recoverabilityScore * 0.3) + (healthPercentage * 0.4) - 
                  (criticalIssues * 8) - (majorIssues * 3);

// Combined score (70% inventory, 30% OSR)
const efficiency = (inventoryEfficiency * 0.7) + (osrImpact * 0.3);
```

### Strategic Alignment Assessment

**Components**:
- **Inventory Optimization** (25%): Portfolio efficiency and distribution
- **Risk Mitigation** (25%): Risk management effectiveness  
- **Operational Excellence** (25%): Performance and efficiency metrics
- **Growth Readiness** (25%): Capacity for expansion and improvement

**Calculation Framework**:
```typescript
const alignment = {
  inventoryOptimization: assessInventoryOptimization(inventoryMetrics),
  riskMitigation: assessRiskMitigation(inventoryMetrics, osrMetrics),
  operationalExcellence: assessOperationalExcellence(inventoryMetrics, osrMetrics),
  growthReadiness: assessGrowthReadiness(inventoryMetrics, osrMetrics)
};

// Equal weighting across strategic areas
const strategicAlignment = Object.values(alignment).reduce((sum, val) => sum + val, 0) / 4;
```

## Partial Data Set Handling

### Design Philosophy

The system is designed to provide meaningful insights even with incomplete data, recognizing that real-world scenarios often involve partial data availability.

### Partial Data Scenarios

1. **Inventory Only**: Provides inventory-focused metrics with notes about missing OSR insights
2. **OSR Only**: Provides operational metrics with recommendations for inventory data
3. **Incomplete Data**: Filters out invalid records while preserving valid analysis

### Data Validation Strategy

```typescript
// Filter valid data entries
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

// Safe numeric extraction
static extractNumericValue(row: Record<string, unknown>, key: string): number {
  const value = row[key];
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[,$]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}
```

## Recommendation Engine

### Algorithm Overview

The recommendation system analyzes calculated metrics to generate prioritized, actionable insights for business stakeholders.

### Recommendation Categories

1. **Critical Actions**: Address immediate risks and critical issues
2. **Optimization Opportunities**: Improve efficiency and performance
3. **Strategic Initiatives**: Long-term improvements and growth preparation
4. **Risk Management**: Proactive risk mitigation strategies

### Generation Logic

```typescript
// Critical issue recommendations
if (criticalIssues > 0) {
  recommendations.push(
    `Address ${criticalIssues} critical issues immediately - significant operational risk`
  );
}

// Concentration risk recommendations
if (concentrationRisk === 'high') {
  recommendations.push(
    'Diversify portfolio to reduce concentration risk - top 20% represents over 80% of value'
  );
}

// Quick wins identification
if (quickWins > 0) {
  recommendations.push(
    `Prioritize ${quickWins} quick wins - high impact, low effort improvements available`
  );
}

// Efficiency improvements
if (efficiencyGrade === 'F') {
  recommendations.push(
    'Immediate attention required for plant efficiency - significant optimization opportunity'
  );
}
```

### Recommendation Prioritization

1. **Immediate/Critical**: Safety and operational continuity
2. **High Impact/Low Effort**: Quick wins for rapid improvement
3. **Strategic**: Long-term competitive advantage
4. **Preventive**: Risk mitigation and future-proofing

## Performance and Scalability

### Computational Complexity

- **Data Processing**: O(n) for most calculations where n = number of data rows
- **Sorting Operations**: O(n log n) for concentration analysis
- **Grouping Operations**: O(n) with hash map aggregation

### Memory Optimization

```typescript
// Efficient data processing with streaming approach
inventorySheets.forEach(sheet => {
  const validData = DataProcessor.filterValidData(sheet.data, requiredFields);
  
  validData.forEach(row => {
    // Process row immediately rather than storing all data in memory
    const value = DataProcessor.extractNumericValue(row, 'value');
    if (value > 0) processValue(value);
  });
});
```

### Large Dataset Handling

- **Incremental Processing**: Process data in chunks to avoid memory overflow
- **Selective Loading**: Only load required columns for specific calculations
- **Result Caching**: Cache intermediate calculations for repeated operations

## Error Handling and Resilience

### Defensive Programming Principles

1. **Null Safety**: All data extraction functions handle null/undefined values
2. **Type Validation**: Explicit type checking before numeric operations
3. **Range Validation**: Clamp values to expected ranges (e.g., 0-100 for percentages)
4. **Fallback Values**: Provide sensible defaults when data is missing

### Error Recovery Strategies

```typescript
// Safe division with zero handling
const utilizationRate = validPlantCount > 0 ? totalUtilization / validPlantCount : 0;

// Range clamping
const finalHealth = Math.max(0, Math.min(100, baseHealth + adjustment));

// Graceful degradation
if (inventorySheets.length === 0) {
  return {
    portfolioConcentration: getDefaultConcentration(),
    plantEfficiency: getDefaultEfficiency(),
    geographicDistribution: getDefaultDistribution(),
    overallHealth: 0
  };
}
```

## Integration Points

### Data Layer Integration

```typescript
// Integration with useDataStorage hook
import { useDataStorage } from '@/hooks/useDataStorage';
import { BusinessIntelligenceCalculator } from '@/services/combinedMetrics';

const { getActiveFileData } = useDataStorage();

const calculateMetrics = async () => {
  const inventoryData = await getActiveFileData('inventory');
  const osrData = await getActiveFileData('osr');
  
  const metrics = BusinessIntelligenceCalculator.calculateWithPartialData(
    inventoryData?.sheets || [],
    osrData?.sheets || []
  );
  
  return metrics;
};
```

### Dashboard Integration

```typescript
// Usage in dashboard components
import { KPICard, ExecutiveSummary } from '@/components/dashboard';

function MetricsDashboard() {
  const [metrics, setMetrics] = useState<CombinedMetrics | null>(null);
  
  useEffect(() => {
    calculateMetrics().then(setMetrics);
  }, []);
  
  return (
    <div>
      <KPICard
        title="Portfolio Health"
        value={`${metrics?.overallPortfolioHealth}%`}
        status={metrics?.overallPortfolioHealth > 80 ? 'success' : 'warning'}
      />
      
      <ExecutiveSummary
        title="Key Insights"
        items={formatMetricsForSummary(metrics)}
      />
    </div>
  );
}
```

## Testing Strategy

### Unit Test Coverage

```typescript
// Example test cases
describe('InventoryCalculator', () => {
  it('should handle empty data sets', () => {
    const metrics = InventoryCalculator.calculateAllMetrics([]);
    expect(metrics.overallHealth).toBe(0);
  });
  
  it('should calculate concentration risk correctly', () => {
    const testSheets = createTestInventoryData();
    const metrics = InventoryCalculator.calculatePortfolioConcentration(testSheets);
    expect(metrics.concentrationRisk).toBe('high');
  });
});
```

### Integration Testing

- Test with real-world data samples
- Validate metric ranges and correlations
- Verify recommendation accuracy
- Test partial data scenarios

### Performance Testing

- Benchmark with large datasets (10K+ records)
- Memory usage profiling
- Calculation speed optimization
- Stress testing with malformed data

## Business Rules and Assumptions

### Key Assumptions

1. **Data Quality**: Input data follows expected format and contains required fields
2. **Currency**: All monetary values in consistent currency (no conversion needed)
3. **Time Period**: Metrics represent current state unless otherwise specified
4. **Completeness**: Missing data points are handled gracefully without skewing results

### Business Rules

1. **Risk Thresholds**: Based on industry standards and best practices
2. **Weighting Factors**: Inventory metrics weighted 60%, OSR metrics 40% for overall health
3. **Grade Boundaries**: Efficiency grades aligned with operational excellence frameworks
4. **Trend Analysis**: Minimum data points required for reliable trend calculation

### Validation Rules

```typescript
// Data validation examples
const isValidValue = (value: number): boolean => {
  return !isNaN(value) && isFinite(value) && value >= 0;
};

const isValidPercentage = (value: number): boolean => {
  return isValidValue(value) && value >= 0 && value <= 100;
};

const isValidGrade = (grade: string): boolean => {
  return ['A', 'B', 'C', 'D', 'F'].includes(grade);
};
```

## Future Enhancements

### Planned Features

1. **Machine Learning Integration**: Predictive analytics for trend forecasting
2. **Benchmarking**: Industry comparison and peer analysis
3. **Sensitivity Analysis**: Impact assessment of parameter changes
4. **Custom Metrics**: User-defined KPIs and calculation rules
5. **Real-time Updates**: Continuous metric recalculation with data changes

### Scalability Improvements

1. **Worker Thread Processing**: Offload heavy calculations to background threads
2. **Incremental Updates**: Only recalculate affected metrics when data changes
3. **Caching Layer**: Redis/memory cache for frequently accessed calculations
4. **Distributed Computing**: Support for cloud-based calculation scaling

### Advanced Analytics

1. **Root Cause Analysis**: Automated investigation of metric degradation
2. **Scenario Modeling**: What-if analysis for decision support
3. **Optimization Engine**: Automated recommendation for metric improvements
4. **Correlation Analysis**: Cross-metric dependency identification

## API Reference

### Core Classes

#### DataProcessor
- `extractNumericValue(row, key): number` - Safe numeric extraction
- `extractStringValue(row, key, fallback): string` - String extraction with fallback
- `calculatePercentile(values, percentile): number` - Statistical percentile calculation
- `calculateHHI(values): number` - Herfindahl-Hirschman Index calculation
- `filterValidData<T>(data, requiredFields): T[]` - Data validation and filtering

#### InventoryCalculator
- `calculatePortfolioConcentration(sheets): ConcentrationMetrics` - Portfolio analysis
- `calculatePlantEfficiency(sheets): EfficiencyMetrics` - Plant performance metrics
- `calculateGeographicDistribution(sheets): DistributionMetrics` - Geographic analysis
- `calculateAllMetrics(sheets): InventoryMetrics` - Complete inventory analysis

#### OSRCalculator
- `calculateHealthPercentage(sheets): number` - Overall operational health
- `calculateSeverityScore(sheets): SeverityMetrics` - Issue categorization and scoring
- `calculateRecoveryPotential(sheets): RecoveryMetrics` - Improvement opportunity analysis
- `calculateRiskAssessment(sheets): RiskMetrics` - Risk evaluation and trending
- `calculateAllMetrics(sheets): OSRMetrics` - Complete OSR analysis

#### BusinessIntelligenceCalculator
- `calculateCombinedMetrics(inventory, osr): CombinedMetrics` - Comprehensive analysis
- `calculateWithPartialData(inventory?, osr?): Partial<CombinedMetrics>` - Partial data handling

### Type Definitions

```typescript
// Core metric interfaces available for import
export interface InventoryMetrics {
  portfolioConcentration: ConcentrationMetrics;
  plantEfficiency: EfficiencyMetrics;
  geographicDistribution: DistributionMetrics;
  overallHealth: number;
}

export interface OSRMetrics {
  healthPercentage: number;
  severityScore: SeverityMetrics;
  recoveryPotential: RecoveryMetrics;
  riskAssessment: RiskMetrics;
}

export interface CombinedMetrics {
  overallPortfolioHealth: number;
  riskExposure: number;
  operationalEfficiency: number;
  strategicAlignment: number;
  recommendedActions: string[];
}
```

## Related Documentation

- [Data Layer Documentation](./DATA_LAYER.md) - Database storage and retrieval
- [Dashboard Components](./DASHBOARD_COMPONENTS.md) - UI component integration
- [Adaptive Charts](./ADAPTIVE_CHARTS.md) - Data visualization integration
- [File Processing](../src/types/fileProcessing.ts) - Data type definitions

## Version History

- **v1.0.0** - Initial implementation with comprehensive inventory and OSR calculations
- **Future versions** - Machine learning integration, advanced analytics, real-time processing