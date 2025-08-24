// One-time script to examine Excel test files
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function examineExcelFile(filePath) {
    console.log(`\n=== Examining: ${filePath} ===`);
    
    try {
        const workbook = XLSX.readFile(filePath);
        console.log(`Sheet Names: ${workbook.SheetNames.join(', ')}`);
        
        workbook.SheetNames.forEach(sheetName => {
            console.log(`\n--- Sheet: ${sheetName} ---`);
            const worksheet = workbook.Sheets[sheetName];
            
            // Get the range of the worksheet
            const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
            console.log(`Range: ${worksheet['!ref'] || 'Empty sheet'}`);
            
            // Get headers (first row)
            const headers = [];
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({r: range.s.r, c: col});
                const cell = worksheet[cellAddress];
                if (cell) {
                    headers.push(cell.v);
                }
            }
            
            console.log(`Headers: ${headers.join(', ')}`);
            console.log(`Rows: ${range.e.r + 1} (including header)`);
            console.log(`Columns: ${range.e.c + 1}`);
            
            // Show first few data rows as sample
            if (range.e.r > 0) {
                console.log('\nSample data (first 3 rows):');
                for (let row = 1; row <= Math.min(3, range.e.r); row++) {
                    const rowData = [];
                    for (let col = range.s.c; col <= range.e.c; col++) {
                        const cellAddress = XLSX.utils.encode_cell({r: row, c: col});
                        const cell = worksheet[cellAddress];
                        rowData.push(cell ? cell.v : '');
                    }
                    console.log(`Row ${row}: ${rowData.join(' | ')}`);
                }
            }
        });
        
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
    }
}

// Examine both files
const inventoryFile = path.join(__dirname, '..', 'docs', 'inventory file.xlsx');
const osrFile = path.join(__dirname, '..', 'docs', 'osr_file.xlsx');

examineExcelFile(inventoryFile);
examineExcelFile(osrFile);