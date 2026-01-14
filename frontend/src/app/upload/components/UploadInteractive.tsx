'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UploadZone from './UploadZone';
import SampleFiles from './SampleFiles';
import UploadProgress from './UploadProgress';
import FileRequirements from './FileRequirements';
import PerformanceMonitor from './PerformanceMonitor';

import fileStore from '@/lib/fileStore';

interface SampleFile {
    id: string;
    name: string;
    description: string;
    size: string;
    type: string;
    icon: string;
    color: string;
}

const UploadInteractive = () => {
    const router = useRouter();
    const [isHydrated, setIsHydrated] = useState(false);
    const [uploadState, setUploadState] = useState<{
        isUploading: boolean;
        fileName: string | null;
        fileSize: string | null;
        progress: number;
        status: 'uploading' | 'validating' | 'complete' | 'error';
    }>({
        isUploading: false,
        fileName: null,
        fileSize: null,
        progress: 0,
        status: 'uploading'
    });

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const simulateUpload = (fileName: string, fileSize: string) => {
        setUploadState({
            isUploading: true,
            fileName,
            fileSize,
            progress: 0,
            status: 'uploading'
        });

        let progress = 0;
        const uploadInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(uploadInterval);
                setUploadState(prev => ({ ...prev, progress: 100, status: 'validating' }));

                setTimeout(() => {
                    setUploadState(prev => ({ ...prev, status: 'complete' }));
                    // Save filename for processing page
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('processingFile', fileName);
                    }
                    setTimeout(() => {
                        router.push('/processing');
                    }, 1000);
                }, 800);
            } else {
                setUploadState(prev => ({ ...prev, progress: Math.floor(progress) }));
            }
        }, 150);
    };

    const handleFileSelect = (file: File) => {
        const fileSize = formatFileSize(file.size);
        fileStore.setFile(file);
        simulateUpload(file.name, fileSize);
    };

    const handleSampleSelect = (file: SampleFile) => {
        // Create a mock PDF file for the sample
        const mockPdfContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 100
>>
stream
BT
/F1 12 Tf
50 700 Td
(Sample Policy Document: ${file.name}) Tj
0 -20 Td
(This is a sample policy document for testing the NLP integration.) Tj
0 -20 Td
(Rule 1: All employees must complete mandatory training within 30 days.) Tj
0 -20 Td
(Action: Enroll in training program) Tj
0 -20 Td
(Responsible Role: HR Department) Tj
0 -40 Td
(Rule 2: Budget approval required for expenses over $5000.) Tj
0 -20 Td
(Action: Submit approval request) Tj
0 -20 Td
(Responsible Role: Finance Manager) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
364
%%EOF
        `;

        const blob = new Blob([mockPdfContent], { type: 'application/pdf' });
        const mockFile = new File([blob], file.name, { type: 'application/pdf' });

        // Store the mock file for processing
        fileStore.setFile(mockFile);
        simulateUpload(file.name, file.size);
    };

    const handleCancelUpload = () => {
        setUploadState({
            isUploading: false,
            fileName: null,
            fileSize: null,
            progress: 0,
            status: 'uploading'
        });
    };

    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-background pt-24 pb-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="h-96 bg-card rounded-2xl animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-16 px-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold font-orbitron text-primary text-glow-cyan mb-3">
                            Upload Command Center
                        </h1>
                        <p className="text-lg text-muted-foreground font-inter max-w-2xl">
                            Transform your policy documents into actionable insights. Upload your file or select a sample to experience the power of AI-driven policy analysis.
                        </p>
                    </div>
                    <PerformanceMonitor />
                </div>

                <FileRequirements />

                {uploadState.isUploading && uploadState.fileName ? (
                    <UploadProgress
                        fileName={uploadState.fileName}
                        fileSize={uploadState.fileSize || '0 MB'}
                        progress={uploadState.progress}
                        status={uploadState.status}
                        onCancel={uploadState.status === 'uploading' ? handleCancelUpload : undefined}
                    />
                ) : (
                    <UploadZone
                        onFileSelect={handleFileSelect}
                        isProcessing={uploadState.isUploading}
                    />
                )}

                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold font-orbitron text-foreground">
                            Try Sample Documents
                        </h2>
                        <span className="text-sm font-jetbrains text-muted-foreground">
                            Click any sample to start processing
                        </span>
                    </div>
                    <SampleFiles
                        onSampleSelect={handleSampleSelect}
                        isProcessing={uploadState.isUploading}
                    />
                </div>
            </div>
        </div>
    );
};

export default UploadInteractive;