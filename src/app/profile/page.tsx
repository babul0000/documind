'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  User, Mail, Calendar, Shield, LayoutDashboard, FileText, 
  Settings, Award, Clock, ArrowRight, ShieldCheck, HardDrive 
} from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import { api } from '../../services/api';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Spinner } from '../../components/ui/spinner';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();

  // Fetch documents count for stats
  const { data: docs = [], isLoading: docsLoading } = useQuery({
    queryKey: ['userDocs'],
    queryFn: async () => {
      const res = await api.get<{ documents: any[] }>('/documents');
      return res.documents;
    },
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <PublicNavbar />
        <main className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </main>
        <PublicFooter />
      </div>
    );
  }

  // Redirect to login if guest attempts to access profile
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <PublicNavbar />
        <main className="flex-1 max-w-md mx-auto px-6 py-24 text-center space-y-6">
          <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <Shield className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Access Denied</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Please sign in to view your account profile details and active intelligence quotas.
            </p>
          </div>
          <Link href="/login">
            <button className="h-10 px-6 rounded-xl bg-accent text-white text-xs font-semibold cursor-pointer">
              Go to Sign In
            </button>
          </Link>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <PublicNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 md:px-8 w-full space-y-8 animate-in fade-in duration-300">
        
        {/* Profile Card Header */}
        <section className="rounded-2xl border border-border bg-card-bg p-8 relative overflow-hidden shadow-md">
          {/* Decorative glowing blobs */}
          <div className="absolute top-1/2 right-10 -translate-y-1/2 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            {/* User Profile Image */}
            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-1 shrink-0 shadow-lg overflow-hidden flex items-center justify-center">
              {user.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={user.image} alt={user.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                <div className="h-full w-full rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center font-extrabold text-3xl text-white uppercase select-none">
                  {user.name?.slice(0, 2).toUpperCase() || 'DM'}
                </div>
              )}
            </div>

            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Verified Profile</span>
                </span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/5 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
                  <Award className="h-3.5 w-3.5" />
                  <span>Pro Member</span>
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-white truncate">{user.name}</h2>
              <p className="text-xs text-zinc-500 truncate flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                <span>{user.email}</span>
              </p>
            </div>

            <Link href="/dashboard">
              <button className="h-10 px-5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 flex items-center gap-1.5 cursor-pointer shadow-md transition-all">
                <span>Dashboard Workspace</span>
                <LayoutDashboard className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </section>

        {/* Detailed Stats and Quotas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Documents uploaded */}
          <div className="bg-card-bg border border-border p-6 rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-zinc-500">
              <FileText className="h-4.5 w-4.5 text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Uploaded Documents</span>
            </div>
            <div className="text-2xl font-extrabold text-white">
              {docsLoading ? '...' : `${docs.length} Files`}
            </div>
            <p className="text-[10px] text-zinc-500">
              Index limits: {docs.length} / 50 total documents.
            </p>
          </div>

          {/* Storage Quota */}
          <div className="bg-card-bg border border-border p-6 rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-zinc-500">
              <HardDrive className="h-4.5 w-4.5 text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Active Storage Use</span>
            </div>
            <div className="text-2xl font-extrabold text-white">
              {docsLoading ? '...' : `${(docs.reduce((acc, d) => acc + d.size, 0) / (1024 * 1024)).toFixed(2)} MB`}
            </div>
            <p className="text-[10px] text-zinc-500">
              Storage quota: 100 MB max.
            </p>
          </div>

          {/* Member duration */}
          <div className="bg-card-bg border border-border p-6 rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-zinc-500">
              <Calendar className="h-4.5 w-4.5 text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Account Tenure</span>
            </div>
            <div className="text-2xl font-extrabold text-white">
              Active Member
            </div>
            <p className="text-[10px] text-zinc-500">
              Active status verified.
            </p>
          </div>
        </div>

        {/* Profile Settings Information list */}
        <section className="rounded-2xl border border-border bg-card-bg p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Settings className="h-4.5 w-4.5 text-indigo-400" />
            <span>Account Details & Quotas</span>
          </h3>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted-bg/30 border-b border-border text-foreground font-bold">
                  <th className="p-3">Attribute</th>
                  <th className="p-3">Detail Value</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400 divide-y divide-border/60 font-medium">
                <tr>
                  <td className="p-3">Full Legal Name</td>
                  <td className="p-3 text-white">{user.name}</td>
                </tr>
                <tr>
                  <td className="p-3">Primary Email</td>
                  <td className="p-3 text-white">{user.email}</td>
                </tr>
                <tr>
                  <td className="p-3">Security Level</td>
                  <td className="p-3 text-white">Administrator Access</td>
                </tr>
                <tr>
                  <td className="p-3">Active Workspace</td>
                  <td className="p-3 text-white">DocuMind Cloud Shared Hub</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
