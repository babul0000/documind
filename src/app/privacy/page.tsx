'use client';

import React from 'react';
import { ShieldAlert, Key, FolderSync, Trash2 } from 'lucide-react';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <PublicNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 md:py-24 w-full space-y-12">
        {/* Header Block */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Compliance Guidelines</span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted max-w-xl mx-auto leading-relaxed">
            Effective Date: July 18, 2026. Review details about how DocuMind AI indexes, encrypts, and handles your documents.
          </p>
        </div>

        {/* Content body */}
        <div className="rounded-2xl border border-border bg-card-bg/40 p-6 md:p-10 space-y-8 shadow-sm">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5 text-indigo-500" /> Data Isolation & Multi-Tenancy
            </h2>
            <p className="text-xs text-muted leading-relaxed">
              Every document you upload is bound explicitly to your user identifier. There is no shared model training across tenant boundaries. Your documents, extracted text chunks, analysis summary records, and chat context histories are stored securely in MongoDB Atlas using access lists.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Key className="h-4.5 w-4.5 text-purple-500" /> Encrypted Storage & APIs
            </h2>
            <p className="text-xs text-muted leading-relaxed">
              All communications between your client browser and the Next.js API endpoints, and between Next.js and the Express server, are encrypted using industry-standard TLS protocols. Session variables are signed and verified dynamically to block unauthorized database lookups.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <FolderSync className="h-4.5 w-4.5 text-pink-500" /> AI LLM Processing & Groundings
            </h2>
            <p className="text-xs text-muted leading-relaxed">
              When processing document content with the Google Gemini API, we send text content in strict API-boundary containers. The content is processed under Google's enterprise confidentiality terms, meaning uploaded material is never indexed into public databases or used for baseline LLM optimization training.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Trash2 className="h-4.5 w-4.5 text-rose-500" /> Complete File Removal
            </h2>
            <p className="text-xs text-muted leading-relaxed">
              Under our privacy standards, you hold complete ownership of your library. When you select 'Delete' on a document from your dashboard, the system immediately purges the binary storage record, the extracted text chunks, the summarization cache, and all associated chat logs permanently from MongoDB.
            </p>
          </section>

          <div className="border-t border-border pt-6 text-[10px] text-muted text-center leading-relaxed">
            If you have questions regarding data storage regulations or compliance (GDPR/HIPAA compatibility), please contact our privacy compliance desk at <span className="text-indigo-500 font-semibold">privacy@documind.ai</span>.
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
