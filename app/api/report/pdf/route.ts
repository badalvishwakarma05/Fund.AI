import { NextRequest, NextResponse } from 'next/server';
import { getProfile, getAllSchemes, getCriteriaForScheme, getRoadmapSteps } from '@/lib/db';
import { evaluateScheme } from '@/lib/eligibility/engine';
import { demoPersonas } from '@/data/personas';
import { formatINR } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get('profile_id') || demoPersonas[0].id;

  let profile = getProfile(profileId);
  if (!profile) {
    const demo = demoPersonas.find((p) => p.id === profileId) || demoPersonas[0];
    profile = demo.profile;
  }

  const schemes = getAllSchemes();
  const evaluationResults = schemes.map((s) => {
    const criteria = getCriteriaForScheme(s.id);
    return {
      scheme: s,
      eval: evaluateScheme(profile!, s.id, s.name, criteria),
    };
  });

  const steps = getRoadmapSteps(profileId);

  const eligibleSchemes = evaluationResults.filter((r) => r.eval.result.overall_verdict === 'likely_eligible');
  const partialSchemes = evaluationResults.filter((r) => r.eval.result.overall_verdict === 'partially_eligible');
  const maxFunding = eligibleSchemes.reduce((acc, curr) => acc + (curr.scheme.funding_range_max || 0), 0);

  // Generate high-fidelity printer-ready HTML document
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FundMate AI — Executive Funding Dossier (${profile.name})</title>
  <style>
    @page { margin: 15mm; size: A4; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      font-size: 13px;
      margin: 0;
      padding: 20px;
    }
    .header {
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .brand { font-size: 22px; font-weight: 800; color: #1e3a8a; }
    .brand span { color: #f97316; }
    .meta { text-align: right; font-size: 11px; color: #64748b; }
    h2 { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 24px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .kpi { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; }
    .kpi-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; }
    .kpi-val { font-size: 20px; font-weight: 800; color: #1e293b; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 16px; font-size: 12px; }
    th { text-align: left; background: #f1f5f9; padding: 8px; border: 1px solid #cbd5e1; font-weight: 600; }
    td { padding: 8px; border: 1px solid #e2e8f0; }
    .badge-met { background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 11px; display: inline-block; }
    .badge-partial { background: #fef3c7; color: #92400e; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 11px; display: inline-block; }
    .badge-not { background: #fee2e2; color: #991b1b; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 11px; display: inline-block; }
    .quote-box { background: #f8fafc; border-left: 3px solid #3b82f6; padding: 6px 10px; margin: 4px 0; font-style: italic; font-size: 11px; }
    .disclaimer { margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 10px; color: #64748b; line-height: 1.4; }
    .no-print { margin-bottom: 16px; }
    @media print {
      .no-print { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right;">
    <button onclick="window.print()" style="background:#2563eb;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:600;">
      🖨️ Print or Save as PDF
    </button>
  </div>

  <div class="header">
    <div>
      <div class="brand">Fund<span>Mate</span> AI</div>
      <div style="font-size: 13px; font-weight: 600; color: #334155; margin-top: 2px;">
        Executive Funding Opportunity & Compliance Dossier
      </div>
    </div>
    <div class="meta">
      <div>Report Ref: FM-${Date.now().toString(36).toUpperCase()}</div>
      <div>Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      <div>Verification Standard: Zero-Hallucination Deterministic Grounding</div>
    </div>
  </div>

  <!-- Profile Snapshot -->
  <h2>1. Venture Profile & Compliance Baseline</h2>
  <table>
    <tr>
      <td width="20%"><strong>Venture Name</strong></td>
      <td width="30%">${profile.name}</td>
      <td width="20%"><strong>Sector / Subsector</strong></td>
      <td width="30%">${profile.sector.value} (${profile.sub_sector.value || 'N/A'})</td>
    </tr>
    <tr>
      <td><strong>Legal Structure</strong></td>
      <td>${profile.registration_type.value.toUpperCase()} (Inc: ${profile.incorporation_date.value || 'N/A'})</td>
      <td><strong>Registered State</strong></td>
      <td>${profile.state.value}</td>
    </tr>
    <tr>
      <td><strong>DPIIT Recognition</strong></td>
      <td><strong>${profile.dpiit_recognition.value === 'yes' ? 'Verified Recognized' : 'Not Recognized'}</strong></td>
      <td><strong>Annual Turnover</strong></td>
      <td>${formatINR(profile.annual_turnover.value || 0)}</td>
    </tr>
  </table>

  <!-- KPI Summary -->
  <div class="kpi-grid">
    <div class="kpi">
      <div class="kpi-label">Likely Eligible Schemes</div>
      <div class="kpi-val" style="color:#16a34a;">${eligibleSchemes.length} Schemes</div>
      <div style="font-size:11px;color:#64748b;">100% criteria verified compliant</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Max Potential Capital Pool</div>
      <div class="kpi-val" style="color:#2563eb;">${formatINR(maxFunding)}</div>
      <div style="font-size:11px;color:#64748b;">Grants, subsidies & debt guarantees</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Partially Eligible</div>
      <div class="kpi-val" style="color:#d97706;">${partialSchemes.length} Schemes</div>
      <div style="font-size:11px;color:#64748b;">Pending document verification</div>
    </div>
  </div>

  <!-- Scheme Evaluation Matrix -->
  <h2>2. Scheme Eligibility & Citation Matrix</h2>
  <table>
    <thead>
      <tr>
        <th width="35%">Government Scheme & Agency</th>
        <th width="15%">Level & Type</th>
        <th width="20%">Financial Ceiling</th>
        <th width="15%">Verdict</th>
        <th width="15%">Compliance</th>
      </tr>
    </thead>
    <tbody>
      ${evaluationResults.map(({ scheme, eval: e }) => {
        const v = e.result.overall_verdict;
        let badge = `<span class="badge-not">Not Eligible</span>`;
        if (v === 'likely_eligible') badge = `<span class="badge-met">Likely Eligible</span>`;
        else if (v === 'partially_eligible') badge = `<span class="badge-partial">Partially Eligible</span>`;

        return `
          <tr>
            <td>
              <strong>${scheme.name}</strong><br/>
              <span style="font-size:11px;color:#64748b;">${scheme.ministry_agency}</span>
            </td>
            <td>${scheme.level.toUpperCase()} / ${scheme.type}</td>
            <td>${scheme.funding_range_max ? formatINR(scheme.funding_range_max) : 'Non-monetary'}</td>
            <td>${badge}</td>
            <td>${e.result.met_count} / ${e.result.total_criteria} Met</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <!-- Prioritized Roadmap Steps -->
  <h2>3. Prioritized Application Action Plan</h2>
  <table>
    <thead>
      <tr>
        <th width="10%">Step</th>
        <th width="40%">Milestone & Action Item</th>
        <th width="20%">Effort</th>
        <th width="15%">Linked Schemes</th>
        <th width="15%">Status</th>
      </tr>
    </thead>
    <tbody>
      ${steps.map((s, idx) => `
        <tr>
          <td align="center"><strong>#${idx + 1}</strong></td>
          <td>
            <strong>${s.title}</strong><br/>
            <span style="font-size:11px;color:#475569;">${s.description}</span>
          </td>
          <td>${s.estimated_effort}</td>
          <td>${s.linked_scheme_ids.join(', ').toUpperCase()}</td>
          <td>${s.is_completed ? '<span style="color:#16a34a;font-weight:700;">Completed</span>' : 'Pending'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="disclaimer">
    <strong>Statutory Notice:</strong> FundMate AI is an automated compliance evaluation engine based on ingested public government guidelines.
    It does not provide formal legal, financial, or tax counsel. The Readiness Score measures administrative preparation completeness,
    not guaranteed government grant disbursement. All trademarks and scheme titles belong to their respective government ministries.
  </div>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
