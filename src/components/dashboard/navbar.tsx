'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, Calendar, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import { useTheme } from '../../providers/theme-provider';

interface NavbarProps {
  className?: string;
  onMenuClick?: () => void;
}

/**
 * Top contextual navbar for dashboard views.
 */
export function Navbar({ className, onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
    <header className="flex h-16 w-full items-center justify-between border-b border-border bg-background/40 backdrop-blur-xl px-4 md:px-8 sticky top-0 z-30 transition-colors duration-300">
      {/* Left section: Hamburger Menu + Title */}
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="mr-3.5 p-2 rounded-xl border border-border bg-muted-bg/50 text-muted hover:text-white lg:hidden transition-all cursor-pointer"
          aria-label="Open Menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-sm md:text-base font-extrabold text-foreground tracking-tight leading-none">{getHeaderTitle()}</h1>
          <p className="text-[10px] md:text-xs text-muted mt-1.5 leading-none">
            {getGreeting()}, <span className="text-foreground font-semibold">{user?.name.split(' ')[0]}</span>
          </p>
        </div>
      </div>

      {/* Right-hand premium actions */}
      <div className="flex items-center gap-2.5 md:gap-4">
        {/* Real-time Date pill */}
        <div className="hidden sm:flex items-center gap-2 rounded-xl bg-muted-bg/30 border border-border px-3 py-1.5 text-xs text-muted">
          <Calendar className="h-3.5 w-3.5 text-muted" />
          <span>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-border bg-muted-bg/30 text-muted hover:text-white transition-all cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>

        {/* PRO badge */}
        <div className="flex items-center gap-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1.5 md:px-3 text-[10px] md:text-xs font-bold text-indigo-400">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
          <span className="hidden sm:inline">Gemini Pro Active</span>
          <span className="sm:hidden">Active</span>
        </div>
      </div>
    </header>
  );
}
export default Navbar;

