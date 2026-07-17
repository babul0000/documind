'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, Calendar, Tag, MessageSquare, Send, Sparkles, 
  ChevronLeft, BookOpen, AlertCircle, RefreshCw, Key, Shield, Layers, HelpCircle
} from 'lucide-react';
import { api } from '../../../../services/api';
import { Button } from '../../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';

interface DocumentData {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  category: string;
  tags: string[];
  originalName: string;
  mimeType: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  textContent: string;
  summary: string;
  keyInfo: {
    documentType?: string;
    keyTopics?: string[];
    importantDates?: string[];
    actionItems?: string[];
    entities?: string[];
  };
  createdAt: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt: string;
}

/**
 * Document Details & Intelligence Workspace.
 * Layout:
 * - Left column: File specs, AI summary, structured key info tabs, tags, and related files.
 * - Right column: Grounded contextual Gemini Q&A panel.
 */
export default function DocumentDetailsPage() {
  const { id } = useParams() as { id: string };
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Local chat state
  const [chatInput, setChatInput] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // 1. Fetch current document details
  const { data: docData, isLoading: isDocLoading, error: docError } = useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      const res = await api.get<{ document: DocumentData }>(`/documents/${id}`);
      return res.document;
    },
  });

  // 2. Fetch all documents to find related ones in the same category
  const { data: allDocs } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get<{ documents: DocumentData[] }>('/documents');
      return res.documents;
    },
    enabled: !!docData,
  });

  // Filter related documents
  const relatedDocuments = allDocs
    ? allDocs.filter((d) => d.id !== id && d.category === docData?.category).slice(0, 3)
    : [];

  // 3. Fetch or initialize conversation list to find conversation ID
  const { data: conversationsData } = useQuery({
    queryKey: ['conversations', id],
    queryFn: async () => {
      const res = await api.get<{ conversations: { id: string; documentId: string }[] }>(`/chats?documentId=${id}`);
      return res.conversations;
    },
    enabled: !!docData,
  });

  // Fetch messages if conversationId is discovered
  useEffect(() => {
    if (conversationsData && conversationsData.length > 0) {
      const matchedConv = conversationsData[0];
      setConversationId(matchedConv.id);
      
      // Load messages
      api.get<{ messages: Message[] }>(`/chats/${matchedConv.id}`).then((res) => {
        setLocalMessages(res.messages);
      }).catch(err => console.error("Error loading messages:", err));
    }
  }, [conversationsData]);

  // Auto-scroll chats
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (payload: { documentId: string; text: string; conversationId?: string }) => {
      return api.post<{ conversationId: string; userMessage: Message; aiMessage: Message }>('/chats', payload);
    },
    onSuccess: (res) => {
      setConversationId(res.conversationId);
      setLocalMessages((prev) => [...prev, res.aiMessage]);
    },
    onError: (err) => {
      console.error("Failed to send message:", err);
      // Remove temporary user message on error
      setLocalMessages((prev) => prev.slice(0, -1));
    },
    onSettled: () => {
      setIsSending(false);
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending || !docData) return;

    const text = chatInput.trim();
    setChatInput('');
    setIsSending(true);

    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      text: text,
      createdAt: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, tempUserMessage]);

    sendMessageMutation.mutate({
      documentId: id,
      text: text,
      conversationId: conversationId || undefined,
    });
  };

  if (isDocLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <RefreshCw className="h-9 w-9 text-indigo-400 animate-spin mb-4" />
        <h3 className="text-white font-bold text-sm">Decrypting document insights...</h3>
      </div>
    );
  }

  if (docError || !docData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 border border-dashed border-rose-500/20 bg-rose-500/5 rounded-2xl text-center">
        <AlertCircle className="h-10 w-10 text-rose-400 mb-3.5" />
        <h3 className="font-bold text-white text-base">Document not found</h3>
        <p className="text-xs text-rose-300 mt-1 max-w-sm">The document may have been deleted or the access permission is missing.</p>
        <Link href="/dashboard/explore" className="mt-4">
          <Button variant="outline" className="h-9.5 text-xs rounded-xl border-zinc-800 flex items-center gap-1.5">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to explore</span>
          </Button>
        </Link>
      </div>
    );
  }

  // File attributes
  const fileLabel = docData.fileType.includes('pdf') ? 'PDF' : docData.fileType.includes('word') || docData.fileType.includes('docx') ? 'DOCX' : 'TXT';
  const formattedSize = `${(docData.size / 1024).toFixed(1)} KB`;
  const formattedDate = new Date(docData.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 pb-10">
      {/* Back Button */}
      <div>
        <Link href="/dashboard/explore">
          <button className="h-9 text-xs font-bold text-zinc-450 hover:text-white bg-zinc-950/20 hover:bg-zinc-900 border border-zinc-900 rounded-xl px-3.5 flex items-center gap-1.5 transition-all">
            <ChevronLeft className="h-4 w-4" />
            <span>All Documents</span>
          </button>
        </Link>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Metadata & AI Analytics */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header Card */}
          <div className="bg-zinc-950/40 border border-zinc-900/80 p-6 rounded-2xl backdrop-blur-xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {docData.category || 'General'}
              </span>
              <span className="text-[10px] font-bold text-zinc-450 bg-zinc-900 border border-zinc-850 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {fileLabel}
              </span>
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl font-bold text-white tracking-tight leading-snug">{docData.title}</h1>
              {docData.description && (
                <p className="text-xs text-zinc-400 leading-relaxed">{docData.description}</p>
              )}
            </div>
          </div>

          {/* Document Specs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-950/20 border border-zinc-900 p-4 rounded-xl flex items-center gap-3">
              <Calendar className="h-5 w-5 text-zinc-500 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-bold uppercase text-zinc-550 tracking-wider">Uploaded</span>
                <span className="text-xs font-semibold text-white mt-0.5 truncate">{formattedDate}</span>
              </div>
            </div>
            <div className="bg-zinc-950/20 border border-zinc-900 p-4 rounded-xl flex items-center gap-3">
              <FileText className="h-5 w-5 text-zinc-500 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-bold uppercase text-zinc-550 tracking-wider">File Size</span>
                <span className="text-xs font-semibold text-white mt-0.5 truncate">{formattedSize}</span>
              </div>
            </div>
            <div className="bg-zinc-950/20 border border-zinc-900 p-4 rounded-xl flex items-center gap-3">
              <Shield className="h-5 w-5 text-zinc-500 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-bold uppercase text-zinc-550 tracking-wider">Status</span>
                <span className="text-xs font-semibold text-emerald-400 mt-0.5 truncate capitalize">{docData.status}</span>
              </div>
            </div>
          </div>

          {/* AI Summary Section */}
          <Card className="border-zinc-900 bg-zinc-950/40 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b border-zinc-900/50 flex flex-row items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
              <CardTitle className="text-sm font-bold text-white tracking-tight">AI Executive Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {docData.status === 'processing' ? (
                <div className="flex items-center gap-2 text-zinc-500 text-xs">
                  <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
                  <span>Gemini AI is parsing and writing a professional summary. Please wait...</span>
                </div>
              ) : docData.summary ? (
                <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">{docData.summary}</p>
              ) : (
                <p className="text-xs text-zinc-500 italic">No summary generated for this document.</p>
              )}
            </CardContent>
          </Card>

          {/* Extracted Information Tab Panels */}
          {docData.status === 'completed' && docData.keyInfo && (
            <Card className="border-zinc-900 bg-zinc-950/40 backdrop-blur-xl rounded-2xl">
              <CardHeader className="p-5 pb-3 border-b border-zinc-900/50 flex flex-row items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-indigo-400" />
                <CardTitle className="text-sm font-bold text-white tracking-tight">Extracted Metadata & Insights</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {/* Important Dates */}
                {docData.keyInfo.importantDates && docData.keyInfo.importantDates.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Key Dates</span>
                    <div className="flex flex-wrap gap-2">
                      {docData.keyInfo.importantDates.map((date, index) => (
                        <span key={index} className="text-xs font-semibold text-white bg-zinc-900 border border-zinc-850 px-3 py-1 rounded-xl">
                          {date}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Items */}
                {docData.keyInfo.actionItems && docData.keyInfo.actionItems.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Action Items / Tasks</span>
                    <ul className="space-y-2.5">
                      {docData.keyInfo.actionItems.map((item, index) => (
                        <li key={index} className="text-xs text-zinc-300 flex items-start gap-2 bg-zinc-900/10 border border-zinc-900 p-3 rounded-xl">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key Entities */}
                {docData.keyInfo.entities && docData.keyInfo.entities.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Named Entities</span>
                    <div className="flex flex-wrap gap-2">
                      {docData.keyInfo.entities.map((ent, index) => (
                        <span key={index} className="text-xs font-semibold text-zinc-300 bg-zinc-900/50 border border-zinc-900 px-3 py-1 rounded-xl">
                          {ent}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tags List */}
          {docData.tags && docData.tags.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-450 uppercase tracking-wider">Document Keywords</span>
              <div className="flex flex-wrap gap-2">
                {docData.tags.map((tag) => (
                  <span key={tag} className="text-xs font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-3 py-1 rounded-xl">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Documents */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-zinc-450 uppercase tracking-wider">Related Documents ({docData.category})</span>
            {relatedDocuments.length === 0 ? (
              <p className="text-xs text-zinc-650 italic">No other documents uploaded in this category yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedDocuments.map((rd) => (
                  <Link href={`/dashboard/documents/${rd.id}`} key={rd.id}>
                    <div className="p-4 bg-zinc-950/20 border border-zinc-900 hover:border-zinc-800 rounded-xl flex items-center gap-3 transition-colors cursor-pointer group">
                      <div className="p-2 bg-zinc-900 rounded-lg text-zinc-400 group-hover:text-indigo-400 transition-colors">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{rd.title}</span>
                        <span className="text-[10px] text-zinc-550 mt-0.5">{(rd.size / 1024).toFixed(0)} KB • {rd.fileType.split('/')[1]?.toUpperCase()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Document Grounded Chat */}
        <div className="lg:col-span-5 h-[calc(100vh-170px)] min-h-[500px] flex flex-col border border-zinc-900 bg-zinc-950/40 backdrop-blur-xl rounded-2xl overflow-hidden relative">
          {/* Chat Header */}
          <div className="p-4.5 border-b border-zinc-900/60 flex items-center justify-between bg-zinc-900/10">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4.5 w-4.5 text-indigo-400" />
              <div>
                <h3 className="font-bold text-sm text-white">Ask your Document</h3>
                <p className="text-[10px] text-zinc-500">Contextual answers powered by Gemini AI</p>
              </div>
            </div>
          </div>

          {/* Message Stream list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {localMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2.5">
                <HelpCircle className="h-9 w-9 text-zinc-650" />
                <h4 className="font-bold text-xs text-zinc-400">Ask a question</h4>
                <p className="text-[10px] text-zinc-500 max-w-xs">Ask specific queries about clauses, terms, figures or dates inside this file.</p>
              </div>
            ) : (
              localMessages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-br-none font-medium'
                          : 'bg-zinc-900/70 border border-zinc-850 text-zinc-200 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line">{m.text}</p>
                    </div>
                  </div>
                );
              })
            )}
            
            {/* Thinking status */}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-zinc-905 border border-zinc-850 text-zinc-400 rounded-2xl rounded-bl-none px-4 py-2.5 text-xs flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                  <span>Gemini is reading document...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Text input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-900/60 bg-zinc-900/10">
            <div className="relative flex items-center bg-zinc-900/30 border border-zinc-900 hover:border-zinc-850 focus-within:border-indigo-500/80 rounded-xl transition-all">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about this document..."
                disabled={isSending}
                className="w-full h-11 pl-4 pr-12 bg-transparent text-xs text-white placeholder-zinc-550 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isSending}
                className="absolute right-2 h-7.5 w-7.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-lg flex items-center justify-center transition-colors focus:outline-none"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
