import 'dotenv/config';

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

  const response = await fetch('http://localhost:8080/api/export/summary?format=xlsx', {
    headers: { Cookie: `auth-token=${token}` },
  });

  console.log('status', response.status);
  console.log('content-type', response.headers.get('content-type'));
  const buffer = await response.arrayBuffer();
  console.log('bytes', buffer.byteLength);
  if (!response.ok) {
    console.log(new TextDecoder().decode(buffer));
  } else {
    const header = new Uint8Array(buffer.slice(0, 4));
    console.log('magic', Array.from(header).map((b) => b.toString(16)).join(' '));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
