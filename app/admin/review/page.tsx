'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  RefreshCw,
  Edit3,
  Trash2,
  Plus,
  BookOpen,
  Filter,
  Check,
  ChevronRight,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Criterion, Scheme, SchemeDocument } from '@/lib/types';

export default function AdminReviewPage() {
  const [criteria, setCriteria] = React.useState<Criterion[]>([]);
  const [schemes, setSchemes] = React.useState<Scheme[]>([]);
  const [docs, setDocs] = React.useState<SchemeDocument[]>([]);
  const [stats, setStats] = React.useState({ schemes: 0, docs: 0, criteria: 0, reviewed: 0 });
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedScheme, setSelectedScheme] = React.useState('all');
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'pending' | 'reviewed'>('all');

  // Edit / Add modal state
  const [editingCriterion, setEditingCriterion] = React.useState<Criterion | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = React.useState(false);
  const [formFields, setFormFields] = React.useState({
    scheme_id: '',
    field_checked: '',
    operator: 'eq',
    value: '',
    human_readable_text: '',
    source_quote: '',
    source_page_or_section: '',
    source_doc_id: '',
  });

  // Fetch initial data
  const fetchData = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/criteria');
      const data = await res.json();
      if (data.success) {
        setCriteria(data.criteria);
        setSchemes(data.schemes);
        setDocs(data.docs);
        setStats(data.stats);
        if (data.schemes.length > 0 && !formFields.scheme_id) {
          setFormFields((prev) => ({
            ...prev,
            scheme_id: data.schemes[0].id,
            source_doc_id: data.docs[0]?.id || '',
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load criteria:', err);
    } finally {
      setLoading(false);
    }
  }, [formFields.scheme_id]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Toggle reviewed status optimistically
  const toggleReviewed = async (criterion: Criterion) => {
    const newStatus = !criterion.reviewed_by_human;

    // Optimistic UI update
    setCriteria((prev) =>
      prev.map((c) => (c.id === criterion.id ? { ...c, reviewed_by_human: newStatus } : c))
    );
    setStats((prev) => ({
      ...prev,
      reviewed: prev.reviewed + (newStatus ? 1 : -1),
    }));

    try {
      const res = await fetch('/api/admin/criteria', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: criterion.id, reviewed: newStatus }),
      });
      const data = await res.json();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to toggle review status:', err);
      // Rollback
      fetchData();
    }
  };

  // Re-run database seeding / ingestion
  const handleReIngest = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/criteria', { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      }
    } catch (err) {
      console.error('Re-ingest failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Save edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCriterion) return;

    try {
      const res = await fetch('/api/admin/criteria', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCriterion.id,
          reviewed: true,
          updates: {
            human_readable_text: formFields.human_readable_text,
            field_checked: formFields.field_checked,
            operator: formFields.operator,
            value: formFields.value,
            source_quote: formFields.source_quote,
            source_page_or_section: formFields.source_page_or_section,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingCriterion(null);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update criterion:', err);
    }
  };

  // Create new criterion
  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/criteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formFields,
          extraction_confidence: 1.0,
          reviewed_by_human: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsNewModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to create criterion:', err);
    }
  };

  // Delete criterion
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this criterion?')) return;
    try {
      const res = await fetch(`/api/admin/criteria?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to delete criterion:', err);
    }
  };

  // Filtered criteria
  const filteredCriteria = criteria.filter((c) => {
    if (selectedScheme !== 'all' && c.scheme_id !== selectedScheme) {
      return false;
    }
    if (filterStatus === 'pending' && c.reviewed_by_human) {
      return false;
    }
    if (filterStatus === 'reviewed' && !c.reviewed_by_human) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = c.human_readable_text.toLowerCase().includes(q);
      const matchField = c.field_checked.toLowerCase().includes(q);
      const matchQuote = c.source_quote.toLowerCase().includes(q);
      const matchScheme = c.scheme_id.toLowerCase().includes(q);
      if (!matchText && !matchField && !matchQuote && !matchScheme) {
        return false;
      }
    }
    return true;
  });

  const reviewedPercentage = stats.criteria > 0 ? Math.round((stats.reviewed / stats.criteria) * 100) : 0;
  const pendingCount = stats.criteria - stats.reviewed;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Banner */}
      <div className="border-b border-border/40 bg-muted/30">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              FundMate AI
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-foreground">Compliance & Human Review Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              <Database className="w-3 h-3" /> SQLite WAL Mode
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-met-500/10 text-met-600 dark:text-met-400 font-medium">
              <ShieldCheck className="w-3 h-3" /> Zero LLM-Hallucination Guard
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-500/10 text-saffron-600 dark:text-saffron-400 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Human-in-the-Loop Audit Console
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight font-display">
              Scheme Criteria & Citation Audit
            </h1>
            <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
              All rules are extracted from official Ministry guideline PDFs and state gazettes.
              Every rule must be backed by a verbatim quote (≤25 words) and approved by a human reviewer before being marked as fully verified.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReIngest}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Re-sync Seed Data
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setFormFields({
                  scheme_id: schemes[0]?.id || 'sisfs',
                  field_checked: 'stage',
                  operator: 'in',
                  value: '["idea","prototype"]',
                  human_readable_text: '',
                  source_quote: '',
                  source_page_or_section: 'Section 1.1',
                  source_doc_id: docs[0]?.id || '',
                });
                setIsNewModalOpen(true);
              }}
              className="gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Custom Rule
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="rounded-2xl border border-border/60 shadow-sm bg-card/60 backdrop-blur-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Target Schemes
                </p>
                <p className="text-2xl font-bold font-display mt-1">{stats.schemes}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Central & State Portals</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Layers className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/60 shadow-sm bg-card/60 backdrop-blur-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Guidelines Ingested
                </p>
                <p className="text-2xl font-bold font-display mt-1">{stats.docs}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Indexed for Citations</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/60 shadow-sm bg-card/60 backdrop-blur-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Extracted Criteria
                </p>
                <p className="text-2xl font-bold font-display mt-1">{stats.criteria}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Deterministic 3-state rules</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-saffron-500/10 flex items-center justify-center text-saffron-600 dark:text-saffron-400">
                <Sparkles className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/60 shadow-sm bg-card/60 backdrop-blur-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Human Audit Status
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-display">{reviewedPercentage}%</span>
                  <span className="text-xs text-muted-foreground">
                    ({stats.reviewed}/{stats.criteria})
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-met-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${reviewedPercentage}%` }}
                  />
                </div>
              </div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  pendingCount > 0 ? 'bg-unknown-500/10 text-unknown-600' : 'bg-met-500/10 text-met-600'
                }`}
              >
                {pendingCount > 0 ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <CheckCircle2 className="w-6 h-6" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-sm mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search rule text, field, quote citation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedScheme}
                onChange={(e) => setSelectedScheme(e.target.value)}
                aria-label="Filter criteria by government scheme"
                className="h-10 rounded-xl border border-input bg-background/50 px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="all">All Schemes ({criteria.length})</option>
                {schemes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/50 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({criteria.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                filterStatus === 'pending'
                  ? 'bg-background text-unknown-600 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-unknown-500" />
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus('reviewed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                filterStatus === 'reviewed'
                  ? 'bg-background text-met-600 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-met-500" />
              Approved ({stats.reviewed})
            </button>
          </div>
        </div>

        {/* Criteria List */}
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading ingested criteria and quotes...</p>
          </div>
        ) : filteredCriteria.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-border/70 p-8">
            <ShieldCheck className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="text-base font-semibold">No criteria match your filter</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search terms or clearing the scheme filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCriteria.map((c) => {
              const scheme = schemes.find((s) => s.id === c.scheme_id);
              const confidencePercent = Math.round(c.extraction_confidence * 100);

              return (
                <div
                  key={c.id}
                  className={`rounded-2xl border p-5 transition-all duration-200 bg-card/70 hover:shadow-md ${
                    c.reviewed_by_human
                      ? 'border-border/60 hover:border-met-500/30'
                      : 'border-unknown-500/30 bg-unknown-500/[0.02] hover:border-unknown-500/50'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Main Criterion Info */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {scheme && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                            {scheme.name}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-mono">
                          {c.field_checked} {c.operator} {c.value}
                        </span>
                        {c.reviewed_by_human ? (
                          <Badge variant="met" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verified by Human
                          </Badge>
                        ) : (
                          <Badge variant="unknown" className="gap-1">
                            <Clock className="w-3 h-3" /> Needs Review
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          Confidence:{' '}
                          <strong
                            className={
                              confidencePercent >= 90
                                ? 'text-met-600 dark:text-met-400'
                                : 'text-unknown-600 dark:text-unknown-400'
                            }
                          >
                            {confidencePercent}%
                          </strong>
                        </span>
                      </div>

                      {/* Human-Readable Rule Statement */}
                      <p className="text-base font-semibold text-foreground">
                        {c.human_readable_text}
                      </p>

                      {/* Official Guideline Citation Quote Box */}
                      {c.source_quote && (
                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                            <span className="font-medium text-foreground flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-primary" />
                              Official Guideline Citation
                              {c.source_page_or_section && (
                                <span className="text-muted-foreground font-normal">
                                  — {c.source_page_or_section}
                                </span>
                              )}
                            </span>
                            {scheme?.official_url && (
                              <a
                                href={scheme.official_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 hover:text-primary transition-colors text-[11px]"
                              >
                                View Portal <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <p className="italic text-foreground/90 font-serif text-[13px] border-l-2 border-primary/50 pl-3 py-0.5">
                            &ldquo;{c.source_quote}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center lg:flex-col gap-2 shrink-0 lg:w-44 lg:items-stretch">
                      <Button
                        size="sm"
                        variant={c.reviewed_by_human ? 'outline' : 'accent'}
                        onClick={() => toggleReviewed(c)}
                        className="flex-1 text-xs gap-1.5"
                      >
                        {c.reviewed_by_human ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-met-600" />
                            Approved
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Approve Rule
                          </>
                        )}
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCriterion(c);
                            setFormFields({
                              scheme_id: c.scheme_id,
                              field_checked: c.field_checked,
                              operator: c.operator,
                              value: c.value,
                              human_readable_text: c.human_readable_text,
                              source_quote: c.source_quote,
                              source_page_or_section: c.source_page_or_section,
                              source_doc_id: c.source_doc_id,
                            });
                          }}
                          className="flex-1 text-xs text-muted-foreground hover:text-foreground gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(c.id)}
                          className="text-xs text-notmet-600 hover:text-notmet-700 hover:bg-notmet-500/10 px-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingCriterion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h3 className="text-lg font-bold">Edit Rule & Citation Quote</h3>
                <p className="text-xs text-muted-foreground">
                  Update deterministic matching rule or official citation.
                </p>
              </div>
              <button
                onClick={() => setEditingCriterion(null)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Human-Readable Rule</label>
                <Input
                  value={formFields.human_readable_text}
                  onChange={(e) =>
                    setFormFields((prev) => ({ ...prev, human_readable_text: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Field Checked</label>
                  <Input
                    value={formFields.field_checked}
                    onChange={(e) =>
                      setFormFields((prev) => ({ ...prev, field_checked: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Operator</label>
                  <select
                    value={formFields.operator}
                    onChange={(e) =>
                      setFormFields((prev) => ({ ...prev, operator: e.target.value as any }))
                    }
                    className="h-10 w-full rounded-xl border border-input bg-background/50 px-3 text-xs"
                  >
                    <option value="eq">eq (=)</option>
                    <option value="neq">neq (≠)</option>
                    <option value="gte">gte (≥)</option>
                    <option value="lte">lte (≤)</option>
                    <option value="in">in (list)</option>
                    <option value="exists">exists (boolean)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Required Value</label>
                  <Input
                    value={formFields.value}
                    onChange={(e) =>
                      setFormFields((prev) => ({ ...prev, value: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold block">Official Source Quote</label>
                  <span className="text-[11px] text-muted-foreground">
                    Words: {formFields.source_quote.trim().split(/\s+/).filter(Boolean).length}/25
                  </span>
                </div>
                <textarea
                  value={formFields.source_quote}
                  onChange={(e) =>
                    setFormFields((prev) => ({ ...prev, source_quote: e.target.value }))
                  }
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background/50 p-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="Verbatim quote from guideline document..."
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Source Page or Section</label>
                <Input
                  value={formFields.source_page_or_section}
                  onChange={(e) =>
                    setFormFields((prev) => ({
                      ...prev,
                      source_page_or_section: e.target.value,
                    }))
                  }
                  placeholder="e.g. Section 3.2, Page 4"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingCriterion(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="default">
                  Save & Approve
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Rule Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h3 className="text-lg font-bold">Add Scheme Rule</h3>
                <p className="text-xs text-muted-foreground">
                  Create a new deterministic rule tied to official scheme guidelines.
                </p>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Target Scheme</label>
                <select
                  value={formFields.scheme_id}
                  onChange={(e) =>
                    setFormFields((prev) => ({ ...prev, scheme_id: e.target.value }))
                  }
                  className="h-10 w-full rounded-xl border border-input bg-background/50 px-3 text-xs"
                >
                  {schemes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Human-Readable Rule</label>
                <Input
                  value={formFields.human_readable_text}
                  onChange={(e) =>
                    setFormFields((prev) => ({ ...prev, human_readable_text: e.target.value }))
                  }
                  placeholder="e.g. Startup must be recognized by DPIIT"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Field Checked</label>
                  <Input
                    value={formFields.field_checked}
                    onChange={(e) =>
                      setFormFields((prev) => ({ ...prev, field_checked: e.target.value }))
                    }
                    placeholder="e.g. stage"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Operator</label>
                  <select
                    value={formFields.operator}
                    onChange={(e) =>
                      setFormFields((prev) => ({ ...prev, operator: e.target.value as any }))
                    }
                    className="h-10 w-full rounded-xl border border-input bg-background/50 px-3 text-xs"
                  >
                    <option value="eq">eq (=)</option>
                    <option value="neq">neq (≠)</option>
                    <option value="gte">gte (≥)</option>
                    <option value="lte">lte (≤)</option>
                    <option value="in">in (list)</option>
                    <option value="exists">exists (boolean)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Required Value</label>
                  <Input
                    value={formFields.value}
                    onChange={(e) =>
                      setFormFields((prev) => ({ ...prev, value: e.target.value }))
                    }
                    placeholder='e.g. ["idea","prototype"]'
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold block">Official Source Quote</label>
                  <span className="text-[11px] text-muted-foreground">Max 25 words</span>
                </div>
                <textarea
                  value={formFields.source_quote}
                  onChange={(e) =>
                    setFormFields((prev) => ({ ...prev, source_quote: e.target.value }))
                  }
                  rows={2}
                  className="w-full rounded-xl border border-input bg-background/50 p-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="Verbatim quote from the guideline..."
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Source Page or Section</label>
                <Input
                  value={formFields.source_page_or_section}
                  onChange={(e) =>
                    setFormFields((prev) => ({
                      ...prev,
                      source_page_or_section: e.target.value,
                    }))
                  }
                  placeholder="e.g. Section 4.2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="default">
                  Create & Approve
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
