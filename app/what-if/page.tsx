'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sliders,
  Building2,
  IndianRupee,
  ShieldCheck,
  BookmarkPlus,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { demoPersonas } from '@/data/personas';
import { formatINR } from '@/lib/utils';
import type { Scheme, OverallVerdict } from '@/lib/types';

export default function WhatIfPage() {
  const searchParams = useSearchParams();
  const toggleParam = searchParams?.get('toggle');

  const [selectedPersonaId, setSelectedPersonaId] = React.useState<string>(
    toggleParam === 'dpiit' ? 'persona-medtech' : demoPersonas[0].id
  );

  // Simulation parameters
  const [dpiitRecognition, setDpiitRecognition] = React.useState<'yes' | 'no'>(
    toggleParam === 'dpiit' ? 'yes' : 'yes'
  );
  const [registrationType, setRegistrationType] = React.useState<string>('pvt_ltd');
  const [stage, setStage] = React.useState<string>('mvp');
  const [state, setState] = React.useState<string>('Karnataka');
  const [incorporationYears, setIncorporationYears] = React.useState<number>(1.2);
  const [annualTurnover, setAnnualTurnover] = React.useState<number>(1200000);
  const [isWomanFounder, setIsWomanFounder] = React.useState<'yes' | 'no'>('yes');
  const [ipStatus, setIpStatus] = React.useState<'yes' | 'no'>('yes');

  const [simulationData, setSimulationData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  // Sync state when persona switches
  React.useEffect(() => {
    const p = demoPersonas.find((persona) => persona.id === selectedPersonaId) || demoPersonas[0];
    const prof = p.profile;

    setDpiitRecognition(toggleParam === 'dpiit' ? 'yes' : (prof.dpiit_recognition.value as any) || 'no');
    setRegistrationType(prof.registration_type.value || 'pvt_ltd');
    setStage(prof.stage.value || 'mvp');
    setState(prof.state.value || 'Karnataka');
    setAnnualTurnover(prof.annual_turnover.value || 0);
    setIsWomanFounder((prof.founder_demographics.value?.is_woman_founder as any) || 'no');
    setIpStatus((prof.ip_status.value as any) || 'no');

    if (prof.incorporation_date.value) {
      const ageYrs =
        (Date.now() - new Date(prof.incorporation_date.value).getTime()) /
        (1000 * 60 * 60 * 24 * 365.25);
      setIncorporationYears(Math.round(ageYrs * 10) / 10);
    }
  }, [selectedPersonaId, toggleParam]);

  // Run simulation API
  const runSimulation = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: selectedPersonaId,
          modifications: {
            dpiit_recognition: dpiitRecognition,
            registration_type: registrationType,
            stage,
            state,
            incorporation_years_ago: incorporationYears,
            annual_turnover: annualTurnover,
            is_woman_founder: isWomanFounder,
            ip_status: ipStatus,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSimulationData(data);
      }
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setLoading(false);
    }
  }, [
    selectedPersonaId,
    dpiitRecognition,
    registrationType,
    stage,
    state,
    incorporationYears,
    annualTurnover,
    isWomanFounder,
    ipStatus,
  ]);

  React.useEffect(() => {
    runSimulation();
  }, [runSimulation]);

  const handleReset = () => {
    const p = demoPersonas.find((persona) => persona.id === selectedPersonaId) || demoPersonas[0];
    const prof = p.profile;
    setDpiitRecognition((prof.dpiit_recognition.value as any) || 'no');
    setRegistrationType(prof.registration_type.value || 'pvt_ltd');
    setStage(prof.stage.value || 'mvp');
    setState(prof.state.value || 'Karnataka');
    setAnnualTurnover(prof.annual_turnover.value || 0);
    setIsWomanFounder((prof.founder_demographics.value?.is_woman_founder as any) || 'no');
    setIpStatus((prof.ip_status.value as any) || 'no');
  };

  const summary = simulationData?.summary;
  const deltas = simulationData?.schemeDeltas || [];
  const narration = simulationData?.narration;

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-brand-500/20">
      <Header />

      <main className="flex-1 pt-20 pb-16">
        <div className="container px-4 sm:px-6 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-500/10 text-accent-600 dark:text-accent-400 text-xs font-bold mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Deterministic Scenario Engine
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight font-display">
                What-If Opportunity Simulator
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5 max-w-2xl">
                Simulate business decisions (getting DPIIT recognition, registering a Pvt Ltd, expanding to a new state) and instantly observe how government eligibility expands or contracts.
              </p>
            </div>

            {/* Persona Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold">Baseline:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {demoPersonas.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersonaId(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      p.id === selectedPersonaId
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-muted/70 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {p.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Simulation Controls Panel (Sidebar) */}
            <div className="lg:col-span-4 rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-sm">Simulation Parameters</h3>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              {/* 1. DPIIT Recognition Toggle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">DPIIT Startup Recognition</label>
                  <span className="text-[11px] text-muted-foreground">Unlocks SISFS, 80-IAC</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDpiitRecognition('yes')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      dpiitRecognition === 'yes'
                        ? 'bg-met-500/10 border-met-500/40 text-met-600 dark:text-met-400 font-bold'
                        : 'border-border/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    ✓ Recognized
                  </button>
                  <button
                    type="button"
                    onClick={() => setDpiitRecognition('no')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      dpiitRecognition === 'no'
                        ? 'bg-notmet-500/10 border-notmet-500/40 text-notmet-600 dark:text-notmet-400 font-bold'
                        : 'border-border/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    ✕ Not Recognized
                  </button>
                </div>
              </div>

              {/* 2. Registration Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Legal Entity Structure</label>
                <select
                  value={registrationType}
                  onChange={(e) => setRegistrationType(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background/50 px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="pvt_ltd">Private Limited (Pvt Ltd)</option>
                  <option value="llp">Limited Liability Partnership (LLP)</option>
                  <option value="partnership">Registered Partnership</option>
                  <option value="proprietorship">Sole Proprietorship</option>
                  <option value="none">Not Registered Yet</option>
                </select>
              </div>

              {/* 3. Startup Stage */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Startup Stage</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background/50 px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="idea">Idea Stage</option>
                  <option value="prototype">Working Prototype</option>
                  <option value="mvp">MVP (Minimum Viable Product)</option>
                  <option value="revenue">Early Revenue</option>
                  <option value="scaling">Growth / Scaling</option>
                </select>
              </div>

              {/* 4. Entity Age Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-foreground">Entity Age</label>
                  <span className="font-semibold text-primary">{incorporationYears} Years Old</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="10"
                  step="0.2"
                  value={incorporationYears}
                  onChange={(e) => setIncorporationYears(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>New (&lt;1 yr)</span>
                  <span>2 yrs (SISFS limit)</span>
                  <span>7 yrs</span>
                  <span>10 yrs</span>
                </div>
              </div>

              {/* 5. Registered State */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Registered State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background/50 px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="Karnataka">Karnataka (Elevate Policy)</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                </select>
              </div>

              {/* 6. Annual Turnover */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-foreground">Annual Turnover</label>
                  <span className="font-semibold text-primary">{formatINR(annualTurnover)}</span>
                </div>
                <select
                  value={annualTurnover}
                  onChange={(e) => setAnnualTurnover(parseInt(e.target.value, 10))}
                  className="w-full h-10 rounded-xl border border-input bg-background/50 px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="0">₹0 (Pre-Revenue)</option>
                  <option value="1200000">₹12 Lakh</option>
                  <option value="5000000">₹50 Lakh</option>
                  <option value="20000000">₹2 Crore</option>
                  <option value="85000000">₹8.5 Crore</option>
                  <option value="300000000">₹30 Crore (Exceeds MSME/State limits)</option>
                </select>
              </div>

              {/* 7. Woman Co-founder */}
              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                <span className="font-bold text-foreground">Woman Co-Founder</span>
                <button
                  type="button"
                  onClick={() => setIsWomanFounder(isWomanFounder === 'yes' ? 'no' : 'yes')}
                  className={`px-3 py-1 rounded-lg font-semibold border transition-all ${
                    isWomanFounder === 'yes'
                      ? 'bg-accent-500/10 border-accent-500/40 text-accent-600 dark:text-accent-400'
                      : 'border-border/60 text-muted-foreground'
                  }`}
                >
                  {isWomanFounder === 'yes' ? 'Yes (Higher Subsidies)' : 'No'}
                </button>
              </div>
            </div>

            {/* Results & Delta Board (Main Section) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Narration Banner */}
              <div className="p-5 rounded-2xl border border-accent-500/30 bg-gradient-to-r from-accent-500/5 via-primary/5 to-transparent shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent-500/10 text-accent-600 dark:text-accent-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-accent-600 dark:text-accent-400 mb-1">
                      Strategic AI Impact Assessment
                    </h4>
                    <p className="text-sm font-medium text-foreground leading-relaxed">
                      {narration}
                    </p>
                  </div>
                </div>
              </div>

              {/* Before vs After Impact KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="rounded-2xl border border-border/60 shadow-xs bg-card/70">
                  <CardContent className="p-4 space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Eligible Schemes
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold line-through text-muted-foreground">
                        {summary?.baseEligibleCount ?? 0}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-primary" />
                      <span className="text-2xl font-extrabold text-met-600 dark:text-met-400">
                        {summary?.simEligibleCount ?? 0}
                      </span>
                    </div>
                    <span className="text-[11px] text-met-600 dark:text-met-400 font-semibold block">
                      {summary?.simEligibleCount >= summary?.baseEligibleCount ? '+' : ''}
                      {summary?.simEligibleCount - summary?.baseEligibleCount} Net Schemes
                    </span>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border/60 shadow-xs bg-card/70">
                  <CardContent className="p-4 space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Potential Capital Pool
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold line-through text-muted-foreground">
                        {formatINR(summary?.baseFundingMax ?? 0)}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-primary" />
                      <span className="text-2xl font-extrabold text-foreground">
                        {formatINR(summary?.simFundingMax ?? 0)}
                      </span>
                    </div>
                    <span className="text-[11px] text-met-600 dark:text-met-400 font-semibold block">
                      {summary?.fundingDeltaMax >= 0 ? '+' : ''}
                      {formatINR(summary?.fundingDeltaMax ?? 0)} Capital Delta
                    </span>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border/60 shadow-xs bg-card/70">
                  <CardContent className="p-4 space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Newly Unlocked
                    </span>
                    <p className="text-2xl font-extrabold text-met-600 dark:text-met-400 mt-1">
                      {summary?.newlyUnlockedCount ?? 0}
                    </p>
                    <span className="text-[11px] text-muted-foreground block">
                      Previously blocked opportunities
                    </span>
                  </CardContent>
                </Card>
              </div>

              {/* Scheme-by-Scheme Delta List */}
              <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <h3 className="font-bold text-base font-display">
                    Scheme-by-Scheme Eligibility Shifts
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    10 Schemes Evaluated
                  </span>
                </div>

                {loading ? (
                  <div className="py-16 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Recomputing deterministic rules...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deltas.map((item: any) => {
                      const isUnlocked = item.status === 'unlocked' || item.status === 'improved';
                      const isLost = item.status === 'lost';

                      return (
                        <div
                          key={item.scheme.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isUnlocked
                              ? 'border-met-500/30 bg-met-500/[0.03]'
                              : isLost
                              ? 'border-notmet-500/30 bg-notmet-500/[0.03]'
                              : 'border-border/60 bg-muted/20'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-foreground">
                                  {item.scheme.name}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  ({item.scheme.type})
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {item.reason || item.scheme.short_description}
                              </p>
                            </div>

                            {/* Verdict Transition Badges */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                                  item.baseVerdict === 'likely_eligible'
                                    ? 'bg-met-500/10 text-met-600'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {item.baseVerdict === 'likely_eligible' ? 'Eligible' : 'Ineligible'}
                              </span>

                              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />

                              <span
                                className={`text-[11px] px-2.5 py-0.5 rounded-md font-bold ${
                                  item.simulatedVerdict === 'likely_eligible'
                                    ? 'bg-met-500/20 text-met-600 dark:text-met-400 border border-met-500/30'
                                    : item.simulatedVerdict === 'partially_eligible'
                                    ? 'bg-unknown-500/20 text-unknown-600 border border-unknown-500/30'
                                    : 'bg-notmet-500/20 text-notmet-600 border border-notmet-500/30'
                                }`}
                              >
                                {item.simulatedVerdict === 'likely_eligible'
                                  ? 'Eligible'
                                  : item.simulatedVerdict === 'partially_eligible'
                                  ? 'Partial'
                                  : 'Ineligible'}
                              </span>

                              {isUnlocked && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-met-500 text-white font-bold animate-pulse">
                                  Unlocked!
                                </span>
                              )}
                              {isLost && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-notmet-500 text-white font-bold">
                                  Lost
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action: Add to Roadmap */}
              <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    Ready to turn this simulation into reality?
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Generate a prioritized application roadmap with effort estimates and dependency tracking.
                  </p>
                </div>
                <Link href="/roadmap">
                  <Button variant="default" size="sm" className="gap-2 shrink-0">
                    <BookmarkPlus className="w-4 h-4" />
                    Open Application Roadmap
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
