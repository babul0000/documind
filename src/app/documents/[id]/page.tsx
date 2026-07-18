'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  FileText, Calendar, Tag, Shield, Star, MessageSquare, Send, 
  ArrowRight, BookOpen, AlertCircle, ArrowLeft, Info, HelpCircle, User, Edit3,
  Award, Globe, Layers, CheckSquare, ClipboardList, TrendingUp, Sparkles,
  Clock, BarChart3, Copy, RotateCcw, Trash2, X, ChevronUp, ChevronDown
} from 'lucide-react';
import { api } from '../../../services/api';
import { PublicNavbar } from '../../../components/public/PublicNavbar';
import { PublicFooter } from '../../../components/public/PublicFooter';
import { Spinner } from '../../../components/ui/spinner';
import { useAuth } from '../../../hooks/use-auth';

interface DocumentData {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  category: string;
  tags: string[];
  summary: string;
  originalName: string;
  size: number;
  createdAt: string;
  keyInfo?: {
    documentType?: string;
    keyTopics?: string[];
    author?: string;
    creationDate?: string;
    actionItems?: string[];
    organizations?: string[];
    keyPoints?: string[];
    importantPeople?: string[];
    importantDates?: string[];
    dates?: string[];
    entities?: string[];
    confidenceScore?: number;
  };
}

interface ReviewData {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export default function PublicDocumentDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Mobile layout collapsible chat state
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // Tags states
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [editedTagsText, setEditedTagsText] = useState('');
  const [isUpdatingTags, setIsUpdatingTags] = useState(false);

