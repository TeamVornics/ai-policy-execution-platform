#!/usr/bin/env python3
"""
Tunnel Server with FIXED SUBDOMAIN
Provides stable URL: https://policy-ai-nlp.loca.lt
"""
import sys
import subprocess
import time

def start_tunnel():
    """Start localtunnel with fixed subdomain"""
    print("\n" + "="*60)
    print("🌐 Starting LocalTunnel with FIXED subdomain...")
    print("="*60)
    
    # Use fixed subdomain for consistent URL
    subdomain = "policy-ai-nlp"
    
    try:
        # Start localtunnel with fixed subdomain
        cmd = f"npx localtunnel --port 8000 --subdomain {subdomain}"
        print(f"📡 Running: {cmd}")
        
        # Run in foreground to see output
        subprocess.run(cmd, shell=True, check=True)
        
    except KeyboardInterrupt:
        print("\n\n🛑 Tunnel stopped by user")
    except Exception as e:
        print(f"\n❌ Tunnel Error: {e}")
        print("\n💡 Troubleshooting:")
        print("   1. Subdomain may be taken - try a different one")
        print("   2. Run without subdomain: npx localtunnel --port 8000")
        print("   3. For production, use ngrok with auth token")

if __name__ == "__main__":
    print("🚀 Policy AI NLP Engine - Tunnel Server")
    print("⚠️  Make sure uvicorn is running on port 8000 first!")
    print()
    
    start_tunnel()
