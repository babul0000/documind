'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BrainCircuit, Menu, X, Sun, Moon, ArrowRight, LogOut, 
  ChevronDown, User, LayoutDashboard, Compass 
} from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import { useTheme } from '../../providers/theme-provider';

export function PublicNavbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const links = [
    { name: 'Home', href: '/' },
    user 
      ? { name: 'Profile', href: '/profile' }
      : { name: 'Explore Documents', href: '/documents' },
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6 md:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-md transition-transform duration-200 group-hover:scale-105">
            <BrainCircuit className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-foreground text-base tracking-wide">DocuMind AI</span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-semibold transition-colors ${
                pathname === link.href ? 'text-accent' : 'text-muted hover:text-foreground'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action button & theme toggle */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-border bg-card-bg text-muted hover:text-foreground transition-all hover:bg-muted-bg cursor-pointer animate-in fade-in"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            /* Premium User Profile Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-border bg-card-bg/60 hover:bg-muted-bg text-left transition-all cursor-pointer"
              >
                {/* Initial Avatar */}
                <div className="h-7 w-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-xs text-white uppercase shrink-0">
                  {user.name?.slice(0, 2).toUpperCase() || 'DM'}
                </div>
                <div className="hidden lg:block min-w-0 pr-1 select-none">
                  <h4 className="text-[11px] font-bold text-white leading-tight truncate max-w-[100px]">{user.name}</h4>
                  <p className="text-[9px] text-zinc-550 leading-tight">DocuMind Member</p>
                </div>
                <ChevronDown className={`h-3 w-3 text-zinc-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown panel */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-card-bg p-4.5 shadow-2xl z-55 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Profile Info */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 font-extrabold text-white text-sm">
                      {user.name?.slice(0, 2).toUpperCase() || 'DM'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-white truncate">{user.name}</h4>
                      <p className="text-[10px] text-zinc-500 truncate mt-0.5">{user.email}</p>
                    </div>
                  </div>

                  <div className="border-t border-zinc-900/60" />

                  {/* Menu Options */}
                  <div className="space-y-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900/40 transition-all cursor-pointer group"
                    >
                      <LayoutDashboard className="h-4 w-4 text-zinc-500 group-hover:text-indigo-400 transition-transform" />
                      <span>Dashboard Workspace</span>
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900/40 transition-all cursor-pointer group"
                    >
                      <User className="h-4 w-4 text-zinc-500 group-hover:text-indigo-400 transition-transform" />
                      <span>My Profile</span>
                    </Link>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 transition-all cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-accent px-4.5 py-2 text-sm font-semibold text-white hover:opacity-90 transition-all duration-200 cursor-pointer"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger menu */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-border bg-card-bg text-muted hover:text-foreground transition-all"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-muted hover:text-foreground transition-colors"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-3.5">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`text-sm font-semibold transition-colors ${
                  pathname === link.href ? 'text-accent' : 'text-muted hover:text-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          <div className="border-t border-border pt-4">
            {user ? (
              <div className="flex flex-col gap-3">
                {/* Profile card metadata details */}
                <div className="flex items-center gap-3 bg-card-bg/40 border border-border p-3.5 rounded-xl">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 font-bold text-white text-xs">
                    {user?.name?.slice(0, 2).toUpperCase() || 'DM'}
                  </div>
                  <div className="flex-1 min-w-0 font-medium">
                    <h4 className="text-xs font-bold text-white truncate leading-snug">{user?.name}</h4>
                    <p className="text-[9px] text-zinc-550 truncate leading-none mt-0.5">{user?.email}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex-grow inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="flex-grow inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card-bg py-2.5 text-xs font-bold text-zinc-400 hover:text-rose-400 cursor-pointer transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-border bg-card-bg text-sm font-semibold text-foreground hover:bg-muted-bg transition-colors cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-accent text-sm font-semibold text-white hover:opacity-90 transition-all cursor-pointer"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default PublicNavbar;
