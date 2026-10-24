import { describe, it, expect } from 'vitest';
import { evaluateScheme } from '../lib/eligibility/engine';
import { demoPersonas } from '../data/personas';
import { seedCriteria } from '../data/seed';

describe('Golden Set — Persona Eligibility Benchmark', () => {
  const kisanSetu = demoPersonas.find((p) => p.id === 'persona-agritech')!.profile;
  const pulseBio = demoPersonas.find((p) => p.id === 'persona-medtech')!.profile;
  const vidyutBharat = demoPersonas.find((p) => p.id === 'persona-cleantech')!.profile;

  const sisfsCriteria = seedCriteria.filter((c) => c.scheme_id === 'sisfs');
  const elevateCriteria = seedCriteria.filter((c) => c.scheme_id === 'karnataka-elevate');
  const cgtmseCriteria = seedCriteria.filter((c) => c.scheme_id === 'cgtmse');

  it('Persona 1 (KisanSetu - Karnataka AgriTech MVP): should be likely eligible for SISFS', () => {
    const { result } = evaluateScheme(kisanSetu, 'sisfs', 'SISFS', sisfsCriteria);
    expect(result.overall_verdict).toBe('likely_eligible');
    expect(result.not_met_count).toBe(0);
  });

  it('Persona 1 (KisanSetu): should qualify for Karnataka Elevate (registered in Karnataka)', () => {
    const { result } = evaluateScheme(kisanSetu, 'karnataka-elevate', 'Elevate', elevateCriteria);
    expect(result.overall_verdict).toBe('likely_eligible');
  });

  it('Persona 2 (PulseBio - MedTech Student Venture): fails SISFS due to lack of DPIIT recognition', () => {
    const { result, blockers } = evaluateScheme(pulseBio, 'sisfs', 'SISFS', sisfsCriteria);
    expect(result.overall_verdict).toBe('not_eligible');
    expect(result.not_met_count).toBeGreaterThanOrEqual(1);

    const dpiitBlocker = blockers.find((b) => b.field_checked === 'dpiit_recognition');
    expect(dpiitBlocker).toBeDefined();
    expect(dpiitBlocker?.type).toBe('hard_blocker');
  });

  it('Persona 3 (Vidyut Bharat - 3.5 yrs old): fails SISFS (>2 yr ceiling) but qualifies for CGTMSE', () => {
    // SISFS check
    const sisfsEval = evaluateScheme(vidyutBharat, 'sisfs', 'SISFS', sisfsCriteria);
    expect(sisfsEval.result.overall_verdict).toBe('not_eligible');

    // CGTMSE check
    if (cgtmseCriteria.length > 0) {
      const cgtmseEval = evaluateScheme(vidyutBharat, 'cgtmse', 'CGTMSE', cgtmseCriteria);
      expect(cgtmseEval.result.not_met_count).toBe(0);
    }
  });
});
