# OSR Data Storyboard - Overstock & Residuals Analysis

## Overview
This document outlines the data attributes available in `osr_file.xlsx` and defines how these attributes can be leveraged to extract meaningful OSR (Over Stock & Residuals) insights. The analysis focuses on two critical sheets: **OSR Main Sheet HC** and **OSR Summary**, which enable comprehensive inventory optimization storytelling.

## Sheet 1: OSR Main Sheet HC (Over Stock & Residuals - Home Care)

### Data Foundation
- **Records Available**: 1,141 material records for comprehensive analysis
- **Required Attributes**: 46 mandatory columns for OSR storytelling
- **Excluded Attributes**: 23 columns omitted (detailed below)
- **Business Context**: Home Care finished goods overstock and residuals analysis
- **Geographic Scope**: Pakistan operations
- **Measurement Standard**: PC (Pieces)

### Excluded Columns Summary
The following 23 columns are **NOT REQUIRED** for OSR analysis and should be omitted:

**Basic Information Exclusions:**
- Basepack, MTyp, Type, Brand, Country, BUN

**Stock & Value Exclusions:**
- Restricted, Returns, Value Restricted, Value Returned Blocked

**Demand & Planning Exclusions:**
- Safety days, Cycle days, Average requirement per week (Qty), Average requirement per day (Qty), Current month demand, 6 months demand

**Stock Classification Exclusions:**
- Max Stock (Qty), Max Stock (PKR), Week Cover (Qty), Days Cover (Qty)

**OSR Analysis Exclusions:**
- Pre Build Vol, Pre Build Val, Cycle Stock (Qnty), Cycle Stock (PKR), No Forward Demand - Volume, No Forward Demand - Value, 6 MO demand

### Data Attributes & OSR Insights

#### Material Identification Attributes
| Attribute | Data Type | Business Use Case | Analytical Potential |
|-----------|-----------|-------------------|---------------------|
| **Material** | Integer | SKU-level tracking | • Individual product OSR analysis<br>• Material-specific overstock identification<br>• Product lifecycle management |
| **Material Description** | Text | Product categorization | • Product family OSR patterns<br>• Category-wise excess analysis<br>• Portfolio optimization insights |
| **Status** | Text | Material lifecycle stage | • Active vs inactive product analysis<br>• Lifecycle-based OSR strategy<br>• Discontinuation impact assessment |
| **Avg Unit Price (Rs)** | Float | Cost/value assessment | • High-value excess identification<br>• Price-based prioritization<br>• Financial impact analysis |

#### Stock Position Attributes
| Attribute | Data Type | Business Use Case | Analytical Potential |
|-----------|-----------|-------------------|---------------------|
| **Unrestricted** | Float | Available inventory analysis | • Immediate liquidation potential<br>• Sales-ready stock assessment<br>• Revenue conversion opportunities |
| **In Quality Insp.** | Float | Quality process tracking | • Quality bottleneck identification<br>• Process efficiency analysis<br>• Release timeline assessment |
| **StockInTfr** | Float | Supply chain flow | • Pipeline inventory analysis<br>• Transfer efficiency tracking<br>• Distribution optimization |
| **Blocked** | Float | Problem inventory identification | • Write-off candidate analysis<br>• Quality issue assessment<br>• Loss prevention strategies |
| **Total Book Stock- QNTY** | Float | Complete inventory picture | • Total OSR exposure assessment<br>• Portfolio-wide analysis<br>• Investment overview |

#### Financial Impact Attributes
| Attribute | Data Type | Business Use Case | Analytical Potential |
|-----------|-----------|-------------------|---------------------|
| **Value Unrestricted (PKR)** | Float | Revenue potential assessment | • Immediate cash conversion analysis<br>• Sales opportunity quantification<br>• Working capital optimization |
| **Value in StkTransf** | Float | Pipeline value tracking | • In-transit asset management<br>• Distribution cost analysis<br>• Supply chain efficiency |
| **Value in QualInsp.** | Float | Quality-held asset analysis | • Quality process cost impact<br>• Release value planning<br>• Process bottleneck financial impact |
| **Value BlockedStock** | Float | Loss exposure assessment | • Write-off planning<br>• Risk quantification<br>• Insurance claim analysis |
| **Total Book StockValue - PKR** | Float | Complete financial exposure | • Total OSR investment analysis<br>• Portfolio valuation<br>• Financial planning foundation |

#### Stock Classification Attributes
| Attribute | Data Type | Business Use Case | Analytical Potential |
|-----------|-----------|-------------------|---------------------|
| **safety Stock (Qty/PKR)** | Float | Buffer requirement analysis | • Optimal safety stock assessment<br>• Risk vs cost optimization<br>• Service level planning |
| **26 Weeks** | Float | Long-term demand reference | • Seasonality impact analysis<br>• Long-term trend assessment<br>• Strategic planning foundation |

