'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, Calendar, Tag, Shield, Loader2, Sparkles, 
  Layers, BarChart4, PieChart as PieIcon, CheckCircle2, AlertTriangle, ArrowUpRight 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { api } from '../../services/api';
import { DocumentCard } from '../../components/dashboard/document-card';
import { formatBytes } from '../../utils/format';

interface DocumentData {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  category: string;
  originalName: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

const COLORS = ['#6366f1', '#3b82f6', '#f59e0b'];

/**
 * Main dashboard view for uploads and file listing.
 */
export default function DashboardPage() {
  // Fetch all documents using TanStack Query
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get<{ documents: DocumentData[] }>('/documents');
      return res.documents;
    },
  });

  // Calculate statistics
  const totalDocs = documents.length;
  const processedDocs = documents.filter((d) => d.status === 'completed').length;
  const processingDocs = documents.filter((d) => d.status === 'processing' || d.status === 'pending').length;
  const failedDocs = documents.filter((d) => d.status === 'failed').length;

  const successRate = totalDocs > 0 
    ? Math.round((processedDocs / totalDocs) * 100) 
    : 100;

  // Filter 3 most recent documents
  const recentDocs = [...documents].slice(0, 3);

  // Group by document type for Pie Chart
  const fileTypeDistribution = React.useMemo(() => {
    let pdf = 0;
    let docx = 0;
    let txt = 0;

    documents.forEach((doc) => {
      const type = doc.fileType.toLowerCase();
      if (type.includes('pdf')) pdf++;
      else if (type.includes('word') || type.includes('officedocument') || type.includes('docx')) docx++;
      else txt++;
    });

    if (totalDocs === 0) {
      // Mock data for display when empty
      return [
        { name: 'PDF Docs', value: 4 },
        { name: 'DOCX Files', value: 2 },
        { name: 'TXT Files', value: 1 },
      ];
    }

    return [
      { name: 'PDF Docs', value: pdf },
      { name: 'DOCX Files', value: docx },
      { name: 'TXT Files', value: txt },
    ].filter((item) => item.value > 0);
  }, [documents, totalDocs]);

  // Group uploads by date for Area Chart (last 7 days)
  const uploadActivityData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return {
        dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: 0,
        rawDate: d,
      };
    }).reverse();

    documents.forEach((doc) => {
      const docDate = new Date(doc.createdAt);
      const match = last7Days.find(
        (day) => day.rawDate.toDateString() === docDate.toDateString()
      );
      if (match) {
        match.count++;
      }
    });

    if (totalDocs === 0) {
      // Return clean mock trend data
      return [
        { dateStr: 'Mon', count: 1 },
        { dateStr: 'Tue', count: 3 },
        { dateStr: 'Wed', count: 2 },
        { dateStr: 'Thu', count: 5 },
        { dateStr: 'Fri', count: 3 },
        { dateStr: 'Sat', count: 6 },
        { dateStr: 'Sun', count: 4 },
      ];
    }

    return last7Days.map((d) => ({
      dateStr: d.dateStr,
      count: d.count,
    }));
  }, [documents, totalDocs]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900/30 via-purple-900/20 to-zinc-950 border border-indigo-500/10 p-6 relative overflow-hidden">
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="max-w-xl space-y-2">
          <div className="flex items-center gap-2 text-indigo-400">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">DocuMind AI Workspace</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">AI-Powered Document Intelligence</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Upload text, PDF or Word documents to extract detailed analysis insights, generate summaries, and trigger context-grounded conversations with Gemini.
          </p>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Documents */}
        <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl backdrop-blur-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest">Total Documents</span>
            <h3 className="text-2xl font-black text-white">{isLoading ? '...' : totalDocs}</h3>
          </div>
          <div className="p-3 bg-indigo-500/5 text-indigo-400 rounded-xl border border-indigo-500/10">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        {/* Successful Summaries */}
        <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl backdrop-blur-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest">Processed Summaries</span>
            <h3 className="text-2xl font-black text-white">{isLoading ? '...' : processedDocs}</h3>
          </div>
          <div className="p-3 bg-emerald-500/5 text-emerald-400 rounded-xl border border-emerald-500/10">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* Processing Files */}
        <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl backdrop-blur-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest">Analyzing Queue</span>
            <h3 className="text-2xl font-black text-white">{isLoading ? '...' : processingDocs}</h3>
          </div>
          <div className="p-3 bg-amber-500/5 text-amber-400 rounded-xl border border-amber-500/10">
            <Loader2 className={`h-5 w-5 ${processingDocs > 0 ? 'animate-spin' : ''}`} />
          </div>
        </div>

        {/* AI Success Rate */}
        <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl backdrop-blur-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest">AI Success Rate</span>
            <h3 className="text-2xl font-black text-white">{isLoading ? '...' : `${successRate}%`}</h3>
          </div>
          <div className="p-3 bg-purple-500/5 text-purple-400 rounded-xl border border-purple-500/10">
            <Layers className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Analytics Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Upload Activity Chart */}
        <div className="lg:col-span-8 bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart4 className="h-4.5 w-4.5 text-indigo-400" />
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">Upload Activity</h4>
                <p className="text-[10px] text-zinc-500">File upload counts over the last 7 days</p>
              </div>
            </div>
            {totalDocs === 0 && (
              <span className="text-[9px] font-bold text-zinc-650 bg-zinc-900/50 border border-zinc-900 px-2 py-0.5 rounded-full uppercase">Demo Data</span>
            )}
          </div>
          
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={uploadActivityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="dateStr" stroke="#3f3f46" tickLine={false} />
                <YAxis stroke="#3f3f46" tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#18181b', borderRadius: '12px' }}
                  labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" name="Files Uploaded" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* File Type Distribution */}
        <div className="lg:col-span-4 bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl backdrop-blur-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon className="h-4.5 w-4.5 text-indigo-400" />
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">Format Breakdown</h4>
                <p className="text-[10px] text-zinc-500">Distribution by file extensions</p>
              </div>
            </div>
            {totalDocs === 0 && (
              <span className="text-[9px] font-bold text-zinc-650 bg-zinc-900/50 border border-zinc-900 px-2 py-0.5 rounded-full uppercase">Demo Data</span>
            )}
          </div>

          <div className="h-56 w-full text-xs flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fileTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {fileTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#18181b', borderRadius: '12px' }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Uploads Grid */}
      <div className="space-y-4.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-indigo-400" />
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">Recent Activity</h4>
              <p className="text-[10px] text-zinc-500">The last 3 files added to your library</p>
            </div>
          </div>
          <Link href="/documents" className="text-xs text-indigo-400 font-bold hover:underline flex items-center gap-1">
            <span>Explore all</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <DocumentCard key={i} isLoading={true} />
            ))}
          </div>
        ) : recentDocs.length === 0 ? (
          <div className="rounded-2xl border border-zinc-900 border-dashed bg-zinc-950/20 p-12 text-center">
            <FileText className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
            <h4 className="text-sm font-bold text-zinc-300">Your library is empty</h4>
            <p className="text-xs text-zinc-550 mt-1 max-w-xs mx-auto">
              Start by uploading your files or documents under "Add Document" to generate AI summaries.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                id={doc.id}
                title={doc.title}
                description={doc.description}
                category={doc.category}
                fileType={doc.fileType}
                createdAt={doc.createdAt}
                status={doc.status}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
