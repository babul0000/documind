'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BrainCircuit, MessageSquare, Shield, Activity, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';

/**
 * Premium SaaS Landing Page for DocuMind AI.
 */
export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-zinc-100 overflow-hidden">
      {/* Header / Top Navigation */}
      <header className="flex h-20 w-full items-center justify-between px-6 md:px-12 border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md">
            <BrainCircuit className="h-5.5 w-5.5 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-wide">DocuMind AI</span>
        </div>
        
        <nav className="flex items-center gap-6">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 hover:shadow-indigo-500/10 transition-all duration-200"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 border border-zinc-700/50"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 text-center max-w-5xl mx-auto px-6">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* AI pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 text-xs font-semibold text-indigo-400 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Generation Document Intelligence</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Understand Your Documents <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Instantly with Gemini AI
            </span>
          </h1>

          <p className="mt-6 text-base md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
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
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 px-8 py-3.5 text-sm font-semibold text-zinc-300 hover:text-white transition-all duration-200"
            >
              Sign In to Your Workspace
            </Link>
          </div>
        </section>

        {/* Feature Highlights Section */}
        <section className="border-t border-zinc-900 bg-zinc-950/20 py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Supercharge your workflows</h2>
              <p className="text-sm text-zinc-500 mt-2">
                Stop wasting hours reading long documents. Let our tailored AI agents fetch context and extract actions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-zinc-900 bg-zinc-950/60 p-8 flex flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Contextual Document Chat</h3>
                <p className="text-sm text-zinc-400 leading-relaxed flex-1">
                  Ask precise questions and hold intelligent, natural dialogue with any document. Source verification guarantees contextual groundings.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-zinc-900 bg-zinc-950/60 p-8 flex flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-6">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Automated Smart Summaries</h3>
                <p className="text-sm text-zinc-400 leading-relaxed flex-1">
                  Instantly obtain professional structural summaries, bulleted takeaways, estimated topic counts, and entities lists right upon upload.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-zinc-900 bg-zinc-950/60 p-8 flex flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 mb-6">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Usage & Volume Analytics</h3>
                <p className="text-sm text-zinc-400 leading-relaxed flex-1">
                  Visualize your processed file types, overall volumes, upload timelines, and analysis health indices over real aggregation timelines.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/60 py-8 px-6 text-center text-xs text-zinc-600">
        <p>© {new Date().getFullYear()} DocuMind AI. All rights reserved. Created with Next.js and Gemini AI.</p>
      </footer>
    </div>
  );
}
