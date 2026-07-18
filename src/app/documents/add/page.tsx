'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, 
  Trash2, FileCode, Check, ArrowRight
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../hooks/use-auth';
import { Sidebar } from '../../../components/dashboard/sidebar';
import { Navbar } from '../../../components/dashboard/navbar';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewText, setFilePreviewText] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  
  // Progress states
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [processingStage, setProcessingStage] = useState<'idle' | 'uploading' | 'parsing' | 'extracting' | 'done'>('idle');
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

  const processSelectedFile = (selectedFile: File) => {
    setFileError(null);
    setUploadSuccess(false);

    // Validate size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError('File exceeds maximum size limits (10MB)');
      setFile(null);
      setFilePreviewText(null);
      return;
    }

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    
    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
    const isValidType = validTypes.includes(selectedFile.type) || ['pdf', 'docx', 'txt'].includes(fileExt || '');
    
    if (!isValidType) {
      setFileError('Invalid file format. Upload PDF, DOCX or TXT files only.');
      setFile(null);
      setFilePreviewText(null);
      return;
    }

    setFile(selectedFile);

    // Auto-fill title with filename if empty
    const currentTitle = watch('title');
    if (!currentTitle) {
      const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setValue('title', fileNameWithoutExt);
    }

    // If text file, generate preview snippet
    if (selectedFile.type === 'text/plain' || fileExt === 'txt') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setFilePreviewText(text.slice(0, 250) + (text.length > 250 ? '...' : ''));
      };
      reader.readAsText(selectedFile.slice(0, 500));
    } else {
      setFilePreviewText(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processSelectedFile(selectedFile);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processSelectedFile(droppedFile);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setFilePreviewText(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    setUploadProgress(0);
    setProcessingStage('uploading');

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

      // Execute upload tracking progress increments
      await api.uploadWithProgress<any>('/documents/upload', formData, (percent) => {
        setUploadProgress(percent);
        if (percent === 100) {
          setProcessingStage('parsing');
          // Simulate parsing and extracting log progressions
          setTimeout(() => setProcessingStage('extracting'), 1000);
        }
      });

      setProcessingStage('done');
      setUploadSuccess(true);
      reset();
      setFile(null);
      setFilePreviewText(null);
      
      // Redirect to explorer workspace after 1.5 seconds
      setTimeout(() => {
        router.push('/documents');
      }, 1500);

    } catch (err: any) {
      setGeneralError(err.message || 'File upload failed. Please try again.');
      setProcessingStage('idle');
    } finally {
      setIsUploading(false);
    }
  };

  if (authLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  const fileExt = file?.name.split('.').pop()?.toLowerCase();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar navigation */}
      <Sidebar className="shrink-0" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable Form Content */}
        <main className="flex-1 overflow-y-auto bg-background/20 p-8 space-y-6">
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Add Document</h1>
            <p className="text-xs text-muted mt-0.5">Upload a new document to execute AI summaries and indexing.</p>
          </div>

          <div className="max-w-3xl bg-background border border-border rounded-2xl p-6 md:p-8 space-y-6">
            
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
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-muted">Document Source</label>
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                    isDragActive ? 'border-indigo-500 bg-indigo-500/[0.04] scale-[0.99]' :
                    fileError ? 'border-rose-500/30 bg-rose-500/[0.02]' : 
                    file ? 'border-indigo-500/30 bg-indigo-500/[0.02]' : 'border-border bg-card-bg hover:bg-muted-bg/10'
                  } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  />
                  {file ? (
                    <div className="flex items-center justify-between w-full max-w-md bg-background border border-border p-4 rounded-xl relative overflow-hidden group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="h-5.5 w-5.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs text-white font-bold block truncate max-w-[200px]" title={file.name}>{file.name}</span>
                          <span className="text-[10px] text-muted font-medium block">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="h-8 w-8 rounded-lg text-muted hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-all cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="h-8 w-8 text-muted" />
                      <div className="text-center">
                        <span className="text-xs text-muted font-bold block">Drag & Drop file here, or browse</span>
                        <span className="text-[10px] text-zinc-600 mt-1 block">Supports PDF, DOCX, TXT up to 10MB</span>
                      </div>
                    </>
                  )}
                </div>
                {fileError && <p className="text-[11px] text-rose-500 font-semibold">{fileError}</p>}
              </div>

              {/* File Preview Snippet Box */}
              {file && (
                <div className="bg-background border border-border rounded-xl p-4.5 space-y-2">
                  <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-muted flex items-center gap-1.5">
                    <FileCode className="h-3.5 w-3.5" />
                    <span>File Context Preview</span>
                  </h4>
                  {filePreviewText ? (
                    <div className="bg-[#09090b] rounded-lg p-3 text-[11px] text-muted font-mono whitespace-pre-wrap border border-border select-none">
                      {filePreviewText}
                    </div>
                  ) : (
                    <div className="text-[11px] text-muted italic leading-relaxed">
                      This file format ({fileExt?.toUpperCase()}) does not support raw snippet preview. We will parse and index all elements dynamically upon submission.
                    </div>
                  )}
                </div>
              )}

              {/* Title input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-muted">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Sales Agreement"
                  {...register('title')}
                  className="w-full h-10.5 bg-card-bg border border-border hover:border-border focus:border-indigo-500 focus:outline-none rounded-xl px-4 text-xs text-white placeholder-zinc-650 transition-colors"
                />
                {errors.title && <p className="text-[11px] text-rose-500 font-semibold">{errors.title.message}</p>}
              </div>

              {/* Short Description */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-muted">Short Summary</label>
                <input
                  type="text"
                  placeholder="A brief 1-sentence synopsis (10-150 chars)"
                  {...register('shortDescription')}
                  className="w-full h-10.5 bg-card-bg border border-border hover:border-border focus:border-indigo-500 focus:outline-none rounded-xl px-4 text-xs text-white placeholder-zinc-650 transition-colors"
                />
                {errors.shortDescription && <p className="text-[11px] text-rose-500 font-semibold">{errors.shortDescription.message}</p>}
              </div>

              {/* Full Description */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-muted">Full Description</label>
                <textarea
                  rows={4}
                  placeholder="Provide comprehensive details about this document (20-1000 chars)"
                  {...register('description')}
                  className="w-full bg-card-bg border border-border hover:border-border focus:border-indigo-500 focus:outline-none rounded-xl p-4 text-xs text-white placeholder-zinc-650 transition-colors resize-none"
                />
                {errors.description && <p className="text-[11px] text-rose-500 font-semibold">{errors.description.message}</p>}
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-muted">Classification Category</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {POPULAR_CATEGORIES.map((cat) => {
                    const isSelected = categoryValue === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setValue('category', cat)}
                        className={`h-9 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' 
                            : 'bg-card-bg border-border text-muted hover:border-border'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
                <div className="pt-2">
                  <input
                    type="text"
                    placeholder="Or enter custom category..."
                    {...register('category')}
                    className="w-full h-10.5 bg-card-bg border border-border hover:border-border focus:border-indigo-500 focus:outline-none rounded-xl px-4 text-xs text-white placeholder-zinc-650 transition-colors"
                  />
                </div>
                {errors.category && <p className="text-[11px] text-rose-500 font-semibold">{errors.category.message}</p>}
              </div>

              {/* Image URL */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-muted">Preview Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  {...register('imageUrl')}
                  className="w-full h-10.5 bg-card-bg border border-border hover:border-border focus:border-indigo-500 focus:outline-none rounded-xl px-4 text-xs text-white placeholder-zinc-650 transition-colors"
                />
                {errors.imageUrl && <p className="text-[11px] text-rose-500 font-semibold">{errors.imageUrl.message}</p>}
              </div>

              {/* Upload Progress Bar and Stage Indicators */}
              {isUploading && (
                <div className="bg-[#09090b] border border-border p-5 rounded-xl space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-muted">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                      <span>{processingStage === 'uploading' ? `Uploading file content (${uploadProgress}%)` : 
                            processingStage === 'parsing' ? 'Parsing text structures' : 
                            processingStage === 'extracting' ? 'Extracting AI takes & summaries' : 'Done!'}</span>
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>

                  {/* Horizontal gauge progress */}
                  <div className="w-full bg-muted-bg rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>

                  {/* Processing animation stage list */}
                  <div className="grid grid-cols-3 gap-2 text-[8px] font-extrabold uppercase tracking-widest text-center">
                    <div className={`p-2 rounded-lg border ${processingStage === 'uploading' ? 'bg-indigo-500/5 border-indigo-500 text-indigo-400' : 'bg-card-bg border-border text-zinc-600'}`}>
                      1. Upload File
                    </div>
                    <div className={`p-2 rounded-lg border ${processingStage === 'parsing' ? 'bg-indigo-500/5 border-indigo-500 text-indigo-400' : 'bg-card-bg border-border text-zinc-600'}`}>
                      2. Parse Content
                    </div>
                    <div className={`p-2 rounded-lg border ${processingStage === 'extracting' ? 'bg-indigo-500/5 border-indigo-500 text-indigo-400' : 'bg-card-bg border-border text-zinc-600'}`}>
                      3. AI Analysis
                    </div>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full h-11 bg-accent text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Processing Document...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Document</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
