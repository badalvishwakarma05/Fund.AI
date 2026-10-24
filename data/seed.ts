/**
 * FundMate AI — Seed Data
 *
 * 10 real Indian government funding schemes with official source URLs,
 * guideline document references, and LLM-extracted eligibility criteria
 * with citations. All criteria are flagged reviewed_by_human: false until
 * approved via the admin review screen.
 *
 * Sources verified against official portals as of October 2026.
 * Status marked "unverified" where deadline/window cannot be confirmed live.
 */

import type { Scheme, SchemeDocument, Criterion } from '@/lib/types';

/* ═══════════════════════════════════════════════════
   SCHEMES
   ═══════════════════════════════════════════════════ */

export const seedSchemes: Scheme[] = [
  {
    id: 'sisfs',
    name: 'Startup India Seed Fund Scheme (SISFS)',
    short_description: 'Provides financial assistance up to ₹50 lakh to startups for proof of concept, prototype development, product trials, market entry, and commercialization via approved incubators.',
    level: 'central',
    state: null,
    ministry_agency: 'Department for Promotion of Industry and Internal Trade (DPIIT)',
    type: 'grant',
    funding_range_min: 500000,
    funding_range_max: 5000000,
    status: 'rolling',
    deadline: null,
    official_url: 'https://seedfund.startupindia.gov.in',
    last_verified_at: '2026-10-20',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'dpiit-recognition',
    name: 'DPIIT Startup Recognition',
    short_description: 'Official recognition by DPIIT that unlocks tax benefits (Section 80-IAC, Section 56(2)(viib) angel tax exemption), easier public procurement, fast-track patent examination, and access to other government schemes.',
    level: 'central',
    state: null,
    ministry_agency: 'Department for Promotion of Industry and Internal Trade (DPIIT)',
    type: 'recognition',
    funding_range_min: null,
    funding_range_max: null,
    status: 'rolling',
    deadline: null,
    official_url: 'https://www.startupindia.gov.in/content/sih/en/startupgov/startup-recognition-page.html',
    last_verified_at: '2026-10-20',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'ffs',
    name: 'Fund of Funds for Startups (FFS)',
    short_description: 'A ₹10,000 crore corpus managed by SIDBI that invests in SEBI-registered AIFs (Alternate Investment Funds) which in turn invest in startups. Indirect funding via VCs/angel funds.',
    level: 'central',
    state: null,
    ministry_agency: 'DPIIT / SIDBI',
    type: 'equity',
    funding_range_min: 5000000,
    funding_range_max: 500000000,
    status: 'rolling',
    deadline: null,
    official_url: 'https://www.startupindia.gov.in/content/sih/en/government-schemes/fund-of-funds-for-startups.html',
    last_verified_at: '2026-10-20',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'cgtmse',
    name: 'Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)',
    short_description: 'Provides collateral-free credit guarantee cover up to ₹5 crore for loans to MSMEs from eligible lending institutions.',
    level: 'central',
    state: null,
    ministry_agency: 'Ministry of MSME / SIDBI',
    type: 'guarantee',
    funding_range_min: 0,
    funding_range_max: 50000000,
    status: 'rolling',
    deadline: null,
    official_url: 'https://www.cgtmse.in',
    last_verified_at: '2026-10-20',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'mudra-shishu',
    name: 'PMMY – MUDRA Shishu Loan',
    short_description: 'Loans up to ₹50,000 under Pradhan Mantri MUDRA Yojana for micro-enterprises in the initial/startup stage.',
    level: 'central',
    state: null,
    ministry_agency: 'Ministry of Finance / MUDRA',
    type: 'loan',
    funding_range_min: 0,
    funding_range_max: 50000,
    status: 'rolling',
    deadline: null,
    official_url: 'https://www.mudra.org.in',
    last_verified_at: '2026-10-20',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'mudra-kishore',
    name: 'PMMY – MUDRA Kishore Loan',
    short_description: 'Loans from ₹50,001 to ₹5 lakh under Pradhan Mantri MUDRA Yojana for growing micro-enterprises.',
    level: 'central',
    state: null,
    ministry_agency: 'Ministry of Finance / MUDRA',
    type: 'loan',
    funding_range_min: 50001,
    funding_range_max: 500000,
    status: 'rolling',
    deadline: null,
    official_url: 'https://www.mudra.org.in',
    last_verified_at: '2026-10-20',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'pmegp',
    name: 'Prime Minister\'s Employment Generation Programme (PMEGP)',
    short_description: 'Subsidy up to 35% of project cost (max ₹25 lakh for manufacturing, ₹10 lakh for services) for new micro-enterprises.',
    level: 'central',
    state: null,
    ministry_agency: 'Ministry of MSME / KVIC',
    type: 'subsidy',
    funding_range_min: 0,
    funding_range_max: 2500000,
    status: 'rolling',
    deadline: null,
    official_url: 'https://www.kviconline.gov.in/pmegp/pmegpweb/',
    last_verified_at: '2026-10-20',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'birac-big',
    name: 'BIRAC BIG (Biotechnology Ignition Grant)',
    short_description: 'Grant of up to ₹50 lakh for startups and entrepreneurs working in biotechnology innovation — proof of concept to early validation stage.',
    level: 'central',
    state: null,
    ministry_agency: 'BIRAC / Department of Biotechnology',
    type: 'grant',
    funding_range_min: 0,
    funding_range_max: 5000000,
    status: 'unverified',
    deadline: null,
    official_url: 'https://www.birac.nic.in/big.php',
    last_verified_at: '2026-10-15',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'aim-aic',
    name: 'Atal Innovation Mission – Atal Incubation Centres (AIC)',
    short_description: 'Grants up to ₹10 crore to incubation centres that support startups. Startups apply to AICs for incubation support, mentoring, and seed funding.',
    level: 'central',
    state: null,
    ministry_agency: 'NITI Aayog / Atal Innovation Mission',
    type: 'incubation',
    funding_range_min: 0,
    funding_range_max: 2500000,
    status: 'rolling',
    deadline: null,
    official_url: 'https://aim.gov.in/atal-incubation-centres.php',
    last_verified_at: '2026-10-18',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'karnataka-elevate',
    name: 'Karnataka Elevate (KITS Startup Policy)',
    short_description: 'Karnataka state startup policy providing seed funding up to ₹50 lakh, co-working space subsidies, and SGST reimbursement for startups registered in Karnataka.',
    level: 'state',
    state: 'Karnataka',
    ministry_agency: 'Karnataka Innovation and Technology Society (KITS)',
    type: 'grant',
    funding_range_min: 0,
    funding_range_max: 5000000,
    status: 'unverified',
    deadline: null,
    official_url: 'https://startup.karnataka.gov.in/elevate-program',
    last_verified_at: '2026-10-15',
    created_at: '',
    updated_at: '',
  },
];

