# Inventory Data Storyboard - Required Columns

## Overview
This document outlines the data attributes available in `inventory file.xlsx` and defines how these attributes can be leveraged to extract meaningful business insights. The file contains two sheets: **FG value** and **RPM**, each with specific columns that enable different analytical perspectives.

## Data Ingestion Strategy

### Column Handling Rules
- **Read All Sheets**: Both FG value and RPM sheets will be read in their entirety
- **Column Filtering**: Columns with no name or invalid names will be omitted from analysis
- **Required Column Validation**: All specified required columns must be present with valid names to proceed with analysis
- **Additional Data Storage**: Non-required columns with valid names will be stored for future analysis but not used in initial storyboard development

### Processing Prerequisites
| Sheet | Required Columns Count | Validation Criteria |
|-------|----------------------|-------------------|
| **FG value** | 9 mandatory columns | All required columns must exist with valid column headers |
| **RPM** | 10 mandatory columns | All required columns must exist with valid column headers |

**Failure Conditions**: If any required column is missing or has an invalid name, the analysis cannot proceed for that sheet.

### Column Classification
| Column Status | Action | Usage |
|--------------|--------|-------|
| **Required + Valid Name** | Include in analysis | Immediate storyboard development |
| **Optional + Valid Name** | Store for future use | Extended analysis and additional insights |
| **No Name/Invalid Name** | Omit completely | Excluded from all processing |

## Sheet 1: FG value (Finished Goods Value) - Required Columns

### Data Attributes & Business Insights

| Attribute | Data Type | Business Use Case | Analytical Potential |
|-----------|-----------|-------------------|---------------------|
| **Pack Size(m.d.)** | Text | Product portfolio analysis | • Identify popular pack sizes<br>• Analyze consumer preferences<br>• Portfolio optimization decisions |
| **Plant** | Text | Manufacturing distribution | • Production capacity analysis<br>• Supply chain optimization<br>• Regional demand planning |
| **location** | Text | Geographic inventory spread | • Distribution center efficiency<br>• Regional stock positioning<br>• Logistics optimization |
| **Material** | Integer | SKU identification | • Product tracking<br>• Inventory turnover analysis<br>• Product lifecycle management |
| **Description** | Text | Product categorization | • Product family analysis<br>• Brand performance evaluation<br>• Market segmentation |
| **Closing Stock Quantity** | Integer | Inventory levels | • Stock availability analysis<br>• Demand vs supply gaps<br>• Inventory turnover metrics |
| **Closing Stock Value** | Float | Financial assessment | • Working capital analysis<br>• Inventory valuation<br>• Financial planning |
| **Per Unit Value Moti** | Float | Pricing insights | • Price point analysis<br>• Profitability assessment<br>• Competitive positioning |
| **Total Value** | Float | Alternative valuation | • Valuation method comparison<br>• Financial reconciliation<br>• Risk assessment |

### Story Themes Available
1. **Product Portfolio Performance**: Compare performance across different pack sizes and formulations
2. **Geographic Distribution Efficiency**: Analyze inventory positioning across plants and distribution centers
3. **Financial Health Assessment**: Evaluate stock values and pricing strategies
4. **Supply Chain Optimization**: Identify bottlenecks and optimization opportunities

## Sheet 2: RPM (Raw Materials & Production Materials) - Required Columns

### Data Attributes & Manufacturing Insights

| Attribute | Data Type | Business Use Case | Analytical Potential |
|-----------|-----------|-------------------|---------------------|
| **Material** | Integer | Raw material tracking | • Material consumption analysis<br>• Supplier performance tracking<br>• Cost optimization opportunities |
| **Description** | Text | Material identification | • Chemical composition analysis<br>• Supplier categorization<br>• Quality management |
| **CAT** | Text | Category classification | • Product line allocation<br>• Category-wise cost analysis<br>• Strategic sourcing decisions |
| **Plant** | Text | Production location | • Manufacturing efficiency<br>• Plant capacity utilization<br>• Supply chain risk assessment |
| **Material Type** | Text | Material classification | • Raw vs semi-finished analysis<br>• Value-add stage tracking<br>• Process optimization |
| **Closing Stock Quantity** | Float | Inventory levels (KG) | • Material availability assessment<br>• Safety stock evaluation<br>• Procurement planning |
| **Closing Stock Value** | Float | Financial exposure | • Working capital management<br>• Cost center analysis<br>• Budget allocation |
| **Unit of Measure** | Text | Measurement standard | • Standardization compliance<br>• Conversion factor validation<br>• Procurement specifications |
| **Unit Price** | Float | Cost per unit | • Cost trend analysis<br>• Supplier price comparison<br>• Budget variance analysis |
| **Total Value** | Float | Total investment | • Investment prioritization<br>• Risk exposure assessment<br>• Financial planning |

