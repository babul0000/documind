'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  FileText, Calendar, Tag, Shield, Star, MessageSquare, Send, 
  ArrowRight, BookOpen, AlertCircle, ArrowLeft, Info, HelpCircle
} from 'lucide-react';
import { api } from '../../../services/api';
import { PublicNavbar } from '../../../components/public/PublicNavbar';
import { PublicFooter } from '../../../components/public/PublicFooter';
import { Spinner } from '../../../components/ui/spinner';

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
  sender: 'user' | 'ai';
  text: string;
}

export default function PublicDocumentDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  // Chat states
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    'What is the core objective of this document?',
    'Summarize the key action items.',
    'Are there any notable entities mentioned?'
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

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isSendingChat) return;

    const userMsg: ChatMessage = { sender: 'user', text: textToSend };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsSendingChat(true);

    try {
      const apiHistory = chatHistory.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        text: msg.text
      }));

      const res = await api.post<{ response: string; suggestedFollowUp?: string[] }>(
        `/documents/public/${id}/chat`,
        { text: textToSend, history: apiHistory }
      );

      const aiMsg: ChatMessage = { sender: 'ai', text: res.response };
      setChatHistory((prev) => [...prev, aiMsg]);
      
      if (res.suggestedFollowUp && res.suggestedFollowUp.length === 3) {
        setSuggestedQuestions(res.suggestedFollowUp);
      }
    } catch (err) {
      const errorMsg: ChatMessage = { sender: 'ai', text: 'Error: Failed to fetch AI answer grounding.' };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setIsSendingChat(false);
    }
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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:px-8 w-full space-y-12">
        {/* Back Link */}
        <div className="flex items-center">
          <Link href="/documents">
            <button className="h-9 px-4 rounded-xl border border-border bg-card-bg text-xs font-bold text-muted hover:text-foreground flex items-center gap-1.5 transition-all cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Library</span>
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

        {/* Main Details Grid */}
        {docData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Content column (Preview, Overview, Summary, Key Points, Metadata) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* 1. Document Preview Header */}
              <section className="rounded-2xl border border-border bg-card-bg p-6 relative overflow-hidden shadow-sm">
                <div className="absolute top-1/2 right-10 -translate-y-1/2 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  {/* Styled Thumbnail */}
                  <div className={`h-20 w-20 rounded-xl shrink-0 border border-border flex flex-col items-center justify-center font-bold text-xs ${
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
                    </div>
                    <h2 className="text-xl font-extrabold text-foreground truncate leading-tight" title={docData.title}>
                      {docData.title}
                    </h2>
                    <p className="text-xs text-muted truncate">
                      Original name: {docData.originalName}
                    </p>
                  </div>
                </div>
              </section>

              {/* 2. Overview Section */}
              <section className="rounded-2xl border border-border bg-card-bg p-6 space-y-3 shadow-sm">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Info className="h-4.5 w-4.5 text-indigo-500" /> Overview & Objective
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  {docData.description || 'No custom description provided for this document.'}
                </p>
              </section>

              {/* 3. AI Summary */}
              <section className="rounded-2xl border border-border bg-card-bg p-6 space-y-3.5 shadow-sm">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Shield className="h-4.5 w-4.5 text-purple-500" /> AI Executive Summary
                </h3>
                <div className="p-4 rounded-xl border border-border bg-background/50 text-xs text-muted leading-relaxed whitespace-pre-line">
                  {docData.summary || 'Summary analysis processing or not generated.'}
                </div>
              </section>

              {/* 4. Key Points & Action items */}
              {docData.keyInfo?.actionItems && docData.keyInfo.actionItems.length > 0 && (
                <section className="rounded-2xl border border-border bg-card-bg p-6 space-y-3.5 shadow-sm">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ArrowRight className="h-4.5 w-4.5 text-indigo-500" /> Key Insights & Action Items
                  </h3>
                  <ul className="space-y-2">
                    {docData.keyInfo.actionItems.map((point, idx) => (
                      <li key={idx} className="text-xs text-muted flex items-start gap-2.5 leading-relaxed">
                        <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* 5. AI Generated Tags */}
              {docData.tags && docData.tags.length > 0 && (
                <section className="rounded-2xl border border-border bg-card-bg p-6 space-y-3 shadow-sm">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Tag className="h-4.5 w-4.5 text-pink-500" /> AI Extracted Topics
                  </h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {docData.tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="text-[10px] font-bold text-foreground bg-muted-bg border border-border px-2.5 py-1 rounded-md capitalize"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* 6. Metadata Details */}
              <section className="rounded-2xl border border-border bg-card-bg p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-indigo-500" /> Document Metadata
                </h3>
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted-bg/30 border-b border-border text-foreground font-bold">
                        <th className="p-3">Property</th>
                        <th className="p-3">Value</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted divide-y divide-border">
                      <tr>
                        <td className="p-3 font-semibold">File format</td>
                        <td className="p-3">{docData.fileType}</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">File size</td>
                        <td className="p-3">{(docData.size / 1024).toFixed(1)} KB</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">Upload timestamp</td>
                        <td className="p-3">{new Date(docData.createdAt).toLocaleString()}</td>
                      </tr>
                      {docData.keyInfo?.author && (
                        <tr>
                          <td className="p-3 font-semibold">Author reference</td>
                          <td className="p-3">{docData.keyInfo.author}</td>
                        </tr>
                      )}
                      {docData.keyInfo?.creationDate && (
                        <tr>
                          <td className="p-3 font-semibold">Document date</td>
                          <td className="p-3">{docData.keyInfo.creationDate}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 7. Related Documents */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="h-4.5 w-4.5 text-indigo-500" /> Related Documents (Category: {docData.category})
                </h3>
                {relatedLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-28 bg-card-bg border border-border rounded-xl animate-pulse" />
                    <div className="h-28 bg-card-bg border border-border rounded-xl animate-pulse" />
                  </div>
                ) : relatedDocs.length === 0 ? (
                  <p className="text-xs text-muted italic">No related documents in this category.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {relatedDocs.map((doc) => (
                      <div key={doc.id} className="rounded-2xl border border-border bg-card-bg p-5 flex flex-col justify-between hover:border-accent/40 shadow-sm transition-all h-36">
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-extrabold text-indigo-500 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {doc.category}
                          </span>
                          <h4 className="text-xs font-bold text-foreground line-clamp-1 truncate">{doc.title}</h4>
                          <p className="text-[10px] text-muted line-clamp-2 leading-relaxed">{doc.description || 'No description.'}</p>
                        </div>
                        <Link href={`/documents/${doc.id}`} className="text-[10px] font-bold text-indigo-500 hover:underline flex items-center gap-1.5 mt-2">
                          <span>View Analysis</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* 8. Reviews & Ratings Section */}
              <section className="rounded-2xl border border-border bg-card-bg p-6 space-y-6 shadow-sm">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Star className="h-4.5 w-4.5 text-amber-500" /> Reviews & Ratings
                </h3>

                {/* Submit review form */}
                <form onSubmit={handleReviewSubmit} className="space-y-4 border-b border-border/60 pb-6">
                  <h4 className="text-xs font-bold text-foreground">Add Document Rating</h4>
                  
                  {reviewSubmitStatus === 'success' && (
                    <p className="text-xs text-emerald-500 font-bold bg-emerald-500/5 border border-emerald-500/15 p-3 rounded-xl">
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

                {/* Reviews List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-foreground">Recent Feedback</h4>
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
                              <h5 className="text-xs font-bold text-foreground">{rev.name}</h5>
                              <p className="text-[9px] text-muted">{new Date(rev.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center text-amber-500 gap-0.5">
                              {Array.from({ length: rev.rating }).map((_, idx) => (
                                <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted leading-relaxed">
                            {rev.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

            </div>

            {/* Right Column (9. AI Chat Panel) */}
            <div className="lg:col-span-4 rounded-2xl border border-border bg-card-bg shadow-md overflow-hidden sticky top-20">
              <div className="border-b border-border p-4 bg-muted-bg/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4.5 w-4.5 text-indigo-500" />
                  <div>
                    <h3 className="text-xs font-bold text-foreground">Public AI Agent</h3>
                    <p className="text-[10px] text-muted">Grounded document dialogue</p>
                  </div>
                </div>
                <div className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* Chat Log */}
              <div className="h-96 overflow-y-auto p-4 space-y-4 bg-zinc-950/20 text-xs">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted space-y-3.5 py-12">
                    <HelpCircle className="h-10 w-10 text-indigo-500/30" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-foreground text-xs">Ask anything to this file</h4>
                      <p className="text-[10px] text-muted/80 max-w-[200px] mx-auto leading-relaxed">
                        The AI assistant coordinates summaries and validates queries using grounded citations.
                      </p>
                    </div>
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'ml-auto bg-indigo-600 text-white rounded-br-none' 
                          : 'mr-auto bg-muted-bg border border-border text-muted rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line text-[11px]">{msg.text}</p>
                    </div>
                  ))
                )}

                {isSendingChat && (
                  <div className="flex max-w-[85%] mr-auto rounded-2xl p-3.5 bg-muted-bg border border-border text-muted rounded-bl-none items-center gap-2">
                    <Spinner size="sm" />
                    <span className="text-[10px] font-semibold animate-pulse">Consulting grounding references...</span>
                  </div>
                )}
              </div>

              {/* Suggestions Panel */}
              <div className="p-4 border-t border-border bg-background/50 space-y-2.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted">Suggested Queries</span>
                <div className="flex flex-col gap-1.5">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      disabled={isSendingChat}
                      className="w-full text-left p-2.5 rounded-xl border border-border bg-card-bg text-[10px] text-muted hover:text-foreground hover:bg-muted-bg transition-all cursor-pointer font-medium leading-tight"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input form */}
              <div className="p-4 border-t border-border bg-card-bg">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage(chatInput);
                    }}
                    placeholder={isSendingChat ? 'Sending inquiry...' : 'Type a query...'}
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
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
