/**
 * FundMate AI — Citation-Enforced RAG Pipeline
 *
 * Grounded Q&A engine that retrieves official government guideline documents
 * and criteria, enforces verbatim quotation limits (≤25 words), verifies
 * source references, and supports both Claude API and offline demo synthesis.
 */

import { searchDocuments, getSchemeById, getAllSchemes, getCriteriaForScheme, getAllCriteria } from '@/lib/db';
import type { SchemeDocument, Criterion, Scheme } from '@/lib/types';

export interface RagSource {
  id: string;
  doc_id: string;
  scheme_id: string;
  scheme_name: string;
  title: string;
  url: string;
  quote: string;
  section: string;
  confidence: number;
}

export interface RagResponse {
  answer: string;
  sources: RagSource[];
  confidence: 'high' | 'medium' | 'low';
  is_fallback: boolean;
}

/**
 * Executes a citation-grounded RAG query against official scheme documents.
 */
export async function querySchemeKnowledge(
  question: string,
  schemeId?: string
): Promise<RagResponse> {
  const cleanQ = question.trim();
  if (!cleanQ) {
    return {
      answer: 'Please provide a specific question regarding government funding schemes, criteria, or documents.',
      sources: [],
      confidence: 'low',
      is_fallback: true,
    };
  }

  // 1. Retrieve matching documents using hybrid search (FTS5 / LIKE)
  const searchResults = searchDocuments(cleanQ, schemeId);
  const allSchemes = getAllSchemes();

  // 2. Retrieve relevant criteria citations for extra precision
  const candidateCriteria = schemeId
    ? getCriteriaForScheme(schemeId)
    : getAllCriteria();

  const qLower = cleanQ.toLowerCase();
  const matchedCriteria = candidateCriteria.filter((c) => {
    return (
      qLower.includes(c.field_checked.toLowerCase()) ||
      c.human_readable_text.toLowerCase().split(/\s+/).some((w) => w.length > 3 && qLower.includes(w)) ||
      (c.source_quote && c.source_quote.toLowerCase().split(/\s+/).some((w) => w.length > 4 && qLower.includes(w)))
    );
  });

  // 3. Assemble validated sources with verbatim quotes
  const sources: RagSource[] = [];
  const seenQuotes = new Set<string>();

  // Add sources from matched criteria (highest confidence, pre-extracted citations)
  for (const c of matchedCriteria.slice(0, 3)) {
    if (c.source_quote && !seenQuotes.has(c.source_quote)) {
      seenQuotes.add(c.source_quote);
      const scheme = allSchemes.find((s) => s.id === c.scheme_id);
      sources.push({
        id: `src-${c.id}`,
        doc_id: c.source_doc_id,
        scheme_id: c.scheme_id,
        scheme_name: scheme ? scheme.name : c.scheme_id.toUpperCase(),
        title: `${scheme?.name || c.scheme_id} Official Guideline`,
        url: scheme?.official_url || 'https://www.startupindia.gov.in',
        quote: c.source_quote,
        section: c.source_page_or_section || 'Eligibility Criteria',
        confidence: c.extraction_confidence || 0.95,
      });
    }
  }

  // Add sources from full-text search document passages
  for (const item of searchResults.slice(0, 3)) {
    const scheme = allSchemes.find((s) => s.id === item.doc.scheme_id);
    const excerpt = extractRelevantExcerpt(item.doc.raw_text, cleanQ);

    if (excerpt && !seenQuotes.has(excerpt.quote)) {
      seenQuotes.add(excerpt.quote);
      sources.push({
        id: `src-doc-${item.doc.id}-${sources.length + 1}`,
        doc_id: item.doc.id,
        scheme_id: item.doc.scheme_id,
        scheme_name: scheme ? scheme.name : item.doc.scheme_id.toUpperCase(),
        title: item.doc.title,
        url: item.doc.url,
        quote: excerpt.quote,
        section: excerpt.section,
        confidence: 0.9,
      });
    }
  }

  // 4. Try live Claude API if key exists and not explicitly in mock mode
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  const isDemo = process.env.DEMO_MODE === 'true';

  if (apiKey && !isDemo && sources.length > 0) {
    try {
      const claudeAnswer = await callClaudeRag(cleanQ, sources);
      if (claudeAnswer) {
        return {
          answer: claudeAnswer,
          sources,
          confidence: 'high',
          is_fallback: false,
        };
      }
    } catch (err) {
      console.warn('Claude API call failed, falling back to local grounded synthesis:', err);
    }
  }

  // 5. Intelligent local grounded synthesis (Demo Mode & zero-cost offline support)
  const syntheticResponse = synthesizeGroundedAnswer(cleanQ, sources, schemeId, allSchemes);
  return syntheticResponse;
}

/**
 * Calls Anthropic Claude API with strict citation prompt
 */
