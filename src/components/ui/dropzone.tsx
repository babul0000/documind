import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  uploadError?: string | null;
  className?: string;
}

/**
 * Premium Dropzone Component featuring:
 * - Drag & Drop overlay states
 * - Custom input triggers
 * - Live upload animations & status check indicators
 */
export function Dropzone({ onFileSelect, isUploading = false, uploadError = null, className }: DropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (isUploading) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file) {
        onFileSelect(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) return;
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file) {
        onFileSelect(file);
      }
    }
  };

  const triggerFileInput = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerFileInput}
      className={cn(
        'group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-950/20 px-6 py-12 text-center cursor-pointer transition-all duration-300 hover:border-indigo-500/70 hover:bg-zinc-950/40',
        {
          'border-indigo-500 bg-indigo-500/5 ring-4 ring-indigo-500/10': isDragOver,
          'opacity-60 cursor-not-allowed': isUploading,
        },
        className
      )}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,.docx,.doc,.txt"
        className="hidden"
        disabled={isUploading}
      />

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 transition-transform duration-300 group-hover:scale-110 group-hover:border-indigo-500/30 group-hover:bg-zinc-900/80">
        {isUploading ? (
          <UploadCloud className="h-7 w-7 text-indigo-400 animate-bounce" />
        ) : (
          <UploadCloud className="h-7 w-7 text-zinc-400 group-hover:text-indigo-400" />
        )}
      </div>

      <h3 className="mt-4 text-base font-semibold text-zinc-200">
        {isUploading ? 'Uploading & parsing file...' : 'Upload document'}
      </h3>
      <p className="mt-1 text-sm text-zinc-500">
        Drag & drop your files here, or <span className="text-indigo-400 font-medium group-hover:underline">browse</span>
      </p>
      
      <p className="mt-3 text-xs text-zinc-600">
        Supports PDF, DOCX, and TXT up to 10MB
      </p>

      {uploadError && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-3.5 py-2 text-rose-400 text-xs font-semibold animate-shake">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}
export default Dropzone;