  // Chat states
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [lastUserQuestion, setLastUserQuestion] = useState<string>('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    'Summarize this document',
    'Explain this in simple language',
    'What are the important points?',
    'What should I learn next?'
  ]);

  // Review states
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitStatus, setReviewSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Fetch document details from public MongoDB endpoint
  const { data: docData, isLoading: docLoading, error: docError } = useQuery({
    queryKey: ['publicDocument', id],
    queryFn: async () => {
      const res = await api.get<{ document: DocumentData }>(`/documents/public/${id}`);
      return res.document;
    },
    enabled: !!id,
  });

  // Fetch related documents in the same category
  const { data: relatedDocs = [], isLoading: relatedLoading } = useQuery({
    queryKey: ['publicRelatedDocuments', id],
    queryFn: async () => {
      const res = await api.get<{ documents: DocumentData[] }>(`/documents/public/${id}/related`);
      return res.documents;
    },
    enabled: !!docData?.category,
  });

  // Fetch document reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['documentReviews', id],
    queryFn: async () => {
      const res = await api.get<{ reviews: ReviewData[] }>(`/documents/public/${id}/reviews`);
      return res.reviews;
    },
    enabled: !!id,
  });

  // Post review mutation
  const addReviewMutation = useMutation({
    mutationFn: async (reviewPayload: { name: string; rating: number; comment: string }) => {
      return api.post(`/documents/public/${id}/reviews`, reviewPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentReviews', id] });
      setReviewName('');
      setReviewComment('');
      setReviewSubmitStatus('success');
    },
    onError: () => {
      setReviewSubmitStatus('error');
    }
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;
    setReviewSubmitStatus('loading');
    addReviewMutation.mutate({
      name: reviewName,
      rating: reviewRating,
      comment: reviewComment
    });
  };

  const handleTagsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingTags(true);
    try {
      const parsedTags = editedTagsText
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
        
      await api.put(`/documents/${id}`, { tags: parsedTags });
      queryClient.invalidateQueries({ queryKey: ['publicDocument', id] });
      setIsEditingTags(false);
    } catch (err) {
      alert('Failed to update tags.');
    } finally {
      setIsUpdatingTags(false);
    }
  };

  // SSE Chunked Streaming client chat submission
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isSendingChat) return;

    setLastUserQuestion(textToSend);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { id: Math.random().toString(), sender: 'user', text: textToSend, timestamp };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsSendingChat(true);

    try {
      const apiHistory = chatHistory.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        text: msg.text
      }));

      // Stream call
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/documents/public/${id}/chat-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textToSend, history: apiHistory })
      });

      if (!response.body) {
        throw new Error('Streaming response body missing.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponseAccumulated = '';

      // Push placeholder AI message
      const aiMsgId = Math.random().toString();
      setChatHistory((prev) => [...prev, { id: aiMsgId, sender: 'ai', text: '', timestamp }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const rawText = decoder.decode(value);
        const lines = rawText.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const dataObj = JSON.parse(line.slice(6));
              if (dataObj.type === 'chunk') {
                aiResponseAccumulated += dataObj.text;
                setChatHistory((prev) => {
                  const updated = [...prev];
                  const target = updated.find((m) => m.id === aiMsgId);
                  if (target) {
                    target.text = aiResponseAccumulated;
                  }
                  return updated;
                });
              } else if (dataObj.type === 'done') {
                if (dataObj.suggestedFollowUp) {
                  setSuggestedQuestions(dataObj.suggestedFollowUp);
                }
              }
            } catch (err) {
              // Ignore line parse discrepancies
            }
          }
        }
      }

    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { id: Math.random().toString(), sender: 'ai', text: 'Connection error. Unable to establish streaming citations.', timestamp }
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Response copied to clipboard!');
  };

  const regenerateLastMessage = () => {
    if (lastUserQuestion) {
      handleSendMessage(lastUserQuestion);
    }
  };

  const clearChatHistory = () => {
    setChatHistory([]);
  };

  const formattedDate = docData ? new Date(docData.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : '';

  const fileLabel = docData?.fileType.includes('pdf') 
    ? 'PDF' 
    : docData?.fileType.includes('word') || docData?.fileType.includes('docx') 
    ? 'DOCX' 
    : 'TXT';

  // Calculate average rating
  const averageRating = React.useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  // Derived dashboard metrics
  const complexityLevel = React.useMemo(() => {
    if (!docData) return 'Medium';
    if (docData.size > 40 * 1024) return 'High';
    if (docData.size < 10 * 1024) return 'Low';
    return 'Medium';
  }, [docData]);

  const readingTime = React.useMemo(() => {
    if (!docData) return '3 min';
    const min = Math.max(1, Math.round(docData.size / 1800));
    return `${min} min read`;
  }, [docData]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:px-8 w-full space-y-10">
        
        {/* Back navigation header */}
        <div className="flex items-center">
          <Link href="/documents">
            <button className="h-9 px-4 rounded-xl border border-border bg-card-bg text-xs font-bold text-muted hover:text-white flex items-center gap-1.5 transition-all cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Library Explorer</span>
            </button>
          </Link>
        </div>

        {/* Error Screen */}
        {docError && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-12 text-center max-w-md mx-auto flex flex-col items-center gap-4">
            <AlertCircle className="h-10 w-10 text-rose-500" />
            <div className="space-y-1.5">
              <h3 className="font-bold text-foreground">Failed to load public analysis</h3>
              <p className="text-xs text-muted">The document ID is invalid or the record has been purged.</p>
            </div>
            <Link href="/documents">
              <button className="h-9 px-5 rounded-xl bg-accent text-white text-xs font-semibold cursor-pointer">
                Return to Documents
              </button>
            </Link>
          </div>
        )}

        {/* Loading Skeletons */}
        {docLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
            <div className="lg:col-span-8 space-y-8">
              <div className="h-44 bg-card-bg border border-border rounded-2xl" />
              <div className="h-32 bg-card-bg border border-border rounded-2xl" />
              <div className="h-56 bg-card-bg border border-border rounded-2xl" />
            </div>
            <div className="lg:col-span-4 h-[600px] bg-card-bg border border-border rounded-2xl" />
          </div>
        )}

        {/* Main Workspace two column layout */}
        {docData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Document information, AI insights, and knowledge sections */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Document Header Preview Card */}
              <section className="rounded-2xl border border-border bg-card-bg p-6 relative overflow-hidden shadow-sm">
                <div className="absolute top-1/2 right-10 -translate-y-1/2 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className={`h-20 w-20 rounded-xl shrink-0 border flex flex-col items-center justify-center font-bold text-xs ${
                    fileLabel === 'PDF' ? 'bg-rose-500/5 text-rose-500 border-rose-500/20' : 
                    fileLabel === 'DOCX' ? 'bg-blue-500/5 text-blue-500 border-blue-500/20' : 
                    'bg-zinc-500/5 text-zinc-400 border-zinc-500/20'
                  }`}>
                    <FileText className="h-8 w-8 mb-1" />
                    <span>{fileLabel}</span>
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {docData.category}
                      </span>
                      <span className="text-[10px] text-muted font-bold flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formattedDate}
                      </span>
                      {reviews.length > 0 && (
                        <span className="text-[10px] text-amber-400 bg-amber-500/5 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-current" /> {averageRating} Stars
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-extrabold text-white truncate leading-tight" title={docData.title}>
                      {docData.title}
                    </h2>
                    <p className="text-xs text-zinc-500 truncate">
                      Original name: {docData.originalName} | Size: {(docData.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              </section>

              {/* AI Knowledge Insights Dashboard Section */}
              <section className="rounded-2xl border border-border bg-card-bg p-6 space-y-4 shadow-sm">
                <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 className="h-4.5 w-4.5 text-indigo-400" />
                  <span>AI Knowledge Insights</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Confidence progress */}
                  <div className="bg-[#09090b] border border-border p-4 rounded-xl space-y-2">
                    <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-extrabold">AI Confidence</span>
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                      <span>{docData.keyInfo?.confidenceScore || 92}%</span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-1.5 rounded-full" 
                        style={{ width: `${docData.keyInfo?.confidenceScore || 92}%` }}
                      />
                    </div>
                  </div>

                  {/* Complexity */}
                  <div className="bg-[#09090b] border border-border p-4 rounded-xl space-y-1">
                    <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-extrabold">Complexity Level</span>
                    <span className={`text-xs font-bold block ${
                      complexityLevel === 'High' ? 'text-rose-400' : 
                      complexityLevel === 'Medium' ? 'text-indigo-400' : 'text-emerald-400'
                    }`}>{complexityLevel} Complexity</span>
                  </div>

                  {/* Reading Time */}
                  <div className="bg-[#09090b] border border-border p-4 rounded-xl space-y-1">
                    <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-extrabold">Reading Time</span>
                    <span className="text-xs font-bold text-white block flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-zinc-500" />
                      <span>{readingTime}</span>
                    </span>
                  </div>

                  {/* Category */}
                  <div className="bg-[#09090b] border border-border p-4 rounded-xl space-y-1">
                    <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-extrabold">Category Index</span>
                    <span className="text-xs font-bold text-white capitalize block truncate">{docData.category}</span>
                  </div>
                </div>

                {/* Concepts badges list */}
                <div className="space-y-2 pt-2 border-t border-zinc-900/50">
                  <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-extrabold">Extracted concepts & Topics</span>
                  <div className="flex flex-wrap gap-1.5">
                    {docData.tags.map((tag, idx) => (
                      <span key={idx} className="text-[9px] font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-lg capitalize">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              {/* 1. Overview */}
              <section className="rounded-2xl border border-border bg-card-bg p-6 space-y-3.5 shadow-sm">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Info className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Overview</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {docData.description || 'No custom description provided for this knowledge block.'}
                </p>
              </section>

              {/* 2. Full Description */}
              <section className="rounded-2xl border border-border bg-card-bg p-6 space-y-3.5 shadow-sm">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Full Description</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                  {docData.description 
                    ? `This file contains the complete records for "${docData.title}". Classification filters mapped it to the "${docData.category}" repository directory. Below are the AI parsed summarization nodes extracted from the textual structure.`
                    : 'No detailed full description provided for this catalog index.'}
                </p>
              </section>

              {/* 3. AI Understanding (renamed from Executive Summary) */}
              <section className="rounded-2xl border border-border bg-card-bg p-6 space-y-3.5 shadow-sm">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="h-4.5 w-4.5 text-purple-400" />
                  <span>AI Understanding</span>
                </h3>
                <div className="p-4.5 rounded-xl border border-border bg-background/60 text-xs text-zinc-400 leading-relaxed whitespace-pre-line">
                  {docData.summary || 'AI analysis summary has not been processed for this index.'}
                </div>
              </section>

              {/* 4. Core Insights (renamed from Key Points) */}
              {docData.keyInfo?.keyPoints && docData.keyInfo.keyPoints.length > 0 && (
                <section className="rounded-2xl border border-border bg-card-bg p-6 space-y-3.5 shadow-sm">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="h-4.5 w-4.5 text-indigo-400" />
                    <span>Core Insights</span>
                  </h3>
                  <ul className="space-y-2">
                    {docData.keyInfo.keyPoints.map((point, idx) => (
                      <li key={idx} className="text-xs text-zinc-400 flex items-start gap-2.5 leading-relaxed">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0 mt-2" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* 5. Important Dates */}
              {docData.keyInfo?.dates && docData.keyInfo.dates.length > 0 && (
                <section className="rounded-2xl border border-border bg-card-bg p-6 space-y-3.5 shadow-sm">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="h-4.5 w-4.5 text-amber-500" />
                    <span>Important Dates</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {docData.keyInfo.dates.map((d, idx) => (
                      <span key={idx} className="text-[10px] font-semibold text-amber-400 bg-amber-500/5 border border-amber-500/10 px-2.5 py-1 rounded-md">
                        {d}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* 6. Important People */}
              {docData.keyInfo?.importantPeople && docData.keyInfo.importantPeople.length > 0 && (
                <section className="rounded-2xl border border-border bg-card-bg p-6 space-y-3.5 shadow-sm">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <User className="h-4.5 w-4.5 text-blue-500" />
                    <span>Important People</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {docData.keyInfo.importantPeople.map((p, idx) => (
                      <span key={idx} className="text-[10px] font-semibold text-blue-400 bg-blue-500/5 border border-blue-500/10 px-2.5 py-1 rounded-md">
                        {p}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* 7. Organizations */}
              {docData.keyInfo?.organizations && docData.keyInfo.organizations.length > 0 && (
                <section className="rounded-2xl border border-border bg-card-bg p-6 space-y-3.5 shadow-sm">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="h-4.5 w-4.5 text-teal-400" />
                    <span>Organizations</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {docData.keyInfo.organizations.map((org, idx) => (
                      <span key={idx} className="text-[10px] font-semibold text-teal-400 bg-teal-500/5 border border-teal-500/10 px-2.5 py-1 rounded-md">
                        {org}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* 8. Action Items */}
              {docData.keyInfo?.actionItems && docData.keyInfo.actionItems.length > 0 && (
                <section className="rounded-2xl border border-border bg-card-bg p-6 space-y-3.5 shadow-sm">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckSquare className="h-4.5 w-4.5 text-rose-500" />
                    <span>Action Items</span>
                  </h3>
                  <div className="space-y-2">
                    {docData.keyInfo.actionItems.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 bg-[#09090b] border border-border/60 p-3 rounded-xl">
                        <input type="checkbox" className="mt-1 shrink-0 accent-rose-500 h-3.5 w-3.5 cursor-pointer rounded" />
                        <span className="text-xs text-zinc-400 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 9. AI Generated Tags & Editable Tags */}
              {docData.tags && (
                <section className="rounded-2xl border border-border bg-card-bg p-6 space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Tag className="h-4.5 w-4.5 text-pink-500" />
                      <span>AI Generated Tags</span>
                    </h3>
                    {user && !isEditingTags && (
                      <button 
                        onClick={() => {
                          setEditedTagsText(docData.tags.join(', '));
                          setIsEditingTags(true);
                        }} 
                        className="text-xs text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit Tags</span>
                      </button>
                    )}
                  </div>

                  {isEditingTags ? (
                    <form onSubmit={handleTagsSubmit} className="space-y-3 pt-1">
                      <input 
                        type="text"
                        value={editedTagsText}
                        onChange={(e) => setEditedTagsText(e.target.value)}
                        className="w-full bg-[#09090b] border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none placeholder-zinc-550"
                        placeholder="NDA, legal, agreement..."
                        disabled={isUpdatingTags}
                        required
                      />
                      <div className="flex gap-2 justify-end">
                        <button 
                          type="button" 
                          onClick={() => setIsEditingTags(false)} 
                          className="h-8 px-4 rounded-lg bg-zinc-900 border border-border text-xs text-muted hover:text-white cursor-pointer"
                          disabled={isUpdatingTags}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          disabled={isUpdatingTags}
                          className="h-8 px-4 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  ) : docData.tags.length === 0 ? (
                    <p className="text-xs text-muted italic">No topics extracted.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {docData.tags.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="text-[10px] font-bold text-foreground bg-muted-bg border border-border px-2.5 py-1 rounded-md capitalize"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* 10. Metadata */}
              <section className="rounded-2xl border border-border bg-card-bg p-6 space-y-3.5 shadow-sm">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ClipboardList className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Metadata</span>
                </h3>
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted-bg/30 border-b border-border text-foreground font-bold">
                        <th className="p-3">Property</th>
                        <th className="p-3">Value</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted divide-y divide-border font-medium">
                      <tr>
                        <td className="p-3">Format</td>
                        <td className="p-3">{docData.fileType}</td>
                      </tr>
                      <tr>
                        <td className="p-3">Size</td>
                        <td className="p-3">{(docData.size / 1024).toFixed(1)} KB</td>
                      </tr>
                      <tr>
                        <td className="p-3">Upload Timestamp</td>
                        <td className="p-3">{new Date(docData.createdAt).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Knowledge Graph Connections (renamed from Related Documents) */}
              <section className="rounded-2xl border border-border bg-card-bg p-6 space-y-6 shadow-sm">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Layers className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Knowledge Connections</span>
                </h3>

                <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4">
                  {/* Visual flowchart connections */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center">
                    <div className="bg-[#09090b] border border-border p-3.5 rounded-xl w-full sm:w-1/3">
                      <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-extrabold mb-1">Current document</span>
                      <span className="text-xs font-bold text-white truncate block max-w-[130px] mx-auto">{docData.title}</span>
                    </div>
                    <div className="text-zinc-700 font-bold rotate-90 sm:rotate-0">$\rightarrow$</div>
                    <div className="bg-[#09090b] border border-border p-3.5 rounded-xl w-full sm:w-1/3">
                      <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-extrabold mb-1">Related Concept</span>
                      <span className="text-xs font-bold text-indigo-400 capitalize">{docData.category} Classification</span>
                    </div>
                    <div className="text-zinc-700 font-bold rotate-90 sm:rotate-0">$\rightarrow$</div>
                    <div className="bg-[#09090b] border border-border p-3.5 rounded-xl w-full sm:w-1/3">
                      <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-extrabold mb-1">Related Documents</span>
                      <span className="text-xs font-bold text-white">{relatedDocs.length} Connected Files</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed text-center italic">
                    AI mapped this network based on overlap in the "{docData.category}" classification category.
                  </p>
                </div>

                {/* Related Documents slider grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {relatedDocs.map((doc) => (
                    <div key={doc.id} className="rounded-xl border border-border bg-[#09090b] p-5 flex flex-col justify-between hover:border-accent/40 shadow-sm transition-all h-36">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-extrabold text-indigo-500 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {doc.category}
                        </span>
                        <h4 className="text-xs font-bold text-white line-clamp-1 truncate">{doc.title}</h4>
                        <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">{doc.description || 'No description.'}</p>
                      </div>
                      <Link href={`/documents/${doc.id}`} className="text-[10px] font-bold text-indigo-400 hover:underline flex items-center gap-1.5 mt-2">
                        <span>View Analysis</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </section>

              {/* AI Recommended Learning Path (renamed from Learning Resources) & Recommended Next Step */}
              <section className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.02] p-6 space-y-6 shadow-sm">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                  <span>AI Recommended Learning Path & Next Step</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Learning Path */}
                  <div className="bg-card-bg border border-border p-4.5 rounded-xl space-y-2">
                    <span className="block text-[9px] font-extrabold uppercase tracking-widest text-indigo-400">AI Recommended Learning Path</span>
                    <a 
                      href={`https://www.google.com/search?q=${encodeURIComponent(`${docData.category} guidelines study resources`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[10px] text-teal-400 font-bold hover:underline"
                    >
                      Search Google for {docData.category} guides $\rightarrow$
                    </a>
                  </div>
                  {/* Recommended Next Step */}
                  <div className="bg-card-bg border border-border p-4.5 rounded-xl space-y-2">
                    <span className="block text-[9px] font-extrabold uppercase tracking-widest text-amber-400">Recommended Next Step</span>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      {relatedDocs[0] 
                        ? `Open and review "${relatedDocs[0].title}" to build out context mapping.`
                        : `Upload additional documents under the category "${docData.category}" to generate followups.`}
                    </p>
                  </div>
                </div>
              </section>

              {/* 15. Reviews & Ratings */}
              <section className="rounded-2xl border border-border bg-card-bg p-6 space-y-6 shadow-sm">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Star className="h-4.5 w-4.5 text-amber-500" />
                  <span>Reviews & Ratings</span>
                </h3>

                <form onSubmit={handleReviewSubmit} className="space-y-4 border-b border-border/60 pb-6">
                  <h4 className="text-xs font-bold text-white">Add Document Rating</h4>
                  
                  {reviewSubmitStatus === 'success' && (
                    <p className="text-xs text-emerald-500 font-bold bg-emerald-500/5 border border-emerald-500/15 p-3 rounded-xl animate-in fade-in">
                      Thank you! Your rating has been logged successfully.
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">Your Name</label>
                      <input 
                        type="text" 
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="John Doe"
                        className="flex h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground placeholder-muted transition-all focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">Rating Score</label>
                      <select 
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="flex h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground transition-all focus:border-indigo-500 focus:outline-none cursor-pointer"
                      >
                        <option value={5}>5 Stars (Excellent)</option>
                        <option value={4}>4 Stars (Good)</option>
                        <option value={3}>3 Stars (Average)</option>
                        <option value={2}>2 Stars (Poor)</option>
                        <option value={1}>1 Star (Critical)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">Comment</label>
                    <textarea 
                      required
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your feedback or takeaways..."
                      className="flex w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder-muted transition-all focus:border-indigo-500 focus:outline-none resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={reviewSubmitStatus === 'loading'}
                    className="h-9 px-6 rounded-xl bg-accent text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Submit Review</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </form>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white">Recent Feedback</h4>
                  {reviewsLoading ? (
                    <div className="h-16 bg-background rounded-xl animate-pulse" />
                  ) : reviews.length === 0 ? (
                    <p className="text-xs text-muted italic">No ratings submitted yet. Be the first to add one!</p>
                  ) : (
                    <div className="space-y-4 divide-y divide-border/40">
                      {reviews.map((rev) => (
                        <div key={rev._id} className="pt-4 first:pt-0 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-xs font-bold text-white">{rev.name}</h5>
                              <p className="text-[9px] text-muted">{new Date(rev.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center text-amber-500 gap-0.5">
                              {Array.from({ length: rev.rating }).map((_, idx) => (
                                <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            {rev.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

            </div>

            {/* RIGHT COLUMN: 16. AI Chat Panel (Sticky on desktop, collapsible drawer bottom on mobile) */}
            <div className={`lg:col-span-4 rounded-2xl border border-border bg-card-bg shadow-md overflow-hidden transition-all duration-350 ${
              isMobileChatOpen 
                ? 'fixed inset-x-0 bottom-0 z-50 h-[80vh] lg:sticky lg:top-20 lg:h-[650px] lg:z-10' 
                : 'fixed inset-x-0 bottom-0 z-50 h-14 lg:sticky lg:top-20 lg:h-[650px] lg:z-10'
            }`}>
              
              {/* Header drawer toggle */}
              <div 
                onClick={() => setIsMobileChatOpen(!isMobileChatOpen)}
                className="border-b border-border p-4 bg-muted-bg/20 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
                  <div>
                    <h3 className="text-xs font-extrabold text-foreground">AI Chat Assistant</h3>
                    <p className="text-[9px] text-muted">Consult references streams</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="lg:hidden text-[9px] font-extrabold uppercase text-indigo-400">
                    {isMobileChatOpen ? 'Collapse Chat' : 'Expand Chat'}
                  </span>
                  <div className="lg:hidden text-zinc-550">
                    {isMobileChatOpen ? <ChevronDown className="h-4.5 w-4.5" /> : <ChevronUp className="h-4.5 w-4.5" />}
                  </div>
                  <div className="hidden lg:block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>

              {/* Chat Window Box (only rendered/expanded) */}
              <div className={`flex flex-col h-[calc(100%-56px)] ${!isMobileChatOpen ? 'hidden lg:flex' : 'flex'}`}>
                
                {/* 1. Chat Log window */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/20 text-xs">
                  {chatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-muted space-y-3.5 py-12">
                      <HelpCircle className="h-10 w-10 text-indigo-500/30 animate-bounce" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-xs">Grounded RAG Dialogue</h4>
                        <p className="text-[10px] text-zinc-500 max-w-[200px] mx-auto leading-relaxed">
                          Ask anything about this document. Custom suggestions are generated below.
                        </p>
                      </div>
                    </div>
                  ) : (
                    chatHistory.map((msg) => (
                      <div key={msg.id} className={`space-y-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block max-w-[85%] rounded-xl p-3.5 text-[11px] leading-relaxed text-left ${
                          msg.sender === 'user' 
                            ? 'bg-indigo-600 text-white rounded-br-none' 
                            : 'bg-muted-bg border border-border text-zinc-300 rounded-bl-none'
                        }`}>
                          <p className="whitespace-pre-line">{msg.text}</p>
                        </div>
                        <div className="flex items-center gap-2 justify-end px-1 pt-0.5 text-[8px] text-zinc-650 font-bold uppercase tracking-wider">
                          <span>{msg.timestamp}</span>
                          {msg.sender === 'ai' && msg.text.length > 0 && (
                            <button 
                              onClick={() => copyToClipboard(msg.text)}
                              className="hover:text-white transition-colors cursor-pointer"
                              title="Copy response"
                            >
                              <Copy className="h-3 w-3 inline" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}

                  {isSendingChat && (
                    <div className="flex max-w-[85%] mr-auto rounded-xl p-3.5 bg-muted-bg border border-border text-zinc-400 rounded-bl-none items-center gap-2">
                      <Spinner size="sm" />
                      <span className="text-[10px] font-semibold animate-pulse text-zinc-500">Retrieving contextual weights...</span>
                    </div>
                  )}
                </div>

                {/* 2. Suggested Queries */}
                <div className="p-4 border-t border-border bg-background/50 space-y-2.5">
                  <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-muted">
                    <span>Suggested Queries</span>
                    {chatHistory.length > 0 && (
                      <div className="flex gap-2">
                        <button onClick={regenerateLastMessage} className="hover:text-white flex items-center gap-1 cursor-pointer">
                          <RotateCcw className="h-2.5 w-2.5" /> <span>Regenerate</span>
                        </button>
                        <button onClick={clearChatHistory} className="hover:text-rose-400 flex items-center gap-1 cursor-pointer text-zinc-600">
                          <Trash2 className="h-2.5 w-2.5" /> <span>Clear</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {suggestedQuestions.slice(0, 3).map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q)}
                        disabled={isSendingChat}
                        className="w-full text-left p-2.5 rounded-xl border border-border bg-card-bg text-[10px] text-zinc-400 hover:text-white hover:bg-muted-bg transition-all cursor-pointer font-semibold leading-tight truncate"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Input Console */}
                <div className="p-4 border-t border-border bg-card-bg">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendMessage(chatInput);
                      }}
                      placeholder={isSendingChat ? 'Grounded reading...' : 'Ask the document AI...'}
                      disabled={isSendingChat}
                      className="flex-1 h-10.5 bg-background border border-border rounded-xl px-4 text-xs text-foreground placeholder-muted focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                    <button
                      onClick={() => handleSendMessage(chatInput)}
                      disabled={isSendingChat || !chatInput.trim()}
                      className="h-10.5 w-10.5 rounded-xl bg-accent text-white flex items-center justify-center shrink-0 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
