'use client';

import React from 'react';
import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card-bg transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Info */}
          <div className="space-y-4 xl:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-md">
                <BrainCircuit className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-foreground text-base tracking-wide">DocuMind AI</span>
            </Link>
            <p className="text-xs text-muted max-w-sm leading-relaxed">
              Unlock the secrets hidden within your documents. DocuMind AI utilizes cutting-edge LLMs to analyze, summarize, and chat with your PDF, Word, and text files instantly.
            </p>
            <div className="flex space-x-5">
              <a href="https://twitter.com" className="text-muted hover:text-foreground transition-colors" target="_blank" rel="noreferrer">
                <span className="sr-only">Twitter</span>
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://github.com" className="text-muted hover:text-foreground transition-colors" target="_blank" rel="noreferrer">
                <span className="sr-only">GitHub</span>
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
              <a href="https://linkedin.com" className="text-muted hover:text-foreground transition-colors" target="_blank" rel="noreferrer">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>


          {/* Navigation Links Columns */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0 md:grid-cols-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">Product</h3>
              <ul role="list" className="mt-4 space-y-2.5">
                <li>
                  <Link href="/" className="text-xs text-muted hover:text-foreground transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/documents" className="text-xs text-muted hover:text-foreground transition-colors font-semibold text-indigo-400">
                    Explore Documents
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-xs text-muted hover:text-foreground transition-colors">
                    Dashboard Workspace
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">Company & Press</h3>
              <ul role="list" className="mt-4 space-y-2.5">
                <li>
                  <Link href="/about" className="text-xs text-muted hover:text-foreground transition-colors">
                    About DocuMind
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-xs text-muted hover:text-foreground transition-colors">
                    Technical Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-xs text-muted hover:text-foreground transition-colors">
                    Contact & Support
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">Security & Legal</h3>
              <ul role="list" className="mt-4 space-y-2.5">
                <li>
                  <Link href="/privacy" className="text-xs text-muted hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-xs text-muted hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright block */}
        <div className="mt-12 border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted text-center md:text-left">
            &copy; {currentYear} DocuMind AI. All rights reserved. Created using Next.js, Express, and Gemini.
          </p>
          <p className="text-xs text-muted text-center md:text-right">
            Designed for secure enterprise document intelligence.
          </p>
        </div>
      </div>
    </footer>
  );
}
export default PublicFooter;
