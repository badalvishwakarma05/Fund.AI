'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  FileSearch,
  Target,
  ArrowRight,
  Shield,
  FileText,
  TrendingUp,
  Zap,
  BarChart3,
  GitBranch,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Spotlight } from '@/components/ui/spotlight';
import { Hero3DVisual } from '@/components/3d/hero-3d-visual';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── Demo Animation Data ─── */
const demoSchemes = [
  { name: 'Startup India Seed Fund', verdict: 'MET' as const, match: 92, type: 'Grant' },
  { name: 'DPIIT Recognition', verdict: 'MET' as const, match: 88, type: 'Recognition' },
  { name: 'CGTMSE', verdict: 'UNKNOWN' as const, match: 65, type: 'Guarantee' },
  { name: 'MUDRA Shishu', verdict: 'NOT_MET' as const, match: 30, type: 'Loan' },
];

const demoCriteria = [
  { text: 'Entity age ≤ 10 years', verdict: 'MET' as const },
  { text: 'DPIIT recognized', verdict: 'MET' as const },
  { text: 'Annual turnover < ₹25 Cr', verdict: 'MET' as const },
  { text: 'Incubator support letter', verdict: 'UNKNOWN' as const },
  { text: 'Previous grant recipient', verdict: 'NOT_MET' as const },
];

function VerdictIcon({ verdict }: { verdict: 'MET' | 'NOT_MET' | 'UNKNOWN' }) {
  switch (verdict) {
    case 'MET': return <CheckCircle2 className="h-4 w-4 text-met-500" />;
    case 'NOT_MET': return <XCircle className="h-4 w-4 text-notmet-500" />;
    case 'UNKNOWN': return <HelpCircle className="h-4 w-4 text-unknown-500" />;
  }
}

function VerdictBadge({ verdict }: { verdict: 'MET' | 'NOT_MET' | 'UNKNOWN' }) {
  const map = {
    MET: 'met' as const,
    NOT_MET: 'notmet' as const,
    UNKNOWN: 'unknown' as const,
  };
  const labels = { MET: 'Likely Eligible', NOT_MET: 'Not Eligible', UNKNOWN: 'Need More Info' };
  return <Badge variant={map[verdict]}>{labels[verdict]}</Badge>;
}

/* ─── Features ─── */
const features = [
  {
    icon: Target,
    title: 'AI Eligibility Checker',
    description: 'Instant eligibility analysis across 10+ government schemes with three-state verdicts: Met, Not Met, or Unknown.',
    color: 'text-brand-500',
    bg: 'bg-brand-500/10',
  },
  {
    icon: FileSearch,
    title: 'Official Document Reasoning',
    description: 'Every verdict cites the exact guideline, page number, and quote. No guesswork — grounded in real documents.',
    color: 'text-met-500',
    bg: 'bg-met-500/10',
  },
  {
    icon: Zap,
    title: 'Missing Requirement Detector',
    description: "See exactly what's blocking your application and get actionable steps to resolve each gap.",
    color: 'text-unknown-500',
    bg: 'bg-unknown-500/10',
  },
  {
    icon: GitBranch,
    title: 'What-If Simulator',
    description: '"What if I get DPIIT recognition?" Toggle scenarios and instantly see how eligibility changes across all schemes.',
    color: 'text-accent-500',
    bg: 'bg-accent-500/10',
  },
  {
    icon: BarChart3,
    title: 'Application Roadmap',
    description: 'A prioritized, dependency-aware plan — from entity registration to final application submission.',
    color: 'text-brand-400',
    bg: 'bg-brand-400/10',
  },
  {
    icon: Shield,
    title: 'Trust by Design',
    description: 'Every data point shows its source, verification date, and status. We never invent eligibility rules.',
    color: 'text-muted-foreground',
    bg: 'bg-muted',
  },
];

