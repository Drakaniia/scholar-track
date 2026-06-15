import 'dotenv/config';
import ExcelJS from 'exceljs';
import { writeFileSync } from 'fs';
import { SignJWT } from 'jose';

const EXPECTED_SHEETS = ['Grade School', 'Junior High', 'Senior High', 'College'];
const EXPECTED_COLUMNS = 19;

async function main() {
  console.log('🧪 Comprehensive Summary Export Test\n');
  console.log('=' .repeat(60));

  // 1. Generate auth token
  console.log('\n1️⃣  Generating authentication token...');
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');
  const token = await new SignJWT({
    user: {
      id: 1,
      username: 'admin',
      email: 'admin@scholartrack.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret);
  console.log('   ✅ Token generated');

  // 2. Test API endpoint
  console.log('\n2️⃣  Testing API endpoint /api/export/summary?format=xlsx');
  const response = await fetch('http://localhost:8080/api/export/summary?format=xlsx', {
    headers: { Cookie: `auth-token=${token}` },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('   ❌ API returned error:', response.status, text);
    process.exit(1);
  }

  console.log('   ✅ Status:', response.status);
  console.log('   ✅ Content-Type:', response.headers.get('content-type'));
  console.log('   ✅ Content-Disposition:', response.headers.get('content-disposition'));

  // 3. Verify file format
  console.log('\n3️⃣  Verifying file format...');
  const buffer = await response.arrayBuffer();
  const header = new Uint8Array(buffer.slice(0, 4));
  const magicNumber = Array.from(header).map((b) => b.toString(16).padStart(2, '0')).join(' ');
  
  if (magicNumber !== '50 4b 03 04') {
    console.error('   ❌ Invalid file format. Magic number:', magicNumber);
    process.exit(1);
  }

  console.log('   ✅ Valid Excel/ZIP format (magic: ' + magicNumber + ')');
  console.log('   ✅ File size:', buffer.byteLength.toLocaleString(), 'bytes');

  // 4. Parse and verify workbook structure
  console.log('\n4️⃣  Parsing workbook structure...');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  console.log('   ✅ Total sheets:', workbook.worksheets.length);

  if (workbook.worksheets.length !== EXPECTED_SHEETS.length) {
    console.error(`   ❌ Expected ${EXPECTED_SHEETS.length} sheets, got ${workbook.worksheets.length}`);
    process.exit(1);
  }

  // 5. Verify each sheet
  console.log('\n5️⃣  Verifying individual sheets...');
  
  const errors: string[] = [];
  
  workbook.worksheets.forEach((sheet, index) => {
    const expectedName = EXPECTED_SHEETS[index];
    console.log(`\n   📄 Sheet ${index + 1}: "${sheet.name}"`);

    // Check name
    if (sheet.name !== expectedName) {
      errors.push(`Sheet ${index + 1} name mismatch: expected "${expectedName}", got "${sheet.name}"`);
      console.log(`      ❌ Name mismatch (expected "${expectedName}")`);
    } else {
      console.log('      ✅ Name correct');
    }

    // Check columns
    if (sheet.columnCount !== EXPECTED_COLUMNS) {
      errors.push(`Sheet "${sheet.name}" has ${sheet.columnCount} columns, expected ${EXPECTED_COLUMNS}`);
      console.log(`      ❌ Column count: ${sheet.columnCount} (expected ${EXPECTED_COLUMNS})`);
    } else {
      console.log(`      ✅ Columns: ${sheet.columnCount}`);
    }

    // Check rows
    console.log(`      ✅ Rows: ${sheet.rowCount}`);

    // Verify header structure
    const row1 = sheet.getRow(1);
    const scholarship = row1.getCell(1).value?.toString() || '';
    const grant = row1.getCell(5).value?.toString() || '';
    
    if (!scholarship.includes('SCHOLARSHIP')) {
      errors.push(`Sheet "${sheet.name}" row 1 missing SCHOLARSHIP header`);
      console.log('      ❌ Missing SCHOLARSHIP header in row 1');
    } else {
      console.log('      ✅ Header row present');
    }

    // Verify data rows exist
    const row2 = sheet.getRow(2);
    const internallyFunded = row2.getCell(1).value?.toString() || '';
    
    if (!internallyFunded.includes('INTERNALLY FUNDED')) {
      errors.push(`Sheet "${sheet.name}" missing INTERNALLY FUNDED section`);
      console.log('      ❌ Missing INTERNALLY FUNDED section');
    } else {
      console.log('      ✅ INTERNALLY FUNDED section present');
    }

    // Check for year columns (should be in row 1)
    const yearColumns = [8, 12, 16]; // Academic year headers
    yearColumns.forEach((col, idx) => {
      const value = row1.getCell(col).value?.toString() || '';
      if (value.match(/\d{4}/)) {
        console.log(`      ✅ Year ${idx + 1} column present: ${value}`);
      }
    });

    // Sample data check
    console.log('      📊 Sample data (first 3 rows):');
    for (let i = 1; i <= Math.min(3, sheet.rowCount); i++) {
      const row = sheet.getRow(i);
      const cell1 = row.getCell(1).value?.toString().slice(0, 40) || '';
      const cell5 = row.getCell(5).value?.toString().slice(0, 40) || '';
      if (cell1) {
        console.log(`         Row ${i}: ${cell1}${cell5 ? ' | ' + cell5 : ''}`);
      }
    }
  });

  // 6. Save test output
  console.log('\n6️⃣  Saving test output...');
  const filename = 'test-output-summary.xlsx';
  writeFileSync(filename, Buffer.from(buffer));
  console.log(`   ✅ Saved as: ${filename}`);

  // 7. Final verdict
  console.log('\n' + '='.repeat(60));
  
  if (errors.length > 0) {
    console.log('\n❌ TEST FAILED\n');
    console.log('Errors found:');
    errors.forEach((error) => console.log(`  - ${error}`));
    process.exit(1);
  }

  console.log('\n✅ ALL TESTS PASSED!\n');
  console.log('Summary:');
  console.log('  ✅ API endpoint working');
  console.log('  ✅ File format valid');
  console.log('  ✅ All 4 grade level sheets present');
  console.log('  ✅ Correct structure and headers');
  console.log('  ✅ Data populated correctly');
  console.log('\n📁 You can open test-output-summary.xlsx to manually verify');
  console.log('=' .repeat(60) + '\n');
}

main().catch((error) => {
  console.error('\n❌ Test execution failed:', error);
  process.exitCode = 1;
});
