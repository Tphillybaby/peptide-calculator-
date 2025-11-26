import assert from 'node:assert';
import { PEPTIDE_DATABASE } from '../src/data/peptideDatabase.js';

const entries = Object.values(PEPTIDE_DATABASE);

assert(entries.length >= 20, 'Expected at least 20 peptide entries');

entries.forEach((p) => {
  assert(p.name, 'name missing');
  assert(p.category, `category missing for ${p.name}`);
  assert(Array.isArray(p.benefits), `benefits missing for ${p.name}`);
  assert(Array.isArray(p.sideEffects), `sideEffects missing for ${p.name}`);
  assert(Array.isArray(p.cons), `cons missing for ${p.name}`);
  assert(Array.isArray(p.warnings), `warnings missing for ${p.name}`);
  assert(Array.isArray(p.contraindications), `contraindications missing for ${p.name}`);
  assert(p.status, `status missing for ${p.name}`);
  assert(p.halfLife, `halfLife missing for ${p.name}`);
  assert(p.commonDosage, `commonDosage missing for ${p.name}`);
  assert(p.description, `description missing for ${p.name}`);
});

console.log('dataSchema.test.js passed');
