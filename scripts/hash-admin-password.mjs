// Prints the environment lines for the single admin login. Reads the password from stdin so it never lands in
// shell history or the repository:  node scripts/hash-admin-password.mjs you@example.com
// Must stay in step with hashPassword in lib/munchies/admin-auth.ts.
import { webcrypto as crypto } from 'node:crypto';
const email = process.argv[2];
if (!email) { console.error('Usage: node scripts/hash-admin-password.mjs <email>  (then type the password and press Enter)'); process.exit(1); }
let input = '';
process.stdin.setEncoding('utf8');
for await (const chunk of process.stdin) { input += chunk; if (input.includes('\n')) break; }
const password = input.replace(/\r?\n[\s\S]*$/, '');
if (password.length < 10) { console.error('Use a password of at least 10 characters.'); process.exit(1); }
const b64 = bytes => Buffer.from(bytes).toString('base64url');
const salt = crypto.getRandomValues(new Uint8Array(16)), iterations = 210000;
const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
console.log(`ADMIN_EMAIL=${email}\nADMIN_PASSWORD_HASH=pbkdf2:${iterations}:${b64(salt)}:${b64(bits)}\nADMIN_SESSION_SECRET=${b64(crypto.getRandomValues(new Uint8Array(32)))}`);
process.exit(0);