#### Core OSR Analysis Attributes
| Attribute | Data Type | Business Use Case | Analytical Potential |
|-----------|-----------|-------------------|---------------------|
| **Export Vol/Val** | Float | International market potential | • Export opportunity analysis<br>• Global market liquidation<br>• Currency conversion impact |
| **Balance Qty** | Float | Net available inventory | • Active inventory management<br>• Operational planning<br>• Demand fulfillment capacity |
| **Total Overstock + Residuals (13 to 26 wks)** | Float | Medium-term excess identification | • Liquidation strategy planning<br>• Discount pricing analysis<br>• Channel optimization |
| **Residual (Qnty) >26 weeks** | Float | Long-term problem inventory | • Write-off decision making<br>• Disposal strategy planning<br>• Loss minimization tactics |
| **Total OSR (Qty/Value) PKR** | Float | Complete OSR measurement | • Overall performance assessment<br>• Executive dashboard KPI<br>• Strategic decision foundation |

#### Detailed OSR Category Attributes
| Attribute | Data Type | Business Use Case | Analytical Potential |
|-----------|-----------|-------------------|---------------------|
| **Slow Moving - Volume/Value** | Float | Velocity-based analysis | • Sales acceleration strategies<br>• Promotional planning<br>• Channel optimization |
| **Non Moving - Volume/Value** | Float | Stagnant inventory identification | • Disposal decision making<br>• Write-off planning<br>• Space optimization |
| **Residuals 13 to 26 weeks** | Float | Medium-term action planning | • Liquidation timeline management<br>• Price optimization strategies<br>• Market intervention planning |

## OSR Data Storyboard Opportunities

### Story Themes Available from OSR Main Sheet

#### 1. Overstock Severity Assessment Story
**Narrative**: "Understanding the Scale of Our Excess Inventory Challenge"
- **Data Journey**: Material → Total Book Stock → Total OSR → Residuals (>26 weeks)
- **Business Question**: Which products represent our biggest overstock risks?
- **Key Insights**: High-value excess identification, product-specific action plans

#### 2. Time-Based Action Priority Story
**Narrative**: "When to Act - Timing Our OSR Interventions"
- **Data Journey**: Residuals 13-26 weeks → Slow Moving → Non Moving → Export opportunities
- **Business Question**: What is our optimal intervention timeline for different products?
- **Key Insights**: Action urgency mapping, timeline-based strategies

#### 3. Financial Impact Optimization Story
**Narrative**: "Maximizing Recovery from Problem Inventory"
- **Data Journey**: Total OSR Value → Export Vol/Val → Value Unrestricted → Balance Qty
- **Business Question**: How can we optimize financial recovery from OSR situations?
- **Key Insights**: Revenue recovery potential, liquidation value analysis

#### 4. Operational Efficiency Story
**Narrative**: "From Quality Issues to Market Solutions"
- **Data Journey**: Value in QualInsp → Blocked Stock → StockInTfr → Unrestricted
- **Business Question**: How do operational issues contribute to OSR problems?
- **Key Insights**: Process bottleneck identification, operational improvements

### Cross-Attribute Analysis Potential

| Analysis Theme | Primary Attributes | Supporting Attributes | Business Story |
|----------------|-------------------|---------------------|----------------|
| **High-Value Risk Assessment** | Avg Unit Price + Total OSR Value | Material Description + Status | Identify expensive problem inventory requiring immediate attention |
| **Recovery Strategy Optimization** | Export Vol/Val + Slow Moving Volume | Value Unrestricted + Balance Qty | Map optimal liquidation channels for different product categories |
| **Time-Critical Action Planning** | Residuals >26 weeks + 13-26 weeks | Non Moving Volume + Total OSR | Prioritize actions based on urgency and financial impact |
| **Operational Excellence** | Value BlockedStock + Value in QualInsp | StockInTfr + Total Book Stock | Link operational issues to OSR creation and prevention |

## Sheet 2: OSR Summary - Executive Dashboard Attributes

### Dashboard Foundation
- **Summary Records**: 25 executive KPI rows
- **Dashboard Attributes**: 12 summary columns
- **Business Purpose**: Executive-level OSR performance tracking
- **Audience**: Senior management and strategic decision makers

### Executive Summary Attributes & Insights

#### Strategic KPI Attributes
| Attribute | Data Type | Executive Use Case | Strategic Potential |
|-----------|-----------|-------------------|-------------------|
| **Total Book Stock** | Float | Investment baseline | • Portfolio value assessment<br>• Working capital planning<br>• Investment allocation strategy |
| **Over Stock** | Float | Excess exposure measurement | • Risk assessment<br>• Liquidation planning<br>• Financial impact evaluation |
| **SLOB (13-26 weeks)** | Float | Medium-term problem sizing | • Action timeline planning<br>• Resource allocation<br>• Performance monitoring |
| **Remnant (>26 weeks)** | Float | Long-term loss exposure | • Write-off planning<br>• Strategic portfolio decisions<br>• Risk management |

