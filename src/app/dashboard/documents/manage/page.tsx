'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Calendar, Tag, Trash2, Eye, RefreshCw, AlertCircle, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';
import { api } from '../../../../services/api';
import { Button } from '../../../../components/ui/button';

interface DocumentData {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  category: string;
  originalName: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

/**
 * Manage Documents Workspace.
 * Lists all documents in a responsive grid/table layout with full view and purge delete controls.
 */
export default function ManageDocumentsPage() {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Fetch documents list
  const { data, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get<{ documents: DocumentData[] }>('/documents');
      return res.documents;
    },
  });

  // Mutate state to purge documents
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setDeleteTarget(null);
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you absolutely sure you want to delete this document? This will permanently delete all summaries, insights, and chat history associated with it.')) {
      setDeleteTarget(id);
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-black text-white tracking-tight">Manage Documents</h1>
          <p className="text-sm text-zinc-400">List, inspect, download, or permanently delete your uploaded document records.</p>
        </div>
        <Link href="/dashboard/documents/add">
          <Button variant="primary" className="h-10.5 rounded-xl font-bold px-5 text-sm">
            Add New Document
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-24 bg-zinc-950/20 border border-zinc-900 rounded-2xl">
          <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin mb-3" />
          <p className="text-xs text-zinc-500 font-medium">Loading documents inventory...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-rose-500/20 bg-rose-500/5 rounded-2xl text-center">
          <AlertCircle className="h-10 w-10 text-rose-400 mb-3" />
          <h3 className="font-bold text-white text-base">Failed to fetch documents</h3>
          <p className="text-xs text-rose-300 mt-1 max-w-sm">An error occurred reading files from the database. Please try reloading the page.</p>
        </div>
      ) : (data || []).length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border border-dashed border-zinc-900 bg-zinc-950/20 rounded-2xl text-center">
          <BookOpen className="h-12 w-12 text-zinc-650 mb-3" />
          <h3 className="font-bold text-white text-base">No documents uploaded</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mb-4">Start by adding your first document to summarize and analyze it with AI.</p>
          <Link href="/dashboard/documents/add">
            <Button variant="outline" className="h-10 text-xs rounded-xl font-bold px-4 border-zinc-800">
              Upload First File
            </Button>
          </Link>
        </div>
      ) : (
        /* Responsive Table Grid */
        <div className="border border-zinc-900 bg-zinc-950/40 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-900/10 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  <th className="py-4.5 px-6">Document details</th>
                  <th className="py-4.5 px-4">Category</th>
                  <th className="py-4.5 px-4">Size</th>
                  <th className="py-4.5 px-4">Status</th>
                  <th className="py-4.5 px-4">Added</th>
                  <th className="py-4.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50">
                {(data || []).map((doc) => {
                  const formattedDate = new Date(doc.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  // Format file sizes
                  const formattedSize = doc.size
                    ? `${(doc.size / 1024).toFixed(1)} KB`
                    : '0 KB';

                  // File badges colors
                  let fileTypeBadge = 'bg-zinc-900 text-zinc-400 border-zinc-800';
                  if (doc.fileType.includes('pdf')) {
                    fileTypeBadge = 'bg-rose-500/10 text-rose-450 border-rose-500/20';
                  } else if (doc.fileType.includes('word') || doc.fileType.includes('officedocument') || doc.fileType.includes('docx')) {
                    fileTypeBadge = 'bg-blue-500/10 text-blue-450 border-blue-500/20';
                  } else {
                    fileTypeBadge = 'bg-amber-500/10 text-amber-405 border-amber-500/20';
                  }

                  const isDeleting = deleteTarget === doc.id;

                  return (
                    <tr key={doc.id} className="hover:bg-zinc-900/10 transition-colors group">
                      {/* Name / Info */}
                      <td className="py-4 px-6 max-w-xs md:max-w-sm">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${fileTypeBadge}`}>
                            <FileText className="h-5 w-5 stroke-[1.5]" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors truncate">
                              {doc.title}
                            </span>
                            <span className="text-[10px] text-zinc-550 truncate mt-0.5">
                              {doc.originalName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-xs font-semibold text-zinc-300 capitalize">
                        {doc.category || 'General'}
                      </td>

                      {/* Size */}
                      <td className="py-4 px-4 text-xs font-medium text-zinc-400">
                        {formattedSize}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {doc.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Ready</span>
                          </span>
                        )}
                        {doc.status === 'processing' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            <span>Parsing</span>
                          </span>
                        )}
                        {doc.status === 'failed' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/5 border border-rose-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Failed</span>
                          </span>
                        )}
                        {doc.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-450 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <RefreshCw className="h-3 w-3" />
                            <span>Queued</span>
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-xs text-zinc-550 font-medium">
                        {formattedDate}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/documents/${doc.id}`}>
                            <Button
                              variant="outline"
                              disabled={isDeleting}
                              className="h-8.5 w-8.5 rounded-lg border-zinc-800 hover:border-zinc-700 p-0 flex items-center justify-center text-zinc-400 hover:text-white"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            disabled={isDeleting}
                            onClick={() => handleDelete(doc.id)}
                            className="h-8.5 w-8.5 rounded-lg border-zinc-800 hover:border-rose-500/30 p-0 flex items-center justify-center text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5"
                            title="Delete file"
                          >
                            {isDeleting ? (
                              <RefreshCw className="h-4 w-4 animate-spin text-rose-400" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
