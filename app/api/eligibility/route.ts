import { NextRequest, NextResponse } from 'next/server';
import {
  getAllSchemes,
  getCriteriaForScheme,
  getDocumentsForScheme,
  getProfile,
  saveProfile,
  saveEligibilityResult,
} from '@/lib/db';
import { evaluateScheme, type MissingRequirement } from '@/lib/eligibility/engine';
import { demoPersonas } from '@/data/personas';
import type { StartupProfile, Scheme, SchemeDocument, EligibilityResult } from '@/lib/types';

export const dynamic = 'force-dynamic';

export interface EvaluatedSchemeCard {
  scheme: Scheme;
  documents: SchemeDocument[];
  result: EligibilityResult;
  blockers: MissingRequirement[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let profile: StartupProfile | null = null;

    if (body.profile) {
      profile = body.profile;
      saveProfile(profile!);
    } else if (body.profile_id) {
      profile = getProfile(body.profile_id);
      if (!profile) {
        const demo = demoPersonas.find((p) => p.id === body.profile_id);
        if (demo) {
          profile = demo.profile;
          saveProfile(profile);
        }
      }
    }

    if (!profile) {
      // Default to first demo persona if none provided
      profile = demoPersonas[0].profile;
      saveProfile(profile);
    }

    const schemes = getAllSchemes();
    const evaluatedSchemes: EvaluatedSchemeCard[] = [];
    const allBlockers: MissingRequirement[] = [];

    let likelyEligibleCount = 0;
    let partiallyEligibleCount = 0;
    let notEligibleCount = 0;
    let totalPotentialFundingMin = 0;
    let totalPotentialFundingMax = 0;

    for (const scheme of schemes) {
      const criteria = getCriteriaForScheme(scheme.id);
      const documents = getDocumentsForScheme(scheme.id);

      const { result, blockers } = evaluateScheme(profile, scheme.id, scheme.name, criteria);
      saveEligibilityResult(result);

      if (result.overall_verdict === 'likely_eligible') {
        likelyEligibleCount++;
        totalPotentialFundingMin += scheme.funding_range_min || 0;
        totalPotentialFundingMax += scheme.funding_range_max || 0;
      } else if (result.overall_verdict === 'partially_eligible') {
        partiallyEligibleCount++;
      } else {
        notEligibleCount++;
      }

      allBlockers.push(...blockers);
      evaluatedSchemes.push({
        scheme,
        documents,
        result,
        blockers,
      });
    }

    // Sort evaluated schemes: likely eligible first, then partially eligible, then not eligible
    const verdictPriority = {
      likely_eligible: 1,
      partially_eligible: 2,
      need_more_info: 3,
      not_eligible: 4,
    };
    evaluatedSchemes.sort((a, b) => {
      const pA = verdictPriority[a.result.overall_verdict];
      const pB = verdictPriority[b.result.overall_verdict];
      if (pA !== pB) return pA - pB;
      return (b.scheme.funding_range_max || 0) - (a.scheme.funding_range_max || 0);
    });

    return NextResponse.json({
      success: true,
      profile,
      schemes: evaluatedSchemes,
      summary: {
        totalSchemes: schemes.length,
        likelyEligibleCount,
        partiallyEligibleCount,
        notEligibleCount,
        totalPotentialFundingMin,
        totalPotentialFundingMax,
        hardBlockersCount: allBlockers.filter((b) => b.type === 'hard_blocker').length,
        infoGapsCount: allBlockers.filter((b) => b.type === 'information_gap').length,
      },
      blockers: allBlockers,
    });
  } catch (error: any) {
    console.error('Eligibility evaluation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Evaluation failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get('profile_id') || demoPersonas[0].id;

  // Delegate to POST with profile_id
  const syntheticReq = new NextRequest(req.url, {
    method: 'POST',
    body: JSON.stringify({ profile_id: profileId }),
  });
  return POST(syntheticReq);
}
