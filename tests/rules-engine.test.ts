import { describe, it, expect } from 'vitest';
import { evaluateSingleCriterion, evaluateScheme } from '../lib/eligibility/engine';
import { demoPersonas } from '../data/personas';
import type { Criterion, StartupProfile } from '../lib/types';

describe('Rules Engine — Deterministic 3-State Evaluator', () => {
  const baseProfile = demoPersonas[0].profile;

  it('evaluates DPIIT recognition equality correctly', () => {
    const criterion: Criterion = {
      id: 'c-test-dpiit',
      scheme_id: 'sisfs',
      field_checked: 'dpiit_recognition',
      operator: 'eq',
      value: '"yes"',
      human_readable_text: 'Must be recognized by DPIIT',
      source_doc_id: 'doc-sisfs',
      source_quote: 'recognized by DPIIT',
      source_page_or_section: 'Section 3.1',
      extraction_confidence: 0.98,
      reviewed_by_human: true,
      created_at: '',
      updated_at: '',
    };

    // Case 1: Recognized -> MET
    const resMet = evaluateSingleCriterion(baseProfile, criterion);
    expect(resMet.verdict).toBe('MET');
    expect(resMet.evidence).toContain('DPIIT Startup Recognition confirmed');

    // Case 2: Not recognized -> NOT_MET
    const unrecogProfile: StartupProfile = {
      ...baseProfile,
      dpiit_recognition: { value: 'no', confidence: 'user_provided' },
    };
    const resNotMet = evaluateSingleCriterion(unrecogProfile, criterion);
    expect(resNotMet.verdict).toBe('NOT_MET');
  });

  it('evaluates relative incorporation date bounds (date math)', () => {
    const criterion: Criterion = {
      id: 'c-test-age',
      scheme_id: 'sisfs',
      field_checked: 'incorporation_date',
      operator: 'gte',
      value: '"2_years_ago"',
      human_readable_text: 'Incorporated not more than 2 years ago',
      source_doc_id: 'doc-sisfs',
      source_quote: 'not more than 2 years ago',
      source_page_or_section: 'Section 3.2',
      extraction_confidence: 0.95,
      reviewed_by_human: true,
      created_at: '',
      updated_at: '',
    };

    // 1 year old -> MET
    const youngProfile: StartupProfile = {
      ...baseProfile,
      incorporation_date: {
        value: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        confidence: 'user_provided',
      },
    };
    const resYoung = evaluateSingleCriterion(youngProfile, criterion);
    expect(resYoung.verdict).toBe('MET');

    // 4 years old -> NOT_MET
    const oldProfile: StartupProfile = {
      ...baseProfile,
      incorporation_date: {
        value: new Date(Date.now() - 4 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        confidence: 'user_provided',
      },
    };
    const resOld = evaluateSingleCriterion(oldProfile, criterion);
    expect(resOld.verdict).toBe('NOT_MET');
    expect(resOld.evidence).toContain('exceeds the 2-year ceiling');
  });

  it('evaluates unknown fields to UNKNOWN without false negatives', () => {
    const criterion: Criterion = {
      id: 'c-test-unknown',
      scheme_id: 'sisfs',
      field_checked: 'annual_turnover',
      operator: 'lte',
      value: '250000000',
      human_readable_text: 'Turnover must not exceed 25 Cr',
      source_doc_id: 'doc-sisfs',
      source_quote: 'turnover not exceeding',
      source_page_or_section: 'Section 3.5',
      extraction_confidence: 0.9,
      reviewed_by_human: true,
      created_at: '',
      updated_at: '',
    };

    const unknownProfile: StartupProfile = {
      ...baseProfile,
      annual_turnover: { value: null, confidence: 'unknown' },
    };

    const res = evaluateSingleCriterion(unknownProfile, criterion);
    expect(res.verdict).toBe('UNKNOWN');
    expect(res.evidence).toContain('not provided');
  });
});
