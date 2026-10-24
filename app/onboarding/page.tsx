'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  FileText,
  IndianRupee,
  Shield,
  Lightbulb,
  Check,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { demoPersonas } from '@/data/personas';
import type { StartupProfile } from '@/lib/types';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [saving, setSaving] = React.useState<boolean>(false);

  // Form State
  const [formData, setFormData] = React.useState({
    name: 'NeoVentures Technologies',
    sector: 'Agriculture & Food Processing',
    sub_sector: 'Precision AgriTech & Solar Cold Storage',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    stage: 'mvp',
    registration_type: 'pvt_ltd',
    incorporation_date: '2025-05-10',
    dpiit_recognition: 'yes',
    annual_turnover: 1500000,
    funds_raised: 500000,
    funding_needed: 4000000,
    funding_purpose: 'Prototype refinement, field validation trials, and DGCA type certification',
    prior_govt_funding: 'no',
    ip_status: 'yes',
    tech_innovation: 'IoT temperature sensors with predictive shelf-life algorithm minimizing post-harvest grain losses',
    is_woman_founder: 'yes',
    is_student: 'no',
    is_sc_st: 'no',
  });

  const handlePrefillPersona = (personaId: string) => {
    const p = demoPersonas.find((persona) => persona.id === personaId);
    if (!p) return;
    const prof = p.profile;

    setFormData({
      name: prof.name,
      sector: prof.sector.value,
      sub_sector: prof.sub_sector.value || '',
      state: prof.state.value,
      district: prof.district.value || '',
      stage: prof.stage.value,
      registration_type: prof.registration_type.value,
      incorporation_date: prof.incorporation_date.value || '2025-01-01',
      dpiit_recognition: prof.dpiit_recognition.value,
      annual_turnover: prof.annual_turnover.value || 0,
      funds_raised: prof.funds_raised_to_date.value || 0,
      funding_needed: prof.funding_needed_amount.value || 3000000,
      funding_purpose: prof.funding_purpose.value || '',
      prior_govt_funding: prof.prior_government_funding.value,
      ip_status: prof.ip_status.value,
      tech_innovation: prof.tech_innovation_nature.value || '',
      is_woman_founder: (prof.founder_demographics.value?.is_woman_founder as any) || 'no',
      is_student: (prof.founder_demographics.value?.is_student as any) || 'no',
      is_sc_st: (prof.founder_demographics.value?.is_sc_st as any) || 'no',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const profileId = `profile-${Date.now().toString(36)}`;
    const fullProfile: StartupProfile = {
      id: profileId,
      name: formData.name,
      sector: { value: formData.sector, confidence: 'user_provided' },
      sub_sector: { value: formData.sub_sector, confidence: 'user_provided' },
      state: { value: formData.state, confidence: 'user_provided' },
      district: { value: formData.district, confidence: 'user_provided' },
      stage: { value: formData.stage as any, confidence: 'user_provided' },
      registration_type: { value: formData.registration_type as any, confidence: 'user_provided' },
      incorporation_date: { value: formData.incorporation_date, confidence: 'user_provided' },
      dpiit_recognition: { value: formData.dpiit_recognition as any, confidence: 'user_provided' },
      team_size: { value: 5, confidence: 'user_provided' },
      founder_demographics: {
        value: {
          is_woman_founder: formData.is_woman_founder as any,
          is_student: formData.is_student as any,
          is_sc_st: formData.is_sc_st as any,
          founder_age: 29,
        },
        confidence: 'user_provided',
      },
      annual_turnover: { value: Number(formData.annual_turnover), confidence: 'user_provided' },
      funds_raised_to_date: { value: Number(formData.funds_raised), confidence: 'user_provided' },
      funding_needed_amount: { value: Number(formData.funding_needed), confidence: 'user_provided' },
      funding_purpose: { value: formData.funding_purpose, confidence: 'user_provided' },
      ip_status: { value: formData.ip_status as any, confidence: 'user_provided' },
      prior_government_funding: { value: formData.prior_govt_funding as any, confidence: 'user_provided' },
      tech_innovation_nature: { value: formData.tech_innovation, confidence: 'user_provided' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullProfile),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
      router.push('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-20 pb-16">
        <div className="container px-4 sm:px-6 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Startup Profile Profiler
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight font-display">
              Let&apos;s Profile Your Venture
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-lg mx-auto">
              We evaluate your exact data against official government eligibility clauses in under 1 second.
            </p>

            {/* Quick-Pick Prefill Buttons */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold">Prefill Demo:</span>
              {demoPersonas.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePrefillPersona(p.id)}
                  className="px-3 py-1 rounded-full text-xs font-medium border border-border/70 bg-card hover:bg-muted transition-colors"
                >
                  {p.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Stepper Bar */}
          <div className="flex items-center justify-between mb-8 px-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(step)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                    currentStep === step
                      ? 'bg-primary text-white shadow-md shadow-primary/30'
                      : currentStep > step
                      ? 'bg-met-500/10 text-met-600 border border-met-500/30'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {currentStep > step ? <Check className="w-4 h-4" /> : step}
                </button>
                {step < 4 && (
                  <div
                    className={`w-12 sm:w-20 h-1 mx-2 rounded-full ${
                      currentStep > step ? 'bg-met-500' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <Card className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Identity & Location */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="border-b border-border/50 pb-3">
                    <h3 className="text-base font-bold text-foreground">
                      Step 1: Company Identity & Location
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Your registered state determines eligibility for state-level seed funds and subsidies.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1">Startup / Business Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold block mb-1">Industry Sector</label>
                      <select
                        value={formData.sector}
                        onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                        className="w-full h-10 rounded-xl border border-input bg-background/50 px-3 text-xs"
                      >
                        <option value="Agriculture & Food Processing">Agriculture & AgriTech</option>
                        <option value="Healthcare & Life Sciences">Healthcare & BioTech</option>
                        <option value="Clean Technology & Renewable Energy">CleanTech / EV / Energy</option>
                        <option value="Information & Communication Technology">IT / SaaS / AI</option>
                        <option value="Manufacturing & Industrial Goods">Manufacturing / Hardware</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1">Registered State</label>
                      <select
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full h-10 rounded-xl border border-input bg-background/50 px-3 text-xs"
                      >
                        <option value="Karnataka">Karnataka</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1">Sub-Sector Specialization</label>
                    <Input
                      value={formData.sub_sector}
                      onChange={(e) => setFormData({ ...formData, sub_sector: e.target.value })}
                      placeholder="e.g. Autonomous drone pesticide spraying"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Legal & DPIIT Structure */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="border-b border-border/50 pb-3">
                    <h3 className="text-base font-bold text-foreground">
                      Step 2: Legal Structure & DPIIT Recognition
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      DPIIT recognition unlocks central grants like SISFS and Section 80-IAC tax exemption.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold block mb-1">Legal Entity Type</label>
                      <select
                        value={formData.registration_type}
                        onChange={(e) => setFormData({ ...formData, registration_type: e.target.value })}
                        className="w-full h-10 rounded-xl border border-input bg-background/50 px-3 text-xs"
                      >
                        <option value="pvt_ltd">Private Limited (Pvt Ltd)</option>
                        <option value="llp">Limited Liability Partnership (LLP)</option>
                        <option value="partnership">Registered Partnership</option>
                        <option value="proprietorship">Sole Proprietorship</option>
                        <option value="none">Not Registered</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1">Startup Stage</label>
                      <select
                        value={formData.stage}
                        onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                        className="w-full h-10 rounded-xl border border-input bg-background/50 px-3 text-xs"
                      >
                        <option value="idea">Idea Stage</option>
                        <option value="prototype">Working Prototype</option>
                        <option value="mvp">MVP (Minimum Viable Product)</option>
                        <option value="revenue">Early Revenue</option>
                        <option value="scaling">Growth / Scaling</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold block mb-1">Incorporation Date</label>
                      <Input
                        type="date"
                        value={formData.incorporation_date}
                        onChange={(e) => setFormData({ ...formData, incorporation_date: e.target.value })}
                      />
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        SISFS requires entity to be ≤ 2 years old
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1">DPIIT Recognition Certificate</label>
                      <select
                        value={formData.dpiit_recognition}
                        onChange={(e) => setFormData({ ...formData, dpiit_recognition: e.target.value })}
                        className="w-full h-10 rounded-xl border border-input bg-background/50 px-3 text-xs"
                      >
                        <option value="yes">Yes — Official Certificate Received</option>
                        <option value="no">No — Not Yet Recognized</option>
                        <option value="unknown">Pending Application / Unknown</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Financials */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="border-b border-border/50 pb-3">
                    <h3 className="text-base font-bold text-foreground">
                      Step 3: Financials & Prior Funding
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Certain schemes restrict eligibility if prior government subsidies exceed ₹10 Lakh.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold block mb-1">Annual Turnover (INR)</label>
                      <Input
                        type="number"
                        value={formData.annual_turnover}
                        onChange={(e) => setFormData({ ...formData, annual_turnover: Number(e.target.value) })}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1">Funding Amount Needed (INR)</label>
                      <Input
                        type="number"
                        value={formData.funding_needed}
                        onChange={(e) => setFormData({ ...formData, funding_needed: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1">Prior Government Grants Received?</label>
                    <select
                      value={formData.prior_govt_funding}
                      onChange={(e) => setFormData({ ...formData, prior_govt_funding: e.target.value })}
                      className="w-full h-10 rounded-xl border border-input bg-background/50 px-3 text-xs"
                    >
                      <option value="no">No prior monetary grant support</option>
                      <option value="yes">Yes — Received &gt; ₹10 Lakh from another central/state scheme</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1">Intended Funding Purpose</label>
                    <Input
                      value={formData.funding_purpose}
                      onChange={(e) => setFormData({ ...formData, funding_purpose: e.target.value })}
                      placeholder="e.g. Prototype manufacturing, field trials, and DGCA certification"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Demographics & Innovation */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="border-b border-border/50 pb-3">
                    <h3 className="text-base font-bold text-foreground">
                      Step 4: Innovation & Founder Demographics
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Special subsidies and higher grant ceilings exist for women, student, and SC/ST founders.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1">Nature of Technological Innovation</label>
                    <textarea
                      value={formData.tech_innovation}
                      onChange={(e) => setFormData({ ...formData, tech_innovation: e.target.value })}
                      rows={2}
                      className="w-full rounded-xl border border-input bg-background/50 p-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      placeholder="Explain the novel technology or business model innovation..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold block mb-1">Woman Co-Founder</label>
                      <select
                        value={formData.is_woman_founder}
                        onChange={(e) => setFormData({ ...formData, is_woman_founder: e.target.value })}
                        className="w-full h-10 rounded-xl border border-input bg-background/50 px-3 text-xs"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1">Student Founder</label>
                      <select
                        value={formData.is_student}
                        onChange={(e) => setFormData({ ...formData, is_student: e.target.value })}
                        className="w-full h-10 rounded-xl border border-input bg-background/50 px-3 text-xs"
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes (Student / PhD)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1">Patent / IP Status</label>
                      <select
                        value={formData.ip_status}
                        onChange={(e) => setFormData({ ...formData, ip_status: e.target.value })}
                        className="w-full h-10 rounded-xl border border-input bg-background/50 px-3 text-xs"
                      >
                        <option value="yes">Patent / IP Filed</option>
                        <option value="no">No IP Filed</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="gap-1.5 ml-auto"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="accent"
                    size="sm"
                    disabled={saving}
                    className="gap-1.5 ml-auto"
                  >
                    {saving ? 'Evaluating...' : 'Discover Funding Matches'}
                    <Sparkles className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
