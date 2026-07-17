'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquareCode, BarChart3, LogOut, FileText, BrainCircuit, Compass, PlusCircle, FolderOpen } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import { cn } from '../../utils/cn';

interface SidebarProps {
  className?: string;
}

/**
 * Main dashboard navigation sidebar.
 * Includes app brand, page routers, and user profiles with signout links.
 */
export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Explore Documents',
      href: '/dashboard/explore',
      icon: Compass,
    },
    {
      name: 'Add Document',
      href: '/dashboard/documents/add',
      icon: PlusCircle,
    },
    {
      name: 'Manage Documents',
      href: '/dashboard/documents/manage',
      icon: FolderOpen,
    },
    {
      name: 'AI Chat Workspace',
      href: '/dashboard/chat',
      icon: MessageSquareCode,
    },
    {
      name: 'Analytics Insights',
      href: '/dashboard/analytics',
      icon: BarChart3,
    },
  ];

  return (
    <aside className={cn(
      'flex h-screen w-64 flex-col border-r border-zinc-900 bg-zinc-950 px-4 py-6 text-zinc-300',
      className
    )}>
      {/* Brand Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 px-2 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md">
          <BrainCircuit className="h-5.5 w-5.5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-white text-base tracking-wide leading-tight">DocuMind AI</span>
          <span className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase">Assistant</span>
        </div>
      </Link>

      {/* Main Navigation Links */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group',
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 border border-indigo-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
              )}
            >
              <Icon className={cn(
                'h-5 w-5 transition-transform duration-200 group-hover:scale-105',
                isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'
              )} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="border-t border-zinc-900 pt-4 mt-auto">
        <div className="flex items-center gap-3 px-2 py-1.5 mb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 font-bold text-white text-sm">
            {user?.name?.slice(0, 2).toUpperCase() || 'DM'}
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-xs font-bold text-white truncate leading-snug">{user?.name}</h4>
            <p className="text-[10px] text-zinc-500 truncate leading-none">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all duration-200 group"
        >
          <LogOut className="h-5 w-5 text-zinc-500 group-hover:text-rose-400 transition-transform duration-200 group-hover:translate-x-0.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
export default Sidebar;
