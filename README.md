# FundMate AI 🇮🇳
> **From Startup Idea to Funding Opportunity**  
> An AI agent that profiles an Indian startup, discovers official central and state government funding schemes, deterministically checks eligibility against verified guideline text, detects missing requirements, simulates what-if scenarios, and produces a prioritized application roadmap.

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![SQLite WAL](https://img.shields.io/badge/SQLite-WAL%20Mode-003B57?logo=sqlite)](https://sqlite.org/)
[![Zero-Hallucination Guard](https://img.shields.io/badge/Compliance-Zero--Hallucination%20Guard-success)](#zero-hallucination-design-principles)

---

## 🌟 The Problem & Solution

Indian founders miss out on over **₹10,000 Crore+** in non-dilutive government grants, subsidized loans, and credit guarantees every year because:
1. **Scattered Portals**: Guidelines are distributed across DPIIT, MSME, SIDBI, BIRAC, and 28+ different state startup cells.
2. **Dense Regulatory Language**: Guidelines are buried in 40-page gazettes with intricate age limits, turnover caps, and incorporation prerequisites.
3. **Misleading LLM Hallucinations**: General-purpose AI chatbots regularly hallucinate eligibility clauses, giving founders false confidence or false disqualifications.

**FundMate AI** solves this with a **Zero-Hallucination Architecture**:
- 🛡️ **Deterministic 3-State Rules Engine**: All eligibility decisions (`MET`, `NOT_MET`, `UNKNOWN`) are computed by pure deterministic code with relative date math and strict bounds. No LLM in the decision loop.
- 📜 **Verbatim Guideline Citations**: Every rule, blocker, and answer cites the official ministry document section with a verbatim quote (≤25 words).
- 🔍 **Human-in-the-Loop Audit Console**: Extracted criteria carry confidence scores and can be audited and edited live at `/admin/review`.
- ⚡ **What-If Opportunity Simulator**: Founders simulate real-world moves (e.g. obtaining DPIIT recognition, switching from LLP to Pvt Ltd) and instantly watch funding opportunities unlock.
- 🗺️ **Dependency-Aware Application Roadmap**: Prioritized, sequential timeline with effort estimates and a dynamic Readiness Score.

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer (Next.js 14 App Router)"
        LP[Landing Page & Value Prop]
        OB[4-Step Profiler Wizard]
        DB[Eligibility Checker & Dashboard]
        WI[What-If Opportunity Simulator]
        RM[Dependency Roadmap & Readiness Gauge]
        AR[Human Review & Rule Audit Console]
        CH[Citation-Enforced RAG Chat]
    end

    subgraph "API Routes Layer (/api/)"
        API_ELIG[/api/eligibility]
        API_WHATIF[/api/what-if]
        API_RAG[/api/rag]
        API_ROADMAP[/api/roadmap]
        API_ADMIN[/api/admin/criteria]
        API_PDF[/api/report/pdf]
    end

    subgraph "Core Deterministic Engines (lib/)"
        RE[Deterministic Rules Engine<br/>3-State: MET / NOT_MET / UNKNOWN]
        MRD[Missing Requirement Detector<br/>Cross-Scheme Blocker Aggregation]
        FTS[FTS5 Hybrid Search Engine<br/>BM25 + Token Fallback]
        RS[Readiness Score Calculator<br/>Checklist Completion Gauge]
    end

    subgraph "Persistence Layer (SQLite WAL)"
        DB_SCHEMES[(schemes: 10 Indian Portals)]
        DB_DOCS[(scheme_documents: Ingested Texts)]
        DB_CRIT[(criteria: 45+ Verified Rules)]
        DB_PROF[(startup_profiles: Personas)]
        DB_RES[(eligibility_results: Audit Trail)]
        DB_STEPS[(roadmap_steps: Timeline)]
    end

    LP --> OB --> DB
    DB --> WI
    DB --> RM --> API_PDF
    DB --> CH
    DB --> AR

    DB --> API_ELIG --> RE
    WI --> API_WHATIF --> RE
    RM --> API_ROADMAP --> RS
    CH --> API_RAG --> FTS
    AR --> API_ADMIN --> DB_CRIT

    RE --> DB_CRIT
    RE --> DB_SCHEMES
    FTS --> DB_DOCS
```

---

## 🇮🇳 Ingested Indian Government Schemes

FundMate AI includes 10 real central and state schemes verified against official gazettes:

| # | Scheme | Tier | Ministry / Agency | Financial Ceiling | Type |
|---|--------|------|-------------------|-------------------|------|
| 1 | **Startup India Seed Fund Scheme (SISFS)** | Central | DPIIT | **₹50 Lakh** | Grant / Debenture |
| 2 | **DPIIT Startup Recognition** | Central | DPIIT / Startup India | Tax benefits & fast-track | Recognition (80-IAC) |
| 3 | **Fund of Funds for Startups (FFS)** | Central | SIDBI / DPIIT | **₹10,000 Cr Corpus** | Equity / AIF |
| 4 | **CGTMSE Credit Guarantee** | Central | MSME / SIDBI | **₹5 Crore** | 85% Collateral Guarantee |
| 5 | **PMMY MUDRA Shishu Loan** | Central | Ministry of Finance | **₹50,000** | Micro Loan |
| 6 | **PMMY MUDRA Kishore Loan** | Central | Ministry of Finance | **₹5 Lakh** | Expansion Loan |
| 7 | **PMEGP Subsidy Programme** | Central | KVIC / MSME | **35% Subsidy (up to ₹50L)** | Margin Money Subsidy |
| 8 | **BIRAC BIG (BioTech Ignition Grant)** | Central | Dept of Biotechnology | **₹50 Lakh** | Non-dilutive Grant |
| 9 | **Atal Innovation Mission (AIM AIC)** | Central | NITI Aayog | **₹25 Lakh + Incubation** | Incubation & Seed |
| 10 | **Karnataka Elevate (KITS Policy)** | State | Govt of Karnataka | **₹50 Lakh + SGST Refund** | State Seed Grant |

---

## 🚀 Quickstart (< 3 Minutes)

### Prerequisites
- Node.js 18.17+ or 20+
- npm / pnpm / yarn

### 1. Clone & Install
```bash
git clone https://github.com/vishw/FundMate-AI.git
cd FundMate-AI
npm install
```

### 2. Configure Environment (Optional)
The application works **100% offline in Demo Mode** with zero API keys required. To enable live Claude RAG generation:
```bash
cp .env.example .env.local
# Add your Anthropic API key (optional):
# ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

> [!TIP]
> The SQLite database auto-seeds itself on the very first boot. If you want to re-ingest and run citation integrity verification manually, run:
> ```bash
> npm run ingest
> ```

---

## 🧪 Running Automated Tests

Run the test suite verifying rules engine date math, golden-set personas, and citation quote constraints:

```bash
npm test
```

Test suites include:
- `tests/rules-engine.test.ts`: Deterministic 3-state evaluator, relative date arithmetic, turnover ceilings, and unknown field handling.
- `tests/golden-set.test.ts`: Persona eligibility benchmarks (KisanSetu, PulseBio, Vidyut Bharat).
- `tests/citations.test.ts`: Verifies all 45+ rules carry non-empty verbatim quotes (≤25 words) and valid scheme links.

---

## 🎭 3-Minute Demo Walkthrough Script

### Minute 1: The Landing Page & Instant Dashboard Switcher
1. Open [http://localhost:3000](http://localhost:3000). Highlight the trust principle and interactive preview.
2. Click **Go to Dashboard** ([http://localhost:3000/dashboard](http://localhost:3000/dashboard)).
3. Show the **Persona Switcher**:
   - Select **KisanSetu (AgriTech)**: Show that it qualifies for **3 Central/State Schemes** (SISFS, Karnataka Elevate, DPIIT) unlocking **₹1.00 Crore** in non-dilutive capital.
   - Switch to **PulseBio (MedTech Student Venture)**: Note how SISFS is marked **Not Eligible** because PulseBio is an unregistered student team lacking DPIIT recognition.
   - Point out the **Missing Requirement Detector**: "What's Blocking You?" reveals that resolving DPIIT recognition unlocks 3 schemes.

### Minute 2: What-If Simulator & RAG Assistant
1. Click **Simulate Changes in What-If Lab** ([http://localhost:3000/what-if](http://localhost:3000/what-if)).
2. Toggle **DPIIT Recognition** from *Not Recognized* to *Recognized*.
3. Watch the live **Delta Meter**:
   - `+2 Newly Unlocked Schemes` (SISFS & BIRAC BIG).
   - `+₹1.00 Crore Capital Delta`.
   - Read the Strategic AI Narration explaining the ROI and estimated effort.
4. Click **Ask AI** ([http://localhost:3000/chat](http://localhost:3000/chat)). Click the preset chip: *"Am I eligible for Startup India Seed Fund (SISFS)?"*. Show the verbatim quote citation from Section 3.1 with link to the official portal.

### Minute 3: Application Roadmap & Printable PDF Dossier
1. Open **Roadmap** ([http://localhost:3000/roadmap](http://localhost:3000/roadmap)).
2. Check off Step 1 (DPIIT Recognition). Observe the **Readiness Score Gauge** increase dynamically from 33% to 50%.
3. Note the explicit statutory notice: *"Measures preparation checklist completion, not guaranteed government funding."*
4. Go back to Dashboard and click **Export Dossier (PDF)** ([http://localhost:3000/api/report/pdf](http://localhost:3000/api/report/pdf)) to view the printer-ready executive compliance report.
5. Visit **Rule Audit** ([http://localhost:3000/admin/review](http://localhost:3000/admin/review)) to prove that every rule is human-auditable with quote verification.

---

## 📁 Repository Structure

```
Fund.Ai/
├── app/
│   ├── layout.tsx              # Root layout (Inter + Plus Jakarta Sans, ThemeProvider)
│   ├── page.tsx                # High-conversion landing page with animated preview
│   ├── dashboard/page.tsx      # Main eligibility checker, KPI strip & scheme cards
│   ├── what-if/page.tsx        # Deterministic scenario simulator & delta compute
│   ├── roadmap/page.tsx        # Sequential timeline & live Readiness Score ring
│   ├── chat/page.tsx           # Citation-enforced RAG assistant with source drawers
│   ├── onboarding/page.tsx     # 4-stage profiler with demo persona prefill
│   ├── admin/review/page.tsx   # Human-in-the-loop rule audit console
│   └── api/                    # REST route handlers
│       ├── eligibility/        # Pure deterministic scheme evaluator
│       ├── what-if/            # Before vs after delta engine
│       ├── rag/                # Hybrid search (FTS5 + Claude/local synthesis)
│       ├── roadmap/            # Step toggles & readiness scoring
│       ├── profile/            # Startup profile CRUD
│       ├── admin/criteria/     # Rule verification & citation editor
│       └── report/pdf/         # Printer-ready executive PDF dossier
├── components/
│   ├── layout/header.tsx       # Glass navigation with dark mode toggle
│   ├── layout/footer.tsx       # Statutory disclaimer & ministry links
│   └── ui/                     # UI components (Button, Badge, Card, Input)
├── data/
│   ├── seed.ts                 # 10 verified schemes, 13 documents, 45+ criteria
│   └── personas.ts             # 3 realistic Indian startup profiles
├── lib/
│   ├── db.ts                   # SQLite WAL persistence layer with auto-seeding
│   ├── types.ts                # TypeScript interfaces & enums
│   ├── utils.ts                # INR currency formatting & color utilities
│   ├── eligibility/engine.ts   # Deterministic 3-state rules engine & date math
│   └── rag/pipeline.ts         # Citation extraction & verbatim quote limits
├── scripts/
│   └── ingest.ts               # CLI ingestion & citation validation pipeline
└── tests/
    ├── rules-engine.test.ts    # Rules engine unit tests
    ├── golden-set.test.ts      # Benchmark persona test cases
    └── citations.test.ts       # Verbatim quote & constraint validation
```

---

## ⚖️ License & Compliance Disclaimer

FundMate AI is created for hackathon demonstration and informational purposes. It does not provide licensed legal, chartered accountancy, or financial advisory services. Eligibility results are deterministic reflections of public guidelines and do not guarantee government sanction. All scheme titles, ministry trademarks, and guideline texts remain the intellectual property of the Government of India and participating state authorities.
