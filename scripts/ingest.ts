/**
 * FundMate AI — Scheme Ingestion Pipeline
 *
 * Runs data seeding, validates criteria citations, builds FTS indices,
 * and prints an ingestion verification report.
 *
 * Usage:
 *   npx tsx scripts/ingest.ts
 *   npm run ingest
 */

import { getDb, seedDatabase, getDbStats, getAllSchemes, getAllCriteria } from '../lib/db';

async function runIngestion() {
  console.log('\n============================================================');
  console.log('   FundMate AI — Official Scheme Data Ingestion Pipeline   ');
  console.log('============================================================\n');

  const startTime = Date.now();
  const db = getDb();

  console.log('[1/4] Connecting to SQLite & applying schema...');
  console.log('      DB Location: ./data/fundmate.db');

  console.log('[2/4] Ingesting official guidelines & criteria...');
  seedDatabase(db);

  console.log('[3/4] Validating citations & citation quotes...');
  const criteria = getAllCriteria();
  let citationWarnings = 0;

  for (const c of criteria) {
    if (!c.source_quote || c.source_quote.trim().length === 0) {
      console.warn(`      ⚠️  Criterion ${c.id} missing source quote!`);
      citationWarnings++;
    }
    const words = c.source_quote.trim().split(/\s+/).length;
    if (words > 30) {
      console.warn(`      ⚠️  Criterion ${c.id} quote is ${words} words (guideline max: 25 words)`);
      citationWarnings++;
    }
  }

  if (citationWarnings === 0) {
    console.log('      ✓ All criteria passed citation integrity checks.');
  }

  console.log('[4/4] Generating Database Verification Report...\n');
  const stats = getDbStats();
  const schemes = getAllSchemes();

  console.log('------------------------------------------------------------');
  console.log(`  Total Central/State Schemes:   ${stats.schemes}`);
  console.log(`  Total Official Documents:      ${stats.docs}`);
  console.log(`  Total Extracted Criteria:      ${stats.criteria}`);
  console.log(`  Human-Reviewed Criteria:       ${stats.reviewed} (${Math.round((stats.reviewed / stats.criteria) * 100)}%)`);
  console.log(`  Demo Startup Profiles:         ${stats.profiles}`);
  console.log('------------------------------------------------------------\n');

  console.log('Ingested Schemes:');
  schemes.forEach((s, idx) => {
    const typeUpper = s.type.toUpperCase().padEnd(12);
    const levelUpper = s.level.toUpperCase().padEnd(8);
    console.log(`  ${(idx + 1).toString().padStart(2, '0')}. [${levelUpper}] [${typeUpper}] ${s.name}`);
  });

  const durationMs = Date.now() - startTime;
  console.log(`\n✓ Ingestion pipeline completed successfully in ${durationMs}ms.\n`);
}

runIngestion().catch((err) => {
  console.error('\n❌ Ingestion failed with error:', err);
  process.exit(1);
});
