'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, SortAsc, SortDesc, BookOpen, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../../services/api';
import { DocumentCard } from '../../../components/dashboard/document-card';
import { Input } from '../../../components/ui/input';

interface DocumentData {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  category: string;
  tags: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

const ITEMS_PER_PAGE = 6;

/**
 * Explore Documents Workspace.
 * Includes Search bar, category filter, file type filter, date sorting, and pagination.
 */
export default function ExploreDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all documents
  const { data, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get<{ documents: DocumentData[] }>('/documents');
      return res.documents;
    },
  });

  // Extract unique categories for the filter list
  const categories = data
    ? ['all', ...Array.from(new Set(data.map((doc) => doc.category).filter(Boolean)))]
    : ['all'];

  // Filter and sort documents
  const filteredDocuments = (data || []).filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.category && doc.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;

    let matchesFileType = true;
    if (selectedFileType !== 'all') {
      if (selectedFileType === 'pdf') {
        matchesFileType = doc.fileType.toLowerCase().includes('pdf');
      } else if (selectedFileType === 'docx') {
        matchesFileType =
          doc.fileType.toLowerCase().includes('word') ||
          doc.fileType.toLowerCase().includes('officedocument') ||
          doc.fileType.toLowerCase().includes('docx');
      } else if (selectedFileType === 'txt') {
        matchesFileType = doc.fileType.toLowerCase().includes('text') || doc.fileType.toLowerCase().includes('txt');
      }
    }

    return matchesSearch && matchesCategory && matchesFileType;
  });

  // Sort by Date
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Pagination bounds
  const totalPages = Math.ceil(sortedDocuments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDocuments = sortedDocuments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset pagination on filter changes
  const handleFilterChange = (setter: (val: string) => void, val: string) => {
    setter(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Title Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black text-white tracking-tight">Explore Documents</h1>
        <p className="text-sm text-zinc-400">Search and filter through all your parsed documents and summaries.</p>
      </div>

      {/* Filter and Search Actions Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-zinc-950/20 border border-zinc-900/80 p-4.5 rounded-2xl backdrop-blur-md">
        {/* Search */}
        <div className="md:col-span-5 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by title, category, keyword..."
            value={searchQuery}
            onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
            className="w-full h-11 bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 focus:border-indigo-500/80 rounded-xl pl-10 pr-4 text-sm text-white placeholder-zinc-550 transition-colors focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => handleFilterChange(setSelectedCategory, e.target.value)}
            className="w-full h-11 bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 rounded-xl px-4 text-xs font-bold text-zinc-300 focus:outline-none focus:border-indigo-500/80 transition-colors cursor-pointer capitalize"
          >
            <option value="all" className="bg-[#09090b]">All Categories</option>
            {categories.filter(c => c !== 'all').map((cat) => (
              <option key={cat} value={cat} className="bg-[#09090b]">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* File Type Filter */}
        <div className="md:col-span-2">
          <select
            value={selectedFileType}
            onChange={(e) => handleFilterChange(setSelectedFileType, e.target.value)}
            className="w-full h-11 bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 rounded-xl px-4 text-xs font-bold text-zinc-300 focus:outline-none focus:border-indigo-500/80 transition-colors cursor-pointer"
          >
            <option value="all" className="bg-[#09090b]">All Filetypes</option>
            <option value="pdf" className="bg-[#09090b]">PDF Docs</option>
            <option value="docx" className="bg-[#09090b]">DOCX Files</option>
            <option value="txt" className="bg-[#09090b]">TXT Files</option>
          </select>
        </div>

        {/* Date Sorting */}
        <div className="md:col-span-2">
          <button
            onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
            className="w-full h-11 bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 hover:text-white rounded-xl px-4 text-xs font-bold text-zinc-400 flex items-center justify-between transition-colors focus:outline-none"
          >
            <span>Sort: {sortBy === 'newest' ? 'Newest' : 'Oldest'}</span>
            {sortBy === 'newest' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Grid Listing View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <DocumentCard key={i} isLoading={true} />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-rose-500/20 bg-rose-500/5 rounded-2xl text-center">
          <AlertCircle className="h-10 w-10 text-rose-400 mb-3" />
          <h3 className="font-bold text-white text-base">Failed to fetch documents</h3>
          <p className="text-xs text-rose-300 mt-1 max-w-sm">There was a network problem fetching your documents. Please verify your connection status.</p>
        </div>
      ) : paginatedDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border border-dashed border-zinc-900 bg-zinc-950/20 rounded-2xl text-center">
          <BookOpen className="h-12 w-12 text-zinc-650 mb-3" />
          <h3 className="font-bold text-white text-base">No documents found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">No files matched your search settings. Try clearing keywords or filters to see all uploads.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                id={doc.id}
                title={doc.title}
                description={doc.description}
                category={doc.category}
                fileType={doc.fileType}
                createdAt={doc.createdAt}
                status={doc.status}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-900/50 pt-5">
              <span className="text-xs font-medium text-zinc-500">
                Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, sortedDocuments.length)} of {sortedDocuments.length} files
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-9 w-9 bg-zinc-900/30 border border-zinc-900 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-900 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-zinc-350 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-9 w-9 bg-zinc-900/30 border border-zinc-900 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-900 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
