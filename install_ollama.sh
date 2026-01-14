#!/bin/bash

# Ollama Installation and Setup Script for macOS M4
# This script will guide you through installing Ollama

echo "=================================================="
echo "OLLAMA INSTALLATION GUIDE FOR macOS M4"
echo "=================================================="
echo ""

echo "STEP 1: Download Ollama"
echo "----------------------"
echo "Please visit: https://ollama.ai/download"
echo "Download the macOS version (Apple Silicon)"
echo ""
echo "OR use this direct download link:"
echo "https://ollama.ai/download/Ollama-darwin.zip"
echo ""
read -p "Press Enter after you've downloaded Ollama..."

echo ""
echo "STEP 2: Install Ollama"
echo "----------------------"
echo "1. Open the downloaded .zip file"
echo "2. Drag Ollama.app to your Applications folder"
echo "3. Open Ollama from Applications"
echo ""
read -p "Press Enter after you've installed Ollama..."

echo ""
echo "STEP 3: Verify Ollama Installation"
echo "-----------------------------------"
echo "Running: ollama --version"
echo ""
if command -v ollama &> /dev/null; then
    ollama --version
    echo "✅ Ollama is installed!"
else
    echo "❌ Ollama command not found."
    echo "Please make sure Ollama is installed and try running:"
    echo "  export PATH=\"/usr/local/bin:\$PATH\""
    echo "  ollama --version"
    exit 1
fi

echo ""
echo "STEP 4: Start Ollama Service"
echo "----------------------------"
echo "Ollama should start automatically when you open the app."
echo "You can also start it manually with: ollama serve"
echo ""

echo "STEP 5: Download Llama 3.1 8B Model"
echo "------------------------------------"
echo "This will download ~4.7GB. It may take a few minutes."
echo ""
read -p "Press Enter to start downloading the model..."

echo ""
echo "Downloading llama3.1:8b..."
ollama pull llama3.1:8b

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Model downloaded successfully!"
else
    echo ""
    echo "❌ Failed to download model."
    echo "Please make sure Ollama is running and try:"
    echo "  ollama pull llama3.1:8b"
    exit 1
fi

echo ""
echo "STEP 6: Test the Model"
echo "----------------------"
echo "Testing the model with a simple query..."
echo ""
echo "Running: ollama run llama3.1:8b 'Say hello in one sentence'"
echo ""
ollama run llama3.1:8b "Say hello in one sentence"

echo ""
echo "=================================================="
echo "✅ OLLAMA SETUP COMPLETE!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Install Python dependencies: pip install -r requirements.txt"
echo "2. Run the demo: python main.py"
echo ""
