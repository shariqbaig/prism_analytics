const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Create samples directory if it doesn't exist
const samplesDir = path.join(__dirname, '../public/samples');
if (!fs.existsSync(samplesDir)) {
  fs.mkdirSync(samplesDir, { recursive: true });
}

// Generate Inventory Sample File
function generateInventorySample() {
  const workbook = XLSX.utils.book_new();

  // FG value sheet - EXACT headers from fileProcessing.ts config
  const fgValueData = [
    ['Pack Size(m.d.)', 'Plant', 'location', 'Material', 'Description', 'Closing Stock Quantity', 'Closing Stock Value', 'Per Unit Value Moti', 'Total Value'],
    ['100ml', 'Houston_TX', 'Warehouse_A', 'MAT-1001', 'Premium Steel Components', 15000, 2500000, 166.67, 2500000],
    ['250g', 'Austin_TX', 'DC_Central', 'MAT-1002', 'Electronic Control Units', 8500, 1800000, 211.76, 1800000],
    ['500ml', 'Detroit_MI', 'Storage_B', 'MAT-1003', 'Hydraulic Systems', 12000, 3200000, 266.67, 3200000],
    ['1kg', 'Shanghai_CN', 'Warehouse_C', 'MAT-1004', 'Precision Bearings', 45000, 1200000, 26.67, 1200000],
    ['2kg', 'Mumbai_IN', 'DC_South', 'MAT-1005', 'Aluminum Extrusions', 28000, 950000, 33.93, 950000],
    ['100g', 'Frankfurt_DE', 'Storage_A', 'MAT-1006', 'Carbon Fiber Panels', 6500, 4100000, 630.77, 4100000],
    ['50ml', 'Tokyo_JP', 'Warehouse_B', 'MAT-1007', 'Optical Sensors', 18500, 2300000, 124.32, 2300000],
    ['5kg', 'London_UK', 'DC_West', 'MAT-1008', 'Titanium Alloys', 3200, 5600000, 1750.00, 5600000],
    ['1.5kg', 'Seoul_KR', 'Storage_C', 'MAT-1009', 'Power Electronics', 9800, 3800000, 387.76, 3800000],
    ['750g', 'Montreal_CA', 'Warehouse_D', 'MAT-1010', 'Composite Structures', 11200, 2900000, 258.93, 2900000]
  ];

  const fgValueSheet = XLSX.utils.aoa_to_sheet(fgValueData);
  XLSX.utils.book_append_sheet(workbook, fgValueSheet, 'FG value');

  // RPM sheet - EXACT headers from fileProcessing.ts config
  const rpmData = [
    ['Material', 'Description', 'CAT', 'Plant', 'Material Type', 'Closing Stock Quantity', 'Closing Stock Value', 'Unit of Measure', 'Unit Price', 'Total Value'],
    ['RPM001', 'Raw Steel Plates', 'Metal', 'Houston_TX', 'Raw Material', 5000, 750000, 'KG', 150.00, 750000],
    ['RPM002', 'Electronic Components', 'Electronics', 'Austin_TX', 'Semi-Finished', 8500, 1200000, 'PCS', 141.18, 1200000],
    ['RPM003', 'Chemical Additives', 'Chemical', 'Detroit_MI', 'Raw Material', 2500, 400000, 'LTR', 160.00, 400000],
    ['RPM004', 'Precision Screws', 'Hardware', 'Shanghai_CN', 'Semi-Finished', 50000, 250000, 'PCS', 5.00, 250000],
    ['RPM005', 'Polymer Resins', 'Polymer', 'Mumbai_IN', 'Raw Material', 1800, 900000, 'KG', 500.00, 900000]
  ];

  const rpmSheet = XLSX.utils.aoa_to_sheet(rpmData);
  XLSX.utils.book_append_sheet(workbook, rpmSheet, 'RPM');

  // Write the file
  const inventoryPath = path.join(samplesDir, 'inventory-sample.xlsx');
  XLSX.writeFile(workbook, inventoryPath);
  console.log('Generated inventory-sample.xlsx');
}

// Generate OSR Sample File
function generateOSRSample() {
  const workbook = XLSX.utils.book_new();

  // OSR Main Sheet HC - Headers matching the OSR configuration
  const osrMainData = [
    ['Material', 'Material Description', 'Status', 'Avg Unit Price (Rs)', 'Total OSR (Qty)', 'Total OSR Value PKR', 'Residual (Qnty) >26 weeks'],
    ['MAT-2001', 'Obsolete Control Modules', 'Active', 4500.00, 100, 450000, 80],
    ['MAT-2002', 'Legacy Circuit Boards', 'Discontinued', 3294.12, 85, 280000, 60],
    ['MAT-2003', 'Surplus Steel Stock', 'Active', 125.00, 1000, 125000, 200],
    ['MAT-2004', 'End-of-Life Components', 'Obsolete', 1259.26, 540, 680000, 450],
    ['MAT-2005', 'Discontinued Sensors', 'Discontinued', 864.91, 220, 190000, 180],
    ['MAT-2006', 'Overstock Raw Materials', 'Active', 2111.11, 45, 95000, 30],
    ['MAT-2007', 'Defective Assemblies', 'Defective', 2133.33, 150, 320000, 120],
    ['MAT-2008', 'Seasonal Components', 'Active', 2500.00, 30, 75000, 20],
    ['MAT-2009', 'Prototype Materials', 'Prototype', 1285.71, 420, 540000, 350],
    ['MAT-2010', 'Excess Packaging', 'Active', 583.33, 60, 35000, 40]
  ];

  const osrMainSheet = XLSX.utils.aoa_to_sheet(osrMainData);
  XLSX.utils.book_append_sheet(workbook, osrMainSheet, 'OSR Main Sheet HC');

  // OSR Summary sheet - EXACT headers from fileProcessing.ts config
  const osrSummaryData = [
    ['Total Book Stock', 'Over Stock', 'Excess Stock %'],
    [15000000, 3500000, 23.33],
    [12000000, 2800000, 23.33],
    [18000000, 4200000, 23.33],
    [9500000, 2100000, 22.11],
    [22000000, 5200000, 23.64]
  ];

  const osrSummarySheet = XLSX.utils.aoa_to_sheet(osrSummaryData);
  XLSX.utils.book_append_sheet(workbook, osrSummarySheet, 'OSR Summary');

  // Write the file
  const osrPath = path.join(samplesDir, 'osr-sample.xlsx');
  XLSX.writeFile(workbook, osrPath);
  console.log('Generated osr-sample.xlsx');
}

// Generate both sample files
generateInventorySample();
generateOSRSample();

console.log('Sample files generated successfully!');