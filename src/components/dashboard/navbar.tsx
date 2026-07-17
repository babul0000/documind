'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';

interface NavbarProps {
  className?: string;
}

/**
 * Top contextual navbar for dashboard views.
 */
export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Compute page headers
  const getHeaderTitle = () => {
    if (pathname.includes('/analytics')) return 'Analytics Insights';
    if (pathname.includes('/chat')) return 'AI Document Workspace';
    return 'Dashboard Overview';
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-md px-8 sticky top-0 z-30">
      {/* Title */}
      <div className="flex flex-col">
        <h1 className="text-lg font-bold text-white tracking-tight">{getHeaderTitle()}</h1>
        <p className="text-xs text-zinc-500">
          {getGreeting()}, {user?.name.split(' ')[0]}
        </p>
      </div>

      {/* Right-hand premium actions */}
      <div className="flex items-center gap-4">
        {/* Real-time Date pill */}
        <div className="hidden sm:flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-850 px-3 py-1.5 text-xs text-zinc-400">
          <Calendar className="h-3.5 w-3.5 text-zinc-500" />
          <span>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>

        {/* PRO badge */}
        <div className="flex items-center gap-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-400">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
          <span>Gemini Pro Active</span>
        </div>
      </div>
    </header>
  );
}
export default Navbar;
