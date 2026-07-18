'use client';

import React from 'react';
import Link from 'next/link';
import { BrainCircuit, Cpu, Shield, Users, ArrowRight } from 'lucide-react';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <PublicNavbar />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 md:py-24 space-y-20">
        {/* About Hero */}
        <section className="text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Our Mission</span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Democratizing Document Intelligence
          </h1>
          <p className="text-sm text-muted max-w-2xl mx-auto leading-relaxed">
            DocuMind AI was founded to solve a simple problem: the hours wasted digging through complex, lengthy documents. We build specialized, agentic AI modules that extract core truths instantly.
          </p>
        </section>

        {/* Core Pillars */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-border bg-card-bg p-6 space-y-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Agentic Core</h3>
            <p className="text-xs text-muted leading-relaxed">
              Instead of single-prompt calls, we invoke dedicated agentic workflows for summarization, classification, metadata indexing, and contextual question answering.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card-bg p-6 space-y-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Strict Isolation</h3>
            <p className="text-xs text-muted leading-relaxed">
              Security is not an afterthought. We build secure multi-tenant structures ensuring your documents, session tokens, and database records remain strictly private.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card-bg p-6 space-y-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Human-First Design</h3>
            <p className="text-xs text-muted leading-relaxed">
              Sleek spacing, dark/light theme adjustments, clear typography, and responsive panels prioritize your cognitive energy.
            </p>
          </div>
        </section>

        {/* Our Approach Story */}
        <section className="rounded-2xl border border-border bg-card-bg/40 p-8 md:p-12 space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            The Technology Behind DocuMind AI
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            By leveraging Google Gemini models paired with custom semantic indexing pipeline configurations, DocuMind parses text fragments from PDF and Word files. We build localized data embeddings that represent topics, action lists, and structural takeaways. When a user queries a document, we extract only the most relevant semantic sections to prevent model hallucination and provide verified, context-accurate responses.
          </p>
          <div className="pt-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-xs font-semibold text-white hover:opacity-90 transition-all"
            >
              <span>Create Your Free Account</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
