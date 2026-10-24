'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Send,
  Sparkles,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  Building2,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  Bot,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { RagSource } from '@/lib/rag/pipeline';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: RagSource[];
  timestamp: string;
  confidence?: 'high' | 'medium' | 'low';
}

const presetPrompts = [
  {
    label: 'SISFS Eligibility',
    prompt: 'Am I eligible for Startup India Seed Fund (SISFS) if incorporated 1.2 years ago?',
    schemeId: 'sisfs',
  },
  {
    label: 'DPIIT Recognition Benefits',
    prompt: 'What specific tax and procurement benefits does DPIIT recognition unlock?',
    schemeId: 'dpiit-recognition',
  },
  {
    label: 'Karnataka Elevate Seed Grant',
    prompt: 'What are the turnover and age limits for the Karnataka Elevate programme?',
    schemeId: 'karnataka-elevate',
  },
  {
    label: 'BIRAC BIG BioTech Grant',
    prompt: 'What qualifies a medical diagnostic project for the BIRAC BIG grant?',
    schemeId: 'birac-big',
  },
  {
    label: 'CGTMSE Collateral-Free Loan',
    prompt: 'Can an LLP get a loan guarantee under CGTMSE without pledging personal property?',
    schemeId: 'cgtmse',
  },
];

export default function ChatPage() {
  const searchParams = useSearchParams();
  const initialScheme = searchParams?.get('scheme') || 'all';

  const [selectedScheme, setSelectedScheme] = React.useState<string>(initialScheme);
  const [inputQuestion, setInputQuestion] = React.useState<string>('');
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello! I am your **FundMate AI Compliance Assistant**. I answer questions regarding Indian central and state funding guidelines with zero hallucinations.\n\nEvery claim I make is grounded directly in official government gazettes, scheme guidelines, or circulars. Select a scheme or ask any question below!`,
      timestamp: 'Just now',
      confidence: 'high',
    },
  ]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [openSources, setOpenSources] = React.useState<Record<string, boolean>>({});

  const chatBottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleSourceDrawer = (messageId: string) => {
    setOpenSources((prev) => ({ ...prev, [messageId]: !prev[messageId] }));
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const q = (customPrompt || inputQuestion).trim();
    if (!q || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          schemeId: selectedScheme !== 'all' ? selectedScheme : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: data.answer,
          sources: data.sources,
          confidence: data.confidence,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        if (data.sources && data.sources.length > 0) {
          setOpenSources((prev) => ({ ...prev, [assistantMsg.id]: true }));
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: 'assistant',
            text: `Unable to process query: ${data.error || 'Unknown error'}. Please try asking in a different way.`,
            timestamp: 'Just now',
            confidence: 'low',
          },
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Network error communicating with the RAG assistant. Please check connection and retry.',
          timestamp: 'Just now',
          confidence: 'low',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-20 pb-12 flex flex-col">
        <div className="container px-4 sm:px-6 max-w-5xl flex-1 flex flex-col">
          {/* Header Title & Scheme Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-border/50">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Citation-Enforced RAG
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight font-display">
                Ask FundMate AI
              </h1>
              <p className="text-xs text-muted-foreground">
                Grounded in official DPIIT, MSME, SIDBI & state startup policy texts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Scheme Focus:</span>
              <select
                value={selectedScheme}
                onChange={(e) => setSelectedScheme(e.target.value)}
                aria-label="Filter chat by specific government scheme"
                className="h-9 rounded-xl border border-input bg-background/50 px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="all">All Portals & Schemes</option>
                <option value="sisfs">Startup India Seed Fund (SISFS)</option>
                <option value="dpiit-recognition">DPIIT Startup Recognition</option>
                <option value="karnataka-elevate">Karnataka Elevate Policy</option>
                <option value="birac-big">BIRAC BIG (BioTech)</option>
                <option value="cgtmse">CGTMSE Credit Guarantee</option>
                <option value="pmegp">PMEGP Subsidy</option>
                <option value="mudra-shishu">MUDRA Loans</option>
              </select>
            </div>
          </div>

          {/* Preset Prompts Row */}
          <div className="py-3 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-border/40">
            <span className="text-xs text-muted-foreground font-semibold shrink-0">
              Suggested:
            </span>
            {presetPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedScheme(p.schemeId);
                  handleSendMessage(p.prompt);
                }}
                className="px-3 py-1 rounded-full border border-border/60 bg-muted/30 hover:bg-muted text-[11px] font-medium text-muted-foreground hover:text-foreground shrink-0 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Message Thread */}
          <div className="flex-1 py-6 space-y-6 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-primary'
                      : 'bg-gradient-to-br from-indigo-600 to-saffron-500'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div
                  className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-xs'
                      : 'bg-card border border-border/70 text-foreground shadow-xs rounded-tl-xs'
                  }`}
                >
                  {/* Markdown-like Text Formatting */}
                  <div className="space-y-2 whitespace-pre-wrap">
                    {msg.text}
                  </div>

                  {/* Sources Drawer for AI responses */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/60 space-y-2">
                      <button
                        onClick={() => toggleSourceDrawer(msg.id)}
                        className="flex items-center justify-between w-full text-xs font-semibold text-primary hover:underline"
                      >
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          Official Citations ({msg.sources.length} Verified Sources)
                        </span>
                        {openSources[msg.id] ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {openSources[msg.id] && (
                        <div className="space-y-2 pt-2 animate-in fade-in">
                          {msg.sources.map((src, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-foreground flex items-center gap-1 text-[11px]">
                                  [Source {sIdx + 1}] {src.scheme_name} — {src.section}
                                </span>
                                {src.url && (
                                  <a
                                    href={src.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] text-primary inline-flex items-center gap-0.5 hover:underline"
                                  >
                                    View Gazette <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                              <p className="italic text-foreground/90 font-serif border-l-2 border-primary/50 pl-2.5 py-0.5 text-[12px]">
                                &ldquo;{src.quote}&rdquo;
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-2 text-[10px] text-muted-foreground/80 flex items-center justify-between">
                    <span>{msg.timestamp}</span>
                    {msg.confidence && msg.sender === 'assistant' && (
                      <span className="flex items-center gap-1 text-met-600 dark:text-met-400 font-medium">
                        <ShieldCheck className="w-3 h-3" /> Citation Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 max-w-3xl mr-auto">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-saffron-500 flex items-center justify-center shrink-0 text-white shadow-xs">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="rounded-2xl rounded-tl-xs p-4 bg-card border border-border/70 text-xs text-muted-foreground flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span>Searching official guidelines and extracting citations...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="pt-2 pb-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center gap-2 p-2 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-lg"
            >
              <Input
                placeholder="Ask about scheme eligibility, documents required, turnover caps..."
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                disabled={loading}
                className="border-0 shadow-none focus-visible:ring-0 text-sm bg-transparent px-3 py-3"
              />
              <Button
                type="submit"
                size="sm"
                variant="default"
                disabled={!inputQuestion.trim() || loading}
                className="gap-1.5 rounded-xl h-10 px-4"
              >
                <span>Ask AI</span>
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-[11px] text-center text-muted-foreground mt-2">
              All answers cite official government guideline texts. Never takes legal responsibility for application outcomes.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
