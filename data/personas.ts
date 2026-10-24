/**
 * FundMate AI — Demo Personas
 *
 * 3 rich, realistic Indian startup profiles designed for instant demo evaluation.
 * Each persona covers distinct stages, legal structures, DPIIT statuses,
 * and sectors to thoroughly exercise the eligibility engine.
 */

import type { DemoPersona } from '@/lib/types';

export const demoPersonas: DemoPersona[] = [
  {
    id: 'persona-agritech',
    name: 'KisanSetu Technologies',
    description: 'Karnataka-based AgriTech drone startup (MVP, Pvt Ltd, DPIIT recognized, woman co-founder)',
    profile: {
      id: 'persona-agritech',
      name: 'KisanSetu Technologies Pvt Ltd',
      sector: { value: 'Agriculture & Food Processing', confidence: 'user_provided' },
      sub_sector: { value: 'Precision Farming & Autonomous Drone Spraying', confidence: 'user_provided' },
      state: { value: 'Karnataka', confidence: 'user_provided' },
      district: { value: 'Bengaluru Urban', confidence: 'user_provided' },
      stage: { value: 'mvp', confidence: 'user_provided' },
      registration_type: { value: 'pvt_ltd', confidence: 'user_provided' },
      incorporation_date: {
        // 14 months ago
        value: new Date(Date.now() - 14 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        confidence: 'user_provided',
      },
      dpiit_recognition: { value: 'yes', confidence: 'user_provided' },
      team_size: { value: 5, confidence: 'user_provided' },
      founder_demographics: {
        value: {
          is_woman_founder: 'yes',
          is_sc_st: 'no',
          founder_age: 28,
          is_student: 'no',
        },
        confidence: 'user_provided',
      },
      annual_turnover: { value: 1200000, confidence: 'user_provided' },
      funds_raised_to_date: { value: 500000, confidence: 'user_provided' },
      funding_needed_amount: { value: 4000000, confidence: 'user_provided' },
      funding_purpose: {
        value: 'Field trials with 200 farmer clusters, DGCA type certification, and assembly line setup',
        confidence: 'user_provided',
      },
      ip_status: { value: 'yes', confidence: 'user_provided' },
      prior_government_funding: { value: 'no', confidence: 'user_provided' },
      tech_innovation_nature: {
        value: 'Multispectral AI edge sensor payload with variable rate pesticide dispensing reducing chemical run-off by 40%',
        confidence: 'user_provided',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'persona-medtech',
    name: 'PulseBio Diagnostics',
    description: 'Delhi-based BioTech student venture (Prototype, LLP, not yet DPIIT recognized, student founders)',
    profile: {
      id: 'persona-medtech',
      name: 'PulseBio Diagnostics LLP',
      sector: { value: 'Healthcare & Life Sciences', confidence: 'user_provided' },
      sub_sector: { value: 'Point-of-Care Molecular Diagnostics', confidence: 'user_provided' },
      state: { value: 'Delhi', confidence: 'user_provided' },
      district: { value: 'South Delhi', confidence: 'user_provided' },
      stage: { value: 'prototype', confidence: 'user_provided' },
      registration_type: { value: 'llp', confidence: 'user_provided' },
      incorporation_date: {
        // 6 months ago
        value: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        confidence: 'user_provided',
      },
      dpiit_recognition: { value: 'no', confidence: 'user_provided' },
      team_size: { value: 3, confidence: 'user_provided' },
      founder_demographics: {
        value: {
          is_woman_founder: 'no',
          is_sc_st: 'no',
          founder_age: 24,
          is_student: 'yes',
        },
        confidence: 'user_provided',
      },
      annual_turnover: { value: 0, confidence: 'user_provided' },
      funds_raised_to_date: { value: 0, confidence: 'user_provided' },
      funding_needed_amount: { value: 5000000, confidence: 'user_provided' },
      funding_purpose: {
        value: 'Clinical sample batch validation in partner hospital and CDSCO regulatory pre-submission',
        confidence: 'user_provided',
      },
      ip_status: { value: 'yes', confidence: 'user_provided' },
      prior_government_funding: { value: 'no', confidence: 'user_provided' },
      tech_innovation_nature: {
        value: 'Nanoparticle lateral-flow diagnostic cassette detecting early dengue non-structural protein-1 in capillary blood within 8 minutes',
        confidence: 'user_provided',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'persona-cleantech',
    name: 'Vidyut Bharat Components',
    description: 'Maharashtra CleanTech / EV component maker (Scaling, Pvt Ltd 3.5 yrs, SC/ST founder, revenue ₹85L)',
    profile: {
      id: 'persona-cleantech',
      name: 'Vidyut Bharat Thermal Components Pvt Ltd',
      sector: { value: 'Clean Technology & Renewable Energy', confidence: 'user_provided' },
      sub_sector: { value: 'Electric Vehicle Battery Thermal Subsystems', confidence: 'user_provided' },
      state: { value: 'Maharashtra', confidence: 'user_provided' },
      district: { value: 'Pune', confidence: 'user_provided' },
      stage: { value: 'revenue', confidence: 'user_provided' },
      registration_type: { value: 'pvt_ltd', confidence: 'user_provided' },
      incorporation_date: {
        // 3.5 years ago
        value: new Date(Date.now() - 42 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        confidence: 'user_provided',
      },
      dpiit_recognition: { value: 'yes', confidence: 'user_provided' },
      team_size: { value: 14, confidence: 'user_provided' },
      founder_demographics: {
        value: {
          is_woman_founder: 'no',
          is_sc_st: 'yes',
          founder_age: 39,
          is_student: 'no',
        },
        confidence: 'user_provided',
      },
      annual_turnover: { value: 8500000, confidence: 'user_provided' },
      funds_raised_to_date: { value: 2500000, confidence: 'user_provided' },
      funding_needed_amount: { value: 15000000, confidence: 'user_provided' },
      funding_purpose: {
        value: 'Automated die-casting tooling and working capital for high-volume Tier-1 OEM two-wheeler battery orders',
        confidence: 'user_provided',
      },
      ip_status: { value: 'no', confidence: 'user_provided' },
      prior_government_funding: { value: 'no', confidence: 'user_provided' },
      tech_innovation_nature: {
        value: 'Immersion dielectric fluid distribution plates with integrated microchannels for thermal runaway mitigation',
        confidence: 'user_provided',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];
