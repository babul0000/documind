'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, BrainCircuit, MessageSquare, Shield, Activity, 
  Zap, Sparkles, FileText, CheckCircle2, ChevronDown, Check, 
  Layers, Users, Star, BarChart3, Database, Lock
} from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { PublicNavbar } from '../components/public/PublicNavbar';
import { PublicFooter } from '../components/public/PublicFooter';

export default function Home() {
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const statistics = [
    { value: '2.5M+', label: 'Documents Processed', icon: FileText },
    { value: '99.8%', label: 'Extraction Precision', icon: CheckCircle2 },
    { value: '15k+', label: 'Active Researchers', icon: Users },
    { value: '< 2.4s', label: 'AI Latency', icon: Zap },
  ];

  const features = [
    {
      title: 'Contextual Document Chat',
      desc: 'Ask precise questions and hold intelligent, natural dialogue with any document. Source verification guarantees contextual groundings.',
      icon: MessageSquare,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
    },
    {
      title: 'Automated Smart Summaries',
      desc: 'Instantly obtain professional structural summaries, bulleted takeaways, estimated topic counts, and entities lists right upon upload.',
      icon: Zap,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
    },
    {
      title: 'Usage & Volume Analytics',
      desc: 'Visualize your processed file types, overall volumes, upload timelines, and analysis health indices over real aggregation timelines.',
      icon: Activity,
      color: 'text-pink-500 bg-pink-500/10 border-pink-500/20'
    }
  ];

  const capabilities = [
    { title: 'Metadata Extractor Agent', desc: 'Identifies entities, key dates, titles, and authors automatically.', icon: Database },
    { title: 'Dynamic Classification', desc: 'Auto-categorizes uploads into folders based on textual themes.', icon: Layers },
    { title: 'Contextual Grounding', desc: 'Ensures chat is completely anchored to your file text to prevent hallucination.', icon: Lock },
    { title: 'Related File Recommendation', desc: 'Suggests complementary reading and secondary files from your library.', icon: Sparkles }
  ];

  const faqItems = [
    {
      q: 'What file extensions does DocuMind AI support?',
      a: 'We fully support PDF (.pdf), Word documents (.docx), and plain text (.txt) files. File sizes up to 10MB are parsed instantly upon upload.'
    },
    {
      q: 'Is my uploaded document data secure?',
      a: 'Absolutely. We enforce transport-layer security and database-level isolation. Your documents are only accessible under your authenticated session, and we do not use your private content to train public models.'
    },
    {
      q: 'How does the Document Recommendation Agent work?',
      a: 'The recommendation engine analyzes the category, tags, and summary of your active document, matching semantic properties against other files in your library to suggest contextually relevant files.'
    },
    {
      q: 'Can I use DocuMind AI for team collaborations?',
      a: 'Yes. Our platform scales to support teams with collaborative analysis features, bulk document sharing, and unified workspace analytics.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Jenkins',
      role: 'Lead Researcher, BioTech Solutions',
      text: 'DocuMind AI transformed how we review clinical trials. Generating summaries that usually took hours now takes less than a minute.',
      rating: 5,
      avatar: 'SJ'
    },
    {
      name: 'Marcus Vance',
      role: 'Principal Software Architect',
      text: 'The API integration is clean, and the contextual grounding makes the chat workspace incredibly reliable. No hallucinations whatsoever.',
      rating: 5,
      avatar: 'MV'
    },
    {
      name: 'Elena Rostova',
      role: 'Senior Legal Advisor',
      text: 'Having our contracts classified and tagged automatically saves our team massive administrative overhead weekly. Spacing and speed are unmatched.',
      rating: 5,
      avatar: 'ER'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* 1. Navbar */}
      <PublicNavbar />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 text-center max-w-5xl mx-auto px-6 overflow-hidden">
          {/* Glowing Ambience */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* AI Banner Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 text-xs font-semibold text-indigo-500 dark:text-indigo-400 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Generation Document Intelligence</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15] max-w-4xl mx-auto">
            Understand Your Documents <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Instantly with Gemini AI
            </span>
          </h1>

          <p className="mt-6 text-sm md:text-base text-muted max-w-2xl mx-auto leading-relaxed">
            Upload PDFs, Word files, or plain text, and let DocuMind AI extract summary insights, key topics, action items, and discuss details contextually in seconds.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={user ? '/dashboard' : '/register'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-95 px-8 py-3.5 text-sm font-semibold text-white shadow-lg hover:shadow-indigo-500/20 transition-all duration-200 group"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-card-bg border border-border hover:bg-muted-bg px-8 py-3.5 text-sm font-semibold text-foreground transition-all duration-200"
            >
              Sign In to Workspace
            </Link>
          </div>

          {/* Interactive dropzone mock for visual illustration */}
          <div className="mt-16 max-w-3xl mx-auto rounded-2xl border border-border bg-card-bg/50 p-8 shadow-xl backdrop-blur-xl">
            <div className="border border-dashed border-border rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
              <BrainCircuit className="h-10 w-10 text-indigo-500 animate-pulse" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">Drop document here to analyze</p>
                <p className="text-xs text-muted">Supports PDF, DOCX or TXT files up to 10MB</p>
              </div>
              <Link 
                href={user ? '/dashboard/documents/add' : '/register'}
                className="mt-2 text-xs font-bold text-indigo-500 hover:underline inline-flex items-center gap-1"
              >
                <span>Upload a sample file</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Features Section */}
        <section id="features" className="border-t border-border bg-card-bg/20 py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Supercharge Your Workflows</h2>
              <p className="text-sm text-muted mt-2">
                Stop wasting hours reading long documents. Let our tailored AI agents fetch context and extract actions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="rounded-2xl border border-border bg-card-bg p-8 flex flex-col hover:border-accent/40 hover:-translate-y-1 transition-all duration-300 shadow-md">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${feature.color} mb-6`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-xs text-muted leading-relaxed flex-1">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. How It Works Section */}
        <section id="how-it-works" className="border-t border-border py-20 px-6 bg-background">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">How It Works</h2>
              <p className="text-sm text-muted mt-2">
                Get started with automated insights in three simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center p-6 relative">
                <div className="h-12 w-12 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center font-bold text-indigo-500 text-lg mb-4">
                  1
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">Upload Files</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Drag and drop documents directly into your secure workspace. PDF, Word, and text files are processed instantly.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center p-6 relative">
                <div className="h-12 w-12 rounded-full bg-purple-500/10 border border-purple-500/25 flex items-center justify-center font-bold text-purple-500 text-lg mb-4">
                  2
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">Automated Extraction</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Gemini agents automatically parse, summarize, extract metadata properties, and classify document themes.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center p-6 relative">
                <div className="h-12 w-12 rounded-full bg-pink-500/10 border border-pink-500/25 flex items-center justify-center font-bold text-pink-500 text-lg mb-4">
                  3
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">Chat & Query</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Interact with your documents using natural dialogue. Ask questions and get instant, grounded source answers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. AI Capabilities Section */}
        <section className="border-t border-border bg-card-bg/20 py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">Agentic Capabilities</span>
                <h2 className="text-2xl md:text-4xl font-extrabold text-foreground mt-2 leading-tight">
                  Powered by Gemini-1.5 AI Core
                </h2>
                <p className="text-sm text-muted mt-4 leading-relaxed">
                  DocuMind AI uses specialized AI agents that collaborate to catalog and explain complex files. Experience accurate context-grounding with source tracebacks.
                </p>
                <div className="mt-6 space-y-3.5">
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Zero training required</h4>
                      <p className="text-[11px] text-muted">Upload and chat instantly without training complex indexing modules.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">100% Client Isolation</h4>
                      <p className="text-[11px] text-muted">Documents are parsed on isolation lines, preventing data leakage.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {capabilities.map((cap, i) => {
                  const Icon = cap.icon;
                  return (
                    <div key={i} className="p-5 rounded-2xl border border-border bg-card-bg shadow-sm">
                      <Icon className="h-5 w-5 text-indigo-500 mb-3" />
                      <h4 className="text-xs font-bold text-foreground mb-1.5">{cap.title}</h4>
                      <p className="text-[11px] text-muted leading-relaxed">{cap.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 6. Statistics Section */}
        <section className="border-t border-border py-16 bg-background">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {statistics.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="text-center space-y-2 p-4">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-3xl font-extrabold text-foreground tracking-tight">{stat.value}</div>
                    <div className="text-xs font-semibold text-muted">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7. Testimonials Section */}
        <section className="border-t border-border bg-card-bg/20 py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Loved by Researchers and Teams</h2>
              <p className="text-sm text-muted mt-2">
                See how DocuMind AI is helping teams stay productive and extract values.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((test, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card-bg p-6 flex flex-col justify-between shadow-sm">
                  <div className="space-y-4">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: test.rating }).map((_, idx) => (
                        <Star key={idx} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-muted italic leading-relaxed">
                      "{test.text}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 border-t border-border pt-4 mt-6">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white font-bold text-xs">
                      {test.avatar}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground leading-tight">{test.name}</h4>
                      <p className="text-[10px] text-muted">{test.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. FAQ Section */}
        <section id="faq" className="border-t border-border py-20 px-6 bg-background">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Frequently Asked Questions</h2>
              <p className="text-sm text-muted mt-2">
                Have questions? We have answers.
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, i) => {
                const isOpen = activeFaq === i;
                return (
                  <div key={i} className="border border-border rounded-xl bg-card-bg/40 overflow-hidden">
                    <button
                      onClick={() => toggleFaq(i)}
                      className="w-full flex items-center justify-between p-5 text-left font-bold text-xs md:text-sm text-foreground hover:bg-muted-bg transition-colors"
                    >
                      <span>{item.q}</span>
                      <ChevronDown className={`h-4 w-4 text-muted transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs text-muted leading-relaxed border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 9. Call to Action Section */}
        <section className="border-t border-border bg-gradient-to-r from-indigo-950/20 via-purple-950/15 to-transparent py-20 px-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center space-y-6 relative">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              Ready to Accelerate Your Document Research?
            </h2>
            <p className="text-sm text-muted max-w-xl mx-auto leading-relaxed">
              Join thousands of researchers, developers, and analysts who use DocuMind AI to extract smart document insights instantly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href={user ? '/dashboard' : '/register'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:opacity-95 transition-all duration-200"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-border bg-card-bg hover:bg-muted-bg px-8 py-3.5 text-sm font-semibold text-foreground transition-all duration-200"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 10. Footer */}
      <PublicFooter />
    </div>
  );
}

