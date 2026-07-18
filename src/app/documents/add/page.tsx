'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../hooks/use-auth';
import { Sidebar } from '../../../components/dashboard/sidebar';
import { Navbar } from '../../../components/dashboard/navbar';
import { Spinner } from '../../../components/ui/spinner';

const documentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters long').max(150, 'Short description cannot exceed 150 characters'),
  description: z.string().min(20, 'Full description must be at least 20 characters long').max(1000, 'Full description cannot exceed 1000 characters'),
  category: z.string().min(2, 'Category must be selected or provided'),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

const POPULAR_CATEGORIES = ['Invoice', 'Contract', 'Manual', 'Research', 'Book', 'Report'];

export default function AddDocumentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
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
      shortDescription: '',
      description: '',
      category: '',
      imageUrl: '',
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
    setUploadSuccess(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    if (droppedFile.size > 10 * 1024 * 1024) {
      setFileError('File exceeds maximum size limits (10MB)');
      setFile(null);
      return;
    }

    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    
    const fileExt = droppedFile.name.split('.').pop()?.toLowerCase();
    const isValidType = validTypes.includes(droppedFile.type) || ['pdf', 'docx', 'txt'].includes(fileExt || '');

    if (!isValidType) {
      setFileError('Invalid file format. Upload PDF, DOCX or TXT files only.');
      setFile(null);
      return;
    }

    setFile(droppedFile);
    const currentTitle = watch('title');
    if (!currentTitle) {
      const fileNameWithoutExt = droppedFile.name.replace(/\.[^/.]+$/, "");
      setValue('title', fileNameWithoutExt);
    }
  };

  const onSubmit = async (values: DocumentFormValues) => {
    if (!file) {
      setFileError('Please select or drag a document file to upload');
      return;
    }

    setIsUploading(true);
    setGeneralError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('shortDescription', values.shortDescription);
      formData.append('category', values.category);
      if (values.imageUrl) {
        formData.append('imageUrl', values.imageUrl);
      }

      await api.upload<any>('/documents/upload', formData);

      setUploadSuccess(true);
      reset();
      setFile(null);
      
      // Redirect to explorer workspace after 1.5 seconds
      setTimeout(() => {
        router.push('/documents');
      }, 1500);

    } catch (err: any) {
      setGeneralError(err.message || 'File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

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
    return null;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050505]">
      {/* Sidebar navigation */}
      <Sidebar className="shrink-0" />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />

        {/* Scrollable Form Content */}
        <main className="flex-1 overflow-y-auto bg-zinc-950/20 p-8 space-y-6">
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Add Document</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Upload a new document to execute AI summaries and indexing.</p>
          </div>

          <div className="max-w-3xl bg-zinc-950 border border-zinc-900 rounded-2xl p-6 md:p-8 space-y-6">
            
            {/* Status alerts */}
            {uploadSuccess && (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-xs text-emerald-400">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <div>
                  <span className="font-bold block">Upload Completed!</span>
                  <span>Document parsed. Running AI analysis in background, redirecting...</span>
                </div>
              </div>
            )}

            {generalError && (
              <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-xs text-rose-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div>
                  <span className="font-bold block">Submission Failed</span>
                  <span>{generalError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {/* File Upload drag and drop */}
              <div className="space-y-2">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Document Source</label>
                <div
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-zinc-900/10 ${
                    fileError ? 'border-rose-500/30 bg-rose-500/[0.02]' : 
                    file ? 'border-indigo-500/30 bg-indigo-500/[0.02]' : 'border-zinc-800 bg-zinc-955'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  />
                  {file ? (
                    <>
                      <FileText className="h-8 w-8 text-indigo-500" />
                      <div className="text-center">
                        <span className="text-xs text-white font-bold block truncate max-w-sm">{file.name}</span>
                        <span className="text-[10px] text-zinc-500 font-medium">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-8 w-8 text-zinc-650 text-zinc-500" />
                      <div className="text-center">
                        <span className="text-xs text-zinc-400 font-bold block">Drag & Drop file here, or browse</span>
                        <span className="text-[10px] text-zinc-650 mt-1 block">Supports PDF, DOCX, TXT up to 10MB</span>
                      </div>
                    </>
                  )}
                </div>
                {fileError && <p className="text-[11px] text-rose-500 font-semibold">{fileError}</p>}
              </div>

              {/* Title input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Sales Agreement"
                  {...register('title')}
                  className="w-full h-10.5 bg-zinc-955 border border-zinc-900 hover:border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl px-4 text-xs text-white placeholder-zinc-600 transition-colors"
                />
                {errors.title && <p className="text-[11px] text-rose-500 font-semibold">{errors.title.message}</p>}
              </div>

              {/* Short Description */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Short Summary</label>
                <input
                  type="text"
                  placeholder="A brief 1-sentence synopsis (10-150 chars)"
                  {...register('shortDescription')}
                  className="w-full h-10.5 bg-zinc-955 border border-zinc-900 hover:border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl px-4 text-xs text-white placeholder-zinc-600 transition-colors"
                />
                {errors.shortDescription && <p className="text-[11px] text-rose-500 font-semibold">{errors.shortDescription.message}</p>}
              </div>

              {/* Full Description */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Full Description</label>
                <textarea
                  rows={4}
                  placeholder="Provide extensive details, target audiences, or specific objectives of this document..."
                  {...register('description')}
                  className="w-full bg-zinc-955 border border-zinc-900 hover:border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-600 transition-colors resize-none"
                />
                {errors.description && <p className="text-[11px] text-rose-500 font-semibold">{errors.description.message}</p>}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Classification / Category</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {POPULAR_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setValue('category', cat, { shouldValidate: true })}
                      className={`h-8 px-3 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        categoryValue === cat
                          ? 'bg-accent border-accent text-white'
                          : 'border-zinc-850 bg-zinc-955 text-zinc-400 hover:text-white hover:border-zinc-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or enter custom category..."
                  {...register('category')}
                  className="w-full h-10.5 bg-zinc-955 border border-zinc-900 hover:border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl px-4 text-xs text-white placeholder-zinc-600 transition-colors capitalize"
                />
                {errors.category && <p className="text-[11px] text-rose-500 font-semibold">{errors.category.message}</p>}
              </div>

              {/* Optional image URL */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Optional Cover Image URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/cover.png"
                  {...register('imageUrl')}
                  className="w-full h-10.5 bg-zinc-955 border border-zinc-900 hover:border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl px-4 text-xs text-white placeholder-zinc-600 transition-colors"
                />
                {errors.imageUrl && <p className="text-[11px] text-rose-500 font-semibold">{errors.imageUrl.message}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isUploading}
                className="w-full h-11 bg-accent text-white text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Analyzing file details...</span>
                  </>
                ) : (
                  <span>Submit & Start AI Summary</span>
                )}
              </button>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
