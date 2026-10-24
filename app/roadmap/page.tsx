'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Calendar,
  Building2,
  FileCheck2,
  Award,
  Lock,
  Unlock,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { demoPersonas } from '@/data/personas';
import type { RoadmapStep, ReadinessScore } from '@/lib/types';

export default function RoadmapPage() {
  const [selectedPersonaId, setSelectedPersonaId] = React.useState<string>(demoPersonas[0].id);
  const [steps, setSteps] = React.useState<RoadmapStep[]>([]);
  const [readinessScore, setReadinessScore] = React.useState<ReadinessScore | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  // Load roadmap data
  const fetchRoadmap = React.useCallback(async (personaId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/roadmap?profile_id=${personaId}`);
      const data = await res.json();
      if (data.success) {
        setSteps(data.steps);
        setReadinessScore(data.readinessScore);
      }
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRoadmap(selectedPersonaId);
  }, [selectedPersonaId, fetchRoadmap]);

  // Toggle step completion optimistically
  const toggleStep = async (step: RoadmapStep) => {
    const newStatus = !step.is_completed;
    setTogglingId(step.id);

    // Optimistic UI
    setSteps((prev) =>
      prev.map((s) => (s.id === step.id ? { ...s, is_completed: newStatus } : s))
    );
    if (readinessScore) {
      const newCompleted = readinessScore.completed + (newStatus ? 1 : -1);
      const newPct = Math.round((newCompleted / readinessScore.total) * 100);
      setReadinessScore({
        ...readinessScore,
        completed: newCompleted,
        outstanding: readinessScore.total - newCompleted,
        percentage: newPct,
      });
    }

    try {
      const res = await fetch('/api/roadmap', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: selectedPersonaId,
          stepId: step.id,
          isCompleted: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSteps(data.steps);
        setReadinessScore(data.readinessScore);
      }
    } catch (err) {
      console.error('Failed to update step:', err);
      fetchRoadmap(selectedPersonaId);
    } finally {
      setTogglingId(null);
    }
  };

  const handleResetRoadmap = async () => {
    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: selectedPersonaId }),
      });
      const data = await res.json();
      if (data.success) {
        setSteps(data.steps);
        setReadinessScore(data.readinessScore);
      }
    } catch (err) {
      console.error('Failed to reset roadmap:', err);
    }
  };

  const pct = readinessScore?.percentage ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-brand-500/20">
      <Header />

      <main className="flex-1 pt-20 pb-16">
        <div className="container px-4 sm:px-6 max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-1.5">
                <FileCheck2 className="w-3.5 h-3.5" />
                Prioritized Action Plan
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight font-display">
                Government Funding Application Roadmap
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5 max-w-2xl">
                A dependency-aware, sequential timeline designed to maximize your preparation and unlock central and state grants in the correct legal sequence.
              </p>
            </div>

            {/* Persona Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold">Persona:</span>
              <div className="flex items-center gap-1.5">
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
            {/* Readiness Score Card (Left Column) */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-primary" />
                    Readiness Score
                  </h3>
                  <button
                    onClick={handleResetRoadmap}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                {/* Circular Percentage Meter with 3D Depth & Glow */}
                <div className="text-center py-4 space-y-2">
                  <div className="relative inline-flex items-center justify-center">
                    {/* Ambient 3D glow aura */}
                    <div
                      className="absolute inset-2 rounded-full bg-primary/25 blur-xl -z-10 animate-pulse"
                      aria-hidden="true"
                    />

                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="52"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-muted/40"
                        fill="transparent"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="52"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={326.7}
                        strokeDashoffset={326.7 - (326.7 * pct) / 100}
                        strokeLinecap="round"
                        className="text-primary transition-all duration-700"
                        style={{ filter: 'drop-shadow(0 4px 10px hsla(226, 71%, 50%, 0.45))' }}
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-extrabold font-display text-foreground drop-shadow-sm">
                        {pct}%
                      </span>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        Ready
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-foreground pt-1">
                    {readinessScore?.completed} of {readinessScore?.total} Milestones Completed
                  </p>
                </div>

                {/* Statutory Disclaimer Alert */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-[11px] leading-relaxed text-muted-foreground flex items-start gap-2">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>Statutory Notice:</strong> The Readiness Score measures administrative preparation checklist completion, <em>not</em> guaranteed government funding approval.
                  </span>
                </div>

                {/* Category Breakdown */}
                {readinessScore?.breakdown && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Readiness by Category
                    </h4>
                    {readinessScore.breakdown.map((cat, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground text-[11px]">{cat.category}</span>
                          <span className="font-semibold text-foreground text-[11px]">
                            {cat.completed}/{cat.total}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${cat.total > 0 ? (cat.completed / cat.total) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Quick Links Card */}
              <Card className="rounded-2xl border border-border/60 bg-muted/20 p-5 space-y-3">
                <h4 className="text-xs font-bold text-foreground">Next Action Recommendations</h4>
                <p className="text-xs text-muted-foreground">
                  Complete Step 1 (DPIIT Recognition) to unlock the host incubator submission pipeline on the Startup India Seed Fund portal.
                </p>
                <Link href="/chat?scheme=sisfs">
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 mt-1">
                    <Sparkles className="w-3.5 h-3.5 text-accent-500" />
                    Ask AI: &ldquo;How to apply to SISFS?&rdquo;
                  </Button>
                </Link>
              </Card>
            </div>

            {/* Dependency-Aware Steps Timeline (Right Column) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <h3 className="font-bold text-base font-display">Sequential Action Steps</h3>
                <span className="text-xs text-muted-foreground">
                  Click a milestone to mark it completed
                </span>
              </div>

              {loading ? (
                <div className="py-20 text-center">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Loading roadmap steps...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {steps.map((step, idx) => {
                    const isCompleted = step.is_completed;
                    // Check if dependencies are completed
                    const dependenciesCompleted = step.dependency_ids.every((depId) => {
                      const dep = steps.find((s) => s.id === depId);
                      return dep ? dep.is_completed : true;
                    });

                    return (
                      <div
                        key={step.id}
                        className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                          isCompleted
                            ? 'border-met-500/30 bg-met-500/[0.02] shadow-xs'
                            : !dependenciesCompleted
                            ? 'border-border/50 bg-muted/10 opacity-75'
                            : 'border-border/80 bg-card hover:border-primary/40 shadow-xs'
                        }`}
                      >
                        <div className="p-5 sm:p-6 space-y-3">
                          {/* Step Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              {/* Checkbox Button */}
                              <button
                                type="button"
                                onClick={() => toggleStep(step)}
                                aria-label={isCompleted ? `Mark ${step.title} as incomplete` : `Mark ${step.title} as completed`}
                                className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                  isCompleted
                                    ? 'bg-met-500 text-white shadow-xs'
                                    : 'border border-input hover:border-primary bg-background text-transparent'
                                }`}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>

                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-bold text-muted-foreground">
                                    Step {idx + 1}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-semibold flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {step.estimated_effort}
                                  </span>
                                  {step.linked_scheme_ids.map((sid) => (
                                    <span
                                      key={sid}
                                      className="px-2 py-0.5 rounded-md bg-accent-500/10 text-accent-600 dark:text-accent-400 text-[11px] font-medium uppercase"
                                    >
                                      {sid}
                                    </span>
                                  ))}
                                </div>

                                <h4
                                  className={`text-base font-bold text-foreground ${
                                    isCompleted ? 'line-through text-muted-foreground' : ''
                                  }`}
                                >
                                  {step.title}
                                </h4>
                              </div>
                            </div>

                            {/* Completed Status Badge */}
                            {isCompleted ? (
                              <Badge variant="met" className="shrink-0 gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Done
                              </Badge>
                            ) : !dependenciesCompleted ? (
                              <span className="shrink-0 inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-md bg-unknown-500/10 text-unknown-600 dark:text-unknown-400 font-semibold">
                                <Lock className="w-3 h-3" /> Prerequisite Pending
                              </span>
                            ) : (
                              <Badge variant="outline" className="shrink-0 gap-1 text-muted-foreground">
                                Pending
                              </Badge>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-9">
                            {step.description}
                          </p>

                          {/* Why It Matters Callout */}
                          {step.why_it_matters && (
                            <div className="ml-9 p-3 rounded-xl bg-muted/40 border border-border/50 text-xs text-foreground/90 space-y-0.5">
                              <span className="text-[11px] uppercase font-bold text-primary block">
                                Strategic Importance
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {step.why_it_matters}
                              </p>
                            </div>
                          )}

                          {/* Footer Action */}
                          <div className="pt-2 pl-9 flex flex-wrap items-center justify-between gap-3">
                            {step.linked_document_url && (
                              <a
                                href={step.linked_document_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                              >
                                Open Official Application Portal <ExternalLink className="w-3 h-3" />
                              </a>
                            )}

                            <Button
                              variant={isCompleted ? 'outline' : 'default'}
                              size="sm"
                              onClick={() => toggleStep(step)}
                              className="text-xs h-8"
                            >
                              {isCompleted ? 'Mark Incomplete' : 'Mark as Completed'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
