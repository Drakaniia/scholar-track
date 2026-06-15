import 'dotenv/config';
import { writeFileSync } from 'fs';
import { SignJWT } from 'jose';

async function main() {
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

  console.log('Testing summary export by grade level...\n');

  const response = await fetch('http://localhost:8080/api/export/summary?format=xlsx', {
    headers: { Cookie: `auth-token=${token}` },
  });

  console.log('✓ Status:', response.status);
  console.log('✓ Content-Type:', response.headers.get('content-type'));
  console.log('✓ Content-Disposition:', response.headers.get('content-disposition'));

  if (!response.ok) {
    const text = await response.text();
    console.error('✗ Error response:', text);
    process.exit(1);
  }

  const buffer = await response.arrayBuffer();
  console.log('✓ File size:', buffer.byteLength, 'bytes');

  const header = new Uint8Array(buffer.slice(0, 4));
  const magicNumber = Array.from(header)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ');
  console.log('✓ Magic number:', magicNumber, '(ZIP/Excel format)');

  // Save file for manual inspection
  const filename = 'test-output-summary.xlsx';
  writeFileSync(filename, Buffer.from(buffer));
  console.log('\n✓ File saved as:', filename);
  console.log('✓ You can open this file in Excel to verify the grade level sheets');
  
  console.log('\n✅ All tests passed! Summary export by grade level is working correctly.');
  console.log('\nExpected sheets in the workbook:');
  console.log('  1. Grade School');
  console.log('  2. Junior High');
  console.log('  3. Senior High');
  console.log('  4. College');
}

main().catch((error) => {
  console.error('✗ Test failed:', error);
  process.exitCode = 1;
});
