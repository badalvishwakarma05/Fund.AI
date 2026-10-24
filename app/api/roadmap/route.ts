import { NextRequest, NextResponse } from 'next/server';
import {
  getRoadmapSteps,
  saveRoadmapSteps,
  toggleRoadmapStep,
  getProfile,
  saveProfile,
} from '@/lib/db';
import { demoPersonas } from '@/data/personas';
import type { RoadmapStep, ReadinessScore, StartupProfile } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get('profile_id') || demoPersonas[0].id;

    let steps = getRoadmapSteps(profileId);

    if (steps.length === 0) {
      let profile = getProfile(profileId);
      if (!profile) {
        const demo = demoPersonas.find((p) => p.id === profileId) || demoPersonas[0];
        profile = demo.profile;
        saveProfile(profile);
      }
      steps = generateDefaultRoadmapSteps(profile);
      saveRoadmapSteps(profileId, steps);
    }

    const readinessScore = computeReadinessScore(profileId, steps);

    return NextResponse.json({
      success: true,
      profileId,
      steps,
      readinessScore,
    });
  } catch (error: any) {
    console.error('Roadmap fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch roadmap' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { profileId, stepId, isCompleted } = body;

    if (!stepId || typeof isCompleted !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Step ID and isCompleted status are required' },
        { status: 400 }
      );
    }

    toggleRoadmapStep(stepId, isCompleted);

    const steps = getRoadmapSteps(profileId || demoPersonas[0].id);
    const readinessScore = computeReadinessScore(profileId || demoPersonas[0].id, steps);

    return NextResponse.json({
      success: true,
      stepId,
      isCompleted,
      steps,
      readinessScore,
    });
  } catch (error: any) {
    console.error('Roadmap toggle error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update step' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profileId } = body;
    const targetId = profileId || demoPersonas[0].id;

    let profile = getProfile(targetId);
    if (!profile) {
      const demo = demoPersonas.find((p) => p.id === targetId) || demoPersonas[0];
      profile = demo.profile;
      saveProfile(profile);
    }

    const newSteps = generateDefaultRoadmapSteps(profile);
    saveRoadmapSteps(targetId, newSteps);
    const readinessScore = computeReadinessScore(targetId, newSteps);

    return NextResponse.json({
      success: true,
      steps: newSteps,
      readinessScore,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reset roadmap' },
      { status: 500 }
    );
  }
}

/**
 * Generates tailored dependency-aware roadmap steps based on startup profile
 */
