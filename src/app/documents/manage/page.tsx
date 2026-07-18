'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  Search, Eye, Trash2, Calendar, FileText, CheckCircle2, 
  AlertTriangle, ArrowRight, ChevronLeft, ChevronRight, RefreshCw, FolderOpen
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../hooks/use-auth';
import { Sidebar } from '../../../components/dashboard/sidebar';
import { Navbar } from '../../../components/dashboard/navbar';
import { Spinner } from '../../../components/ui/spinner';

interface DocumentData {
  id: string;
  title: string;
  shortDescription?: string;
  imageUrl?: string;
  fileType: string;
  category: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

const ITEMS_PER_PAGE = 8;

export default function ManageDocumentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  // Fetch all user documents
  const { data: documents = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get<{ documents: DocumentData[] }>('/documents');
      return res.documents;
    },
    enabled: !!user,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setDeleteConfirmId(null);
      setDeleteMessage('Document deleted successfully.');
      setTimeout(() => setDeleteMessage(null), 3000);
    },
    onError: (err: any) => {
      setDeleteConfirmId(null);
      alert(err.message || 'Failed to delete document.');
    }
  });

  // Filter documents by title
  const filteredDocuments = React.useMemo(() => {
    return documents.filter((doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [documents, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDocuments = filteredDocuments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const executeDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (authLoading) {
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
    return null;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <Sidebar className="shrink-0" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable Table Area */}
        <main className="flex-1 overflow-y-auto bg-background/20 p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Manage Documents</h1>
              <p className="text-xs text-muted mt-0.5">Edit, index, or delete your parsing document records.</p>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isLoading || isRefetching}
              className="h-9 px-3.5 rounded-xl border border-border bg-background text-xs font-bold text-muted hover:text-white flex items-center gap-2 hover:bg-muted-bg disabled:opacity-50 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
              <span>Refresh Library</span>
            </button>
          </div>

          {/* Delete confirmation modal */}
          {deleteConfirmId && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-background border border-border p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-xl">
                <div className="flex items-center gap-3 text-amber-500">
                  <AlertTriangle className="h-6 w-6 shrink-0" />
                  <h3 className="text-sm font-extrabold text-white">Purge Confirmation</h3>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Are you sure you want to permanently delete this document and all associated AI reports and conversations? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="h-9 px-4 rounded-xl border border-border text-xs font-bold text-muted hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteConfirmId && executeDelete(deleteConfirmId)}
                    disabled={deleteMutation.isPending}
                    className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {deleteMutation.isPending ? 'Purging...' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Banners */}
          {deleteMessage && (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-xs text-emerald-400">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{deleteMessage}</span>
            </div>
          )}

          {/* Actions & Filters */}
          <div className="flex items-center bg-background/40 border border-border p-4 rounded-2xl">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Search documents by title..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full h-10.5 bg-background border border-border hover:border-border focus:border-indigo-500/80 rounded-xl pl-10 pr-4 text-xs text-white placeholder-zinc-600 transition-colors focus:outline-none"
              />
            </div>
          </div>

          {/* Documents Table / Card List */}
          {error ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-12 text-center max-w-lg mx-auto flex flex-col items-center gap-3">
              <AlertTriangle className="h-10 w-10 text-rose-500" />
              <h3 className="text-sm font-bold text-white">Connection Error</h3>
              <p className="text-xs text-rose-300/80">{(error as Error).message || 'Failed to fetch MongoDB library.'}</p>
              <button
                onClick={() => refetch()}
                className="h-9 px-6 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : isLoading ? (
            /* Skeleton Table list */
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-background/40 border border-border rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredDocuments.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl border border-dashed border-border bg-background/10 p-16 text-center max-w-md mx-auto">
              <FolderOpen className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-foreground">No documents found</h3>
              <p className="text-xs text-muted mt-1.5 max-w-xs mx-auto">
                {searchQuery ? 'No documents match your query string.' : 'You have not uploaded any documents yet.'}
              </p>
              {!searchQuery && (
                <Link href="/documents/add" className="inline-block mt-5">
                  <button className="h-9 px-4 rounded-xl bg-accent text-white text-xs font-semibold hover:opacity-90 transition-colors cursor-pointer">
                    Upload Document
                  </button>
                </Link>
              )}
            </div>
          ) : (
            /* Documents Table & Grid layouts */
            <div className="space-y-6">
              
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-2xl border border-border bg-card-bg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-background border-b border-border text-muted font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4">Cover / File</th>
                      <th className="p-4">Document Title</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Size</th>
                      <th className="p-4">Upload Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-foreground">
                    {paginatedDocuments.map((doc) => {
                      const uploadDate = new Date(doc.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });
                      
                      return (
                        <tr key={doc.id} className="hover:bg-muted-bg/10 transition-colors">
                          <td className="p-4">
                            {doc.imageUrl ? (
                              <img 
                                src={doc.imageUrl} 
                                alt={doc.title} 
                                className="h-10 w-10 rounded-lg object-cover border border-border" 
                                onError={(e) => {
                                  // Fallback to text icon on load failure
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-muted-bg border border-border flex items-center justify-center text-muted">
                                <FileText className="h-5 w-5" />
                              </div>
                            )}
                          </td>
                          <td className="p-4 font-bold text-white">
                            <div className="space-y-0.5 max-w-xs">
                              <span className="block truncate">{doc.title}</span>
                              {doc.shortDescription && (
                                <span className="block text-[10px] text-muted font-medium truncate">{doc.shortDescription}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 capitalize font-semibold">{doc.category}</td>
                          <td className="p-4 text-muted font-medium">{(doc.size / 1024).toFixed(1)} KB</td>
                          <td className="p-4 text-muted font-medium">{uploadDate}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/dashboard/documents/${doc.id}`}>
                                <button className="h-8 px-3 rounded-lg bg-muted-bg hover:bg-zinc-800 text-foreground hover:text-white border border-border flex items-center gap-1.5 transition-all text-[11px] font-bold cursor-pointer">
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>View</span>
                                </button>
                              </Link>
                              <button
                                onClick={() => setDeleteConfirmId(doc.id)}
                                className="h-8 px-3 rounded-lg bg-rose-950/20 hover:bg-rose-600 hover:text-white text-rose-400 border border-rose-500/20 flex items-center gap-1.5 transition-all text-[11px] font-bold cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {paginatedDocuments.map((doc) => {
                  const uploadDate = new Date(doc.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  return (
                    <div key={doc.id} className="bg-card-bg border border-border rounded-xl p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted-bg border border-border flex items-center justify-center text-muted shrink-0">
                          {doc.imageUrl ? (
                            <img src={doc.imageUrl} alt={doc.title} className="h-10 w-10 rounded-lg object-cover" />
                          ) : (
                            <FileText className="h-5 w-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{doc.title}</h4>
                          <p className="text-[10px] text-muted font-medium truncate capitalize">{doc.category} • {uploadDate}</p>
                        </div>
                      </div>
                      {doc.shortDescription && (
                        <p className="text-[11px] text-muted leading-relaxed line-clamp-2">{doc.shortDescription}</p>
                      )}
                      <div className="flex justify-end gap-2 border-t border-border pt-3">
                        <Link href={`/dashboard/documents/${doc.id}`}>
                          <button className="h-8 px-3 rounded-lg bg-muted-bg hover:bg-zinc-800 text-foreground hover:text-white border border-border flex items-center gap-1.5 transition-all text-[10px] font-bold cursor-pointer">
                            <Eye className="h-3.5 w-3.5" />
                            <span>View</span>
                          </button>
                        </Link>
                        <button
                          onClick={() => setDeleteConfirmId(doc.id)}
                          className="h-8 px-3 rounded-lg bg-rose-950/20 hover:bg-rose-600 hover:text-white text-rose-400 border border-rose-500/20 flex items-center gap-1.5 transition-all text-[10px] font-bold cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination bar */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-[11px] text-muted font-bold">
                    Page {currentPage} of {totalPages} ({filteredDocuments.length} files)
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-border bg-background text-muted hover:text-white disabled:opacity-30 transition-all cursor-pointer"
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
                              : 'border border-border bg-background text-muted hover:text-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-border bg-background text-muted hover:text-white disabled:opacity-30 transition-all cursor-pointer"
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
