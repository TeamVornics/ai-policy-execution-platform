'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import NeuralNetworkVisualization from './NeuralNetworkVisualization';
import Icon from '@/components/ui/AppIcon';
import fileStore from '@/lib/fileStore';
import { uploadPolicy, saveNLPResults, NLPResponse } from '@/lib/api';

// Simulation Data
const STAGES = [
    { id: 'analysis', name: 'Document Analysis', description: 'Parsing document structure and content', icon: 'DocumentTextIcon' },
    { id: 'extraction', name: 'Rule Extraction', description: 'Identifying policy rules and conditions', icon: 'ClipboardDocumentCheckIcon' },
    { id: 'semantic', name: 'Semantic Analysis', description: 'Understanding context and relationships', icon: 'LightBulbIcon' },
    { id: 'validation', name: 'Validation', description: 'Verifying extracted rules and logic', icon: 'CheckBadgeIcon' },
    { id: 'optimization', name: 'Optimization', description: 'Optimizing rule structure for execution', icon: 'BoltIcon' }
];

const ProcessingInteractive = () => {
    const router = useRouter();
    const [progress, setProgress] = useState(0);
    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [extractedRules, setExtractedRules] = useState<any[]>([]);
    const [stats, setStats] = useState({ rules: 0, confidence: 0, time: 0, fps: 60 });
    const [fileName, setFileName] = useState('Document.pdf');
    const startTimeRef = useRef(Date.now());
    const [apiData, setApiData] = useState<NLPResponse | null>(null); // Store API response
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let storedFile = 'Document.pdf';
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('processingFile');
            if (stored) {
                setFileName(stored);
                storedFile = stored;
            }
        }

        // Trigger API Call
        const processDocument = async () => {
            try {
                const file = fileStore.getFile();
                if (!file) {
                    console.warn('⚠️ No file found in store, using simulation fallback');
                    return;
                }

                console.log('📤 Preparing to send file to NLP backend...');
                console.log('  - File name:', file.name);
                console.log('  - File size:', file.size, 'bytes');
                console.log('  - File type:', file.type);

                const policyId = `POL_${Date.now()}`;
                console.log('  - Policy ID:', policyId);
                console.log('  - API URL:', 'https://sharp-words-rule.loca.lt/api/policy/process');

                console.log('🚀 Sending request to NLP backend...');
                const data = await uploadPolicy(file, policyId);
                console.log('✅ NLP API Response received:', data);

                // Save results to backend for PDF generation
                try {
                    console.log('💾 Saving results to backend for PDF export...');
                    const resultId = await saveNLPResults(policyId, file.name, data);
                    localStorage.setItem('nlpResultId', resultId);
                    console.log('✅ Results saved with ID:', resultId);
                } catch (saveError) {
                    console.error('⚠️ Failed to save results to backend:', saveError);
                    // Continue anyway, just PDF download won't work
                }

                // Store results for the Review Page
                localStorage.setItem('nlpResults', JSON.stringify(data));

                setApiData(data);

                // Map NLP rules to the visual feed
                if (data.rules?.length > 0) {
                    console.log(`📝 Processing ${data.rules.length} rules from NLP...`);
                    const formattedRules = data.rules.map((r: any) => ({
                        title: r.ambiguity_flag ? 'Ambiguous Rule' : 'Extracted Rule',
                        content: `${r.action} (Condition: ${r.conditions.join(', ')})`,
                        confidence: r.ambiguity_flag ? 65 : 98,
                        color: r.ambiguity_flag ? 'bg-amber-500' : 'bg-cyan-500'
                    }));
                    setExtractedRules(formattedRules);
                    setStats(prev => ({
                        ...prev,
                        rules: data.rules.length,
                        confidence: Math.floor(data.rules.reduce((acc, r) => acc + (r.ambiguity_flag ? 65 : 98), 0) / data.rules.length)
                    }));
                    console.log('✅ Rules processed and displayed');
                }

            } catch (error: any) {
                console.error('❌ NLP API Error:', error);
                console.error('Error details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    url: error.config?.url
                });
                // Fallback to simulation mode
            }
        };

        processDocument();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                // If API is done, accelerate to 100%
                if (apiData && prev < 90) {
                    return prev + 2;
                }

                // Normal simulation handling
                const step = 0.5 + Math.random() * 0.8;
                let nextVal = prev + step;

                // Hold at 95% if API hasn't returned yet
                if (!apiData && nextVal > 95) {
                    return 95;
                }

                // Update Time
                const elapsedTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
                setStats(s => ({
                    ...s,
                    time: elapsedTime,
                    fps: Math.floor(55 + Math.random() * 10),
                    confidence: apiData ? stats.confidence : Math.min(99, Math.floor(85 + (nextVal / 100) * 14))
                }));

                // Stage Transition
                const stageThreshold = 100 / STAGES.length;
                const calculatedStage = Math.floor(nextVal / stageThreshold);
                if (calculatedStage > currentStageIndex && calculatedStage < STAGES.length) {
                    setCurrentStageIndex(calculatedStage);
                }

                // Completion
                if (nextVal >= 100) {
                    clearInterval(interval);
                    setIsComplete(true);
                    return 100;
                }
                return nextVal;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [currentStageIndex, router, apiData]);

    return (
        <div className="min-h-screen bg-background text-foreground p-6 space-y-8 font-sans">
            {/* Header */}
            <div className="text-center space-y-2 mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-pulse-glow">
                    AI Processing Theater
                </h1>
                <p className="text-muted-foreground font-jetbrains">
                    Watch as our neural network extracts and analyzes policy rules in real-time
                </p>
            </div>

            {/* Main Progress Bar */}
            <div className="bg-card/50 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="flex justify-between items-end mb-2">
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Overall Progress</span>
                        <span className="text-3xl font-bold font-orbitron text-cyan-400">{Math.floor(progress)}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-mono flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            {stats.fps} FPS
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">Processing: {fileName}</span>
                    </div>
                </div>
                <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-200 ease-out relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                </div>
                <div className="mt-2 text-xs font-mono text-muted-foreground flex justify-between items-center">
                    <span>{isComplete ? 'Processing Complete' : apiData ? 'Finalizing results...' : 'Connecting to Neural Engine...'}</span>
                    {isComplete ? (
                        <button
                            onClick={() => router.push('/review')}
                            className="px-6 py-2 bg-cyan-500 text-black font-bold font-orbitron rounded-lg box-glow-cyan hover:scale-105 transition-all duration-200 animate-bounce"
                        >
                            Proceed to Review
                        </button>
                    ) : (
                        <button onClick={() => router.push('/upload')} className="text-red-400 hover:text-red-300 transition-colors">Cancel Processing</button>
                    )}
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Panel: Stages */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold font-orbitron text-cyan-400 flex items-center gap-2">
                        <Icon name="CpuChipIcon" size={24} /> Processing Stages
                    </h2>
                    <div className="space-y-4">
                        {STAGES.map((stage, idx) => {
                            const isActive = idx === currentStageIndex;
                            const isPast = idx < currentStageIndex;
                            return (
                                <div
                                    key={stage.id}
                                    className={`
                                        p-4 rounded-xl border transition-all duration-500 flex items-start gap-4
                                        ${isActive ? 'bg-cyan-950/30 border-cyan-500/50 box-glow-cyan' : isPast ? 'bg-black/20 border-white/5 opacity-50' : 'bg-black/20 border-white/5 opacity-30'}
                                    `}
                                >
                                    <div className={`p-2 rounded-lg ${isActive ? 'bg-cyan-500 text-black' : 'bg-white/5 text-white'}`}>
                                        <Icon name={stage.icon as any} size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-bold font-orbitron ${isActive ? 'text-cyan-400' : 'text-foreground'}`}>
                                            {stage.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1">{stage.description}</p>
                                    </div>
                                    {isActive && <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse mt-2"></div>}
                                    {isPast && <Icon name="CheckCircleIcon" size={16} className="text-green-500 mt-2" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Panel: Visualization & Stats */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold font-orbitron text-purple-400 flex items-center gap-2">
                        <Icon name="CubeTransparentIcon" size={24} /> Neural Network Activity
                    </h2>

                    {/* Visualizer Container */}
                    <div className="h-[350px] bg-black/40 rounded-2xl border border-white/10 relative overflow-hidden">
                        <div className="absolute top-4 left-4 z-10">
                            <span className="text-xs font-mono text-cyan-400 animate-pulse">Neural Network Active</span>
                        </div>
                        <NeuralNetworkVisualization isProcessing={true} />
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-card/30 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Rules Extracted</div>
                            <div className="text-2xl font-bold font-orbitron text-cyan-400">{stats.rules}</div>
                            <Icon name="DocumentDuplicateIcon" size={16} className="text-cyan-500/50 absolute bottom-4 right-4" />
                        </div>
                        <div className="bg-card/30 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg Confidence</div>
                            <div className="text-2xl font-bold font-orbitron text-green-400">{stats.confidence}%</div>
                            <Icon name="ShieldCheckIcon" size={16} className="text-green-500/50 absolute bottom-4 right-4" />
                        </div>
                        <div className="bg-card/30 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Processing Time</div>
                            <div className="text-2xl font-bold font-orbitron text-purple-400">{stats.time}s</div>
                            <Icon name="ClockIcon" size={16} className="text-purple-500/50 absolute bottom-4 right-4" />
                        </div>
                        <div className="bg-card/30 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Performance</div>
                            <div className="text-2xl font-bold font-orbitron text-pink-400">{stats.fps} <span className="text-xs">FPS</span></div>
                            <Icon name="BoltIcon" size={16} className="text-pink-500/50 absolute bottom-4 right-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom: Extracted Rules Feed */}
            {extractedRules.length > 0 && (
                <div className="space-y-4 pt-8 border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold font-orbitron text-white flex items-center gap-2">
                            <Icon name="SparklesIcon" size={24} className="text-pink-500" /> Extracted Rules ({extractedRules.length})
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {extractedRules.map((rule, idx) => (
                            <div key={idx} className="bg-card/20 border border-white/5 rounded-xl p-4 flex flex-col gap-3 animate-slide-up hover:bg-card/40 transition-colors">
                                <div className="flex justify-between items-start">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-black ${rule.color.replace('bg-', 'bg-')}`}>
                                        {rule.title}
                                    </span>
                                    <span className="text-xs font-mono text-muted-foreground">{rule.confidence}% confidence</span>
                                </div>
                                <p className="font-medium text-foreground">{rule.content}</p>
                                <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${rule.color.replace('bg-', 'bg-')}`}
                                        style={{ width: `${rule.confidence}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProcessingInteractive;