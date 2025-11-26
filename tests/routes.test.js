import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const appPath = resolve(__dirname, '../src/App.jsx');
const contents = readFileSync(appPath, 'utf8');

const expectedRoutes = ['price-checker', 'encyclopedia', 'half-life', 'calculator', 'privacy', 'terms'];
expectedRoutes.forEach((route) => {
  assert(contents.includes(`"${route}"`), `Missing route path "${route}"`);
});

assert(contents.includes('NotFound'), 'Missing NotFound route handler');
assert(contents.includes('ErrorBoundary'), 'Layout should be wrapped by ErrorBoundary');

console.log('routes.test.js passed');
