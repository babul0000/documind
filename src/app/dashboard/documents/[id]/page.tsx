'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, Calendar, Tag, MessageSquare, Send, Sparkles, 
  ChevronLeft, BookOpen, AlertCircle, RefreshCw, Shield, Layers, HelpCircle,
  CheckCircle, ArrowRight, Brain, Lightbulb
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

interface AnalyzerResult {
  summary: string;
  keyPoints: string[];
  importantSections: { sectionTitle: string; significance: string }[];
  actionItems: string[];
}

interface ClassificationResult {
  category: string;
  tags: string[];
  suggestedTitle: string;
}

interface RecommendationResult {
  relatedDocuments: { id: string; title: string; reason: string }[];
  learningResources: { title: string; description: string }[];
  nextActions: { action: string; priority: string; reason: string }[];
}

export default function DocumentDetailsPage() {
  const { id } = useParams() as { id: string };
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Tabs state
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'classify' | 'recommend'>('overview');

  // Agent 1: Analyzer state
  const [analysis, setAnalysis] = useState<AnalyzerResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Agent 2: Classification state
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSavingClassification, setIsSavingClassification] = useState(false);

  // Agent 3: Chat Assistant state
  const [chatInput, setChatInput] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([
    'What is the main topic of this document?',
    'What are the key takeaways?',
    'Are there any actions to perform?'
  ]);

  // Agent 4: Recommendation state
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null);
  const [isRecommending, setIsRecommending] = useState(false);

  // Fetch current document details
  const { data: docData, isLoading: isDocLoading, error: docError } = useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      const res = await api.get<{ document: DocumentData }>(`/documents/${id}`);
      return res.document;
    },
  });

  // Auto-scroll chats
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  // Trigger Agent 1: Document Analyzer
  const handleRunAnalyzer = async () => {
    if (!docData) return;
    setIsAnalyzing(true);
    try {
      const res = await api.post<{ analysis: AnalyzerResult }>('/ai/analyze', { documentId: id });
      setAnalysis(res.analysis);
    } catch (err) {
      console.error("Analyzer Agent execution failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Trigger Agent 2: Classification Agent
  const handleRunClassification = async () => {
    if (!docData) return;
    setIsClassifying(true);
    try {
      const res = await api.post<{ classification: ClassificationResult }>('/ai/classify', { documentId: id });
      setClassification(res.classification);
    } catch (err) {
      console.error("Classification Agent execution failed:", err);
    } finally {
      setIsClassifying(false);
    }
  };

  // Save classification back to document (edits category/tags/title)
  const handleSaveClassification = async () => {
    if (!classification) return;
    setIsSavingClassification(true);
    try {
      await api.post(`/documents/${id}`, {
        title: classification.suggestedTitle,
        category: classification.category,
        tags: classification.tags,
      });
      // Invalidate queries to reload updated details
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      setClassification(null);
    } catch (err) {
      // Fallback in case PUT is mapped or POST is overridden
      try {
        await fetch(`http://localhost:5000/api/documents/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: classification.suggestedTitle,
            category: classification.category,
            tags: classification.tags,
          }),
        });
        queryClient.invalidateQueries({ queryKey: ['document', id] });
        setClassification(null);
      } catch (nestedErr) {
        console.error("Failed to save classification:", nestedErr);
      }
    } finally {
      setIsSavingClassification(false);
    }
  };

  // Trigger Agent 4: Recommendation Agent
  const handleRunRecommendations = async () => {
    if (!docData) return;
    setIsRecommending(true);
    try {
      const res = await api.post<{ recommendations: RecommendationResult }>('/ai/recommend', { documentId: id });
      setRecommendations(res.recommendations);
    } catch (err) {
      console.error("Recommendation Agent execution failed:", err);
    } finally {
      setIsRecommending(false);
    }
  };

  // Handle Q&A send (Agent 3)
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isSending || !docData) return;

    const queryText = textToSend.trim();
    setIsSending(true);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      createdAt: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    try {
      // Map current conversation history
      const formattedHistory = localMessages.map((m) => ({
        sender: m.sender === 'user' ? 'user' : 'ai',
        text: m.text,
      }));

      // Call Agentic Q&A Assistant Endpoint
      const res = await api.post<{ response: string; suggestedFollowUp: string[] }>('/ai/chat', {
        documentId: id,
        text: queryText,
        history: formattedHistory,
      });

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.response,
        createdAt: new Date().toISOString(),
      };

      setLocalMessages((prev) => [...prev, aiMsg]);
      
      // Update interactive suggested questions dynamically
      if (res.suggestedFollowUp && res.suggestedFollowUp.length > 0) {
        setSuggestedFollowUps(res.suggestedFollowUp);
      }
    } catch (err: any) {
      console.error("Agent Q&A failed:", err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `Chat assistant encountered an error: ${err.message || 'API error'}`,
        createdAt: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
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
        <Link href="/documents" className="mt-4">
          <Button variant="outline" className="h-9.5 text-xs rounded-xl border-zinc-800 flex items-center gap-1.5">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to explore</span>
          </Button>
        </Link>
      </div>
    );
  }

  const fileLabel = docData.fileType.includes('pdf') ? 'PDF' : docData.fileType.includes('word') || docData.fileType.includes('docx') ? 'DOCX' : 'TXT';
  const formattedSize = `${(docData.size / 1024).toFixed(1)} KB`;
  const formattedDate = new Date(docData.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 pb-10">
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <Link href="/documents">
          <button className="h-9 text-xs font-bold text-zinc-450 hover:text-white bg-zinc-955 hover:bg-zinc-900 border border-zinc-900 rounded-xl px-3.5 flex items-center gap-1.5 transition-all">
            <ChevronLeft className="h-4 w-4" />
            <span>All Documents</span>
          </button>
        </Link>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
            <Brain className="h-3 w-3" />
            <span>Agentic Workspace Active</span>
          </span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Metadata & AI Agents Tabs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Header Specs Card */}
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
                <p className="text-xs text-zinc-450 leading-relaxed">{docData.description}</p>
              )}
            </div>
            
            {/* Horizontal Specs */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-zinc-900/40">
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-zinc-555" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] font-bold uppercase text-zinc-550">Uploaded</span>
                  <span className="text-[10px] font-semibold text-white truncate">{formattedDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-zinc-555" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] font-bold uppercase text-zinc-550">File Size</span>
                  <span className="text-[10px] font-semibold text-white truncate">{formattedSize}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Shield className="h-4 w-4 text-zinc-555" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] font-bold uppercase text-zinc-550">Status</span>
                  <span className="text-[10px] font-semibold text-emerald-400 truncate capitalize">{docData.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Intelligence Workspace Tab Bar */}
          <div className="flex items-center border-b border-zinc-900 bg-zinc-950/20 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-zinc-900 text-white border border-zinc-800'
                  : 'text-zinc-450 hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'bg-zinc-900 text-white border border-zinc-800'
                  : 'text-zinc-450 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Deep Audit</span>
            </button>
            <button
              onClick={() => setActiveTab('classify')}
              className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'classify'
                  ? 'bg-zinc-900 text-white border border-zinc-800'
                  : 'text-zinc-450 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              <span>Auto Classify</span>
            </button>
            <button
              onClick={() => setActiveTab('recommend')}
              className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'recommend'
                  ? 'bg-zinc-900 text-white border border-zinc-800'
                  : 'text-zinc-450 hover:text-white'
              }`}
            >
              <Lightbulb className="h-3.5 w-3.5 text-indigo-400" />
              <span>Recommendations</span>
            </button>
          </div>

          {/* TAB 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive Summary */}
              <Card className="border-zinc-900 bg-zinc-950/40 backdrop-blur-xl rounded-2xl">
                <CardHeader className="p-5 pb-3 border-b border-zinc-900/50 flex flex-row items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                  <CardTitle className="text-xs font-bold text-white tracking-tight">AI Executive Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  {docData.status === 'processing' ? (
                    <div className="flex items-center gap-2.5 text-zinc-450 text-xs">
                      <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
                      <span>Gemini AI is generating the initial executive summary...</span>
                    </div>
                  ) : docData.summary ? (
                    <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">{docData.summary}</p>
                  ) : (
                    <p className="text-xs text-zinc-550 italic">No summary generated yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Extraction Specs */}
              {docData.status === 'completed' && docData.keyInfo && (
                <Card className="border-zinc-900 bg-zinc-950/40 backdrop-blur-xl rounded-2xl">
                  <CardHeader className="p-5 pb-3 border-b border-zinc-900/50 flex flex-row items-center gap-2">
                    <Layers className="h-4.5 w-4.5 text-indigo-400" />
                    <CardTitle className="text-xs font-bold text-white tracking-tight">Extracted Metadata Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4.5">
                    {docData.keyInfo.documentType && (
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider shrink-0 w-24">Document Type:</span>
                        <span className="text-xs font-bold text-white">{docData.keyInfo.documentType}</span>
                      </div>
                    )}
                    
                    {docData.keyInfo.importantDates && docData.keyInfo.importantDates.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider block">Key Dates Mentioned</span>
                        <div className="flex flex-wrap gap-2">
                          {docData.keyInfo.importantDates.map((date, index) => (
                            <span key={index} className="text-xs font-semibold text-zinc-350 bg-zinc-900 border border-zinc-850 px-3 py-1 rounded-xl">
                              {date}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {docData.keyInfo.keyTopics && docData.keyInfo.keyTopics.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider block">Extracted Topics</span>
                        <div className="flex flex-wrap gap-2">
                          {docData.keyInfo.keyTopics.map((topic, index) => (
                            <span key={index} className="text-[11px] font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-3 py-1 rounded-xl">
                              #{topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* TAB 2: AI Deep Audit (Agent 1) */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              {!analysis ? (
                <div className="p-8 border border-dashed border-zinc-800 bg-zinc-950/20 rounded-2xl text-center space-y-4">
                  <Brain className="h-10 w-10 text-indigo-400 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-sm">Document Analyzer Agent</h3>
                    <p className="text-xs text-zinc-450 max-w-sm mx-auto">Analyze the entire document text to generate an in-depth summary, key takeaways list, critical sections breakdown, and task checklists.</p>
                  </div>
                  <Button 
                    onClick={handleRunAnalyzer}
                    disabled={isAnalyzing}
                    className="h-9.5 text-xs bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl flex items-center gap-2 mx-auto"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Analyzing Text...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Run Deep Audit</span>
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Detailed Summary */}
                  <Card className="border-zinc-900 bg-zinc-950/40 backdrop-blur-xl rounded-2xl">
                    <CardHeader className="p-5 pb-2">
                      <CardTitle className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Executive Deep Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                      <p className="text-xs text-zinc-300 leading-relaxed">{analysis.summary}</p>
                    </CardContent>
                  </Card>

                  {/* Key Takeaways */}
                  <Card className="border-zinc-900 bg-zinc-950/40 backdrop-blur-xl rounded-2xl">
                    <CardHeader className="p-5 pb-2">
                      <CardTitle className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Core Takeaways</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 space-y-2.5">
                      {analysis.keyPoints.map((pt, index) => (
                        <div key={index} className="flex items-start gap-2.5 text-xs text-zinc-300">
                          <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{pt}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Critical Sections */}
                  {analysis.importantSections && analysis.importantSections.length > 0 && (
                    <Card className="border-zinc-900 bg-zinc-950/40 backdrop-blur-xl rounded-2xl">
                      <CardHeader className="p-5 pb-2">
                        <CardTitle className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Critical Sections Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent className="p-5 pt-0 space-y-3.5">
                        {analysis.importantSections.map((sec, index) => (
                          <div key={index} className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-1">
                            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                              {sec.sectionTitle}
                            </h4>
                            <p className="text-[11px] text-zinc-450 leading-relaxed pl-3">{sec.significance}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Task / Action Items Checklist */}
                  {analysis.actionItems && analysis.actionItems.length > 0 && (
                    <Card className="border-zinc-900 bg-zinc-950/40 backdrop-blur-xl rounded-2xl">
                      <CardHeader className="p-5 pb-2">
                        <CardTitle className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Action Items Checklist</CardTitle>
                      </CardHeader>
                      <CardContent className="p-5 pt-0 space-y-3">
                        {analysis.actionItems.map((item, index) => (
                          <div key={index} className="flex items-start gap-2.5 text-xs text-zinc-350 bg-zinc-900/10 border border-zinc-900 p-3 rounded-xl">
                            <input 
                              type="checkbox" 
                              className="mt-1 h-3.5 w-3.5 rounded border-zinc-800 bg-zinc-900 text-indigo-600 focus:ring-indigo-500/50 shrink-0 cursor-pointer"
                            />
                            <span className="leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Auto Classify (Agent 2) */}
          {activeTab === 'classify' && (
            <div className="space-y-6">
              {!classification ? (
                <div className="p-8 border border-dashed border-zinc-800 bg-zinc-950/20 rounded-2xl text-center space-y-4">
                  <Layers className="h-10 w-10 text-indigo-400 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-sm">Classification Agent</h3>
                    <p className="text-xs text-zinc-450 max-w-sm mx-auto">Automatically classify document categories, generate descriptive titles, and organize keyword tags to optimize file search.</p>
                  </div>
                  <Button 
                    onClick={handleRunClassification}
                    disabled={isClassifying}
                    className="h-9.5 text-xs bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl flex items-center gap-2 mx-auto"
                  >
                    {isClassifying ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Classifying...</span>
                      </>
                    ) : (
                      <>
                        <Layers className="h-3.5 w-3.5" />
                        <span>Classify Document</span>
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Card className="border-zinc-900 bg-zinc-950/40 backdrop-blur-xl rounded-2xl">
                  <CardHeader className="p-5 pb-3 border-b border-zinc-900/50">
                    <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">Smart Classification Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-5">
                    {/* Suggested Title */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Suggested Search Title</span>
                      <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl">
                        <input
                          type="text"
                          value={classification.suggestedTitle}
                          onChange={(e) => setClassification({ ...classification, suggestedTitle: e.target.value })}
                          className="w-full bg-transparent text-xs text-white border-none p-0 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Auto Category</span>
                      <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl">
                        <input
                          type="text"
                          value={classification.category}
                          onChange={(e) => setClassification({ ...classification, category: e.target.value })}
                          className="w-full bg-transparent text-xs text-white border-none p-0 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Keywords & Tags</span>
                      <div className="flex flex-wrap gap-2">
                        {classification.tags.map((tag, index) => (
                          <span key={index} className="text-xs font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-3 py-1 rounded-xl flex items-center gap-1">
                            <span>#{tag}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-2 border-t border-zinc-900/40 flex justify-end">
                      <Button
                        onClick={handleSaveClassification}
                        disabled={isSavingClassification}
                        className="h-9.5 text-xs bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl flex items-center gap-1.5"
                      >
                        {isSavingClassification ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        <span>Approve & Save Classification</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* TAB 4: Recommendations (Agent 4) */}
          {activeTab === 'recommend' && (
            <div className="space-y-6">
              {!recommendations ? (
                <div className="p-8 border border-dashed border-zinc-800 bg-zinc-950/20 rounded-2xl text-center space-y-4">
                  <Lightbulb className="h-10 w-10 text-indigo-400 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-sm">AI Recommendation Agent</h3>
                    <p className="text-xs text-zinc-450 max-w-sm mx-auto">Compares this file against other library documents, suggesting related files, learning paths, tutorials, and priority next tasks.</p>
                  </div>
                  <Button 
                    onClick={handleRunRecommendations}
                    disabled={isRecommending}
                    className="h-9.5 text-xs bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl flex items-center gap-2 mx-auto"
                  >
                    {isRecommending ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Discovering suggestions...</span>
                      </>
                    ) : (
                      <>
                        <Lightbulb className="h-3.5 w-3.5" />
                        <span>Generate Recommendations</span>
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Related Documents */}
                  <Card className="border-zinc-900 bg-zinc-950/40 backdrop-blur-xl rounded-2xl">
                    <CardHeader className="p-5 pb-2">
                      <CardTitle className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Related Files (Library)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 space-y-3.5">
                      {recommendations.relatedDocuments.length === 0 ? (
                        <p className="text-xs text-zinc-550 italic">No other related documents found in the database.</p>
                      ) : (
                        recommendations.relatedDocuments.map((rd, idx) => (
                          <div key={idx} className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl flex items-start gap-3">
                            <FileText className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-white">{rd.title}</span>
                              <span className="text-[10px] text-zinc-450 mt-1 leading-relaxed">{rd.reason}</span>
                              <Link href={`/dashboard/documents/${rd.id}`} className="text-[10px] text-indigo-400 font-bold mt-2 flex items-center gap-0.5 hover:text-indigo-300">
                                <span>Go to document</span>
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {/* Study / Learning Resources */}
                  <Card className="border-zinc-900 bg-zinc-950/40 backdrop-blur-xl rounded-2xl">
                    <CardHeader className="p-5 pb-2">
                      <CardTitle className="text-xs font-bold text-indigo-400 uppercase tracking-wider">AI Learning Paths & Resources</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 space-y-3.5">
                      {recommendations.learningResources.map((res, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <BookOpen className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">{res.title}</span>
                            <span className="text-[10px] text-zinc-450 mt-0.5 leading-relaxed">{res.description}</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Priority Actions */}
                  <Card className="border-zinc-900 bg-zinc-950/40 backdrop-blur-xl rounded-2xl">
                    <CardHeader className="p-5 pb-2">
                      <CardTitle className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Suggested Next Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 space-y-3.5">
                      {recommendations.nextActions.map((act, idx) => (
                        <div key={idx} className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold uppercase text-zinc-550">Action suggestion</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              act.priority === 'High' 
                                ? 'text-rose-455 bg-rose-500/10 border border-rose-500/20' 
                                : act.priority === 'Medium' 
                                ? 'text-amber-455 bg-amber-500/10 border border-amber-500/20'
                                : 'text-emerald-455 bg-emerald-500/10 border border-emerald-500/20'
                            }`}>
                              {act.priority} Priority
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-white leading-relaxed">{act.action}</p>
                          <p className="text-[10px] text-zinc-450 leading-relaxed">{act.reason}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: AI Chat Assistant (Agent 3) */}
        <div className="lg:col-span-5 h-[calc(100vh-170px)] min-h-[550px] flex flex-col border border-zinc-900 bg-zinc-950/40 backdrop-blur-xl rounded-2xl overflow-hidden relative">
          
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

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {localMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2.5">
                <HelpCircle className="h-9 w-9 text-zinc-650 animate-bounce" />
                <h4 className="font-bold text-xs text-zinc-405">Chat with document text</h4>
                <p className="text-[10px] text-zinc-500 max-w-xs leading-relaxed">Ask specific questions about clauses, terms, figures or dates inside this file. The assistant answers with ground truths.</p>
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
                          : 'bg-zinc-900/70 border border-zinc-850 text-zinc-250 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line">{m.text}</p>
                    </div>
                  </div>
                );
              })
            )}
            
            {/* Typing Indicator */}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-zinc-900/40 border border-zinc-850 text-zinc-400 rounded-2xl rounded-bl-none px-4 py-2.5 text-xs flex items-center gap-2 animate-pulse">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                  <span>AI Assistant is reading context...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Actions & Suggested Questions & Input Bar */}
          <div className="p-4 border-t border-zinc-900/60 bg-zinc-900/10 space-y-3.5">
            {/* Interactive follow-up badges */}
            {!isSending && suggestedFollowUps.length > 0 && (
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-wider block">Suggested Questions</span>
                <div className="flex flex-wrap gap-2">
                  {suggestedFollowUps.slice(0, 3).map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="text-[10px] text-left text-zinc-350 hover:text-white bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(chatInput);
              }}
              className="relative flex items-center bg-zinc-900/30 border border-zinc-900 hover:border-zinc-850 focus-within:border-indigo-500/80 rounded-xl transition-all"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question about this document..."
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
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
