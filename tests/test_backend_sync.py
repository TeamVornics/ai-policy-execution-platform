import requests
import time
import os

BASE_URL = "http://localhost:8000"
PDF_PATH = "demo_data/sample_policy.pdf"

def print_result(name, passed, detail=""):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} - {name}")
    if detail:
        print(f"   {detail}")

def test_backend_sync():
    print("🚀 Starting Verification for /api/policy/submit (Backend Sync)")

    # 1. Health Check
    for i in range(10):
        try:
            r = requests.get(f"{BASE_URL}/health")
            if r.status_code == 200:
                print_result("Server Health", True)
                break
        except:
            time.sleep(1)
    else:
        print_result("Server Health", False, "Could not connect to server")
        return

    # 2. Upload Policy
    print("\n📤 Step 1: Uploading Policy...")
    if not os.path.exists(PDF_PATH):
        print(f"❌ PDF not found at {PDF_PATH}")
        return

    policy_id = "SYNC_TEST_001"
    files = {'file': open(PDF_PATH, 'rb')}
    data = {'policy_id': policy_id}
    
    try:
        r = requests.post(f"{BASE_URL}/api/policy/process", files=files, data=data)
        if r.status_code != 200:
            print_result("Policy Process", False, f"Status: {r.status_code}")
            return
        print_result("Policy Process", True)
    except Exception as e:
        print_result("Policy Process", False, f"Exception: {e}")
        return

    # 3. Submit to Execution Backend
    print(f"\n🚀 Step 2: Submitting Policy {policy_id}...")
    
    payload = {"policy_id": policy_id}
    
    try:
        r = requests.post(f"{BASE_URL}/api/policy/submit", json=payload)
        
        if r.status_code == 200:
            print_result("Backend Sync", True, f"Response: {r.json()}")
        else:
            print_result("Backend Sync", False, f"Status: {r.status_code} - Body: {r.text}")
            
    except Exception as e:
        print_result("Backend Sync", False, f"Exception: {e}")

if __name__ == "__main__":
    test_backend_sync()
