#!/bin/bash

# =============================================================================
# Policy AI NLP Engine - Startup Script
# =============================================================================
# This script starts both the FastAPI server and the public tunnel
# with a FIXED subdomain for stable frontend integration
# =============================================================================

echo "🚀 Starting Policy AI NLP Engine..."
echo ""

# Check if Ollama is running
if ! pgrep -x "ollama" > /dev/null; then
    echo "⚠️  WARNING: Ollama doesn't appear to be running"
    echo "   Start it with: ollama serve"
    echo ""
fi

# Kill any existing processes on port 8000
echo "🧹 Cleaning up port 8000..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Start uvicorn in background
echo "🔧 Starting FastAPI server on port 8000..."
cd "$(dirname "$0")"
uvicorn main:app --host 0.0.0.0 --port 8000 &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to initialize..."
sleep 3

# Check if server started successfully
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "❌ Server failed to start!"
    exit 1
fi

echo "✅ Server running (PID: $SERVER_PID)"
echo ""

# Start tunnel with fixed subdomain
echo "🌐 Starting public tunnel..."
echo "📍 Fixed URL: https://policy-ai-nlp.loca.lt"
echo ""
echo "="*60
echo "🎯 FRONTEND CONFIGURATION"
echo "="*60
echo "Base URL: https://policy-ai-nlp.loca.lt"
echo "Upload:   https://policy-ai-nlp.loca.lt/api/policy/process"
echo "Clarify:  https://policy-ai-nlp.loca.lt/api/policy/clarify"
echo "Submit:   https://policy-ai-nlp.loca.lt/api/policy/submit"
echo "="*60
echo ""

# Start tunnel (this will run in foreground)
npx localtunnel --port 8000 --subdomain policy-ai-nlp

# Cleanup on exit
echo ""
echo "🛑 Shutting down..."
kill $SERVER_PID 2>/dev/null || true
echo "✅ Stopped"
