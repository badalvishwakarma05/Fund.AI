import Link from 'next/link';
import { ExternalLink, Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-display text-lg font-bold mb-2">
              Fund<span className="text-brand-500">Mate</span>
              <span className="ml-0.5 text-accent-500 text-xs font-semibold align-super">AI</span>
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              From Startup Idea to Funding Opportunity. Discover, evaluate, and apply for Indian
              government funding schemes with AI-powered eligibility analysis grounded in official documents.
            </p>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border/50 max-w-md">
              <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Disclaimer:</strong> FundMate AI is an informational tool. It does not provide
                legal or financial advice. Always verify eligibility with the official portal before
                applying. The &ldquo;Readiness Score&rdquo; measures your preparation checklist completion,
                not funding probability.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link href="/what-if" className="hover:text-foreground transition-colors">What-If Lab</Link></li>
              <li><Link href="/roadmap" className="hover:text-foreground transition-colors">Roadmap</Link></li>
              <li><Link href="/chat" className="hover:text-foreground transition-colors">Ask AI</Link></li>
              <li><Link href="/admin/review" className="hover:text-foreground transition-colors text-primary font-medium">Compliance & Rule Audit</Link></li>
            </ul>
          </div>

          {/* Official Sources */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Official Sources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="https://www.startupindia.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
                  Startup India <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://msme.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
                  MSME Portal <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://sidbi.in" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
                  SIDBI <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://www.mudra.org.in" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
                  MUDRA <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FundMate AI. Built for demonstrative purposes.</p>
          <p className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-met-500 animate-pulse" />
            All data sourced from official government portals
          </p>
        </div>
      </div>
    </footer>
  );
}
