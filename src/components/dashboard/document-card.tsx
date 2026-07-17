import React from 'react';
import Link from 'next/link';
import { FileText, Calendar, Tag, Eye } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';

interface DocumentCardProps {
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  fileType?: string;
  createdAt?: string | Date;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  isLoading?: boolean;
}

/**
 * Reusable Document Card Component.
 * Implements strict dimension layouts, responsive states, specific file badges, and custom skeleton layouts.
 */
export function DocumentCard({
  id,
  title,
  description,
  category,
  fileType,
  createdAt,
  status = 'completed',
  isLoading = false,
}: DocumentCardProps) {
  if (isLoading) {
    return (
      <Card className="flex flex-col h-[400px] w-full border-zinc-900 bg-zinc-950/40 backdrop-blur-xl rounded-2xl overflow-hidden animate-pulse">
        <div className="h-44 bg-zinc-900/40 w-full flex items-center justify-center border-b border-zinc-900" />
        <CardHeader className="p-5 space-y-3">
          <div className="h-3.5 w-1/4 bg-zinc-900 rounded" />
          <div className="h-5 w-3/4 bg-zinc-900 rounded" />
        </CardHeader>
        <CardContent className="px-5 py-0 flex-1 space-y-2">
          <div className="h-3.5 bg-zinc-900 rounded w-full" />
          <div className="h-3.5 bg-zinc-900 rounded w-full" />
          <div className="h-3.5 bg-zinc-900 rounded w-5/6" />
        </CardContent>
        <CardFooter className="p-5 border-t border-zinc-900/50 flex justify-between items-center">
          <div className="h-3 w-1/3 bg-zinc-900 rounded" />
          <div className="h-9 w-24 bg-zinc-900 rounded-xl" />
        </CardFooter>
      </Card>
    );
  }

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  // Style tags depending on file types
  let previewBg = 'bg-indigo-500/5 text-indigo-400 border-indigo-500/10';
  let fileLabel = 'TXT';
  
  if (fileType) {
    if (fileType.includes('pdf')) {
      fileLabel = 'PDF';
      previewBg = 'bg-rose-500/5 text-rose-400 border-rose-500/10';
    } else if (fileType.includes('word') || fileType.includes('officedocument') || fileType.includes('docx')) {
      fileLabel = 'DOCX';
      previewBg = 'bg-blue-500/5 text-blue-400 border-blue-500/10';
    } else {
      fileLabel = 'TXT';
      previewBg = 'bg-amber-500/5 text-amber-400 border-amber-500/10';
    }
  }

  const truncatedDesc = description
    ? (description.length > 100 ? description.substring(0, 100) + '...' : description)
    : 'No description provided. AI is analyzing summaries and insights...';

  return (
    <Card className="flex flex-col h-[400px] w-full border-zinc-900 bg-zinc-950/40 backdrop-blur-xl hover:border-zinc-800 transition-all duration-300 rounded-2xl overflow-hidden group">
      {/* File Preview Graphic */}
      <div className={`h-44 w-full flex flex-col items-center justify-center border-b border-zinc-900/50 relative overflow-hidden ${previewBg}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
        <FileText className="h-16 w-16 stroke-[1.2] mb-2 group-hover:scale-110 transition-transform duration-300 relative z-10" />
        <span className="text-[10px] font-bold tracking-widest uppercase border border-current px-2.5 py-0.5 rounded-full relative z-10">
          {fileLabel}
        </span>
        {status === 'processing' && (
          <div className="absolute top-3.5 right-3.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full animate-pulse border border-indigo-500/30 z-20">
            Analyzing...
          </div>
        )}
      </div>

      {/* Details Header */}
      <CardHeader className="p-5 pb-2">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          <Tag className="h-3.5 w-3.5 text-zinc-500" />
          <span>{category || 'General'}</span>
        </div>
        <h3 className="font-bold text-white text-base tracking-tight line-clamp-1 mt-1 group-hover:text-indigo-400 transition-colors duration-200">
          {title}
        </h3>
      </CardHeader>

      {/* Description Content */}
      <CardContent className="px-5 py-0 flex-1">
        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
          {truncatedDesc}
        </p>
      </CardContent>

      {/* Details Footer */}
      <CardFooter className="p-5 pt-3 border-t border-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-550">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formattedDate}</span>
        </div>
        <Link href={`/dashboard/documents/${id}`}>
          <Button variant="outline" className="h-9 text-xs rounded-xl font-bold px-4 border-zinc-800 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            <span>Details</span>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
export default DocumentCard;
