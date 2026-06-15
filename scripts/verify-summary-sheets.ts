import ExcelJS from 'exceljs';
import { readFileSync } from 'fs';

async function main() {
  console.log('Verifying Excel workbook structure...\n');

  const buffer = readFileSync('test-output-summary.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  console.log('✓ Total sheets:', workbook.worksheets.length);
  console.log('\nSheet details:');

  workbook.worksheets.forEach((sheet, index) => {
    console.log(`\n${index + 1}. "${sheet.name}"`);
    console.log(`   - Rows: ${sheet.rowCount}`);
    console.log(`   - Columns: ${sheet.columnCount}`);
    
    // Show first few rows
    if (sheet.rowCount > 0) {
      console.log('   - Sample data:');
      for (let i = 1; i <= Math.min(5, sheet.rowCount); i++) {
        const row = sheet.getRow(i);
        const cells = [];
        for (let j = 1; j <= Math.min(5, sheet.columnCount); j++) {
          const cell = row.getCell(j);
          if (cell.value) {
            cells.push(`${cell.value}`.slice(0, 30));
          }
        }
        if (cells.length > 0) {
          console.log(`     Row ${i}: ${cells.join(' | ')}`);
        }
      }
    }
  });

  console.log('\n✅ Verification complete!');
}

main().catch((error) => {
  console.error('✗ Verification failed:', error);
  process.exitCode = 1;
});
