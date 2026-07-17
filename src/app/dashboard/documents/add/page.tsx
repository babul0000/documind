'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../../../../services/api';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';

const documentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  category: z.string().min(2, 'Category must be at least 2 characters long'),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

const POPULAR_CATEGORIES = ['Invoice', 'Contract', 'Manual', 'Research', 'Book', 'Report'];

/**
 * Add Document Form Page.
 * Uses React Hook Form + Zod, includes custom upload fields, file drag-and-drop,
 * and background upload execution gates.
 */
export default function AddDocumentPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
    },
  });

  const categoryValue = watch('category');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setUploadSuccess(false);
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError('File exceeds maximum size limits (10MB)');
      setFile(null);
      return;
    }

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
      'text/plain',
    ];
    
    // Check type or extension fallback
    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
    const isValidType = validTypes.includes(selectedFile.type) || ['pdf', 'docx', 'txt'].includes(fileExt || '');
    
    if (!isValidType) {
      setFileError('Invalid file format. Upload PDF, DOCX or TXT files only.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    // Auto-fill title with filename if empty
    const currentTitle = watch('title');
    if (!currentTitle) {
      const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setValue('title', fileNameWithoutExt);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setFileError(null);
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    // Trigger file change parsing
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(droppedFile);
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
      const event = new Event('change', { bubbles: true }) as any;
      fileInputRef.current.dispatchEvent(event);
      // Fallback manual invocation
      handleFileChange({ target: { files: dataTransfer.files } } as any);
    }
  };

  const onSubmit = async (values: DocumentFormValues) => {
    setGeneralError(null);
    setFileError(null);

    if (!file) {
      setFileError('Please select a document file to upload');
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', values.title);
      formData.append('description', values.description || '');
      formData.append('category', values.category);

      const res = await api.upload<any>('/documents/upload', formData);

      setUploadSuccess(true);
      reset();
      setFile(null);
      
      // Redirect to explorer workspace after 1.5 seconds
      setTimeout(() => {
        router.push('/dashboard/explore');
      }, 1500);

    } catch (err: any) {
      setGeneralError(err.message || 'File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black text-white tracking-tight">Add New Document</h1>
        <p className="text-sm text-zinc-400">Import a document file (PDF, DOCX, TXT) to summarize and analyze with Gemini AI.</p>
      </div>

      <div className="bg-zinc-950/40 border border-zinc-900/80 p-6 md:p-8 rounded-2xl backdrop-blur-xl relative">
        {uploadSuccess && (
          <div className="absolute inset-0 bg-[#050505]/95 rounded-2xl flex flex-col items-center justify-center space-y-3 z-30 transition-all duration-300">
            <CheckCircle2 className="h-14 w-14 text-indigo-400 animate-bounce" />
            <h3 className="text-lg font-bold text-white">Upload Succeeded!</h3>
            <p className="text-xs text-zinc-400">Redirecting to document list while AI analysis executes in the background...</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {generalError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3.5 text-rose-400 text-xs font-semibold">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* File Drag & Drop Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Document File</label>
            <div
              onDragOver={onDragOver}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                file
                  ? 'border-indigo-500/50 bg-indigo-500/5'
                  : fileError
                  ? 'border-rose-500/40 bg-rose-500/5'
                  : 'border-zinc-900 bg-zinc-900/10 hover:border-zinc-800'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
                className="hidden"
                disabled={isUploading}
              />
              {file ? (
                <>
                  <FileText className="h-12 w-12 text-indigo-400 mb-3 animate-pulse" />
                  <span className="text-sm font-bold text-white line-clamp-1 max-w-sm">{file.name}</span>
                  <span className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-wider">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-12 w-12 text-zinc-650 mb-3" />
                  <span className="text-sm font-bold text-zinc-350">Drag and drop file here, or click to browse</span>
                  <span className="text-[10px] text-zinc-600 mt-1 font-semibold">Supports PDF, DOCX or TXT files (Up to 10MB)</span>
                </>
              )}
            </div>
            {fileError && (
              <span className="text-[11px] font-semibold text-rose-400 block mt-1 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{fileError}</span>
              </span>
            )}
          </div>

          {/* Title Input */}
          <Input
            label="Document Title"
            placeholder="e.g. FY2026 Financial Strategy"
            error={errors.title?.message}
            {...register('title')}
            disabled={isUploading}
          />

          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Description (Optional)</label>
            <textarea
              placeholder="Provide a brief context or description of this document..."
              {...register('description')}
              disabled={isUploading}
              rows={3}
              className="w-full bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 focus:border-indigo-500/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-550 transition-colors focus:outline-none resize-none"
            />
            {errors.description?.message && (
              <span className="text-[11px] font-semibold text-rose-400 block mt-1">{errors.description.message}</span>
            )}
          </div>

          {/* Category Input */}
          <div className="space-y-2">
            <Input
              label="Category"
              placeholder="e.g. Invoices"
              error={errors.category?.message}
              {...register('category')}
              disabled={isUploading}
            />

            {/* Popular quick tags */}
            <div className="flex flex-wrap gap-2 items-center mt-2.5">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mr-1">Quick Select:</span>
              {POPULAR_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setValue('category', cat)}
                  disabled={isUploading}
                  className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${
                    categoryValue === cat
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      : 'bg-zinc-900/30 text-zinc-450 border-zinc-900 hover:border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" variant="primary" className="w-full mt-4 h-11 rounded-xl font-bold flex items-center justify-center gap-2" isLoading={isUploading}>
            {isUploading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Processing Document...</span>
              </>
            ) : (
              <span>Analyze with Gemini AI</span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
