/**
 * FundMate AI — Core Data Types
 *
 * Every type mirrors the SQL schema. Field-level confidence tracking
 * lets the UI and rules engine distinguish user-provided data from
 * inferred or unknown values.
 */

/* ═══════════════════════════════════════════════════
   Enums & Primitives
   ═══════════════════════════════════════════════════ */

export type Stage = 'idea' | 'prototype' | 'mvp' | 'revenue' | 'scaling';
export type RegistrationType = 'none' | 'proprietorship' | 'partnership' | 'llp' | 'pvt_ltd' | 'public_ltd';
export type TriState = 'yes' | 'no' | 'unknown';
export type FieldConfidence = 'user_provided' | 'inferred' | 'unknown';
export type SchemeLevel = 'central' | 'state';
export type SchemeType = 'grant' | 'loan' | 'equity' | 'subsidy' | 'incubation' | 'guarantee' | 'recognition' | 'tax_benefit';
export type SchemeStatus = 'open' | 'closed' | 'rolling' | 'unverified';
export type DocType = 'guideline' | 'faq' | 'notification' | 'circular' | 'webpage';
export type CriterionOperator = 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'in' | 'not_in' | 'contains' | 'exists' | 'boolean';
export type Verdict = 'MET' | 'NOT_MET' | 'UNKNOWN';
export type OverallVerdict = 'likely_eligible' | 'partially_eligible' | 'not_eligible' | 'need_more_info';

/* ═══════════════════════════════════════════════════
   Startup Profile
   ═══════════════════════════════════════════════════ */

export interface FieldWithConfidence<T> {
  value: T;
  confidence: FieldConfidence;
}

export interface FounderDemographics {
  is_woman_founder: TriState;
  is_sc_st: TriState;
  founder_age: number | null;
  is_student: TriState;
}

export interface StartupProfile {
  id: string;
  name: string;
  sector: FieldWithConfidence<string>;
  sub_sector: FieldWithConfidence<string | null>;
  state: FieldWithConfidence<string>;
  district: FieldWithConfidence<string | null>;
  stage: FieldWithConfidence<Stage>;
  registration_type: FieldWithConfidence<RegistrationType>;
  incorporation_date: FieldWithConfidence<string | null>; // ISO date
  dpiit_recognition: FieldWithConfidence<TriState>;
  team_size: FieldWithConfidence<number | null>;
  founder_demographics: FieldWithConfidence<FounderDemographics>;
  annual_turnover: FieldWithConfidence<number | null>; // INR
  funds_raised_to_date: FieldWithConfidence<number | null>;
  funding_needed_amount: FieldWithConfidence<number | null>;
  funding_purpose: FieldWithConfidence<string | null>;
  ip_status: FieldWithConfidence<TriState>; // has patents/IP
  prior_government_funding: FieldWithConfidence<TriState>;
  tech_innovation_nature: FieldWithConfidence<string | null>;
  created_at: string;
  updated_at: string;
}

/* ═══════════════════════════════════════════════════
   Scheme & Documents
   ═══════════════════════════════════════════════════ */

export interface Scheme {
  id: string;
  name: string;
  short_description: string;
  level: SchemeLevel;
  state: string | null; // null for central
  ministry_agency: string;
  type: SchemeType;
  funding_range_min: number | null;
  funding_range_max: number | null;
  status: SchemeStatus;
  deadline: string | null; // ISO date
  official_url: string;
  last_verified_at: string; // ISO date
  created_at: string;
  updated_at: string;
}

export interface SchemeDocument {
  id: string;
  scheme_id: string;
  title: string;
  url: string;
  doc_type: DocType;
  raw_text: string;
  fetched_at: string;
  created_at: string;
}

/* ═══════════════════════════════════════════════════
   Criteria (LLM-extracted, human-reviewable)
   ═══════════════════════════════════════════════════ */

export interface Criterion {
  id: string;
  scheme_id: string;
  field_checked: string; // maps to StartupProfile field path
  operator: CriterionOperator;
  value: string; // JSON-serialized comparison value
  human_readable_text: string;
  source_doc_id: string;
  source_quote: string; // ≤25 words
  source_page_or_section: string;
  extraction_confidence: number; // 0.0 – 1.0
  reviewed_by_human: boolean;
  created_at: string;
  updated_at: string;
}

/* ═══════════════════════════════════════════════════
   Eligibility Results
   ═══════════════════════════════════════════════════ */

export interface CriterionResult {
  criterion_id: string;
  verdict: Verdict;
  evidence: string; // human-readable explanation
  profile_value: string | null; // what the profile had
  required_value: string; // what the criterion requires
}

export interface EligibilityResult {
  id: string;
  profile_id: string;
  scheme_id: string;
  criterion_results: CriterionResult[];
  overall_verdict: OverallVerdict;
  met_count: number;
  not_met_count: number;
  unknown_count: number;
  total_criteria: number;
  created_at: string;
}

/* ═══════════════════════════════════════════════════
   Roadmap
   ═══════════════════════════════════════════════════ */

export interface RoadmapStep {
  id: string;
  profile_id: string;
  order: number;
  title: string;
  description: string;
  why_it_matters: string;
  estimated_effort: string; // e.g., "2-3 days", "1 week"
  dependency_ids: string[];
  linked_criterion_id: string | null;
  linked_scheme_ids: string[];
  linked_document_url: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

/* ═══════════════════════════════════════════════════
   Readiness Score
   ═══════════════════════════════════════════════════ */

export interface ReadinessScore {
  profile_id: string;
  completed: number;
  outstanding: number;
  total: number;
  percentage: number; // 0–100; documented as checklist-completion only
  breakdown: {
    category: string;
    completed: number;
    total: number;
  }[];
  computed_at: string;
}

/* ═══════════════════════════════════════════════════
   Demo Personas
   ═══════════════════════════════════════════════════ */

export interface DemoPersona {
  id: string;
  name: string;
  description: string;
  profile: StartupProfile;
}
