'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Award,
} from 'lucide-react';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { Badge } from '@/components/ui/badge';

// Lazy load the 3D scene without blocking main thread hydration
const SplineScenePlaceholder = dynamic(
  () => import('@/components/3d/spline-scene'),
  { ssr: false }
);

interface Hero3DVisualProps {
  demoSchemes: {
    name: string;
    type: string;
    match: number;
    verdict: 'MET' | 'NOT_MET' | 'UNKNOWN';
  }[];
  demoCriteria: {
    text: string;
    verdict: 'MET' | 'NOT_MET' | 'UNKNOWN';
  }[];
}

export function Hero3DVisual({ demoSchemes, demoCriteria }: Hero3DVisualProps) {
  return (
    <div className="relative w-full flex items-center justify-center">
      {/* Background 3D Orb Scene (Lazy Loaded) */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none opacity-80 overflow-hidden">
        <SplineScenePlaceholder />
      </div>

      <CardContainer className="w-full max-w-xl" containerClassName="py-0">
        <CardBody className="relative w-full rounded-2xl border border-border/80 bg-card/85 backdrop-blur-md shadow-2xl shadow-brand-500/15 overflow-visible">
          {/* 3D Floating Badge 1: DPIIT Certified */}
          <CardItem
            translateZ="55"
            className="absolute -top-4 -left-4 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-met-500/40 shadow-lg shadow-met-500/10 text-xs font-bold text-met-600 dark:text-met-400"
          >
            <ShieldCheck className="w-4 h-4 text-met-500" />
            <span>DPIIT Recognized ✓</span>
          </CardItem>

          {/* 3D Floating Badge 2: Funding Unlocked */}
          <CardItem
            translateZ="65"
            className="absolute -bottom-4 -right-4 z-20 hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-accent-500 to-amber-500 text-white shadow-xl shadow-accent-500/25 text-xs font-bold"
          >
            <Sparkles className="w-4 h-4" />
            <span>₹50 Lakh Grant Ready</span>
          </CardItem>

          {/* Card Window Header */}
          <CardItem
            translateZ="25"
            className="w-full flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-muted/40 rounded-t-2xl"
          >
            <div className="flex gap-1.5" aria-hidden="true">
              <div className="h-3 w-3 rounded-full bg-notmet-400/80" />
              <div className="h-3 w-3 rounded-full bg-unknown-400/80" />
              <div className="h-3 w-3 rounded-full bg-met-400/80" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs text-muted-foreground font-semibold">
                Live Government Scheme Match · TechFlow Labs
              </span>
            </div>
          </CardItem>

          {/* Main Card Content */}
          <div className="p-5 space-y-3.5">
            {demoSchemes.map((scheme, i) => (
              <CardItem
                key={scheme.name}
                translateZ={30 + i * 8}
                className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-border/60 bg-background/70 hover:bg-background/90 transition-all shadow-xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs sm:text-sm font-semibold truncate text-foreground">
                      {scheme.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium shrink-0">
                      {scheme.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          scheme.verdict === 'MET'
                            ? 'bg-met-500'
                            : scheme.verdict === 'UNKNOWN'
                            ? 'bg-unknown-500'
                            : 'bg-notmet-500'
                        }`}
                        style={{ width: `${scheme.match}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-muted-foreground w-8 text-right">
                      {scheme.match}%
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-bold shrink-0 ${
                    scheme.verdict === 'MET'
                      ? 'bg-met-500/15 text-met-600 dark:text-met-400 border border-met-500/30'
                      : scheme.verdict === 'UNKNOWN'
                      ? 'bg-unknown-500/15 text-unknown-600 dark:text-unknown-400 border border-unknown-500/30'
                      : 'bg-notmet-500/15 text-notmet-600 dark:text-notmet-400 border border-notmet-500/30'
                  }`}
                >
                  {scheme.verdict === 'MET'
                    ? 'Likely Eligible'
                    : scheme.verdict === 'UNKNOWN'
                    ? 'Need Info'
                    : 'Not Eligible'}
                </span>
              </CardItem>
            ))}

            {/* Criteria Preview with translateZ depth */}
            <CardItem
              translateZ="40"
              className="w-full pt-3 border-t border-border/60"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-met-500" />
                  Criteria Check — Startup India Seed Fund
                </p>
                <span className="text-[10px] text-met-600 dark:text-met-400 font-semibold">
                  Grounded in Gazette
                </span>
              </div>
              <div className="space-y-1.5">
                {demoCriteria.slice(0, 3).map((c) => (
                  <div
                    key={c.text}
                    className="flex items-center gap-2 text-xs text-foreground/90 font-medium"
                  >
                    {c.verdict === 'MET' ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-met-500 shrink-0" />
                    ) : c.verdict === 'NOT_MET' ? (
                      <XCircle className="h-3.5 w-3.5 text-notmet-500 shrink-0" />
                    ) : (
                      <HelpCircle className="h-3.5 w-3.5 text-unknown-500 shrink-0" />
                    )}
                    <span className={c.verdict === 'NOT_MET' ? 'line-through text-muted-foreground' : ''}>
                      {c.text}
                    </span>
                  </div>
                ))}
              </div>
            </CardItem>
          </div>
        </CardBody>
      </CardContainer>
    </div>
  );
}
