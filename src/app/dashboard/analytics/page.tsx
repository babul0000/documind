'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Loader2 } from 'lucide-react';
import { api } from '../../../services/api';
import { Analytics } from '../../../types';
import { AnalyticsCharts } from '../../../components/dashboard/analytics-charts';

/**
 * Analytics page loading user aggregates.
 */
export default function AnalyticsPage() {
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await api.get<Analytics>('/analytics');
      return res;
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <BarChart3 className="h-5.5 w-5.5 text-indigo-400" /> Usage & Volume Analytics
        </h2>
        <p className="text-xs text-muted mt-1">Real-time statistics covering storage volumes, file types, and AI completion indicators.</p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-background/20 p-24 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 text-zinc-700 animate-spin" />
          <span className="text-xs text-muted font-semibold">Analyzing database statistics...</span>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center text-rose-400">
          <p className="text-sm font-semibold">Failed to load analytics statistics: {(error as Error).message}</p>
        </div>
      ) : analyticsData ? (
        <AnalyticsCharts data={analyticsData} />
      ) : (
        <div className="rounded-2xl border border-border p-12 text-center text-muted">
          No analytics data available.
        </div>
      )}
    </div>
  );
}
