'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { FileText, FolderOpen, AlertCircle, CircleDot } from 'lucide-react';
import { Analytics } from '../../types';

interface AnalyticsChartsProps {
  data: Analytics;
}

// Curated violet/indigo premium palette
const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6'];

/**
 * Renders analytical diagrams and aggregate counts for the analytics dashboard view.
 */
export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  // Safe defaults
  const totalDocs = data.totalDocuments || 0;
  const totalSizeFormatted = (data.totalSize / (1024 * 1024)).toFixed(2) + ' MB';
  const typeDistribution = data.typeDistribution || [];
  const statusDistribution = data.statusDistribution || [];
  const activityChart = data.activityChart || [];

  const completedCount = statusDistribution.find((s) => s.status === 'completed')?.count || 0;
  const processingCount = statusDistribution.find((s) => s.status === 'processing')?.count || 0;
  const failedCount = statusDistribution.find((s) => s.status === 'failed')?.count || 0;

  return (
    <div className="space-y-8">
      {/* 1. Stat Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <FolderOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Documents</p>
            <h3 className="text-2xl font-bold text-white mt-1">{totalDocs}</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Storage</p>
            <h3 className="text-2xl font-bold text-white mt-1">{totalSizeFormatted}</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CircleDot className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Successfully Analyzed</p>
            <h3 className="text-2xl font-bold text-white mt-1">{completedCount}</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Processing Failures</p>
            <h3 className="text-2xl font-bold text-white mt-1">{failedCount}</h3>
          </div>
        </div>
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 flex flex-col h-[380px]">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">Upload Activity Timeline</h3>
            <p className="text-xs text-zinc-500">Number of files processed during the past 7 days</p>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
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
                <Area type="monotone" dataKey="uploads" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorUploads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* File Type Distribution Pie Chart */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 flex flex-col h-[380px]">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">File Format Distribution</h3>
            <p className="text-xs text-zinc-500">Types of document files uploaded</p>
          </div>
          <div className="flex-1 w-full flex items-center justify-center text-xs">
            {typeDistribution.length === 0 ? (
              <p className="text-xs text-zinc-500">No document records found.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default AnalyticsCharts;
