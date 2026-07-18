'use client';

import React, { useState } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { Sidebar } from '../../components/dashboard/sidebar';
import { Navbar } from '../../components/dashboard/navbar';
import { Spinner } from '../../components/ui/spinner';

/**
 * Nested layout that wraps the client workspace screen.
 * Displays Sidebar, Navbar, and handles loading page states.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-muted">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs font-semibold tracking-wider uppercase text-muted">Initializing session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // The AuthProvider router guard will automatically redirect
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Navigation Sidebar */}
      <Sidebar className="shrink-0" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        {/* Scrollable Context Area */}
        <main className="flex-1 overflow-y-auto bg-background/20 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
