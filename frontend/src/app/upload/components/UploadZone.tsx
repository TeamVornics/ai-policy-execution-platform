'use client';

import { useState, useCallback, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const UploadZone = ({ onFileSelect, isProcessing }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const validateFile = (file: File): boolean => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload PDF, DOC, DOCX, or TXT files only.');
      return false;
    }

    if (file.size > maxSize) {
      alert('File size exceeds 10MB limit. Please upload a smaller file.');
      return false;
    }

    return true;
  };

  const handleZoneClick = () => {
    if (!isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      onClick={handleZoneClick}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full h-96 rounded-2xl border-4 border-dashed
        transition-all duration-300 spring-animation cursor-pointer
        ${isDragging
          ? 'border-primary bg-primary/10 box-glow-cyan scale-105' : 'border-muted hover:border-primary/50 hover:bg-muted/30'
        }
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileInput}
        disabled={isProcessing}
        className="hidden"
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
        <div className={`
          w-32 h-32 mb-6 rounded-2xl bg-gradient-to-br from-primary to-secondary
          flex items-center justify-center box-glow-cyan
          transition-transform duration-300
          ${isDragging ? 'scale-110 rotate-12' : 'scale-100'}
        `}>
          <Icon
            name="CloudArrowUpIcon"
            size={64}
            className="text-primary-foreground animate-pulse-glow"
          />
        </div>

        <h3 className="text-2xl font-bold font-orbitron text-primary text-glow-cyan mb-3">
          {isDragging ? 'Drop Your Policy Document' : 'Upload Policy Document'}
        </h3>

        <p className="text-muted-foreground font-inter mb-6 max-w-md">
          Drag and drop your policy file here, or click to browse. We support PDF, DOC, DOCX, and TXT formats up to 10MB.
        </p>

        <div className="flex items-center space-x-4 text-sm font-jetbrains">
          <div className="flex items-center space-x-2 text-success">
            <Icon name="CheckCircleIcon" size={20} />
            <span>Secure Upload</span>
          </div>
          <div className="flex items-center space-x-2 text-success">
            <Icon name="ShieldCheckIcon" size={20} />
            <span>Encrypted</span>
          </div>
          <div className="flex items-center space-x-2 text-success">
            <Icon name="LockClosedIcon" size={20} />
            <span>Private</span>
          </div>
        </div>
      </div>

      {isDragging && (
        <div className="absolute inset-0 bg-primary/5 rounded-2xl animate-pulse" />
      )}
    </div>
  );
};

export default UploadZone;