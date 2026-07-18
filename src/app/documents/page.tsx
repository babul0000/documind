'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  Search, AlertCircle, ChevronLeft, ChevronRight,
  FileText, ArrowRight, RefreshCw, FolderOpen, Award
} from 'lucide-react';
import { api } from '../../services/api';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';

interface DocumentData {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  category: string;
  tags: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  size: number;
  createdAt: string;
  keyInfo?: {
    confidenceScore?: number;
  };
}

const ITEMS_PER_PAGE = 8; // Exactly 2 rows of 4 cards on desktop

export default function ExploreDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all public documents from MongoDB
  const { data: documents = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['publicDocuments'],
    queryFn: async () => {
      const res = await api.get<{ documents: DocumentData[] }>('/documents/public-list');
      return res.documents;
    },
  });

  // Extract unique categories for the dropdown filter list
  const categories = React.useMemo(() => {
    const list = new Set(documents.map((doc) => doc.category).filter(Boolean));
    return ['all', ...Array.from(list)];
  }, [documents]);

  // Filter documents by title, category, and file extension
  const filteredDocuments = React.useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;

      let matchesFileType = true;
      if (selectedFileType !== 'all') {
        const typeLower = doc.fileType.toLowerCase();
        if (selectedFileType === 'pdf') {
          matchesFileType = typeLower.includes('pdf');
        } else if (selectedFileType === 'docx') {
          matchesFileType = typeLower.includes('word') || typeLower.includes('officedocument') || typeLower.includes('docx');
        } else if (selectedFileType === 'txt') {
          matchesFileType = typeLower.includes('text') || typeLower.includes('txt');
        }
      }

      return matchesSearch && matchesCategory && matchesFileType;
    });
  }, [documents, searchQuery, selectedCategory, selectedFileType]);

  // Sort by date (newest/oldest) or title (alphabetical)
  const sortedDocuments = React.useMemo(() => {
    return [...filteredDocuments].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [filteredDocuments, sortBy]);

  // Pagination bounds division
  const totalPages = Math.ceil(sortedDocuments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDocuments = sortedDocuments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleFilterChange = (setter: (val: any) => void, val: any) => {
    setter(val);
    setCurrentPage(1);
  };

  const getFileThumbnail = (fileType: string) => {
    const type = fileType.toLowerCase();
    const isPdf = type.includes('pdf');
    const isDocx = type.includes('word') || type.includes('officedocument') || type.includes('docx');
    
    if (isPdf) {
      return (
        <div className="w-full h-36 rounded-t-xl bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-b border-border flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30 text-[9px] font-extrabold text-rose-500 tracking-wider">
            PDF
          </div>
          <FileText className="h-10 w-10 text-rose-500" />
        </div>
      );
    }
    
    if (isDocx) {
      return (
        <div className="w-full h-36 rounded-t-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-b border-border flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/30 text-[9px] font-extrabold text-blue-500 tracking-wider">
            DOCX
          </div>
          <FileText className="h-10 w-10 text-blue-500" />
        </div>
      );
    }
    
    return (
      <div className="w-full h-36 rounded-t-xl bg-gradient-to-br from-zinc-500/10 to-slate-500/10 border-b border-border flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-zinc-500/20 border border-zinc-500/30 text-[9px] font-extrabold text-zinc-400 tracking-wider">
          TXT
        </div>
        <FileText className="h-10 w-10 text-zinc-400" />
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:px-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Explore Documents</h1>
            <p className="text-xs text-zinc-500 mt-1">Discover, filter, and inspect document analysis indexes powered by AI.</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="h-10 px-4 rounded-xl border border-border bg-card-bg text-xs font-bold text-muted hover:text-white flex items-center gap-2 hover:bg-muted-bg disabled:opacity-50 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Refresh Explorer</span>
          </button>
        </div>

        {/* Filters and sorting panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-card-bg border border-border p-4.5 rounded-2xl shadow-sm">
          {/* Title search */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search documents by title..."
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
              className="w-full h-10.5 bg-background border border-border hover:border-zinc-800 focus:border-indigo-500/80 rounded-xl pl-10 pr-4 text-xs text-white placeholder-zinc-655 transition-colors focus:outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => handleFilterChange(setSelectedCategory, e.target.value)}
              className="w-full h-10.5 bg-background border border-border hover:border-zinc-800 rounded-xl px-4 text-xs font-bold text-zinc-400 focus:outline-none focus:border-indigo-500/80 transition-colors cursor-pointer capitalize"
            >
              <option value="all" className="bg-[#09090b]">All Categories</option>
              {categories.filter((c) => c !== 'all').map((cat) => (
                <option key={cat} value={cat} className="bg-[#09090b]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* File Type Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedFileType}
              onChange={(e) => handleFilterChange(setSelectedFileType, e.target.value)}
              className="w-full h-10.5 bg-background border border-border hover:border-zinc-800 rounded-xl px-4 text-xs font-bold text-zinc-400 focus:outline-none focus:border-indigo-500/80 transition-colors cursor-pointer"
            >
              <option value="all" className="bg-[#09090b]">All Formats</option>
              <option value="pdf" className="bg-[#09090b]">PDF Docs</option>
              <option value="docx" className="bg-[#09090b]">DOCX Files</option>
              <option value="txt" className="bg-[#09090b]">TXT Files</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => handleFilterChange(setSortBy, e.target.value as any)}
              className="w-full h-10.5 bg-background border border-border hover:border-zinc-800 rounded-xl px-4 text-xs font-bold text-zinc-400 focus:outline-none focus:border-indigo-500/80 transition-colors cursor-pointer"
            >
              <option value="newest" className="bg-[#09090b]">Newest Added</option>
              <option value="oldest" className="bg-[#09090b]">Oldest Added</option>
              <option value="title" className="bg-[#09090b]">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-12 text-center max-w-lg mx-auto flex flex-col items-center gap-3.5">
            <AlertCircle className="h-10 w-10 text-rose-400" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Failed to load library</h3>
              <p className="text-xs text-rose-300/80">{(error as Error).message || 'An unexpected error occurred.'}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="h-9.5 px-6 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : isLoading ? (
          /* Skeleton Loading Grid (Desktop: exactly 4 cards) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col h-[415px] w-full rounded-xl border border-border bg-card-bg/60 animate-pulse overflow-hidden">
                <div className="w-full h-36 bg-zinc-900/50 border-b border-border" />
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <div className="h-4 w-16 bg-zinc-900 rounded-md" />
                      <div className="h-4 w-12 bg-zinc-900 rounded-md" />
                    </div>
                    <div className="h-5 w-3/4 bg-zinc-900 rounded-md" />
                    <div className="h-4 w-full bg-zinc-900 rounded-md" />
                    <div className="h-4 w-5/6 bg-zinc-900 rounded-md" />
                  </div>
                  <div className="h-9.5 w-full bg-zinc-900 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedDocuments.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-border bg-card-bg/40 p-16 text-center max-w-md mx-auto space-y-4">
            <FolderOpen className="h-12 w-12 text-zinc-700 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-300">No public documents found</h3>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                Try modifying your filters, search terms, or upload a new file.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedFileType('all');
                  setSortBy('newest');
                }}
                className="h-9 px-4 rounded-xl border border-border text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
              <Link href="/documents/add">
                <button className="h-9 px-4 rounded-xl bg-accent text-white text-xs font-semibold hover:opacity-90 transition-colors cursor-pointer">
                  Upload Document
                </button>
              </Link>
            </div>
          </div>
        ) : (
          /* Responsive Cards Grid (Desktop = exactly 4, Tablet = 2, Mobile = 1) */
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedDocuments.map((doc) => {
                const formattedDate = new Date(doc.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                
                const score = doc.keyInfo?.confidenceScore ?? 92;

                return (
                  <div 
                    key={doc.id}
                    className="flex flex-col h-[415px] w-full rounded-xl border border-border bg-card-bg hover:border-accent/30 shadow-sm transition-all hover:shadow-md overflow-hidden group hover:translate-y-[-2px] duration-300"
                  >
                    {/* File icon preview image thumbnail */}
                    {getFileThumbnail(doc.fileType)}

                    {/* Meta detail description body */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-muted">
                          <span className="bg-muted-bg px-2.5 py-0.5 rounded-md text-foreground capitalize truncate max-w-[125px]">
                            {doc.category || 'General'}
                          </span>
                          <span>{formattedDate}</span>
                        </div>

                        <h3 
                          className="text-sm font-extrabold text-foreground line-clamp-1 group-hover:text-accent transition-colors" 
                          title={doc.title}
                        >
                          {doc.title}
                        </h3>

                        <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                          {doc.description || 'No description provided.'}
                        </p>
                      </div>

                      {/* Score metrics & View details actions */}
                      <div className="space-y-3 pt-3">
                        <div className="flex items-center justify-between text-[10px] text-muted border-t border-border/50 pt-2.5">
                          <span className="flex items-center gap-1">
                            <Award className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <span>Confidence: <strong className="text-indigo-400">{score}%</strong></span>
                          </span>
                          <span>{(doc.size / 1024).toFixed(1)} KB</span>
                        </div>

                        <Link href={`/documents/${doc.id}`} className="block">
                          <button className="w-full h-9.5 rounded-xl bg-accent text-white text-xs font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                            <span>View Details</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-[11px] text-zinc-550 font-bold">
                  Page {currentPage} of {totalPages} ({filteredDocuments.length} files)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-border bg-card-bg text-zinc-400 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8.5 w-8.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-accent text-white shadow-md'
                            : 'border border-border bg-card-bg text-zinc-400 hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-border bg-card-bg text-zinc-400 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