/* ─── How It Works ─── */
const steps = [
  {
    num: '01',
    title: 'Tell Us About Your Startup',
    description: 'Answer 5–7 quick questions — stage, sector, state, registration type. We profile your startup.',
    icon: FileText,
  },
  {
    num: '02',
    title: 'AI Matches & Checks Eligibility',
    description: 'We search official guideline documents, extract criteria, and evaluate your profile deterministically.',
    icon: Target,
  },
  {
    num: '03',
    title: 'Get Your Personalized Roadmap',
    description: "See which schemes fit, what's missing, and a step-by-step plan to get application-ready.",
    icon: TrendingUp,
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      <Header />

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
        {/* Background mesh */}
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-brand-500/5 blur-3xl" />

        {/* Aceternity 3D Ambient Spotlights */}
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="hsl(226, 71%, 50%)"
        />
        <Spotlight
          className="top-10 left-full md:-top-10"
          fill="hsl(32, 95%, 52%)"
        />

        <div className="container relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-xl"
            >
              <motion.div variants={fadeUp} custom={0}>
                <Badge variant="accent" className="mb-6 gap-1.5 py-1 px-3">
                  <Sparkles className="h-3 w-3" />
                  AI-Powered · Grounded in Official Documents
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.1] mb-6"
              >
                From Startup Idea to{' '}
                <span className="gradient-text">Funding Opportunity</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg"
              >
                Discover Indian government funding schemes, check eligibility with
                AI analysis grounded in official guidelines, and get a personalized
                roadmap to submit your application.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap items-center gap-3">
                <Link href="/onboarding">
                  <Button size="xl" className="gap-2 font-semibold">
                    Check My Eligibility
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/dashboard?demo=student-ai-founder">
                  <Button variant="outline" size="lg" className="gap-2">
                    See Demo
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>

              {/* Trust bar */}
              <motion.div
                variants={fadeUp}
                custom={4}
                className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
              >
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-met-500" />
                  Official sources only
                </span>
                <span className="flex items-center gap-1.5">
                  <FileSearch className="h-3.5 w-3.5 text-brand-500" />
                  Cited verdicts
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-accent-500" />
                  No legal claims
                </span>
              </motion.div>
            </motion.div>

            {/* Right: 3D interactive hero visual with floating badges */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative"
            >
              <Hero3DVisual demoSchemes={demoSchemes} demoCriteria={demoCriteria} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">
              How It Works
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Three steps to your funding roadmap
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground max-w-2xl mx-auto text-lg">
              No jargon, no guesswork. Tell us about your startup, and we handle the rest.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeUp}
                custom={i}
              >
                <CardContainer className="w-full h-full" containerClassName="py-0">
                  <CardBody className="relative h-full w-full rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm p-8 group hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-5">
                      <CardItem
                        translateZ="40"
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300 shadow-sm"
                      >
                        <step.icon className="h-6 w-6" />
                      </CardItem>
                      <CardItem
                        translateZ="50"
                        className="font-display text-4xl font-bold text-muted-foreground/20 group-hover:text-brand-500/30 transition-colors"
                      >
                        {step.num}
                      </CardItem>
                    </div>
                    <CardItem translateZ="30">
                      <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
                    </CardItem>
                    <CardItem translateZ="20">
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                    </CardItem>
                  </CardBody>
                </CardContainer>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FEATURES ════════════════ */}
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-accent-500 uppercase tracking-wider mb-3">
              Features
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Built for trust, designed for clarity
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Every feature is grounded in official documents, never hallucinated.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-30px' }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="h-full group hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-7">
                    <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.bg} mb-5 transition-transform duration-200 group-hover:scale-110`}>
                      <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ TRUST SECTION ════════════════ */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeUp} custom={0} className="text-center mb-12">
              <p className="text-sm font-semibold text-met-500 uppercase tracking-wider mb-3">
                Built on Trust
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Grounded, not guessed
              </h2>
            </motion.div>

            <motion.div variants={fadeUp} custom={1} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: FileSearch,
                  title: 'Every claim has a citation',
                  desc: 'Each eligibility verdict links to the exact document, section, and quote from official guidelines.',
                },
                {
                  icon: Shield,
                  title: 'Three-state honesty',
                  desc: "We never guess. If information is missing, we say \"Unknown\" and ask you — we don't fill in the blanks.",
                },
                {
                  icon: Target,
                  title: 'Deterministic evaluation',
                  desc: 'The rules engine evaluates criteria with exact logic. AI explains results; it doesn\'t decide them.',
                },
                {
                  icon: FileText,
                  title: 'Source transparency',
                  desc: 'Every scheme shows its status, deadline, source URL, and "Last verified on" date. Nothing is hidden.',
                },
              ].map((item, i) => (
                <Card key={item.title} className="group hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6 flex gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-met-500/10 shrink-0">
                      <item.icon className="h-5 w-5 text-met-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ CTA ════════════════ */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="container relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Ready to find your funding?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-lg text-muted-foreground mb-8">
              Start with 5 questions. Get matched to real government schemes in under 2 minutes.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/onboarding">
                <Button size="xl" className="gap-2 font-semibold">
                  <Sparkles className="h-5 w-5" />
                  Start Free Analysis
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} custom={3} className="mt-6 text-xs text-muted-foreground">
              No sign-up required · Demo mode available · All data from official sources
            </motion.p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
