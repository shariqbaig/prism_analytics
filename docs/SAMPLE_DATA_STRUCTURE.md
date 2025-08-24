# Sample Excel Files Structure

## Inventory Sample File (`inventory-sample.xlsx`)

### Sheet: `FG value`
| Pack Size(m.d.) | Plant      | location     | Material | Description              | Closing Stock Quantity | Closing Stock Value |
|------------------|------------|--------------|----------|--------------------------|------------------------|-------------------- |
| 100ml            | Houston_TX | Warehouse_A  | MAT-1001 | Premium Steel Components | 15000                  | 2500000            |
| 250g             | Austin_TX  | DC_Central   | MAT-1002 | Electronic Control Units | 8500                   | 1800000            |
| 500ml            | Detroit_MI | Storage_B    | MAT-1003 | Hydraulic Systems        | 12000                  | 3200000            |
| 1kg              | Shanghai_CN| Warehouse_C  | MAT-1004 | Precision Bearings       | 45000                  | 1200000            |
| 2kg              | Mumbai_IN  | DC_South     | MAT-1005 | Aluminum Extrusions      | 28000                  | 950000             |
| 100g             | Frankfurt_DE| Storage_A   | MAT-1006 | Carbon Fiber Panels      | 6500                   | 4100000            |
| 50ml             | Tokyo_JP   | Warehouse_B  | MAT-1007 | Optical Sensors          | 18500                  | 2300000            |
| 5kg              | London_UK  | DC_West      | MAT-1008 | Titanium Alloys          | 3200                   | 5600000            |
| 1.5kg            | Seoul_KR   | Storage_C    | MAT-1009 | Power Electronics        | 9800                   | 3800000            |
| 750g             | Montreal_CA| Warehouse_D  | MAT-1010 | Composite Structures     | 11200                  | 2900000            |

## OSR Sample File (`osr-sample.xlsx`)

### Sheet: `OSR Main Sheet HC`
| Material | Description                | Plant       | Excess Stock Value | Risk Level | Age Days | Recovery Potential | Action Required        |
|----------|----------------------------|-------------|-------------------|------------|----------|-------------------|------------------------|
| MAT-2001 | Obsolete Control Modules   | Houston_TX  | 450000            | High       | 365      | 25                | Immediate Liquidation  |
| MAT-2002 | Legacy Circuit Boards      | Austin_TX   | 280000            | Medium     | 180      | 60                | Negotiate Return       |
| MAT-2003 | Surplus Steel Stock        | Detroit_MI  | 125000            | Low        | 90       | 85                | Internal Transfer      |
| MAT-2004 | End-of-Life Components     | Shanghai_CN | 680000            | Critical   | 540      | 15                | Write-off Assessment   |
| MAT-2005 | Discontinued Sensors       | Mumbai_IN   | 190000            | Medium     | 220      | 45                | Alternative Sourcing   |
| MAT-2006 | Overstock Raw Materials    | Frankfurt_DE| 95000             | Low        | 45       | 90                | Production Planning    |
| MAT-2007 | Defective Assemblies       | Tokyo_JP    | 320000            | High       | 150      | 35                | Quality Review         |
| MAT-2008 | Seasonal Components        | London_UK   | 75000             | Low        | 30       | 95                | Monitor                |
| MAT-2009 | Prototype Materials        | Seoul_KR    | 540000            | Critical   | 420      | 20                | R&D Evaluation         |
| MAT-2010 | Excess Packaging           | Montreal_CA | 35000             | Low        | 60       | 80                | Redistribute           |

## Instructions to Create Excel Files:

1. **Create `inventory-sample.xlsx`:**
   - Create a new Excel workbook
   - Rename the first sheet to exactly: `FG value`
   - Copy the inventory table above with exact column headers
   - Save as `inventory-sample.xlsx` in the `public/samples/` folder

2. **Create `osr-sample.xlsx`:**
   - Create a new Excel workbook
   - Rename the first sheet to exactly: `OSR Main Sheet HC`
   - Copy the OSR table above with exact column headers
   - Save as `osr-sample.xlsx` in the `public/samples/` folder

3. **Test the Sample Data:**
   - Go to Upload page
   - Click "Load Both" to download sample files
   - Upload the files using the file selector
   - Navigate to Dashboard, Inventory Analysis, and OSR Command Center to see charts

This will provide realistic sample data that matches the expected structure for the chart system.