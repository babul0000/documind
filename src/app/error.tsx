'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to diagnostic logs
    console.error('Next.js Client Crash caught by ErrorBoundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 transition-colors duration-300">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-500">
          <AlertCircle className="h-7 w-7 animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Something went wrong</h1>
          <p className="text-sm text-muted leading-relaxed">
            An unexpected error has occurred inside the client application workspace.
          </p>
          <div className="rounded-xl border border-border bg-card-bg/60 p-3 mt-4 text-[10px] font-mono text-rose-500 truncate max-w-sm mx-auto">
            {error.message || 'Unknown Workspace Exception'}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-xs font-semibold text-white hover:opacity-95 transition-all shadow-md cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card-bg px-6 py-2.5 text-xs font-semibold text-foreground hover:bg-muted-bg transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Go to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
