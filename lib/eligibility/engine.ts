/**
 * FundMate AI — Deterministic 3-State Eligibility Rules Engine
 *
 * Implements strict, verifiable, deterministic evaluation of startup profiles
 * against official scheme criteria. Zero LLM involvement in verdicts.
 * Every verdict produces clear, human-auditable evidence with verbatim guideline quotes.
 */

import type {
  StartupProfile,
  Criterion,
  CriterionResult,
  EligibilityResult,
  OverallVerdict,
  Verdict,
  FieldConfidence,
} from '@/lib/types';
import { formatINR } from '@/lib/utils';

export interface MissingRequirement {
  id: string;
  scheme_id: string;
  scheme_name: string;
  type: 'hard_blocker' | 'information_gap';
  title: string;
  description: string;
  field_checked: string;
  current_value: string | null;
  required_value: string;
  action_label: string;
  action_href: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SchemeEvaluation {
  result: EligibilityResult;
  blockers: MissingRequirement[];
}

/**
 * Evaluates a startup profile against all criteria for a specific scheme.
 */
export function evaluateScheme(
  profile: StartupProfile,
  schemeId: string,
  schemeName: string,
  criteria: Criterion[]
): SchemeEvaluation {
  const criterionResults: CriterionResult[] = [];
  const blockers: MissingRequirement[] = [];

  let metCount = 0;
  let notMetCount = 0;
  let unknownCount = 0;

  for (const criterion of criteria) {
    const evalResult = evaluateSingleCriterion(profile, criterion);
    criterionResults.push(evalResult);

    if (evalResult.verdict === 'MET') {
      metCount++;
    } else if (evalResult.verdict === 'NOT_MET') {
      notMetCount++;
      blockers.push({
        id: `blocker-${criterion.id}`,
        scheme_id: schemeId,
        scheme_name: schemeName,
        type: 'hard_blocker',
        title: criterion.human_readable_text,
        description: evalResult.evidence,
        field_checked: criterion.field_checked,
        current_value: evalResult.profile_value,
        required_value: evalResult.required_value,
        action_label: getActionLabelForField(criterion.field_checked),
        action_href: getActionHrefForField(criterion.field_checked),
        priority: 'high',
      });
    } else {
      unknownCount++;
      blockers.push({
        id: `gap-${criterion.id}`,
        scheme_id: schemeId,
        scheme_name: schemeName,
        type: 'information_gap',
        title: `Verify ${criterion.human_readable_text}`,
        description: evalResult.evidence,
        field_checked: criterion.field_checked,
        current_value: evalResult.profile_value,
        required_value: evalResult.required_value,
        action_label: 'Update Profile Field',
        action_href: '/onboarding',
        priority: 'medium',
      });
    }
  }

  // Determine overall verdict
  let overallVerdict: OverallVerdict = 'likely_eligible';
  if (notMetCount > 0) {
    overallVerdict = 'not_eligible';
  } else if (unknownCount > 0) {
    if (metCount === 0 || unknownCount > metCount) {
      overallVerdict = 'need_more_info';
    } else {
      overallVerdict = 'partially_eligible';
    }
  } else {
    overallVerdict = 'likely_eligible';
  }

  const result: EligibilityResult = {
    id: `res-${profile.id}-${schemeId}`,
    profile_id: profile.id,
    scheme_id: schemeId,
    criterion_results: criterionResults,
    overall_verdict: overallVerdict,
    met_count: metCount,
    not_met_count: notMetCount,
    unknown_count: unknownCount,
    total_criteria: criteria.length,
    created_at: new Date().toISOString(),
  };

  return { result, blockers };
}

/**
 * Deterministically evaluates a single criterion against the profile.
 */
export function evaluateSingleCriterion(
  profile: StartupProfile,
  criterion: Criterion
): CriterionResult {
  const { value: profileValue, confidence } = extractFieldValue(profile, criterion.field_checked);

  // If the profile field confidence is marked 'unknown', or if value is null/undefined
  if (confidence === 'unknown' || profileValue === null || profileValue === undefined) {
    return {
      criterion_id: criterion.id,
      verdict: 'UNKNOWN',
      evidence: `Profile field '${criterion.field_checked}' is not provided. Add this in your profile to verify compliance with: "${criterion.source_quote || criterion.human_readable_text}".`,
      profile_value: null,
      required_value: formatCriterionValue(criterion.value),
    };
  }

  // Handle TriState 'unknown' values
  if (profileValue === 'unknown') {
    return {
      criterion_id: criterion.id,
      verdict: 'UNKNOWN',
      evidence: `Status for '${criterion.field_checked}' is currently set to 'Unknown'.`,
      profile_value: 'unknown',
      required_value: formatCriterionValue(criterion.value),
    };
  }

  // Date relative arithmetic (incorporation date limit checks)
  if (criterion.field_checked === 'incorporation_date') {
    return evaluateDateCriterion(profileValue, criterion);
  }

  // Set / List membership (operator: 'in' or 'not_in')
  if (criterion.operator === 'in' || criterion.operator === 'not_in') {
    return evaluateSetCriterion(profileValue, criterion);
  }

  // Equality / Inequality
  if (criterion.operator === 'eq' || criterion.operator === 'neq') {
    return evaluateEqualityCriterion(profileValue, criterion);
  }

  // Numeric comparisons (lte, gte, lt, gt)
  if (['lte', 'gte', 'lt', 'gt'].includes(criterion.operator)) {
    return evaluateNumericCriterion(profileValue, criterion);
  }

  // Existence / Non-empty check
  if (criterion.operator === 'exists') {
    const hasValue = typeof profileValue === 'string'
      ? profileValue.trim().length >= 4
      : Boolean(profileValue);

    return {
      criterion_id: criterion.id,
      verdict: hasValue ? 'MET' : 'NOT_MET',
      evidence: hasValue
        ? `Criterion satisfied: Documented innovative nature ("${truncate(String(profileValue), 60)}").`
        : `Innovation description missing or incomplete.`,
      profile_value: String(profileValue),
      required_value: 'Documented innovation statement',
    };
  }

  // Fallback safe evaluation
  return {
    criterion_id: criterion.id,
    verdict: 'UNKNOWN',
    evidence: `Unable to automatically verify operator '${criterion.operator}'. Manual officer review recommended.`,
    profile_value: String(profileValue),
    required_value: formatCriterionValue(criterion.value),
  };
}

/**
 * Extracts field value and confidence from a StartupProfile
 */
function extractFieldValue(
  profile: StartupProfile,
  fieldPath: string
): { value: any; confidence: FieldConfidence } {
  // Support founder demographics subfields
  if (fieldPath.startsWith('founder_demographics.') || ['is_woman_founder', 'is_sc_st', 'is_student', 'founder_age'].includes(fieldPath)) {
    const key = fieldPath.replace('founder_demographics.', '') as keyof typeof profile.founder_demographics.value;
    const demo = profile.founder_demographics;
    if (!demo || !demo.value) return { value: null, confidence: 'unknown' };
    return {
      value: demo.value[key],
      confidence: demo.confidence,
    };
  }

  // Direct profile field
  const field = (profile as any)[fieldPath];
  if (field && typeof field === 'object' && 'value' in field && 'confidence' in field) {
    return { value: field.value, confidence: field.confidence };
  }

  return { value: field ?? null, confidence: field !== undefined ? 'user_provided' : 'unknown' };
}

/**
 * Evaluates incorporation date bounds (e.g. <= 2 years old, <= 10 years old)
 */
function evaluateDateCriterion(
  incDateStr: string,
  criterion: Criterion
): CriterionResult {
  const incDate = new Date(incDateStr);
  if (isNaN(incDate.getTime())) {
    return {
      criterion_id: criterion.id,
      verdict: 'UNKNOWN',
      evidence: `Invalid incorporation date format '${incDateStr}'.`,
      profile_value: incDateStr,
      required_value: formatCriterionValue(criterion.value),
    };
  }

  const now = new Date();
  const ageInMs = now.getTime() - incDate.getTime();
  const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
  const roundedAgeYears = Math.round(ageInYears * 10) / 10;

  // Criterion values typically look like: "2_years_ago", "5_years_ago", "7_years_ago", "10_years_ago"
  const cleanVal = criterion.value.replace(/["']/g, '');
  let limitYears = 10;
  const match = cleanVal.match(/(\d+)_years_ago/);
  if (match) {
    limitYears = parseInt(match[1], 10);
  }

  // gte "2_years_ago" means: incorporation_date >= (now - 2 years), i.e., age <= 2 years
  const isSatisfied = criterion.operator === 'gte'
    ? ageInYears <= limitYears
    : ageInYears >= limitYears;

  const verdict: Verdict = isSatisfied ? 'MET' : 'NOT_MET';
  const evidence = isSatisfied
    ? `Incorporated ${roundedAgeYears} year(s) ago (${incDateStr}), compliant with the maximum ${limitYears}-year age requirement.`
    : `Entity is ${roundedAgeYears} year(s) old (${incDateStr}), which exceeds the ${limitYears}-year ceiling under official guidelines.`;

  return {
    criterion_id: criterion.id,
    verdict,
    evidence,
    profile_value: `${roundedAgeYears} years (${incDateStr})`,
    required_value: `≤ ${limitYears} years from incorporation`,
  };
}

/**
 * Evaluates set inclusion (e.g. stage in ["idea", "prototype", "mvp"])
 */
function evaluateSetCriterion(
  profileValue: any,
  criterion: Criterion
): CriterionResult {
  let acceptedValues: string[] = [];
  try {
    acceptedValues = JSON.parse(criterion.value);
  } catch {
    acceptedValues = criterion.value.replace(/[\[\]"']/g, '').split(',').map((s) => s.trim());
  }

  const normalizedProfileVal = String(profileValue).toLowerCase();
  const isIncluded = acceptedValues.some((v) => v.toLowerCase() === normalizedProfileVal);

  const isSatisfied = criterion.operator === 'in' ? isIncluded : !isIncluded;
  const verdict: Verdict = isSatisfied ? 'MET' : 'NOT_MET';

  const evidence = isSatisfied
    ? `Current value '${profileValue}' is accepted (${acceptedValues.join(', ')}).`
    : `Current value '${profileValue}' does not meet the requirement. Must be one of: ${acceptedValues.join(', ')}.`;

  return {
    criterion_id: criterion.id,
    verdict,
    evidence,
    profile_value: String(profileValue),
    required_value: acceptedValues.join(' or '),
  };
}

/**
 * Evaluates equality (e.g. dpiit_recognition eq "yes", state eq "Karnataka")
 */
function evaluateEqualityCriterion(
  profileValue: any,
  criterion: Criterion
): CriterionResult {
  const cleanReqVal = criterion.value.replace(/["']/g, '').toLowerCase();
  const cleanProfileVal = String(profileValue).replace(/["']/g, '').toLowerCase();

  const isMatch = cleanProfileVal === cleanReqVal;
  const isSatisfied = criterion.operator === 'eq' ? isMatch : !isMatch;
  const verdict: Verdict = isSatisfied ? 'MET' : 'NOT_MET';

  let evidence = '';
  if (criterion.field_checked === 'dpiit_recognition') {
    evidence = isSatisfied
      ? 'DPIIT Startup Recognition confirmed on record.'
      : 'Startup does not possess official DPIIT Recognition Certificate. This is a mandatory prerequisite.';
  } else if (criterion.field_checked === 'prior_government_funding') {
    evidence = isSatisfied
      ? 'No conflicting prior monetary grant support exceeding scheme thresholds.'
      : 'Prior monetary support received may disqualify under single-subsidy rules.';
  } else {
    evidence = isSatisfied
      ? `Matches requirement: '${profileValue}' equals '${cleanReqVal}'.`
      : `Value mismatch: profile has '${profileValue}', scheme requires '${cleanReqVal}'.`;
  }

  return {
    criterion_id: criterion.id,
    verdict,
    evidence,
    profile_value: String(profileValue),
    required_value: cleanReqVal,
  };
}

/**
 * Evaluates numeric thresholds (e.g. annual_turnover <= 250000000)
 */
function evaluateNumericCriterion(
  profileValue: any,
  criterion: Criterion
): CriterionResult {
  const profileNum = Number(profileValue);
  const targetNum = Number(criterion.value.replace(/["']/g, ''));

  if (isNaN(profileNum) || isNaN(targetNum)) {
    return {
      criterion_id: criterion.id,
      verdict: 'UNKNOWN',
      evidence: `Numeric comparison failed: could not parse values.`,
      profile_value: String(profileValue),
      required_value: criterion.value,
    };
  }

  let isSatisfied = false;
  if (criterion.operator === 'lte') isSatisfied = profileNum <= targetNum;
  else if (criterion.operator === 'gte') isSatisfied = profileNum >= targetNum;
  else if (criterion.operator === 'lt') isSatisfied = profileNum < targetNum;
  else if (criterion.operator === 'gt') isSatisfied = profileNum > targetNum;

  const verdict: Verdict = isSatisfied ? 'MET' : 'NOT_MET';
  const formattedProfile = formatINR(profileNum);
  const formattedTarget = formatINR(targetNum);

  const evidence = isSatisfied
    ? `Turnover of ${formattedProfile} is within the threshold (${criterion.operator.toUpperCase()} ${formattedTarget}).`
    : `Turnover of ${formattedProfile} breaches the maximum allowed limit of ${formattedTarget}.`;

  return {
    criterion_id: criterion.id,
    verdict,
    evidence,
    profile_value: formattedProfile,
    required_value: `${criterion.operator.toUpperCase()} ${formattedTarget}`,
  };
}

/**
 * Helper helpers for missing requirements UI actions
 */
function getActionLabelForField(field: string): string {
  switch (field) {
    case 'dpiit_recognition':
      return 'Apply for DPIIT Recognition';
    case 'registration_type':
      return 'Register as Pvt Ltd / LLP';
    case 'incorporation_date':
      return 'Explore Early-Stage Exemptions';
    case 'annual_turnover':
      return 'Explore MSME Subsidies';
    default:
      return 'Simulate in What-If Lab';
  }
}

function getActionHrefForField(field: string): string {
  switch (field) {
    case 'dpiit_recognition':
      return '/what-if?toggle=dpiit';
    case 'registration_type':
      return '/what-if?toggle=registration';
    default:
      return '/what-if';
  }
}

function formatCriterionValue(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.join(', ');
    return String(parsed);
  } catch {
    return raw.replace(/["']/g, '');
  }
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
}