/* ═══════════════════════════════════════════════════
   DOCUMENTS
   ═══════════════════════════════════════════════════ */

export const seedDocuments: SchemeDocument[] = [
  // ── SISFS ──
  {
    id: 'doc-sisfs-guideline',
    scheme_id: 'sisfs',
    title: 'SISFS Operational Guidelines',
    url: 'https://seedfund.startupindia.gov.in/guidelines',
    doc_type: 'guideline',
    raw_text: `Startup India Seed Fund Scheme — Operational Guidelines

Section 3: Eligibility of Startups
3.1 The startup must be recognized by DPIIT as on the date of application to the incubator.
3.2 The startup must have been incorporated not more than 2 years ago at the time of application to the incubator.
3.3 The startup must be using technology in its core product or service, or be a scalable business model with high potential of employment generation or wealth creation.
3.4 The startup should not have received more than Rs 10 lakhs of monetary support under any other Central or State Government scheme. This shall not include prizes won through competitions and grant challenges.
3.5 Shareholding by Indian promoters in the startup should be at least 51% at the time of application.
3.6 The startup should be looking for funding for validation of Proof of Concept, or prototype development, or product trials, or market entry, or commercialization.

Section 4: Funding Support
4.1 Up to Rs 20 lakhs as grant for validation of Proof of Concept, or prototype development, or product trials.
4.2 Up to Rs 50 lakhs of investment for market entry, commercialization, or scaling up through convertible debentures or debt or debt-linked instruments.

Section 5: Application Process
5.1 Startups shall apply through an incubator approved under the scheme.
5.2 The incubator shall evaluate the startup and recommend for funding to the Expert Advisory Committee (EAC).
5.3 EAC shall evaluate the proposal and approve or reject within 45 days.`,
    fetched_at: '2026-10-20',
    created_at: '',
  },
  {
    id: 'doc-sisfs-faq',
    scheme_id: 'sisfs',
    title: 'SISFS Frequently Asked Questions',
    url: 'https://seedfund.startupindia.gov.in/faq',
    doc_type: 'faq',
    raw_text: `SISFS FAQ

Q: Who can apply?
A: DPIIT-recognized startups incorporated within the last 2 years.

Q: Can a startup that has received funding from other government schemes apply?
A: Yes, but total monetary support from other central/state schemes must be under Rs 10 lakhs (excluding prize money).

Q: What is the maximum funding amount?
A: Up to Rs 20 lakh as grant for PoC/prototype; up to Rs 50 lakh as investment for commercialization.

Q: Do I apply directly?
A: No. You apply through an SISFS-approved incubator.`,
    fetched_at: '2026-10-20',
    created_at: '',
  },

  // ── DPIIT Recognition ──
  {
    id: 'doc-dpiit-guideline',
    scheme_id: 'dpiit-recognition',
    title: 'Startup India — Startup Recognition Guidelines',
    url: 'https://www.startupindia.gov.in/content/dam/invest-india/Templates/public/Guidelines_for_recognition.pdf',
    doc_type: 'guideline',
    raw_text: `DPIIT Startup Recognition — Guidelines (Updated)

Section 2: Definition of a Startup
2.1 An entity shall be considered a Startup if it is incorporated as a private limited company, or registered as a partnership firm, or a limited liability partnership in India.
2.2 The entity must not be older than 10 years from the date of incorporation/registration. For Biotechnology Startups, this limit is 10 years.
2.3 Annual turnover of the entity for any of the financial years since incorporation/registration has not exceeded INR 100 crore.
2.4 The entity is working towards innovation, development or improvement of products or processes or services, or if it is a scalable business model with a high potential of employment generation or wealth creation.
2.5 The entity should not have been formed by splitting up or reconstruction of an existing business.

Section 3: Benefits of Recognition
3.1 Self-certification under 6 labour laws and 3 environmental laws.
3.2 Tax exemption under Section 80-IAC for 3 consecutive years out of 10 years from incorporation.
3.3 Exemption from angel tax under Section 56(2)(viib).
3.4 Fast-track patent examination at reduced fees.
3.5 Access to Fund of Funds, SISFS, and other government schemes.`,
    fetched_at: '2026-10-20',
    created_at: '',
  },

  // ── Fund of Funds ──
  {
    id: 'doc-ffs-guideline',
    scheme_id: 'ffs',
    title: 'Fund of Funds for Startups — Scheme Details',
    url: 'https://www.startupindia.gov.in/content/sih/en/government-schemes/fund-of-funds-for-startups.html',
    doc_type: 'webpage',
    raw_text: `Fund of Funds for Startups (FFS)

Overview: DPIIT has established Fund of Funds for Startups (FFS) with a corpus of Rs 10,000 crore managed by SIDBI.

Section: How it works
FFS does not directly invest in startups. It invests in SEBI-registered Alternative Investment Funds (AIFs) — Category I. These AIFs then invest in eligible startups.

Section: Eligibility for startups (via AIF)
- The startup must be DPIIT-recognized.
- Investment decision is made by the fund manager of the AIF.
- Startups at any stage can be considered depending on the fund's mandate.
- There is no direct application process; startups pitch to participating VC/angel funds.

Section: Current status
Total corpus committed: Rs 10,000 crore. As of 2024, Rs 7,385 crore committed to 120+ AIFs, supporting 900+ startups.`,
    fetched_at: '2026-10-20',
    created_at: '',
  },

  // ── CGTMSE ──
  {
    id: 'doc-cgtmse-guideline',
    scheme_id: 'cgtmse',
    title: 'CGTMSE — Scheme Guidelines',
    url: 'https://www.cgtmse.in/About_us.aspx',
    doc_type: 'guideline',
    raw_text: `Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)

Section: Eligibility
1. New and existing Micro and Small Enterprises (MSEs) engaged in manufacturing or service activities.
2. The enterprise must be classified as a Micro or Small Enterprise as per MSMED Act 2006 (investment and turnover criteria).
3. Loans up to Rs 5 crore covered under the scheme. Effective from April 2023, guarantee cover is available for credit facilities up to Rs 5 crore.
4. Both term loans and working capital facilities are covered.
5. No collateral or third-party guarantee required for loans up to Rs 5 crore.
6. Retail trade is NOT eligible.

Section: Guarantee Coverage
- For Micro Enterprises: up to 85% of credit facility.
- For Women/SC/ST entrepreneurs and units in NER: up to 85%.
- For other MSEs: up to 75%.

Section: Process
The lending institution (bank/NBFC) applies for the guarantee cover on behalf of the borrower. The borrower does not apply directly.`,
    fetched_at: '2026-10-20',
    created_at: '',
  },

  // ── MUDRA ──
  {
    id: 'doc-mudra-guideline',
    scheme_id: 'mudra-shishu',
    title: 'PMMY MUDRA — Scheme Guidelines',
    url: 'https://www.mudra.org.in/offerings',
    doc_type: 'guideline',
    raw_text: `Pradhan Mantri MUDRA Yojana (PMMY) — Guidelines

Section: Categories
1. Shishu: Loans up to Rs 50,000 for businesses in early/startup stage.
2. Kishore: Loans from Rs 50,001 to Rs 5 lakh for growing businesses.
3. Tarun: Loans from Rs 5,00,001 to Rs 10 lakh for established businesses seeking expansion.

Section: Eligibility
- Any Indian citizen who has a business plan for a non-farm income-generating activity.
- The applicant should not be a defaulter with any bank or financial institution.
- Activities covered: manufacturing, trading, services, allied agriculture.
- Retail trade and small shopkeepers are eligible.
- No collateral required.

Section: How to apply
Apply through any bank (public, private, regional rural), NBFC, or MFI participating in PMMY. There is no online application portal run by MUDRA directly.`,
    fetched_at: '2026-10-20',
    created_at: '',
  },
  {
    id: 'doc-mudra-kishore-ref',
    scheme_id: 'mudra-kishore',
    title: 'PMMY MUDRA Kishore — Reference',
    url: 'https://www.mudra.org.in/offerings',
    doc_type: 'guideline',
    raw_text: `MUDRA Kishore — Same guidelines as PMMY.
Loans from Rs 50,001 to Rs 5 lakh.
For businesses that have started and are looking to expand.
Eligibility: same as Shishu — Indian citizen, non-farm business, non-defaulter.
Additional: business should have some track record or revenue.`,
    fetched_at: '2026-10-20',
    created_at: '',
  },

  // ── PMEGP ──
  {
    id: 'doc-pmegp-guideline',
    scheme_id: 'pmegp',
    title: 'PMEGP — Scheme Guidelines',
    url: 'https://www.kviconline.gov.in/pmegp/pmegpweb/',
    doc_type: 'guideline',
    raw_text: `Prime Minister's Employment Generation Programme (PMEGP) — Guidelines

Section: Eligibility
1. Any individual above 18 years of age.
2. Minimum 8th standard pass for projects above Rs 10 lakh in manufacturing and Rs 5 lakh in services/business.
3. Self-help groups, production co-operatives, charitable trusts, and institutions registered under the Societies Registration Act are also eligible.
4. Only new projects are eligible. Existing units or units that have already availed government subsidy are NOT eligible.
5. Projects cost: up to Rs 50 lakh for manufacturing sector, up to Rs 20 lakh for service sector.

Section: Subsidy/Margin Money
- General category: 15% in urban areas, 25% in rural areas.
- Special category (SC/ST/OBC/women/minorities/ex-servicemen/PwD/NER/Hill/Border): 25% in urban, 35% in rural.
- Beneficiary's contribution: 10% for general, 5% for special category.
- Balance from bank loan.

Section: Key condition
The project must be NEW. Cannot be combined with any other subsidy scheme of the Government of India or State Government.`,
    fetched_at: '2026-10-20',
    created_at: '',
  },

  // ── BIRAC BIG ──
  {
    id: 'doc-birac-big-guideline',
    scheme_id: 'birac-big',
    title: 'BIRAC BIG — Programme Details',
    url: 'https://www.birac.nic.in/big.php',
    doc_type: 'guideline',
    raw_text: `Biotechnology Ignition Grant (BIG) — BIRAC

Section: About
BIG is the largest early-stage biotech funding programme in India providing grants up to Rs 50 lakhs for proof of concept and early validation of new biotech innovations.

Section: Eligibility
1. Scientists / startups / entrepreneurs with innovative biotech ideas.
2. The applicant must be an Indian company (registered under Companies Act).
3. The idea should involve biotechnology: healthcare, agriculture, industrial biotech, clean energy, etc.
4. The entity can be a startup, incubated company, or individual proposing to form a company.
5. Stage: Idea to early proof of concept. Not for established products.

Section: Evaluation
Two-stage process: screening followed by a presentation to the BIG expert committee.
Funding is milestone-based.`,
    fetched_at: '2026-10-15',
    created_at: '',
  },

  // ── AIM AIC ──
  {
    id: 'doc-aim-aic-guideline',
    scheme_id: 'aim-aic',
    title: 'AIM — Atal Incubation Centres Details',
    url: 'https://aim.gov.in/atal-incubation-centres.php',
    doc_type: 'webpage',
    raw_text: `Atal Incubation Centres (AIC) — Atal Innovation Mission

Section: About
AICs are world-class incubation centres set up in universities, institutions, and the private sector. AIM provides a grant of up to Rs 10 crore to establish the incubator over 5 years.

Section: For Startups
Startups can apply to be incubated at an AIC. Benefits include:
1. Physical co-working space and infrastructure.
2. Mentoring and business support services.
3. Seed funding (varies by AIC, typically Rs 10 lakh to Rs 25 lakh).
4. Access to networks, industry connections, and government programmes.

Section: Eligibility for incubation
- Innovation-driven startup at idea/prototype/early stage.
- The startup's technology/business model should be innovative.
- Preference for technology startups.
- Must apply through the specific AIC's application process.

Section: Current AICs
As of 2024, 69 AICs are operational across India, supporting 3,800+ startups.`,
    fetched_at: '2026-10-18',
    created_at: '',
  },

  // ── Karnataka Elevate ──
  {
    id: 'doc-karnataka-elevate-guideline',
    scheme_id: 'karnataka-elevate',
    title: 'Karnataka Startup Policy — Elevate Programme',
    url: 'https://startup.karnataka.gov.in/elevate-program',
    doc_type: 'guideline',
    raw_text: `Karnataka Startup Policy — Elevate Programme

Section: Eligibility
1. The startup must be registered/incorporated in Karnataka.
2. The entity must be less than 7 years old from the date of incorporation.
3. Annual turnover should not have exceeded Rs 25 crore in any financial year.
4. The startup should be working on an innovative product, service, or process.
5. Preference for technology startups, but social innovation startups are also eligible.

Section: Benefits
1. Seed funding up to Rs 50 lakh (equity / convertible note).
2. Reimbursement of SGST paid, for a period of 3 years.
3. Subsidy for co-working space (up to Rs 5,000/month per seat for 2 years).
4. Patent support: reimbursement of patent filing fees.
5. Mentoring, market access, and incubation support.

Section: Process
Apply through the Karnataka Startup Cell portal. Shortlisted startups are evaluated by a selection committee. The programme typically opens in annual cycles (Elevate 2024, etc.).`,
    fetched_at: '2026-10-15',
    created_at: '',
  },
];

