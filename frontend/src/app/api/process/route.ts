import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { filename } = body;

        // TODO: INTEGRATE FRIEND'S AI NLP MODEL HERE
        // For now, we simulate the AI processing with a delay and mock data

        console.log(`[API] Processing document: ${filename}`);

        // Simulate AI Latency (2-4 seconds)
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Mock Response from "Friend's AI"
        const mockAnalysis = {
            status: 'success',
            filename: filename,
            stats: {
                rules: Math.floor(Math.random() * 100) + 150, // 150-250 rules
                confidence: 94.5,
                reduction: 82,
                time: '2m 14s',
                fps: 60
            },
            extractedRules: [
                { id: 1, text: "All personnel must undergo annual compliance training.", confidence: 0.98 },
                { id: 2, text: "Data retention period is set to 5 years for financial records.", confidence: 0.95 },
                { id: 3, text: "External access requires multi-factor authentication.", confidence: 0.99 },
                { id: 4, text: "Incident response team must be notified within 1 hour.", confidence: 0.92 },
                { id: 5, text: "Encrypted backups must be performed daily.", confidence: 0.97 }
            ]
        };

        return NextResponse.json(mockAnalysis);

    } catch (error) {
        console.error('Processing error:', error);
        return NextResponse.json(
            { error: 'Failed to process document' },
            { status: 500 }
        );
    }
}