#### Performance Health Attributes
| Attribute | Data Type | Management Use Case | Decision Support |
|-----------|-----------|-------------------|------------------|
| **Total Excess Stock** | Float | Overall OSR performance | • Executive scorecard<br>• Board reporting<br>• Strategic planning |
| **Excess Stock %** | Float | Relative performance indicator | • Benchmark comparison<br>• Trend analysis<br>• Target setting |
| **Slow Moving** | Float | Velocity performance tracking | • Operational efficiency<br>• Market responsiveness<br>• Product strategy |
| **Non-Moving** | Float | Stagnation measurement | • Portfolio optimization<br>• Product lifecycle decisions<br>• Market exit strategies |

#### Executive Decision Support Attributes
| Attribute | Data Type | Strategic Application | Leadership Insights |
|-----------|-----------|---------------------|-------------------|
| **Unhealthy Stocks (%)** | Float | Portfolio health assessment | • Strategic intervention needs<br>• Resource prioritization<br>• Performance management |
| **Healthy Stocks (%)** | Float | Operational excellence measure | • Business health monitoring<br>• Competitive positioning<br>• Strategic planning |
| **SLOB %** | Float | Process efficiency indicator | • Operational excellence<br>• System effectiveness<br>• Continuous improvement |

## Executive Storyboard Opportunities

### 1. Strategic Portfolio Health Story
**Narrative**: "Board-Level OSR Performance Assessment"
- **Data Journey**: Total Book Stock → Total Excess Stock → Unhealthy Stocks % → Strategic Actions
- **Business Question**: How healthy is our inventory portfolio from a strategic perspective?
- **Executive Insights**: Board reporting, strategic intervention needs, competitive positioning

### 2. Financial Risk Exposure Story
**Narrative**: "Understanding Our OSR Investment Risk"
- **Data Journey**: Over Stock → SLOB → Remnant → Total Excess Stock %
- **Business Question**: What is our financial exposure from problem inventory?
- **Executive Insights**: Risk management, insurance planning, working capital optimization

### 3. Operational Excellence Story
**Narrative**: "From Operational Metrics to Strategic Performance"
- **Data Journey**: Slow Moving → Non-Moving → SLOB % → Healthy Stocks %
- **Business Question**: How well are our operations preventing OSR creation?
- **Executive Insights**: Process improvement, operational excellence, strategic planning

## Cross-Sheet Integration Opportunities

### Main Sheet + Summary Integration
| Integration Theme | Main Sheet Attributes | Summary Attributes | Executive Story |
|-------------------|----------------------|-------------------|-----------------|
| **Value Chain Analysis** | Material + Total OSR Value | Over Stock + Total Excess | Map individual product issues to portfolio-level impacts |
| **Time-Based Intervention** | Residuals 13-26 weeks + >26 weeks | SLOB + Remnant | Strategic timeline planning for OSR resolution |
| **Financial Impact Assessment** | Balance Qty + Export Vol/Val | Total Book Stock + Excess Stock % | Revenue recovery vs write-off decision framework |
| **Performance Monitoring** | Slow Moving + Non Moving | Unhealthy Stocks % + Healthy Stocks % | Operational metrics to strategic KPI translation |

## OSR Data Utilization Framework

### Phase 1: Data Foundation
- **Attribute Validation**: Verify all 46 mandatory OSR attributes are present with valid data
- **Cross-Sheet Consistency**: Ensure main sheet and summary sheet alignment
- **Data Quality Standards**: Establish validation rules for OSR-specific attributes

### Phase 2: Story Development
- **Executive Narratives**: Develop board-ready OSR performance stories
- **Operational Insights**: Create actionable stories for inventory management teams
- **Strategic Planning**: Build long-term OSR prevention and optimization stories

### Phase 3: Decision Support
- **Real-Time Monitoring**: Implement OSR attribute tracking dashboards
- **Automated Alerts**: Create threshold-based notification systems
- **Performance Management**: Establish OSR KPI frameworks

### Phase 4: Strategic Integration
- **Business Planning**: Integrate OSR insights into strategic planning
- **Risk Management**: Incorporate OSR exposure into enterprise risk frameworks
- **Continuous Improvement**: Create feedback loops for OSR prevention

## Data Requirements Summary

### Mandatory OSR Attributes: 46 columns required
- **Material Identification**: 4 attributes for product tracking and categorization
- **Stock Position**: 5 attributes for inventory status and availability
- **Financial Impact**: 5 attributes for value assessment and risk quantification
- **Classification**: 2 attributes for stock category and timeline analysis
- **Core OSR Analysis**: 5 attributes for primary OSR measurement and action planning
- **Detailed Categories**: 3 attributes for granular OSR analysis and intervention strategies
- **Summary Dashboard**: 22 attributes for executive-level performance monitoring

### Excluded Attributes: 23 columns not required
These attributes are omitted to focus on essential OSR analysis while maintaining comprehensive coverage of overstock and residuals management needs.