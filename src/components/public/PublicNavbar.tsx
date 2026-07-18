'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrainCircuit, Menu, X, Sun, Moon, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import { useTheme } from '../../providers/theme-provider';

export function PublicNavbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
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
          <Link href="/#features" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
            How It Works
          </Link>
          <Link href="/#faq" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
            FAQ
          </Link>
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href ? 'text-accent font-semibold' : 'text-muted hover:text-foreground'
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
            className="p-2 rounded-xl border border-border bg-card-bg text-muted hover:text-foreground transition-all hover:bg-muted-bg cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4.5 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 hover:shadow-indigo-500/10 transition-all duration-200"
            >
              <span>Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-muted hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-accent px-4.5 py-2 text-sm font-semibold text-white hover:opacity-90 transition-all duration-200"
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
            <Link
              href="/#features"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/#faq"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href ? 'text-accent font-semibold' : 'text-muted hover:text-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          <div className="border-t border-border pt-4 flex flex-col gap-3">
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-border bg-card-bg text-sm font-semibold text-foreground hover:bg-muted-bg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-accent text-sm font-semibold text-white hover:opacity-90 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
export default PublicNavbar;
