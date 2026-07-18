'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  Search, AlertCircle, ChevronLeft, ChevronRight,
  FileText, ArrowRight, RefreshCw, FolderOpen
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/use-auth';
import { Sidebar } from '../../components/dashboard/sidebar';
import { Navbar } from '../../components/dashboard/navbar';
import { Spinner } from '../../components/ui/spinner';

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
}

const ITEMS_PER_PAGE = 8; // Exactly 2 rows of 4 cards on desktop

export default function ExploreDocumentsPage() {
  const { user, loading: authLoading } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all documents from MongoDB using TanStack Query
  const { data: documents = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get<{ documents: DocumentData[] }>('/documents');
      return res.documents;
    },
    enabled: !!user,
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
        <div className="w-full h-36 rounded-t-2xl bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-b border-border flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30 text-[9px] font-extrabold text-rose-500 tracking-wider">
            PDF
          </div>
          <FileText className="h-10 w-10 text-rose-500" />
        </div>
      );
    }
    
    if (isDocx) {
      return (
        <div className="w-full h-36 rounded-t-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-b border-border flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/30 text-[9px] font-extrabold text-blue-500 tracking-wider">
            DOCX
          </div>
          <FileText className="h-10 w-10 text-blue-500" />
        </div>
      );
    }
    
    return (
      <div className="w-full h-36 rounded-t-2xl bg-gradient-to-br from-zinc-500/10 to-slate-500/10 border-b border-border flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-zinc-500/20 border border-zinc-500/30 text-[9px] font-extrabold text-zinc-400 tracking-wider">
          TXT
        </div>
        <FileText className="h-10 w-10 text-zinc-555 text-zinc-400" />
      </div>
    );
  };

  // Render auth loading state
  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#050505] text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs font-semibold tracking-wider uppercase text-zinc-500">Initializing session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Route redirect handles auth protection
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050505]">
      {/* Left Sidebar navigation */}
      <Sidebar className="shrink-0" />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />

        {/* Scrollable Document Area */}
        <main className="flex-1 overflow-y-auto bg-zinc-950/20 p-8 space-y-6">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Explore Documents</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Filter, sort, and navigate through all processed document vectors.</p>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isLoading || isRefetching}
              className="h-9 px-3.5 rounded-xl border border-zinc-900 bg-zinc-950 text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-2 hover:bg-zinc-900 disabled:opacity-50 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
              <span>Refresh Library</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-zinc-950/40 border border-zinc-900 p-4 rounded-2xl">
            {/* Title search */}
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search documents by title..."
                value={searchQuery}
                onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                className="w-full h-10.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-indigo-500/80 rounded-xl pl-10 pr-4 text-xs text-white placeholder-zinc-600 transition-colors focus:outline-none"
              />
            </div>

            {/* Category Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => handleFilterChange(setSelectedCategory, e.target.value)}
                className="w-full h-10.5 bg-zinc-955 border border-zinc-900 hover:border-zinc-800 rounded-xl px-4 text-xs font-bold text-zinc-400 focus:outline-none focus:border-indigo-500/80 transition-colors cursor-pointer capitalize"
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
                className="w-full h-10.5 bg-zinc-955 border border-zinc-900 hover:border-zinc-800 rounded-xl px-4 text-xs font-bold text-zinc-400 focus:outline-none focus:border-indigo-500/80 transition-colors cursor-pointer"
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
                className="w-full h-10.5 bg-zinc-955 border border-zinc-900 hover:border-zinc-800 rounded-xl px-4 text-xs font-bold text-zinc-400 focus:outline-none focus:border-indigo-500/80 transition-colors cursor-pointer"
              >
                <option value="newest" className="bg-[#09090b]">Newest Added</option>
                <option value="oldest" className="bg-[#09090b]">Oldest Added</option>
                <option value="title" className="bg-[#09090b]">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Error state */}
          {error ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-12 text-center max-w-lg mx-auto flex flex-col items-center gap-3.5">
              <AlertCircle className="h-10 w-10 text-rose-400" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Failed to load documents</h3>
                <p className="text-xs text-rose-300/80">{(error as Error).message || 'An unexpected connection error occurred.'}</p>
              </div>
              <button
                onClick={() => refetch()}
                className="h-9 px-6 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 transition-colors cursor-pointer"
              >
                Retry Request
              </button>
            </div>
          ) : isLoading ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col h-[410px] w-full rounded-2xl border border-zinc-900 bg-zinc-950/20 animate-pulse overflow-hidden">
                  <div className="w-full h-36 bg-zinc-900/50 border-b border-zinc-900" />
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
            <div className="rounded-2xl border border-dashed border-zinc-900 bg-zinc-950/10 p-16 text-center max-w-md mx-auto">
              <FolderOpen className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-zinc-300">No documents found</h3>
              <p className="text-xs text-zinc-500 mt-1.5 max-w-xs mx-auto">
                No files match your search criteria. Try modifying your filters or upload a new file.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedFileType('all');
                    setSortBy('newest');
                  }}
                  className="h-9 px-4 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
                <Link href="/dashboard/documents/add">
                  <button className="h-9 px-4 rounded-xl bg-accent text-white text-xs font-semibold hover:opacity-90 transition-colors cursor-pointer">
                    Upload Document
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            /* Document Cards Grid Layout */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {paginatedDocuments.map((doc) => {
                  const formattedDate = new Date(doc.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  return (
                    <div 
                      key={doc.id}
                      className="flex flex-col h-[410px] w-full rounded-2xl border border-border bg-card-bg hover:border-accent/30 shadow-sm transition-all hover:shadow-md overflow-hidden group"
                    >
                      {/* File Icon Thumbnail */}
                      {getFileThumbnail(doc.fileType)}

                      {/* Content Section */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between text-[10px] font-bold text-muted">
                            <span className="bg-muted-bg px-2 py-0.5 rounded-md text-foreground capitalize truncate max-w-[120px]">
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

                        {/* Bottom stats and action button */}
                        <div className="space-y-3 pt-3">
                          <div className="flex items-center justify-between text-[10px] text-muted border-t border-border/50 pt-2.5">
                            <span>Type: {doc.fileType.split('/').pop()?.toUpperCase() || 'UNKNOWN'}</span>
                            <span>{(doc.size / 1024).toFixed(1)} KB</span>
                          </div>

                          <Link href={`/dashboard/documents/${doc.id}`} className="block">
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
                <div className="flex items-center justify-between border-t border-zinc-900 pt-4">
                  <span className="text-[11px] text-zinc-500 font-bold">
                    Page {currentPage} of {totalPages} ({filteredDocuments.length} files)
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-zinc-900 bg-zinc-950 text-zinc-400 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
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
                              : 'border border-zinc-900 bg-zinc-950 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-zinc-900 bg-zinc-950 text-zinc-400 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
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
      </div>
    </div>
  );
}
