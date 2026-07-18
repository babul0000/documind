'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';

export default function BlogPage() {
  const blogs = [
    {
      title: 'How Gemini 1.5 Pro Powers Accurate RAG Operations',
      desc: 'Discover how Google Gemini 1.5 Pro models process deep document context lengths to prevent chat hallucinations compared to classic vector database retrieval pipelines.',
      date: 'July 14, 2026',
      author: 'A. Miller',
      readTime: '6 min read',
      tag: 'Technology',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'Protecting Corporate Document Privacy in SaaS Integrations',
      desc: 'A breakdown of network security, database isolation, and policy boundaries that companies must establish when integrating AI document readers into corporate folders.',
      date: 'June 29, 2026',
      author: 'S. Patel',
      readTime: '5 min read',
      tag: 'Security',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Simplifying Academic Literature Review with Agentic AI',
      desc: 'How research workflows can use collaborative summaries, automated classification tagging, and smart recommendation sub-agents to digest hundreds of journal publications.',
      date: 'May 18, 2026',
      author: 'Prof. L. Zhao',
      readTime: '8 min read',
      tag: 'Research',
      color: 'from-blue-500 to-indigo-500'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <PublicNavbar />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 md:py-24 w-full space-y-16">
        {/* Header Block */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">SaaS Publication</span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            The DocuMind AI Blog
          </h1>
          <p className="text-sm text-muted max-w-xl mx-auto leading-relaxed">
            Latest announcements, technology details, and best practices covering agentic LLM structures, compliance, and cognitive workflows.
          </p>
        </div>

        {/* Featured Blog */}
        <section className="rounded-2xl border border-border bg-card-bg/40 p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-md">
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-500 dark:text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Featured Post</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground hover:text-indigo-500 transition-colors">
              <a href="#">The Rise of Collaborative Document Agents in Corporate Environments</a>
            </h2>
            <p className="text-xs text-muted leading-relaxed">
              Classical search indexes are failing under complex, unstructured PDF tables and manuals. We analyze how multi-agent teams solve this issue by executing sequential classification, metadata tagging, and context queries.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-muted pt-2">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Aug 12, 2026</span>
              <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Marcus Jenkins</span>
            </div>
          </div>
          <div className="md:col-span-5 h-48 md:h-64 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-90 relative flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-white/40" />
          </div>
        </section>

        {/* Article Grid */}
        <section className="space-y-6">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span>Recent Publications</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog, i) => (
              <article key={i} className="rounded-2xl border border-border bg-card-bg flex flex-col justify-between overflow-hidden shadow-sm hover:border-accent/40 transition-colors duration-300">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-indigo-500 uppercase tracking-wider">{blog.tag}</span>
                    <span className="text-muted">{blog.readTime}</span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground leading-snug hover:text-indigo-500 transition-colors">
                    <a href="#">{blog.title}</a>
                  </h4>
                  <p className="text-xs text-muted leading-relaxed">
                    {blog.desc}
                  </p>
                </div>
                <div className="border-t border-border px-6 py-4 flex items-center justify-between mt-auto bg-muted-bg/10">
                  <span className="text-[10px] text-muted">{blog.date}</span>
                  <a href="#" className="text-xs font-bold text-indigo-500 hover:text-indigo-600 inline-flex items-center gap-1">
                    <span>Read Article</span>
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
