import { describe, it, expect } from 'vitest';
import { seedCriteria, seedDocuments, seedSchemes } from '../data/seed';

describe('Citations Integrity & Zero-Hallucination Guard', () => {
  it('every seed criterion is backed by a non-empty source quote and section', () => {
    for (const c of seedCriteria) {
      expect(c.source_quote, `Criterion ${c.id} missing source quote`).toBeDefined();
      expect(c.source_quote.trim().length, `Criterion ${c.id} has empty quote`).toBeGreaterThan(0);
      expect(c.source_page_or_section, `Criterion ${c.id} missing section`).toBeDefined();
    }
  });

  it('every source quote conforms to brevity bounds (max 30 words)', () => {
    for (const c of seedCriteria) {
      const words = c.source_quote.trim().split(/\s+/).length;
      expect(words, `Quote in ${c.id} exceeds 30 words (${words} words found)`).toBeLessThanOrEqual(30);
    }
  });

  it('every criterion maps to an existing scheme and valid document ID', () => {
    const schemeIds = new Set(seedSchemes.map((s) => s.id));
    const docIds = new Set(seedDocuments.map((d) => d.id));

    for (const c of seedCriteria) {
      expect(schemeIds.has(c.scheme_id), `Criterion ${c.id} references unknown scheme ${c.scheme_id}`).toBe(true);
      expect(docIds.has(c.source_doc_id), `Criterion ${c.id} references unknown doc ${c.source_doc_id}`).toBe(true);
    }
  });
});
