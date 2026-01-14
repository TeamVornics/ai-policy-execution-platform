'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface UploadProgressProps {
  fileName: string;
  fileSize: string;
  progress: number;
  status: 'uploading' | 'validating' | 'complete' | 'error';
  onCancel?: () => void;
}

const UploadProgress = ({ fileName, fileSize, progress, status, onCancel }: UploadProgressProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'uploading':
        return {
          icon: 'ArrowUpTrayIcon',
          text: 'Uploading...',
          color: 'text-primary',
          bgColor: 'bg-primary/20'
        };
      case 'validating':
        return {
          icon: 'ShieldCheckIcon',
          text: 'Validating...',
          color: 'text-warning',
          bgColor: 'bg-warning/20'
        };
      case 'complete':
        return {
          icon: 'CheckCircleIcon',
          text: 'Upload Complete',
          color: 'text-success',
          bgColor: 'bg-success/20'
        };
      case 'error':
        return {
          icon: 'XCircleIcon',
          text: 'Upload Failed',
          color: 'text-error',
          bgColor: 'bg-error/20'
        };
    }
  };

  const statusConfig = getStatusConfig();

  if (!isHydrated) {
    return (
      <div className="w-full bg-card rounded-xl p-6 elevation-subtle">
        <div className="h-20 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full bg-card rounded-xl p-6 elevation-subtle">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4 flex-1">
          <div className={`
            w-12 h-12 rounded-lg ${statusConfig.bgColor}
            flex items-center justify-center
          `}>
            <Icon
              name={statusConfig.icon as any}
              size={24}
              className={statusConfig.color}
            />
          </div>

          <div className="flex-1">
            <h4 className="text-base font-bold font-orbitron text-foreground mb-1">
              {fileName}
            </h4>
            <div className="flex items-center space-x-3 text-sm font-jetbrains text-muted-foreground">
              <span>{fileSize}</span>
              <span>•</span>
              <span className={statusConfig.color}>{statusConfig.text}</span>
            </div>
          </div>
        </div>

        {status === 'uploading' && onCancel && (
          <button
            onClick={onCancel}
            className="p-2 text-muted-foreground hover:text-error transition-colors"
          >
            <Icon name="XMarkIcon" size={20} />
          </button>
        )}
      </div>

      <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`
            absolute top-0 left-0 h-full rounded-full
            transition-all duration-300
            ${status === 'complete' ? 'bg-success' : 'bg-primary'}
            ${status === 'error' ? 'bg-error' : ''}
          `}
          style={{ width: `${progress}%` }}
        />
        {status === 'uploading' && (
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        )}
      </div>

      <div className="flex items-center justify-between mt-2 text-xs font-jetbrains">
        <span className="text-muted-foreground">{progress}% Complete</span>
        {status === 'complete' && (
          <span className="text-success flex items-center space-x-1">
            <Icon name="CheckIcon" size={14} />
            <span>Ready for Processing</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default UploadProgress;