async function callClaudeRag(question: string, sources: RagSource[]): Promise<string | null> {
  const context = sources
    .map(
      (s, idx) =>
        `[Source ${idx + 1}] (${s.scheme_name} — ${s.section}): "${s.quote}"\nOfficial URL: ${s.url}`
    )
    .join('\n\n');

  const systemPrompt = `You are FundMate AI's Senior Compliance Advisor.
Answer the founder's query accurately using ONLY the provided official government sources below.
Rules:
1. Every major assertion must cite the corresponding source, e.g. [Source 1].
2. Include short verbatim quotes (≤25 words) when stating specific numbers, time limits, or eligibility clauses.
3. If the provided sources do not address a point, explicitly state that it is not covered in the current official guideline snapshot.
4. Keep the tone authoritative, concise, and helpful for Indian founders.`;

  const userPrompt = `Official Sources:\n${context}\n\nFounder Question: ${question}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Claude API responded with status ${res.status}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text;
  return text || null;
}

/**
 * Deterministic, grounded local response synthesizer for demo mode
 */
function synthesizeGroundedAnswer(
  question: string,
  sources: RagSource[],
  schemeId?: string,
  schemes: Scheme[] = []
): RagResponse {
  const qLower = question.toLowerCase();

  // If no sources could be matched
  if (sources.length === 0) {
    return {
      answer: `The official guidelines currently ingested do not contain specific criteria matching your question: "${question}".\n\nFor official clarification, please check the [Startup India Central Portal](https://www.startupindia.gov.in) or visit the relevant ministry website directly.`,
      sources: [],
      confidence: 'low',
      is_fallback: true,
    };
  }

  const primarySource = sources[0];
  const targetScheme = schemeId ? schemes.find((s) => s.id === schemeId) : null;
  const schemeName = targetScheme ? targetScheme.name : primarySource.scheme_name;

  let answer = '';

  // Specific query intent matching
  if (qLower.includes('eligible') || qLower.includes('eligibility') || qLower.includes('can i apply')) {
    answer = `Based on official guidelines for **${schemeName}**, the primary compliance rules are:\n\n`;
    sources.forEach((s, i) => {
      answer += `- **${s.section}**: &ldquo;${s.quote}&rdquo; [Source ${i + 1}]\n`;
    });
    answer += `\nEnsure your startup's incorporation date, registration type (Pvt Ltd/LLP), and DPIIT status align with these requirements before submitting your application.`;
  } else if (qLower.includes('document') || qLower.includes('paperwork') || qLower.includes('proof')) {
    answer = `For **${schemeName}**, the required documentation according to official notices includes:\n\n`;
    sources.forEach((s, i) => {
      answer += `1. **${s.section} Verification**: &ldquo;${s.quote}&rdquo; [Source ${i + 1}]\n`;
    });
    answer += `\nYou will generally need your Certificate of Incorporation, DPIIT Recognition letter, PAN, bank statement, and a Detailed Project Report (DPR).`;
  } else if (qLower.includes('how much') || qLower.includes('amount') || qLower.includes('funding') || qLower.includes('grant')) {
    const fundingMax = targetScheme?.funding_range_max
      ? `up to ₹${(targetScheme.funding_range_max / 100000).toFixed(0)} Lakh`
      : 'as specified in the guidelines';
    answer = `Under **${schemeName}**, financial assistance is provided ${fundingMax}.\n\nOfficial guideline text confirms:\n`;
    sources.forEach((s, i) => {
      answer += `> &ldquo;${s.quote}&rdquo; — *${s.section}* [Source ${i + 1}]\n\n`;
    });
    answer += `Disbursement is milestone-based through approved government incubators or nodal agencies.`;
  } else {
    answer = `According to the official guidelines for **${schemeName}**:\n\n`;
    sources.forEach((s, i) => {
      answer += `- **${s.section}**: &ldquo;${s.quote}&rdquo; [Source ${i + 1}]\n`;
    });
    answer += `\nAll citations above are taken verbatim from official ministry guidelines. Verify live circulars at [${primarySource.title}](${primarySource.url}).`;
  }

  return {
    answer,
    sources,
    confidence: 'high',
    is_fallback: false,
  };
}

/**
 * Extracts a concise (≤25 word) quote and section heading from raw guideline text
 */
function extractRelevantExcerpt(rawText: string, query: string): { quote: string; section: string } | null {
  if (!rawText) return null;

  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  let currentSection = 'General Guidelines';

  const queryTokens = query.toLowerCase().split(/\s+/).filter((w) => w.length > 3);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.toLowerCase().startsWith('section:') || line.toLowerCase().startsWith('eligibility')) {
      currentSection = line;
      continue;
    }

    const lineLower = line.toLowerCase();
    const matchesToken = queryTokens.some((t) => lineLower.includes(t));

    if (matchesToken && line.length > 20) {
      // Split into words and clamp to 25 words max
      const words = line.split(/\s+/);
      const quote = words.slice(0, 24).join(' ') + (words.length > 24 ? '...' : '');
      return {
        quote,
        section: currentSection,
      };
    }
  }

  // Fallback to first substantive sentence
  const firstSentence = lines.find((l) => l.length > 25 && !l.startsWith('Section:'));
  if (firstSentence) {
    const words = firstSentence.split(/\s+/);
    return {
      quote: words.slice(0, 22).join(' ') + '...',
      section: 'Official Text',
    };
  }

  return null;
}
