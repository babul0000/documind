'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  Sparkles, FileText, ArrowRight, RefreshCw, 
  HelpCircle, History, BookOpen, AlertTriangle, ChevronRight, CornerDownRight, Layers
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../hooks/use-auth';

interface RecommendationItem {
  documentId?: string;
  title: string;
  reason: string;
}

interface TopicItem {
  topic: string;
  description: string;
}

interface LearningResourceItem {
  title: string;
  description: string;
  searchQuery: string;
}

interface RecommendationData {
  _id: string;
  userRefinement: string;
  createdAt: string;
  recommendations: {
    relatedDocuments: RecommendationItem[];
    similarTopics: TopicItem[];
    learningResources: LearningResourceItem[];
    nextToRead: RecommendationItem[];
  };
}

export default function RecommendationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [refinementText, setRefinementText] = useState('');
  const [activeRecommendation, setActiveRecommendation] = useState<RecommendationData | null>(null);

  // Fetch the latest recommendation (runs the engine if empty)
  const { data: latestData, isLoading: latestLoading, error: latestError, refetch: refetchLatest } = useQuery({
    queryKey: ['latestRecommendation'],
    queryFn: async () => {
      const res = await api.get<{ recommendation: RecommendationData | null; message?: string }>('/recommendations');
      if (res.recommendation && !activeRecommendation) {
        setActiveRecommendation(res.recommendation);
      }
      return res;
    },
    enabled: !!user,
  });

  // Fetch recommendation history logs
  const { data: historyData = { history: [] }, isLoading: historyLoading } = useQuery({
    queryKey: ['recommendationHistory'],
    queryFn: async () => {
      return api.get<{ history: RecommendationData[] }>('/recommendations/history');
    },
    enabled: !!user,
  });

  // Refine recommendations mutation
  const refineMutation = useMutation({
    mutationFn: async (text: string) => {
      return api.post<{ recommendation: RecommendationData }>('/recommendations/refine', { refinement: text });
    },
    onSuccess: (res) => {
      setActiveRecommendation(res.recommendation);
      setRefinementText('');
      queryClient.invalidateQueries({ queryKey: ['latestRecommendation'] });
      queryClient.invalidateQueries({ queryKey: ['recommendationHistory'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to refine recommendations.');
    }
  });

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementText.trim()) return;
    refineMutation.mutate(refinementText);
  };

  const handleTriggerInitial = () => {
    refetchLatest();
  };

  if (!user) {
    return null;
  }

  const noDocuments = latestData?.recommendation === null && !latestLoading;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <span>AI Recommendation Engine</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">Contextual reading priority, related files grouping, and research topics compiled by AI.</p>
        </div>
      </div>

      {/* Empty state when no documents uploaded */}
      {noDocuments ? (
        <div className="rounded-2xl border border-dashed border-zinc-900 bg-zinc-955 p-16 text-center max-w-lg mx-auto space-y-4">
          <FileText className="h-12 w-12 text-zinc-700 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-300">No Recommendations Available</h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
            We need documents uploaded in your database library to build relationship linkages and target reading topics.
          </p>
          <div className="pt-2">
            <Link href="/documents/add">
              <button className="h-9 px-5 rounded-xl bg-accent text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer">
                Upload Your First Document
              </button>
            </Link>
          </div>
        </div>
      ) : latestLoading ? (
        /* Loading Skeleton pulses */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-44 bg-zinc-950/40 border border-zinc-900 rounded-2xl" />
            <div className="h-48 bg-zinc-950/40 border border-zinc-900 rounded-2xl" />
            <div className="h-48 bg-zinc-950/40 border border-zinc-900 rounded-2xl" />
          </div>
          <div className="lg:col-span-4 h-96 bg-zinc-950/40 border border-zinc-900 rounded-2xl" />
        </div>
      ) : latestError ? (
        /* Error Warning */
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-12 text-center max-w-md mx-auto flex flex-col items-center gap-4">
          <AlertTriangle className="h-10 w-10 text-rose-400" />
          <h3 className="text-sm font-bold text-white">Connection Error</h3>
          <p className="text-xs text-rose-300/80">{(latestError as Error).message || 'Failed to generate recommendations.'}</p>
          <button
            onClick={handleTriggerInitial}
            className="h-9 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Retry Calculation
          </button>
        </div>
      ) : (
        /* Main Recommendations workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Recommendations results */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* User Refinement control form */}
            <section className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Refine AI Recommendations</h3>
              <form onSubmit={handleRefineSubmit} className="flex gap-2">
                <input 
                  type="text"
                  value={refinementText}
                  onChange={(e) => setRefinementText(e.target.value)}
                  placeholder="e.g., Focus more on tax compliance / Show external data science resources..."
                  disabled={refineMutation.isPending}
                  className="flex-1 h-10.5 bg-zinc-955 border border-zinc-900 hover:border-zinc-850 focus:border-indigo-500/80 focus:outline-none rounded-xl px-4 text-xs text-white placeholder-zinc-600 transition-colors"
                />
                <button
                  type="submit"
                  disabled={refineMutation.isPending || !refinementText.trim()}
                  className="h-10.5 px-5 rounded-xl bg-accent hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  {refineMutation.isPending ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <span>Regenerate</span>
                  )}
                </button>
              </form>
              {activeRecommendation?.userRefinement && (
                <div className="text-[10px] text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl flex items-start gap-1.5 font-medium leading-relaxed">
                  <CornerDownRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-indigo-500" />
                  <div>
                    <span className="font-extrabold block uppercase tracking-wider text-[8px] text-indigo-500 mb-0.5">Active Refinement Instruction:</span>
                    <span>"{activeRecommendation.userRefinement}"</span>
                  </div>
                </div>
              )}
            </section>

            {/* 1. Related Documents */}
            {activeRecommendation?.recommendations.relatedDocuments && activeRecommendation.recommendations.relatedDocuments.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Linked Document Networks</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeRecommendation.recommendations.relatedDocuments.map((doc, idx) => (
                    <div key={idx} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between h-36 hover:border-accent/40 shadow-sm transition-all">
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-white truncate max-w-sm" title={doc.title}>{doc.title}</h4>
                        <p className="text-[10px] text-zinc-400 leading-relaxed line-clamp-2">{doc.reason}</p>
                      </div>
                      {doc.documentId ? (
                        <Link href={`/documents/${doc.documentId}`} className="text-[10px] font-bold text-indigo-400 hover:underline flex items-center gap-1.5 mt-2">
                          <span>Open Analysis</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-[9px] text-zinc-600 font-bold uppercase">Linked File Reference</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 2. Next documents to read */}
            {activeRecommendation?.recommendations.nextToRead && activeRecommendation.recommendations.nextToRead.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Recommended Next Readings</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeRecommendation.recommendations.nextToRead.map((doc, idx) => (
                    <div key={idx} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between h-36 hover:border-accent/40 shadow-sm transition-all">
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-white truncate max-w-sm" title={doc.title}>{doc.title}</h4>
                        <p className="text-[10px] text-zinc-400 leading-relaxed line-clamp-2">{doc.reason}</p>
                      </div>
                      {doc.documentId ? (
                        <Link href={`/documents/${doc.documentId}`} className="text-[10px] font-bold text-indigo-400 hover:underline flex items-center gap-1.5 mt-2">
                          <span>Open Analysis</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-[9px] text-zinc-600 font-bold uppercase">Library file reference</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3. Similar Topics */}
            {activeRecommendation?.recommendations.similarTopics && activeRecommendation.recommendations.similarTopics.length > 0 && (
              <section className="bg-zinc-950/40 border border-zinc-900 p-6 rounded-2xl space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Recurrent Conceptual Topics</span>
                </h3>
                <div className="space-y-4">
                  {activeRecommendation.recommendations.similarTopics.map((topic, idx) => (
                    <div key={idx} className="space-y-1">
                      <h4 className="text-xs font-bold text-white">{topic.topic}</h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{topic.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4. Learning Resources */}
            {activeRecommendation?.recommendations.learningResources && activeRecommendation.recommendations.learningResources.length > 0 && (
              <section className="bg-zinc-950/40 border border-zinc-900 p-6 rounded-2xl space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Suggested External Research & Learning Resources</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeRecommendation.recommendations.learningResources.map((res, idx) => (
                    <div key={idx} className="bg-zinc-955 border border-zinc-900 rounded-xl p-4 flex flex-col justify-between min-h-[140px] hover:border-zinc-800 transition-colors">
                      <div className="space-y-1">
                        <h4 className="text-[11px] font-bold text-white leading-tight">{res.title}</h4>
                        <p className="text-[10px] text-zinc-400 leading-normal">{res.description}</p>
                      </div>
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(res.searchQuery)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[9px] font-bold text-indigo-400 hover:underline flex items-center gap-1 mt-3"
                      >
                        <span>Search Topic</span>
                        <ArrowRight className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Right Column: Recommendation History */}
          <div className="lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-4 shadow-sm sticky top-20">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <History className="h-4 w-4 text-zinc-400" />
              <span>Refinement History</span>
            </h3>
            {historyLoading ? (
              <div className="h-32 bg-zinc-955 rounded-xl animate-pulse" />
            ) : historyData.history.length === 0 ? (
              <p className="text-[10px] text-zinc-500 italic">No history logged yet.</p>
            ) : (
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                {historyData.history.map((hist) => {
                  const isActive = activeRecommendation?._id === hist._id;
                  const dateStr = new Date(hist.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  });
                  
                  return (
                    <button
                      key={hist._id}
                      onClick={() => setActiveRecommendation(hist)}
                      className={`w-full text-left p-3.5 rounded-xl border text-[11px] transition-all flex items-start justify-between gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 border-indigo-600 text-white font-bold'
                          : 'bg-zinc-955 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-extrabold">
                          {dateStr}
                        </span>
                        <span className="block truncate">
                          {hist.userRefinement ? `"${hist.userRefinement}"` : 'Initial Recommendation'}
                        </span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 mt-2 text-zinc-650" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