function generateDefaultRoadmapSteps(profile: StartupProfile): RoadmapStep[] {
  const isDpiitRecognized = profile.dpiit_recognition.value === 'yes';
  const isPvtLtdOrLlp = ['pvt_ltd', 'llp'].includes(profile.registration_type.value);
  const state = profile.state.value || 'Karnataka';

  return [
    {
      id: `step-1-${profile.id}`,
      profile_id: profile.id,
      order: 1,
      title: 'Obtain Official DPIIT Startup Recognition',
      description:
        'Submit incorporation certificate, board resolution, and innovation pitch note on Startup India portal to receive DPIIT certificate.',
      why_it_matters:
        'Mandatory gatekeeper requirement for SISFS (₹50L grant), Section 80-IAC 3-year tax exemption, and fast-track patents.',
      estimated_effort: '2-3 business days',
      dependency_ids: [],
      linked_criterion_id: 'c-sisfs-dpiit',
      linked_scheme_ids: ['sisfs', 'dpiit-recognition', 'karnataka-elevate'],
      linked_document_url: 'https://www.startupindia.gov.in/content/sih/en/startupgov/startup-recognition-page.html',
      is_completed: isDpiitRecognized,
      completed_at: isDpiitRecognized ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
    },
    {
      id: `step-2-${profile.id}`,
      profile_id: profile.id,
      order: 2,
      title: 'Audited Financial Statements & CA Net-Worth Certificate',
      description:
        'Engage your Chartered Accountant to issue an official net worth certificate and 6-month current bank account statements.',
      why_it_matters:
        'Required proof to establish non-defaulter status and verify turnover bounds under MSME/CGTMSE rules.',
      estimated_effort: '3-5 business days',
      dependency_ids: [],
      linked_criterion_id: null,
      linked_scheme_ids: ['cgtmse', 'mudra-shishu'],
      linked_document_url: 'https://www.cgtmse.in',
      is_completed: false,
      completed_at: null,
      created_at: new Date().toISOString(),
    },
    {
      id: `step-3-${profile.id}`,
      profile_id: profile.id,
      order: 3,
      title: 'Formulate Detailed Project Report (DPR) & Milestone Budget',
      description:
        'Draft a structured 10-page Detailed Project Report breaking down Proof-of-Concept testing, prototype manufacturing, and fund utilization.',
      why_it_matters:
        'Government incubators and BIRAC evaluation committees score applications heavily based on technical milestone clarity.',
      estimated_effort: '1-2 weeks',
      dependency_ids: [],
      linked_criterion_id: null,
      linked_scheme_ids: ['sisfs', 'birac-big'],
      linked_document_url: 'https://seedfund.startupindia.gov.in',
      is_completed: false,
      completed_at: null,
      created_at: new Date().toISOString(),
    },
    {
      id: `step-4-${profile.id}`,
      profile_id: profile.id,
      order: 4,
      title: 'Submit SISFS Application to Approved Host Incubator',
      description:
        'Log into seedfund.startupindia.gov.in and select up to 3 preference incubators (e.g. IIMB NSRCEL, IIT Madras RTBI, or Derbi Foundation).',
      why_it_matters:
        'Grants up to ₹20 Lakh for prototype/trials and up to ₹50 Lakh via convertible debentures for commercialization.',
      estimated_effort: '3-4 days',
      dependency_ids: [`step-1-${profile.id}`, `step-3-${profile.id}`],
      linked_criterion_id: 'c-sisfs-dpiit',
      linked_scheme_ids: ['sisfs'],
      linked_document_url: 'https://seedfund.startupindia.gov.in',
      is_completed: false,
      completed_at: null,
      created_at: new Date().toISOString(),
    },
    {
      id: `step-5-${profile.id}`,
      profile_id: profile.id,
      order: 5,
      title: `Apply for ${state} State Startup Policy Grants & Subsidies`,
      description:
        `File an application through the ${state} state startup cell portal for state-specific seed grants (up to ₹50 Lakh) and SGST reimbursement.`,
      why_it_matters:
        'Provides supplementary non-dilutive state grants that stack on top of central Startup India support.',
      estimated_effort: '1 week',
      dependency_ids: [`step-1-${profile.id}`],
      linked_criterion_id: 'c-ke-state',
      linked_scheme_ids: ['karnataka-elevate'],
      linked_document_url: 'https://startup.karnataka.gov.in/elevate-program',
      is_completed: false,
      completed_at: null,
      created_at: new Date().toISOString(),
    },
    {
      id: `step-6-${profile.id}`,
      profile_id: profile.id,
      order: 6,
      title: 'Apply for CGTMSE Collateral-Free Credit Guarantee Loan',
      description:
        'Submit working capital loan proposal to an eligible lending institution (SBI, SIDBI, BoB) with request for 85% CGTMSE guarantee cover.',
      why_it_matters:
        'Enables raising up to ₹5 Crore in bank debt without pledging personal residential property or third-party collateral.',
      estimated_effort: '2-3 weeks',
      dependency_ids: [`step-2-${profile.id}`],
      linked_criterion_id: 'c-cgtmse-msme',
      linked_scheme_ids: ['cgtmse'],
      linked_document_url: 'https://www.cgtmse.in',
      is_completed: false,
      completed_at: null,
      created_at: new Date().toISOString(),
    },
  ];
}

/**
 * Computes readiness score measuring preparation checklist completion
 */
function computeReadinessScore(profileId: string, steps: RoadmapStep[]): ReadinessScore {
  const completed = steps.filter((s) => s.is_completed).length;
  const total = steps.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Breakdown by category
  const breakdown = [
    {
      category: 'Corporate & DPIIT Recognition',
      completed: steps.slice(0, 1).filter((s) => s.is_completed).length,
      total: 1,
    },
    {
      category: 'Financial & Audit Compliance',
      completed: steps.slice(1, 2).filter((s) => s.is_completed).length,
      total: 1,
    },
    {
      category: 'Technical Dossier & DPR',
      completed: steps.slice(2, 3).filter((s) => s.is_completed).length,
      total: 1,
    },
    {
      category: 'Scheme Submissions (Central & State)',
      completed: steps.slice(3).filter((s) => s.is_completed).length,
      total: 3,
    },
  ];

  return {
    profile_id: profileId,
    completed,
    outstanding: total - completed,
    total,
    percentage,
    breakdown,
    computed_at: new Date().toISOString(),
  };
}
