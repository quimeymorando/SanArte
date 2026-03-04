import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const envPath = path.join(cwd, '.env.local');

const requiredKeys = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'GEMINI_API_KEY'
];

const optionalKeys = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'LEMON_SQUEEZY_WEBHOOK_SECRET'
];

if (!fs.existsSync(envPath)) {
  console.error('Missing .env.local file.');
  console.error('Create it with: copy .env.example .env.local');
  process.exit(1);
}

const raw = fs.readFileSync(envPath, 'utf8');
const lines = raw.split(/\r?\n/);

const env = {};
for (const line of lines) {
  const clean = line.trim();
  if (!clean || clean.startsWith('#')) continue;
  const idx = clean.indexOf('=');
  if (idx === -1) continue;
  const key = clean.slice(0, idx).trim();
  const value = clean.slice(idx + 1).trim();
  env[key] = value;
}

const missingRequired = requiredKeys.filter((k) => !env[k]);
const missingOptional = optionalKeys.filter((k) => !env[k]);

if (missingRequired.length > 0) {
  console.error('Missing required keys in .env.local:');
  for (const key of missingRequired) console.error(`- ${key}`);
  process.exit(1);
}

console.log('OK: required env keys are present.');
if (missingOptional.length > 0) {
  console.log('Optional keys missing (needed for webhook/premium deploy):');
  for (const key of missingOptional) console.log(`- ${key}`);
}
