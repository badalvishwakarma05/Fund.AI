'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Shield,
  Building2,
  IndianRupee,
  Layers,
  SlidersHorizontal,
  BookmarkPlus,
  BookOpen,
  Filter,
  Check,
  RefreshCw,
  Info,
  Calendar,
  AlertTriangle,
  Lightbulb,
  FileText,
} from 'lucide-react';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { demoPersonas } from '@/data/personas';
import { formatINR, verdictColor, verdictLabel } from '@/lib/utils';
import type { EvaluatedSchemeCard } from '@/app/api/eligibility/route';
import type { StartupProfile, OverallVerdict } from '@/lib/types';
import type { MissingRequirement } from '@/lib/eligibility/engine';

export default function DashboardPage() {
  const [selectedPersonaId, setSelectedPersonaId] = React.useState<string>(demoPersonas[0].id);
  const [profile, setProfile] = React.useState<StartupProfile | null>(null);
  const [schemes, setSchemes] = React.useState<EvaluatedSchemeCard[]>([]);
  const [summary, setSummary] = React.useState<any>(null);
  const [blockers, setBlockers] = React.useState<MissingRequirement[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Filters
  const [verdictFilter, setVerdictFilter] = React.useState<string>('all');
  const [levelFilter, setLevelFilter] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  // Expandable cards state
  const [expandedCards, setExpandedCards] = React.useState<Record<string, boolean>>({});
  const [expandedQuotes, setExpandedQuotes] = React.useState<Record<string, boolean>>({});

  // Active guideline preview modal
  const [selectedSchemeDetail, setSelectedSchemeDetail] = React.useState<EvaluatedSchemeCard | null>(null);

  // Fetch evaluation results whenever persona changes
  const evaluateProfile = React.useCallback(async (personaId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: personaId }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setSchemes(data.schemes);
        setSummary(data.summary);
        setBlockers(data.blockers);

        // Auto-expand the first likely-eligible and first not-eligible card
        const initialExpanded: Record<string, boolean> = {};
        if (data.schemes.length > 0) {
          initialExpanded[data.schemes[0].scheme.id] = true;
        }
        setExpandedCards(initialExpanded);
      }
    } catch (err) {
      console.error('Failed to evaluate profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    evaluateProfile(selectedPersonaId);
  }, [selectedPersonaId, evaluateProfile]);

  const toggleCard = (schemeId: string) => {
    setExpandedCards((prev) => ({ ...prev, [schemeId]: !prev[schemeId] }));
  };

  const toggleQuote = (criterionId: string) => {
    setExpandedQuotes((prev) => ({ ...prev, [criterionId]: !prev[criterionId] }));
  };

  // Filter schemes
  const filteredSchemes = schemes.filter(({ scheme, result }) => {
    if (verdictFilter !== 'all' && result.overall_verdict !== verdictFilter) {
      return false;
    }
    if (levelFilter !== 'all' && scheme.level !== levelFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = scheme.name.toLowerCase().includes(q);
      const matchAgency = scheme.ministry_agency.toLowerCase().includes(q);
      const matchDesc = scheme.short_description.toLowerCase().includes(q);
      if (!matchName && !matchAgency && !matchDesc) return false;
    }
    return true;
  });

  // Group blockers by impact (how many schemes are blocked by the same requirement)
  const groupedBlockers = React.useMemo(() => {
    const map = new Map<string, { blocker: MissingRequirement; count: number; schemeNames: string[] }>();
    for (const b of blockers) {
      const key = `${b.field_checked}-${b.required_value}`;
      if (!map.has(key)) {
        map.set(key, { blocker: b, count: 1, schemeNames: [b.scheme_name] });
      } else {
        const item = map.get(key)!;
        item.count++;
        if (!item.schemeNames.includes(b.scheme_name)) {
          item.schemeNames.push(b.scheme_name);
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [blockers]);

  const activePersona = demoPersonas.find((p) => p.id === selectedPersonaId) || demoPersonas[0];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-brand-500/20">
      <Header />

      <main className="flex-1 pt-20 pb-16">
        <div className="container px-4 sm:px-6 max-w-7xl">
          {/* Top Persona Switcher Strip */}
          <div className="mb-6 p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-primary" /> Active Demo Persona:
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  Demo Mode
                </span>
              </div>

              {/* Persona Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {demoPersonas.map((p) => {
                  const isActive = p.id === selectedPersonaId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPersonaId(p.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-primary text-white shadow-sm shadow-primary/30 scale-[1.02]'
                          : 'bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {p.id === 'persona-agritech' && '🌱'}
                      {p.id === 'persona-medtech' && '🧬'}
                      {p.id === 'persona-cleantech' && '⚡'}
                      <span>{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profile Brief Info */}
            {profile && (
              <div className="mt-3 pt-3 border-t border-border/40 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  {profile.name}
                </span>
                <span>
                  <strong>Sector:</strong> {profile.sector.value}
                </span>
                <span>
                  <strong>Stage:</strong> {profile.stage.value.toUpperCase()}
                </span>
                <span>
                  <strong>State:</strong> {profile.state.value}
                </span>
                <span>
                  <strong>DPIIT:</strong>{' '}
                  <span
                    className={
                      profile.dpiit_recognition.value === 'yes'
                        ? 'text-met-600 dark:text-met-400 font-semibold'
                        : 'text-notmet-600 dark:text-notmet-400 font-semibold'
                    }
                  >
                    {profile.dpiit_recognition.value === 'yes' ? 'Recognized ✓' : 'Not Recognized ✕'}
                  </span>
                </span>
                <span>
                  <strong>Turnover:</strong> {formatINR(profile.annual_turnover.value || 0)}
                </span>
              </div>
            )}
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="rounded-2xl border border-border/60 shadow-xs bg-card/60 backdrop-blur-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Eligible Schemes
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold font-display text-met-600 dark:text-met-400">
                      {summary?.likelyEligibleCount ?? 0}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      of {summary?.totalSchemes ?? 10} checked
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">100% criteria satisfied</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-met-500/10 flex items-center justify-center text-met-600 dark:text-met-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border/60 shadow-xs bg-card/60 backdrop-blur-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Max Funding Pool
                  </p>
                  <p className="text-3xl font-extrabold font-display text-foreground mt-1">
                    {formatINR(summary?.totalPotentialFundingMax ?? 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Grants, subsidies & loans</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <IndianRupee className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border/60 shadow-xs bg-card/60 backdrop-blur-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Partially Eligible
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold font-display text-unknown-600 dark:text-unknown-400">
                      {summary?.partiallyEligibleCount ?? 0}
                    </span>
                    <span className="text-xs text-muted-foreground">Schemes</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Need doc verification</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-unknown-500/10 flex items-center justify-center text-unknown-600 dark:text-unknown-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border/60 shadow-xs bg-card/60 backdrop-blur-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Blockers Detected
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold font-display text-notmet-600 dark:text-notmet-400">
                      {summary?.hardBlockersCount ?? 0}
                    </span>
                    <span className="text-xs text-muted-foreground">Hard criteria</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Fixable via What-If Lab</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-notmet-500/10 flex items-center justify-center text-notmet-600 dark:text-notmet-400">
                  <XCircle className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Missing Requirement Detector (What's Blocking You?) */}
          {groupedBlockers.length > 0 && (
            <div className="mb-8 p-6 rounded-2xl border border-border/80 bg-card shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-unknown-500/10 text-unknown-600 dark:text-unknown-400 text-xs font-bold mb-1">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Missing Requirement Detector
                  </div>
                  <h2 className="text-xl font-bold tracking-tight font-display">
                    What&apos;s Blocking You From Additional Schemes?
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Our rules engine identified key hurdles preventing your startup from unlocking {summary?.notEligibleCount ?? 0} additional opportunities.
                  </p>
                </div>
                <Link href="/what-if">
                  <Button variant="accent" size="sm" className="gap-2 shrink-0">
                    <Sparkles className="w-4 h-4" />
                    Simulate Changes in What-If Lab
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {groupedBlockers.slice(0, 3).map(({ blocker, count, schemeNames }, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/50 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-notmet-500/10 text-notmet-600 dark:text-notmet-400 text-[11px] font-semibold">
                          Blocks {count} {count === 1 ? 'Scheme' : 'Schemes'}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {blocker.field_checked}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">
                        {blocker.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {blocker.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground truncate max-w-[150px]">
                        Affects: {schemeNames.join(', ')}
                      </span>
                      <Link
                        href={blocker.action_href}
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline text-xs"
                      >
                        {blocker.action_label} <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scheme Section Header & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight font-display">
                Discovered Funding Schemes ({schemes.length})
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Deterministic compliance evaluation verified against official ministry guidelines.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center p-1 bg-muted/60 rounded-xl border border-border/50 text-xs">
                <button
                  onClick={() => setVerdictFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    verdictFilter === 'all'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All ({schemes.length})
                </button>
                <button
                  onClick={() => setVerdictFilter('likely_eligible')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                    verdictFilter === 'likely_eligible'
                      ? 'bg-background text-met-600 shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-met-500" />
                  Eligible ({summary?.likelyEligibleCount ?? 0})
                </button>
                <button
                  onClick={() => setVerdictFilter('partially_eligible')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                    verdictFilter === 'partially_eligible'
                      ? 'bg-background text-unknown-600 shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-unknown-500" />
                  Partial ({summary?.partiallyEligibleCount ?? 0})
                </button>
                <button
                  onClick={() => setVerdictFilter('not_eligible')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                    verdictFilter === 'not_eligible'
                      ? 'bg-background text-notmet-600 shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5 text-notmet-500" />
                  Ineligible ({summary?.notEligibleCount ?? 0})
                </button>
              </div>

              {/* Level Filter */}
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                aria-label="Filter schemes by jurisdiction level"
                className="h-9 rounded-xl border border-input bg-background/50 px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="all">Central & State</option>
                <option value="central">Central Only</option>
                <option value="state">State Only</option>
              </select>

              {/* Export Dossier Button */}
              <a
                href={`/api/report/pdf?profile_id=${selectedPersonaId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-xs font-semibold text-primary transition-all shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                Export Dossier (PDF)
              </a>
            </div>
          </div>

          {/* Scheme Cards List */}
          {loading ? (
            <div className="py-24 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Evaluating criteria against official guidelines...</p>
            </div>
          ) : filteredSchemes.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed border-border/70 p-8">
              <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="text-base font-semibold">No schemes match this filter</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Try selecting a different filter above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSchemes.map(({ scheme, documents, result, blockers }) => {
                const isExpanded = !!expandedCards[scheme.id];
                const metPercent = result.total_criteria > 0
                  ? Math.round((result.met_count / result.total_criteria) * 100)
                  : 0;

                const verdictBadge = getVerdictBadge(result.overall_verdict);

                return (
                  <CardContainer key={scheme.id} className="w-full" containerClassName="py-0 w-full">
                    <CardBody className="w-full rounded-2xl border border-border/70 bg-card shadow-xs hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-200 overflow-hidden">
                      {/* Card Header Summary */}
                      <div className="p-5 sm:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <CardItem translateZ="20" className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                                {scheme.level === 'central' ? 'Central Scheme' : `${scheme.state} State`}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium capitalize">
                                {scheme.type}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {scheme.ministry_agency}
                              </span>
                            </CardItem>

                            <CardItem translateZ="35">
                              <h3 className="text-xl font-bold tracking-tight font-display text-foreground">
                                {scheme.name}
                              </h3>
                            </CardItem>

                            <CardItem translateZ="15">
                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 max-w-3xl">
                                {scheme.short_description}
                              </p>
                            </CardItem>
                          </div>

                          {/* Verdict & Funding Block with translateZ depth */}
                          <CardItem translateZ="45" className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/50">
                            <div className="text-left lg:text-right">
                              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                                Max Financial Assistance
                              </span>
                              <span className="text-lg font-bold font-display text-foreground">
                                {scheme.funding_range_max ? formatINR(scheme.funding_range_max) : 'Non-monetary / Tax'}
                              </span>
                            </div>

                            {verdictBadge}
                          </CardItem>
                        </div>

                      {/* Criteria Progress Meter */}
                      <div className="mt-4 pt-4 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 max-w-md">
                          <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                result.overall_verdict === 'likely_eligible'
                                  ? 'bg-met-500'
                                  : result.overall_verdict === 'partially_eligible'
                                  ? 'bg-unknown-500'
                                  : 'bg-notmet-500'
                              }`}
                              style={{ width: `${metPercent}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                            {result.met_count} / {result.total_criteria} Criteria Met ({metPercent}%)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCard(scheme.id)}
                            className="text-xs font-semibold gap-1 text-primary hover:text-primary/90"
                          >
                            {isExpanded ? 'Hide Criteria Checklist' : 'Inspect Criteria & Citations'}
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>

                          <a
                            href={scheme.official_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-input text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            Official Portal <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Criteria Checklist & Official Citations */}
                    {isExpanded && (
                      <div className="border-t border-border/60 bg-muted/20 p-5 sm:p-6 space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-primary" />
                            Official Requirement Evaluation & Evidence
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            Verified against official guidelines
                          </span>
                        </div>

                        <div className="space-y-3">
                          {result.criterion_results.map((cr, cIdx) => {
                            const isQuoteOpen = !!expandedQuotes[cr.criterion_id];

                            return (
                              <div
                                key={cIdx}
                                className="p-4 rounded-xl border border-border/60 bg-card/80 space-y-2 text-xs"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-2.5">
                                    <div className="mt-0.5 shrink-0">
                                      {cr.verdict === 'MET' && (
                                        <CheckCircle2 className="w-4 h-4 text-met-600 dark:text-met-400" />
                                      )}
                                      {cr.verdict === 'NOT_MET' && (
                                        <XCircle className="w-4 h-4 text-notmet-600 dark:text-notmet-400" />
                                      )}
                                      {cr.verdict === 'UNKNOWN' && (
                                        <HelpCircle className="w-4 h-4 text-unknown-600 dark:text-unknown-400" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-foreground text-sm">
                                        {cr.evidence}
                                      </p>
                                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-muted-foreground text-[11px]">
                                        <span>
                                          Required: <strong>{cr.required_value}</strong>
                                        </span>
                                        {cr.profile_value && (
                                          <span>
                                            Your profile: <strong>{cr.profile_value}</strong>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="shrink-0 flex items-center gap-2">
                                    <span
                                      className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                                        cr.verdict === 'MET'
                                          ? 'bg-met-500/10 text-met-600 dark:text-met-400'
                                          : cr.verdict === 'NOT_MET'
                                          ? 'bg-notmet-500/10 text-notmet-600 dark:text-notmet-400'
                                          : 'bg-unknown-500/10 text-unknown-600 dark:text-unknown-400'
                                      }`}
                                    >
                                      {verdictLabel(cr.verdict)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Scheme Card Footer Actions */}
                        <div className="pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Link href={`/what-if?scheme=${scheme.id}`}>
                              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                                <Sparkles className="w-3.5 h-3.5 text-accent-500" />
                                What-If Simulation
                              </Button>
                            </Link>
                            <Link href={`/chat?scheme=${scheme.id}`}>
                              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                                <BookOpen className="w-3.5 h-3.5 text-primary" />
                                Ask AI About Guidelines
                              </Button>
                            </Link>
                          </div>

                          <Link href={`/roadmap`}>
                            <Button variant="default" size="sm" className="gap-1.5 text-xs">
                              <BookmarkPlus className="w-3.5 h-3.5" />
                              Add to Application Roadmap
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                    </CardBody>
                  </CardContainer>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function getVerdictBadge(verdict: OverallVerdict) {
  switch (verdict) {
    case 'likely_eligible':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-met-500/10 text-met-600 dark:text-met-400 font-bold text-xs border border-met-500/20">
          <CheckCircle2 className="w-4 h-4" /> Likely Eligible
        </span>
      );
    case 'partially_eligible':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-unknown-500/10 text-unknown-600 dark:text-unknown-400 font-bold text-xs border border-unknown-500/20">
          <AlertCircle className="w-4 h-4" /> Partially Eligible
        </span>
      );
    case 'need_more_info':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-unknown-500/10 text-unknown-600 dark:text-unknown-400 font-bold text-xs border border-unknown-500/20">
          <HelpCircle className="w-4 h-4" /> Need More Info
        </span>
      );
    case 'not_eligible':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-notmet-500/10 text-notmet-600 dark:text-notmet-400 font-bold text-xs border border-notmet-500/20">
          <XCircle className="w-4 h-4" /> Not Eligible
        </span>
      );
  }
}
