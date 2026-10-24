import { NextRequest, NextResponse } from 'next/server';
import { getAllSchemes, getCriteriaForScheme, getProfile, saveProfile } from '@/lib/db';
import { evaluateScheme } from '@/lib/eligibility/engine';
import { demoPersonas } from '@/data/personas';
import { formatINR } from '@/lib/utils';
import type { StartupProfile, Scheme, OverallVerdict } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profileId, modifications } = body;

    let baseProfile = profileId ? getProfile(profileId) : null;
    if (!baseProfile) {
      const demo = demoPersonas.find((p) => p.id === profileId) || demoPersonas[0];
      baseProfile = demo.profile;
    }

    // Deep clone and apply modifications
    const simulatedProfile: StartupProfile = JSON.parse(JSON.stringify(baseProfile));

    if (modifications) {
      if (modifications.dpiit_recognition) {
        simulatedProfile.dpiit_recognition = {
          value: modifications.dpiit_recognition,
          confidence: 'user_provided',
        };
      }
      if (modifications.registration_type) {
        simulatedProfile.registration_type = {
          value: modifications.registration_type,
          confidence: 'user_provided',
        };
      }
      if (modifications.stage) {
        simulatedProfile.stage = {
          value: modifications.stage,
          confidence: 'user_provided',
        };
      }
      if (modifications.annual_turnover !== undefined) {
        simulatedProfile.annual_turnover = {
          value: modifications.annual_turnover,
          confidence: 'user_provided',
        };
      }
      if (modifications.state) {
        simulatedProfile.state = {
          value: modifications.state,
          confidence: 'user_provided',
        };
      }
      if (modifications.incorporation_years_ago !== undefined) {
        const yearsAgo = Number(modifications.incorporation_years_ago);
        const date = new Date(Date.now() - yearsAgo * 365.25 * 24 * 60 * 60 * 1000);
        simulatedProfile.incorporation_date = {
          value: date.toISOString().split('T')[0],
          confidence: 'user_provided',
        };
      }
      if (modifications.is_woman_founder !== undefined) {
        simulatedProfile.founder_demographics.value.is_woman_founder = modifications.is_woman_founder;
      }
      if (modifications.ip_status !== undefined) {
        simulatedProfile.ip_status = {
          value: modifications.ip_status,
          confidence: 'user_provided',
        };
      }
    }

    const schemes = getAllSchemes();

    let baseEligibleCount = 0;
    let baseFundingMax = 0;
    let simEligibleCount = 0;
    let simFundingMax = 0;

    const schemeDeltas: {
      scheme: Scheme;
      baseVerdict: OverallVerdict;
      simulatedVerdict: OverallVerdict;
      status: 'unlocked' | 'lost' | 'improved' | 'unchanged';
      reason?: string;
    }[] = [];

    for (const scheme of schemes) {
      const criteria = getCriteriaForScheme(scheme.id);
      const baseEval = evaluateScheme(baseProfile, scheme.id, scheme.name, criteria);
      const simEval = evaluateScheme(simulatedProfile, scheme.id, scheme.name, criteria);

      if (baseEval.result.overall_verdict === 'likely_eligible') {
        baseEligibleCount++;
        baseFundingMax += scheme.funding_range_max || 0;
      }

      if (simEval.result.overall_verdict === 'likely_eligible') {
        simEligibleCount++;
        simFundingMax += scheme.funding_range_max || 0;
      }

      let status: 'unlocked' | 'lost' | 'improved' | 'unchanged' = 'unchanged';
      let reason: string | undefined;

      const baseV = baseEval.result.overall_verdict;
      const simV = simEval.result.overall_verdict;

      if (baseV === 'not_eligible' && simV === 'likely_eligible') {
        status = 'unlocked';
        reason = 'All mandatory criteria now satisfied under simulated profile.';
      } else if (baseV === 'not_eligible' && simV === 'partially_eligible') {
        status = 'improved';
        reason = 'Hard blockers resolved; documentary verification pending.';
      } else if (baseV === 'likely_eligible' && simV === 'not_eligible') {
        status = 'lost';
        reason = 'Simulated profile parameters breach scheme thresholds.';
      }

      schemeDeltas.push({
        scheme,
        baseVerdict: baseV,
        simulatedVerdict: simV,
        status,
        reason,
      });
    }

    const newlyUnlocked = schemeDeltas.filter((d) => d.status === 'unlocked' || d.status === 'improved');
    const lost = schemeDeltas.filter((d) => d.status === 'lost');
    const fundingDeltaMax = simFundingMax - baseFundingMax;

    // Strategic Narration
    let narration = '';
    if (newlyUnlocked.length > 0) {
      const names = newlyUnlocked.map((d) => d.scheme.name).slice(0, 3).join(', ');
      narration = `This simulation unlocks **${newlyUnlocked.length} new government funding ${
        newlyUnlocked.length === 1 ? 'opportunity' : 'opportunities'
      }** (${names}), expanding your potential non-dilutive capital by **${formatINR(
        Math.max(0, fundingDeltaMax)
      )}**.`;
    } else if (lost.length > 0) {
      narration = `Caution: this change causes you to lose eligibility for **${lost.length} schemes** due to threshold breaches.`;
    } else {
      narration = `Your eligibility profile remains unchanged across all 10 evaluated schemes under this parameter set.`;
    }

    return NextResponse.json({
      success: true,
      summary: {
        baseEligibleCount,
        simEligibleCount,
        baseFundingMax,
        simFundingMax,
        fundingDeltaMax,
        newlyUnlockedCount: newlyUnlocked.length,
        lostCount: lost.length,
      },
      schemeDeltas,
      narration,
      simulatedProfile,
    });
  } catch (error: any) {
    console.error('What-If simulation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Simulation failed' },
      { status: 500 }
    );
  }
}