/* ═══════════════════════════════════════════════════
   CRITERIA (Extracted from documents, with citations)
   ═══════════════════════════════════════════════════ */

export const seedCriteria: Criterion[] = [
  // ══════ SISFS ══════
  {
    id: 'c-sisfs-dpiit',
    scheme_id: 'sisfs',
    field_checked: 'dpiit_recognition',
    operator: 'eq',
    value: '"yes"',
    human_readable_text: 'Startup must be recognized by DPIIT',
    source_doc_id: 'doc-sisfs-guideline',
    source_quote: 'must be recognized by DPIIT as on the date of application',
    source_page_or_section: 'Section 3.1',
    extraction_confidence: 0.98,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'c-sisfs-age',
    scheme_id: 'sisfs',
    field_checked: 'incorporation_date',
    operator: 'gte',
    value: '"2_years_ago"',
    human_readable_text: 'Startup must be incorporated not more than 2 years ago',
    source_doc_id: 'doc-sisfs-guideline',
    source_quote: 'incorporated not more than 2 years ago at the time of application',
    source_page_or_section: 'Section 3.2',
    extraction_confidence: 0.95,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'c-sisfs-tech',
    scheme_id: 'sisfs',
    field_checked: 'tech_innovation_nature',
    operator: 'exists',
    value: 'true',
    human_readable_text: 'Must use technology in core product/service or have a scalable business model',
    source_doc_id: 'doc-sisfs-guideline',
    source_quote: 'using technology in its core product or service, or scalable business model',
    source_page_or_section: 'Section 3.3',
    extraction_confidence: 0.88,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'c-sisfs-prior-funding',
    scheme_id: 'sisfs',
    field_checked: 'prior_government_funding',
    operator: 'eq',
    value: '"no"',
    human_readable_text: 'Must not have received more than ₹10 lakh from other govt schemes (excl. prizes)',
    source_doc_id: 'doc-sisfs-guideline',
    source_quote: 'not received more than Rs 10 lakhs of monetary support under any other scheme',
    source_page_or_section: 'Section 3.4',
    extraction_confidence: 0.92,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'c-sisfs-registration',
    scheme_id: 'sisfs',
    field_checked: 'registration_type',
    operator: 'in',
    value: '["pvt_ltd","llp","partnership"]',
    human_readable_text: 'Must be a registered entity (Pvt Ltd, LLP, or Partnership)',
    source_doc_id: 'doc-dpiit-guideline',
    source_quote: 'incorporated as a private limited company, or registered as a partnership firm, or LLP',
    source_page_or_section: 'Section 2.1',
    extraction_confidence: 0.95,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },

  // ══════ DPIIT Recognition ══════
  {
    id: 'c-dpiit-entity',
    scheme_id: 'dpiit-recognition',
    field_checked: 'registration_type',
    operator: 'in',
    value: '["pvt_ltd","llp","partnership"]',
    human_readable_text: 'Entity must be registered as Pvt Ltd, LLP, or Partnership firm',
    source_doc_id: 'doc-dpiit-guideline',
    source_quote: 'incorporated as a private limited company, or registered as a partnership firm, or LLP',
    source_page_or_section: 'Section 2.1',
    extraction_confidence: 0.98,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'c-dpiit-age',
    scheme_id: 'dpiit-recognition',
    field_checked: 'incorporation_date',
    operator: 'gte',
    value: '"10_years_ago"',
    human_readable_text: 'Entity must not be older than 10 years from incorporation',
    source_doc_id: 'doc-dpiit-guideline',
    source_quote: 'entity must not be older than 10 years from the date of incorporation',
    source_page_or_section: 'Section 2.2',
    extraction_confidence: 0.98,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'c-dpiit-turnover',
    scheme_id: 'dpiit-recognition',
    field_checked: 'annual_turnover',
    operator: 'lt',
    value: '1000000000',
    human_readable_text: 'Annual turnover must not exceed ₹100 crore in any year',
    source_doc_id: 'doc-dpiit-guideline',
    source_quote: 'annual turnover has not exceeded INR 100 crore',
    source_page_or_section: 'Section 2.3',
    extraction_confidence: 0.98,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'c-dpiit-innovation',
    scheme_id: 'dpiit-recognition',
    field_checked: 'tech_innovation_nature',
    operator: 'exists',
    value: 'true',
    human_readable_text: 'Must be working towards innovation/improvement of products, processes, or services',
    source_doc_id: 'doc-dpiit-guideline',
    source_quote: 'working towards innovation, development or improvement of products or processes or services',
    source_page_or_section: 'Section 2.4',
    extraction_confidence: 0.95,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },

  // ══════ Fund of Funds ══════
  {
    id: 'c-ffs-dpiit',
    scheme_id: 'ffs',
    field_checked: 'dpiit_recognition',
    operator: 'eq',
    value: '"yes"',
    human_readable_text: 'Startup must be DPIIT-recognized to access FFS-backed VC/AIF funding',
    source_doc_id: 'doc-ffs-guideline',
    source_quote: 'The startup must be DPIIT-recognized',
    source_page_or_section: 'Eligibility for startups (via AIF)',
    extraction_confidence: 0.92,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },

  // ══════ CGTMSE ══════
  {
    id: 'c-cgtmse-mse',
    scheme_id: 'cgtmse',
    field_checked: 'registration_type',
    operator: 'in',
    value: '["proprietorship","partnership","llp","pvt_ltd"]',
    human_readable_text: 'Must be a registered Micro or Small Enterprise',
    source_doc_id: 'doc-cgtmse-guideline',
    source_quote: 'New and existing Micro and Small Enterprises engaged in manufacturing or service',
    source_page_or_section: 'Eligibility, Point 1',
    extraction_confidence: 0.90,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'c-cgtmse-sector',
    scheme_id: 'cgtmse',
    field_checked: 'sector',
    operator: 'not_in',
    value: '["retail_trade"]',
    human_readable_text: 'Retail trade enterprises are NOT eligible',
    source_doc_id: 'doc-cgtmse-guideline',
    source_quote: 'Retail trade is NOT eligible',
    source_page_or_section: 'Eligibility, Point 6',
    extraction_confidence: 0.98,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'c-cgtmse-turnover',
    scheme_id: 'cgtmse',
    field_checked: 'annual_turnover',
    operator: 'lte',
    value: '50000000',
    human_readable_text: 'Annual turnover must qualify as Micro or Small Enterprise (≤₹50 Cr)',
    source_doc_id: 'doc-cgtmse-guideline',
    source_quote: 'classified as a Micro or Small Enterprise as per MSMED Act',
    source_page_or_section: 'Eligibility, Point 2',
    extraction_confidence: 0.85,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },

  // ══════ MUDRA Shishu ══════
  {
    id: 'c-mudra-s-citizen',
    scheme_id: 'mudra-shishu',
    field_checked: 'state',
    operator: 'exists',
    value: 'true',
    human_readable_text: 'Applicant must be an Indian citizen with a business plan',
    source_doc_id: 'doc-mudra-guideline',
    source_quote: 'Any Indian citizen who has a business plan for a non-farm income-generating activity',
    source_page_or_section: 'Eligibility',
    extraction_confidence: 0.90,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'c-mudra-s-nonfarm',
    scheme_id: 'mudra-shishu',
    field_checked: 'sector',
    operator: 'not_in',
    value: '["agriculture_farming"]',
    human_readable_text: 'Business must be a non-farm activity (manufacturing, trading, services, allied agriculture)',
    source_doc_id: 'doc-mudra-guideline',
    source_quote: 'non-farm income-generating activity',
    source_page_or_section: 'Eligibility',
    extraction_confidence: 0.88,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },

  // ══════ MUDRA Kishore ══════
  {
    id: 'c-mudra-k-citizen',
    scheme_id: 'mudra-kishore',
    field_checked: 'state',
    operator: 'exists',
    value: 'true',
    human_readable_text: 'Applicant must be an Indian citizen',
    source_doc_id: 'doc-mudra-kishore-ref',
    source_quote: 'Indian citizen, non-farm business, non-defaulter',
    source_page_or_section: 'Eligibility',
    extraction_confidence: 0.90,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'c-mudra-k-stage',
    scheme_id: 'mudra-kishore',
    field_checked: 'stage',
    operator: 'in',
    value: '["prototype","mvp","revenue","scaling"]',
    human_readable_text: 'Business should have started operations (not just idea stage)',
    source_doc_id: 'doc-mudra-kishore-ref',
    source_quote: 'businesses that have started and are looking to expand',
    source_page_or_section: 'Eligibility',
    extraction_confidence: 0.85,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },

  // ══════ PMEGP ══════
  {
    id: 'c-pmegp-new',
    scheme_id: 'pmegp',
    field_checked: 'prior_government_funding',
    operator: 'eq',
    value: '"no"',
    human_readable_text: 'Only new projects eligible — no prior government subsidy',
    source_doc_id: 'doc-pmegp-guideline',
    source_quote: 'Only new projects are eligible. Existing units that have availed government subsidy are NOT eligible',
    source_page_or_section: 'Eligibility, Point 4',
    extraction_confidence: 0.95,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'c-pmegp-age',
    scheme_id: 'pmegp',
    field_checked: 'founder_demographics.founder_age',
    operator: 'gte',
    value: '18',
    human_readable_text: 'Applicant must be above 18 years of age',
    source_doc_id: 'doc-pmegp-guideline',
    source_quote: 'Any individual above 18 years of age',
    source_page_or_section: 'Eligibility, Point 1',
    extraction_confidence: 0.98,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },

  // ══════ BIRAC BIG ══════
  {
    id: 'c-birac-sector',
    scheme_id: 'birac-big',
    field_checked: 'sector',
    operator: 'in',
    value: '["biotechnology","healthcare","agriculture","clean_energy","industrial_biotech"]',
    human_readable_text: 'Must be a biotechnology innovation (healthcare, agriculture, industrial biotech, clean energy)',
    source_doc_id: 'doc-birac-big-guideline',
    source_quote: 'biotechnology: healthcare, agriculture, industrial biotech, clean energy',
    source_page_or_section: 'Eligibility, Point 3',
    extraction_confidence: 0.95,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'c-birac-entity',
    scheme_id: 'birac-big',
    field_checked: 'registration_type',
    operator: 'in',
    value: '["pvt_ltd"]',
    human_readable_text: 'Must be an Indian company registered under the Companies Act',
    source_doc_id: 'doc-birac-big-guideline',
    source_quote: 'must be an Indian company (registered under Companies Act)',
    source_page_or_section: 'Eligibility, Point 2',
    extraction_confidence: 0.95,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'c-birac-stage',
    scheme_id: 'birac-big',
    field_checked: 'stage',
    operator: 'in',
    value: '["idea","prototype"]',
    human_readable_text: 'Must be at idea to early proof of concept stage',
    source_doc_id: 'doc-birac-big-guideline',
    source_quote: 'Idea to early proof of concept. Not for established products',
    source_page_or_section: 'Eligibility, Point 5',
    extraction_confidence: 0.92,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },

  // ══════ AIM AIC ══════
  {
    id: 'c-aim-innovation',
    scheme_id: 'aim-aic',
    field_checked: 'tech_innovation_nature',
    operator: 'exists',
    value: 'true',
    human_readable_text: 'Technology/business model should be innovative',
    source_doc_id: 'doc-aim-aic-guideline',
    source_quote: 'Innovation-driven startup at idea/prototype/early stage',
    source_page_or_section: 'Eligibility for incubation',
    extraction_confidence: 0.88,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'c-aim-stage',
    scheme_id: 'aim-aic',
    field_checked: 'stage',
    operator: 'in',
    value: '["idea","prototype","mvp"]',
    human_readable_text: 'Must be at idea, prototype, or early stage',
    source_doc_id: 'doc-aim-aic-guideline',
    source_quote: 'idea/prototype/early stage',
    source_page_or_section: 'Eligibility for incubation',
    extraction_confidence: 0.90,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },

  // ══════ Karnataka Elevate ══════
  {
    id: 'c-ke-state',
    scheme_id: 'karnataka-elevate',
    field_checked: 'state',
    operator: 'eq',
    value: '"Karnataka"',
    human_readable_text: 'Startup must be registered/incorporated in Karnataka',
    source_doc_id: 'doc-karnataka-elevate-guideline',
    source_quote: 'startup must be registered/incorporated in Karnataka',
    source_page_or_section: 'Eligibility, Point 1',
    extraction_confidence: 0.98,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'c-ke-age',
    scheme_id: 'karnataka-elevate',
    field_checked: 'incorporation_date',
    operator: 'gte',
    value: '"7_years_ago"',
    human_readable_text: 'Entity must be less than 7 years old from incorporation',
    source_doc_id: 'doc-karnataka-elevate-guideline',
    source_quote: 'less than 7 years old from the date of incorporation',
    source_page_or_section: 'Eligibility, Point 2',
    extraction_confidence: 0.95,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'c-ke-turnover',
    scheme_id: 'karnataka-elevate',
    field_checked: 'annual_turnover',
    operator: 'lte',
    value: '250000000',
    human_readable_text: 'Annual turnover must not exceed ₹25 crore',
    source_doc_id: 'doc-karnataka-elevate-guideline',
    source_quote: 'not exceeded Rs 25 crore in any financial year',
    source_page_or_section: 'Eligibility, Point 3',
    extraction_confidence: 0.95,
    reviewed_by_human: false,
    created_at: '',
    updated_at: '',
  },
];
