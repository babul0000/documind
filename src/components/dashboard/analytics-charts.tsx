'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { FileText, FolderOpen, AlertCircle, CircleDot, Sparkles, Database, BarChart3 } from 'lucide-react';
import { Analytics } from '../../types';

interface AnalyticsChartsProps {
  data: Analytics;
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const {
    totalDocuments = 0,
    totalSize = 0,
    totalAIRequests = 0,
    typeDistribution = [],
    documentsByCategory = [],
    monthlyUploads = [],
    statusDistribution = [],
    activityChart = []
  } = data;

  const completedDocs = statusDistribution.find((s) => s.status === 'completed')?.count || 0;
  const failedDocs = statusDistribution.find((s) => s.status === 'failed')?.count || 0;

  const formattedSize = (totalSize / (1024 * 1024)).toFixed(2) + ' MB';

  // Render empty state if there are no documents in the database
  if (totalDocuments === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-900 bg-zinc-950/10 p-16 text-center max-w-lg mx-auto space-y-4">
        <Database className="h-12 w-12 text-zinc-700 mx-auto" />
        <h3 className="text-sm font-bold text-zinc-300">No Analytics Data Yet</h3>
        <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
          Upload documents and interact with our AI agents to start generating MongoDB storage counts, category splits, and activity timelines.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Statistic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Total Documents Card */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 flex items-center gap-4 shadow-sm hover:border-zinc-800 transition-colors">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <FolderOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Total Documents</p>
            <h3 className="text-2xl font-bold text-white mt-1">{totalDocuments}</h3>
          </div>
        </div>

        {/* AI Requests Card */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 flex items-center gap-4 shadow-sm hover:border-zinc-800 transition-colors">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Sparkles className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">AI Queries & Tasks</p>
            <h3 className="text-2xl font-bold text-white mt-1">{totalAIRequests}</h3>
          </div>
        </div>

        {/* Total Storage Card */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 flex items-center gap-4 shadow-sm hover:border-zinc-800 transition-colors">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Total Storage Size</p>
            <h3 className="text-2xl font-bold text-white mt-1">{formattedSize}</h3>
          </div>
        </div>

        {/* Status Completed Card */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 flex items-center gap-4 shadow-sm hover:border-zinc-800 transition-colors">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CircleDot className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">Fully Analyzed Docs</p>
            <h3 className="text-2xl font-bold text-white mt-1">{completedDocs}</h3>
          </div>
        </div>

      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Uploads - Area Chart */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 flex flex-col h-[380px] shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">Monthly Upload Trends</h3>
            <p className="text-xs text-zinc-500">File uploads aggregated monthly over the past 6 months</p>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyUploads} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="monthlyTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                <XAxis dataKey="month" stroke="#52525b" tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                  labelClassName="text-zinc-400 text-xs font-bold"
                  itemStyle={{ color: '#ffffff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="uploads" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#monthlyTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Documents by Category - Bar Chart */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 flex flex-col h-[380px] shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">Documents by Category</h3>
            <p className="text-xs text-zinc-500">Files volume grouped by category classifications</p>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={documentsByCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#ffffff', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {documentsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* File Format Distribution - Pie Chart */}
        <div className="lg:col-span-1 rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 flex flex-col h-[380px] shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">File Format Distribution</h3>
            <p className="text-xs text-zinc-500">Types of document extensions processed</p>
          </div>
          <div className="flex-1 w-full flex items-center justify-center text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#09090b" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#ffffff', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingTop: '20px', color: '#a1a1aa', fontSize: '11px', fontWeight: '500' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7-Day Upload Activity - Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 flex flex-col h-[380px] shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">Upload Activity Timeline</h3>
            <p className="text-xs text-zinc-500">Number of files processed during the past 7 days</p>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                <XAxis dataKey="date" stroke="#52525b" tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                  labelClassName="text-zinc-400 text-xs font-bold"
                  itemStyle={{ color: '#ffffff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="uploads" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorUploads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
export default AnalyticsCharts;
