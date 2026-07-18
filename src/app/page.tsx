'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, BrainCircuit, MessageSquare, Shield, Activity, 
  Zap, Sparkles, FileText, CheckCircle2, ChevronDown, Check, 
  Layers, Users, Star, BarChart3, Database, Lock, Award, ArrowRightCircle,
  HelpCircle, Compass, Upload, Search, MessageSquareCode
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/use-auth';
import { PublicNavbar } from '../components/public/PublicNavbar';
import { PublicFooter } from '../components/public/PublicFooter';
import { api } from '../services/api';

export default function Home() {
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Fetch featured public documents from MongoDB
  const { data: featuredDocuments = [] } = useQuery({
    queryKey: ['featuredPublicDocs'],
    queryFn: async () => {
      const res = await api.get<{ documents: any[] }>('/documents/public-list');
      return res.documents.slice(0, 4); // Limit to top 4 featured files
    },
  });

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const statistics = [
    { value: '2.5M+', label: 'Knowledge Blocks Parsed', icon: FileText },
    { value: '99.8%', label: 'Extraction Precision', icon: CheckCircle2 },
    { value: '15k+', label: 'Active Thinkers', icon: Users },
    { value: '< 2.4s', label: 'AI Synthesis Latency', icon: Zap },
  ];

  const features = [
    {
      title: 'Semantic Dialogue',
      desc: 'Ask precise questions and hold grounded natural conversation with your document corpus. AI verifies source snippets automatically.',
      icon: MessageSquare,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
    },
    {
      title: 'Knowledge Synthesizer',
      desc: 'Instantly extract core insights, action items, dates, and people entities upon upload, generating structured conceptual indexes.',
      icon: Zap,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
    },
    {
      title: 'Library Connections',
      desc: 'Visualize conceptual intersections, categories breakdown, and research volume graphs dynamically in your personal workspace.',
      icon: Activity,
      color: 'text-pink-500 bg-pink-500/10 border-pink-500/20'
    }
  ];

  const faqItems = [
    {
      q: 'What is an AI Knowledge Intelligence Platform?',
      a: 'Unlike simple summaries, DocuMind AI acts as a smart workspace that maps concepts across documents, suggests learning tracks, and answers grounded questions.'
    },
    {
      q: 'What file formats does the platform support?',
      a: 'We fully support PDF, DOCX, and TXT files up to 10MB. Text extractions and AI processing complete in under 5 seconds.'
    },
    {
      q: 'Is my upload data private and secure?',
      a: 'Yes, absolutely. All user libraries are strictly isolated. We implement secure database parameters and do not share document content to train public AI weights.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navbar */}
      <PublicNavbar />

      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 text-center max-w-5xl mx-auto px-6 overflow-hidden">
          {/* Glowing background highlights */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* AI Banner Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 text-xs font-semibold text-indigo-400 mb-6 animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Knowledge Intelligence Platform</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.12] max-w-4xl mx-auto">
            Understand Any Document <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              With AI Knowledge Engines
            </span>
          </h1>

          <p className="mt-6 text-sm md:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Synthesize unstructured documents into interactive knowledge structures. Ask questions, discover connections, and extract takeaways instantly.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/documents"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-95 px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:shadow-indigo-500/20 transition-all duration-200 group cursor-pointer"
            >
              <span>Explore Knowledge</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href={user ? '/documents/add' : '/login'}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-card-bg border border-border hover:bg-muted-bg px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 cursor-pointer"
            >
              Upload Document
            </Link>
          </div>
        </section>

        {/* User Journey Map Section */}
        <section className="py-12 bg-background border-t border-border/60">
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-card-bg/30 border border-border p-6.5 rounded-2xl">
              <h3 className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest text-center mb-6">The Knowledge Cycle</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center items-center">
                <div className="space-y-1">
                  <span className="text-white font-extrabold text-xs block">1. Upload Knowledge</span>
                  <span className="text-[10px] text-zinc-500 block leading-relaxed">Feed PDFs, DOCX, or TXT notes.</span>
                </div>
                <div className="text-zinc-700 hidden md:block">$\rightarrow$</div>
                <div className="space-y-1">
                  <span className="text-white font-extrabold text-xs block">2. AI Understands</span>
                  <span className="text-[10px] text-zinc-500 block leading-relaxed">Semantic themes maps automatically.</span>
                </div>
                <div className="text-zinc-700 hidden md:block">$\rightarrow$</div>
                <div className="space-y-1">
                  <span className="text-white font-extrabold text-xs block">3. Discover Insights</span>
                  <span className="text-[10px] text-zinc-500 block leading-relaxed">Instantly obtain takeaways & dates.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works workflow connections */}
        <section className="border-t border-border py-20 px-6 bg-zinc-955/20">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">System Workflow</h2>
              <p className="text-xs text-zinc-500 mt-2">
                Five pipeline layers to process, extract, and recommend knowledge paths.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6 relative">
              <div className="bg-card-bg border border-border p-5 rounded-xl flex flex-col items-center text-center space-y-3 hover-card-trigger">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
                  <Upload className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-extrabold text-white">1. Upload</h4>
                <p className="text-[10px] text-zinc-400 leading-relaxed">Direct upload or drag files securely.</p>
              </div>

              <div className="bg-card-bg border border-border p-5 rounded-xl flex flex-col items-center text-center space-y-3 hover-card-trigger">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
                  <Zap className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-extrabold text-white">2. AI Processing</h4>
                <p className="text-[10px] text-zinc-400 leading-relaxed">Gemini parses context and text indices.</p>
              </div>

              <div className="bg-card-bg border border-border p-5 rounded-xl flex flex-col items-center text-center space-y-3 hover-card-trigger">
                <div className="h-10 w-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold text-sm">
                  <Layers className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-extrabold text-white">3. Knowledge Extraction</h4>
                <p className="text-[10px] text-zinc-400 leading-relaxed">Extract dates, action checklists, and entities.</p>
              </div>

              <div className="bg-card-bg border border-border p-5 rounded-xl flex flex-col items-center text-center space-y-3 hover-card-trigger">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  <MessageSquareCode className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-extrabold text-white">4. AI Conversation</h4>
                <p className="text-[10px] text-zinc-400 leading-relaxed">Interactive streaming dialogs grounded in sources.</p>
              </div>

              <div className="bg-card-bg border border-border p-5 rounded-xl flex flex-col items-center text-center space-y-3 hover-card-trigger">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-extrabold text-white">5. Smart Recommendations</h4>
                <p className="text-[10px] text-zinc-400 leading-relaxed">Dynamically suggest next files and topics.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured public documents grid */}
        {featuredDocuments.length > 0 && (
          <section className="border-t border-border bg-card-bg/10 py-16 px-6">
            <div className="max-w-6xl mx-auto space-y-10">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Active Knowledge Repositories</h2>
                <p className="text-xs text-zinc-500 mt-2">
                  Browse and inspect document indexes already processed by our AI core.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredDocuments.map((doc: any) => {
                  const formattedDate = new Date(doc.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                  return (
                    <div 
                      key={doc.id}
                      className="bg-zinc-950 border border-border rounded-xl p-5 flex flex-col justify-between h-[235px] hover:border-accent/40 shadow-sm transition-all hover-card-trigger"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-bold text-muted">
                          <span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded capitalize text-zinc-300">
                            {doc.category}
                          </span>
                          <span>{formattedDate}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">{doc.title}</h4>
                        <p className="text-[10px] text-zinc-500 line-clamp-3 leading-relaxed">{doc.description}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-zinc-900/50 pt-3 mt-3">
                        <span className="text-[9px] text-indigo-400 font-bold flex items-center gap-1">
                          <Award className="h-3.5 w-3.5" />
                          <span>Score: {doc.keyInfo?.confidenceScore || 95}%</span>
                        </span>
                        <Link href={`/documents/${doc.id}`} className="text-[10px] font-bold text-white hover:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer">
                          <span>Inspect</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center pt-2">
                <Link href="/documents" className="text-xs font-bold text-indigo-400 hover:underline inline-flex items-center gap-1">
                  <span>Explore all document indexes</span>
                  <ArrowRightCircle className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Features list */}
        <section id="features" className="border-t border-border py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Supercharge Your Workflows</h2>
              <p className="text-sm text-zinc-500 mt-2">
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
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed flex-1">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Live stats */}
        <section className="border-t border-border bg-background py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {statistics.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="text-center space-y-2">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-2xl md:text-3xl font-extrabold text-white">{stat.value}</div>
                    <div className="text-xs text-zinc-500 font-medium">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section id="faq" className="border-t border-border bg-card-bg/20 py-20 px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
              <p className="text-sm text-zinc-500 mt-2">Have questions about DocuMind AI? We have answers.</p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div key={idx} className="rounded-xl border border-border bg-zinc-955/60 overflow-hidden transition-all">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-5 text-left text-xs font-extrabold text-white focus:outline-none"
                    >
                      <span>{item.q}</span>
                      <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-border/30 pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
