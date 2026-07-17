'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  BrainCircuit,
  Calendar,
  Layers,
  Sparkles,
  ClipboardList,
  ChevronLeft,
  BookOpen,
} from 'lucide-react';
import { api } from '../../../services/api';
import { Document } from '../../../types';
import { useFiles } from '../../../hooks/use-files';
import { ChatWindow } from '../../../components/dashboard/chat-window';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Tabs } from '../../../components/ui/tabs';
import { formatBytes } from '../../../utils/format';

/**
 * Main workspace that loads files, lets the user choose which document to review,
 * and splits into dynamic preview and AI chat columns.
 */
function ChatWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const docId = searchParams.get('docId');
  const { documents, loading: loadingDocs } = useFiles();
  const [activeTab, setActiveTab] = useState('summary');

  // Fetch individual document details including summary and text content
  const { data: documentData, isLoading: loadingDocDetails } = useQuery({
    queryKey: ['document', docId],
    queryFn: async () => {
      if (!docId) return null;
      const res = await api.get<{ document: Document }>(`/documents/${docId}`);
      return res.document;
    },
    enabled: !!docId,
  });

  const activeDoc = documentData || documents.find((d) => d.id === docId);

  // Tab configurations
  const tabs = [
    { id: 'summary', label: 'AI Summary Outline', icon: <BrainCircuit className="h-4 w-4" /> },
    { id: 'insights', label: 'Extracted Details', icon: <ClipboardList className="h-4 w-4" /> },
    { id: 'context', label: 'Document Raw Text', icon: <BookOpen className="h-4 w-4" /> },
  ];

  // If no document ID is active in query parameters, list ready documents to open
  if (!docId) {
    const readyDocs = documents.filter((d) => d.status === 'completed');

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">AI Document Workspace</h2>
          <p className="text-xs text-zinc-500 mt-1">Select an analyzed document from the list below to begin discussing details with the AI assistant.</p>
        </div>

        {loadingDocs ? (
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/20 p-12 text-center flex flex-col items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-zinc-650" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-xs text-zinc-500 font-semibold">Loading documents list...</span>
          </div>
        ) : readyDocs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-900 bg-zinc-950/25 p-12 text-center">
            <FileText className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
            <h4 className="text-sm font-bold text-zinc-300">No ready documents</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto mb-6">
              You must upload a document and wait for the status to show &apos;Ready&apos; before starting a chat workspace session.
            </p>
            <Button onClick={() => router.push('/dashboard')} variant="outline" size="sm">
              Upload Files
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readyDocs.map((doc) => (
              <Card
                key={doc.id}
                onClick={() => router.push(`/dashboard/chat?docId=${doc.id}`)}
                className="hover:border-zinc-755 hover:bg-zinc-900/20 cursor-pointer transition-all duration-200"
              >
                <CardContent className="p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-indigo-400">
                      <FileText className="h-5.5 w-5.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate max-w-[200px]">{doc.originalName}</h4>
                      <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">{formatBytes(doc.size)}</p>
                    </div>
                  </div>
                  <ChevronLeft className="h-5 w-5 text-zinc-650 rotate-180" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-140px)] max-w-[1600px] mx-auto overflow-hidden">
      {/* LEFT COLUMN: Document Inspector */}
      <div className="flex-1 flex flex-col min-w-0 rounded-2xl border border-zinc-900 bg-zinc-950/20 overflow-hidden">
        {/* Document Header details */}
        <div className="px-6 py-4 border-b border-zinc-900 bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/chat')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-950 text-zinc-500 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">{activeDoc?.originalName}</h3>
              <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                {activeDoc?.keyInfo?.documentType || 'Document'} • {activeDoc ? formatBytes(activeDoc.size) : ''}
              </p>
            </div>
          </div>

          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Dynamic Tab Panel content */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-zinc-350 leading-relaxed font-medium">
          {loadingDocDetails ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <svg className="animate-spin h-5 w-5 text-zinc-700" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-xs text-zinc-500">Retrieving content...</span>
            </div>
          ) : (
            <>
              {activeTab === 'summary' && (
                <div className="space-y-4 whitespace-pre-line text-zinc-300">
                  {activeDoc?.summary ? (
                    <div className="prose prose-invert max-w-none">
                      {activeDoc.summary}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-zinc-500">
                      No summary available. AI processing may still be in progress.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'insights' && (
                <div className="space-y-6">
                  {activeDoc?.keyInfo ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Suggested Title */}
                        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-2">
                            <Sparkles className="h-3.5 w-3.5" /> Suggested Document Title
                          </span>
                          <p className="text-sm font-semibold text-white">{activeDoc.keyInfo.suggestedTitle || 'Not identified'}</p>
                        </div>
                        {/* Document Type */}
                        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-2">
                            <Layers className="h-3.5 w-3.5" /> Document Category
                          </span>
                          <p className="text-sm font-semibold text-white">{activeDoc.keyInfo.documentType || 'Not identified'}</p>
                        </div>
                      </div>

                      {/* Key Topics */}
                      {activeDoc.keyInfo.keyTopics && activeDoc.keyInfo.keyTopics.length > 0 && (
                        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Key Topics & Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            {activeDoc.keyInfo.keyTopics.map((topic, i) => (
                              <span key={i} className="rounded-lg bg-zinc-900 border border-zinc-850 px-2.5 py-1 text-xs text-zinc-300 font-semibold">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Important Dates */}
                      {activeDoc.keyInfo.dates && activeDoc.keyInfo.dates.length > 0 && (
                        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 mb-3">
                            <Calendar className="h-4 w-4 text-purple-400" /> Mentioned Dates
                          </h4>
                          <ul className="list-disc list-inside space-y-1.5 text-xs font-semibold text-zinc-300">
                            {activeDoc.keyInfo.dates.map((date, i) => (
                              <li key={i}>{date}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action Items */}
                      {activeDoc.keyInfo.actionItems && activeDoc.keyInfo.actionItems.length > 0 && (
                        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 mb-3">
                            <ClipboardList className="h-4 w-4 text-indigo-400" /> Action Items & Tasks
                          </h4>
                          <ul className="list-disc list-inside space-y-1.5 text-xs font-semibold text-zinc-300">
                            {activeDoc.keyInfo.actionItems.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 text-zinc-500">
                      No extracted metadata insights found.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'context' && (
                <div className="space-y-4">
                  <div className="bg-zinc-950/60 rounded-xl p-5 border border-zinc-900 font-mono text-xs text-zinc-400 h-[380px] overflow-y-auto whitespace-pre-wrap select-all">
                    {activeDoc?.textContent || 'No readable text content extracted.'}
                  </div>
                  <p className="text-[10px] text-zinc-650 font-bold uppercase tracking-wider text-right">Double-click text block to select all</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: AI Chat Window */}
      <div className="w-full xl:w-[480px] shrink-0 h-full flex flex-col">
        <ChatWindow documentId={docId} />
      </div>
    </div>
  );
}

/**
 * Suspense wrapper for Next.js app queries.
 */
export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full w-full items-center justify-center p-12 bg-[#050505] text-zinc-400">
        <div className="flex flex-col items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-zinc-700" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Mounting workspace...</span>
        </div>
      </div>
    }>
      <ChatWorkspace />
    </Suspense>
  );
}
