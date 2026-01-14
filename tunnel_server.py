import sys
import uvicorn
from pyngrok import ngrok
from main import app
import threading
import time

def start_tunnel():
    """
    Start ngrok tunnel and print the public URL
    """
    # Open a HTTP tunnel on the default port 8000
    # <NgrokTunnel: "https://<public_sub>.ngrok-free.app" -> "http://localhost:8000">
    try:
        public_url = ngrok.connect(8000).public_url
        print("\n" + "="*60)
        print(f"🌍 PUBLIC URL GENERATED: {public_url}")
        print("="*60)
        print(f"👉 COPY THIS URL TO YOUR FRONTEND CONFIG")
        print(f"   API Endpoint: {public_url}/api/policy/process")
        print("="*60 + "\n")
    except Exception as e:
        print(f"❌ Ngrok Error: {e}")
        print("Ensure you have an ngrok account and have run `ngrok config add-authtoken <TOKEN>` if needed.")

if __name__ == "__main__":
    # Start Tunnel in a separate thread (or just before app if non-blocking, but ngrok.connect is blocking?? No, it returns tunnel obj)
    # Actually ngrok.connect is synchronous and returns the tunnel. 
    # But we need the uvicorn server to run nicely.
    
    print("🚀 Starting Local Backend with Public Tunnel...")
    
    start_tunnel()
    
    # Start Server
    uvicorn.run(app, host="0.0.0.0", port=8000)