### Story Themes Available
1. **Manufacturing Cost Structure**: Analyze raw material costs vs semi-finished goods investment
2. **Plant Efficiency Comparison**: Compare material utilization between manufacturing plants
3. **Supplier Strategy Analysis**: Evaluate material sourcing patterns and cost structures
4. **Financial Risk Assessment**: Identify high-value materials and exposure points

## Data Storyboard Opportunities

### Cross-Sheet Analysis Potential

| Analysis Theme | FG Attributes Used | RPM Attributes Used | Business Story |
|----------------|-------------------|-------------------|-----------------|
| **End-to-End Value Chain** | Plant + Description + Total Value | Plant + Material Type + Total Value | Map raw material investment to finished goods output by plant |
| **Cost-to-Revenue Flow** | Per Unit Value + Closing Stock Quantity | Unit Price + Closing Stock Quantity | Analyze material cost impact on finished goods pricing |
| **Geographic Efficiency** | location + Plant + Closing Stock Value | Plant + Total Value | Compare distribution costs vs manufacturing investments |
| **Product Profitability** | Pack Size + Per Unit Value + Total Value | Material Type + Unit Price + Total Value | Link product variants to raw material cost structure |

### Data Quality Assessment

| Data Dimension | FG Value Sheet | RPM Sheet | Storyboard Impact |
|----------------|----------------|-----------|-------------------|
| **Completeness** | 100% across all attributes | 100% across all attributes | Enables comprehensive analysis without data gaps |
| **Consistency** | Uniform product family (SURF EXCEL) | Uniform category (Laundry) | Allows focused narrative within product category |
| **Granularity** | SKU-level details | Material-level details | Supports detailed cost and profitability analysis |
| **Timeliness** | Closing stock snapshot | Closing stock snapshot | Provides point-in-time analysis capability |

## Meaningful Data Stories We Can Extract

### 1. Supply Chain Efficiency Story
**Narrative**: "From Raw Materials to Market - Understanding Our Value Chain"
- **Data Journey**: Material → Description → Plant → Material Type → Unit Price → Closing Stock Quantity
- **Business Question**: How efficiently do we convert raw materials into finished goods?
- **Key Metrics**: Material utilization rates, plant efficiency, cost transformation

### 2. Portfolio Performance Story
**Narrative**: "Product Mix Optimization - Which Pack Sizes Drive Value"
- **Data Journey**: Pack Size → Description → Closing Stock Quantity → Per Unit Value → Total Value
- **Business Question**: Which product variants generate optimal returns?
- **Key Metrics**: Pack size profitability, inventory turnover, revenue concentration

### 3. Geographic Distribution Story
**Narrative**: "Market Reach vs Manufacturing Footprint"
- **Data Journey**: Plant (Manufacturing) → location (Distribution) → Closing Stock Value
- **Business Question**: How well aligned is our production with market distribution?
- **Key Metrics**: Plant-to-market efficiency, distribution cost ratios, geographic coverage

### 4. Financial Risk Assessment Story
**Narrative**: "Inventory Investment Strategy - Where Our Money Is Tied Up"
- **Data Journey**: Material Type → Unit Price → Closing Stock Quantity → Total Value
- **Business Question**: What is our risk exposure across different inventory categories?
- **Key Metrics**: Value concentration, price volatility, inventory aging risks

### 5. Operational Excellence Story
**Narrative**: "Manufacturing vs Distribution - Balancing Our Operations"
- **Data Journey**: Plant (both sheets) → Material Type → Closing Stock Quantity → location
- **Business Question**: How can we optimize our operational footprint?
- **Key Metrics**: Plant utilization, distribution efficiency, operational cost ratios

## Data Utilization Framework

### Phase 1: Data Foundation
- **Column Validation**: Verify all required columns exist with valid names before proceeding
- **Data Ingestion**: Read complete sheets but filter out unnamed/invalid columns
- **Required vs Optional Segregation**: Separate mandatory columns for immediate analysis from additional columns for future use
- **Data Quality Metrics**: Establish quality metrics for all required columns
- **Standardization**: Create naming conventions and validation rules

### Phase 2: Story Development
- Define business questions for each story theme
- Map data attributes to analytical requirements
- Create visualization frameworks

### Phase 3: Insight Generation
- Develop automated dashboards
- Create alert systems for key metrics
- Enable self-service analytics

### Phase 4: Decision Support
- Link insights to business actions
- Create feedback loops for continuous improvement
- Establish performance monitoring